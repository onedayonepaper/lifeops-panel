import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const FOLDER_ID_KEY = 'lifeops_study_folder_id'
const DOC_ID_KEY = 'lifeops_study_doc_id'
const FOLDER_NAME = 'LifeOps 공부장'
const DOC_NAME = '공부장'

export interface StudyEntry {
  id: string
  title: string
  content: string
  createdAt: string
}

interface StudyJournalState {
  isLoading: boolean
  error: string | null
  folderId: string | null
  docId: string | null
  isInitialized: boolean
  isSaving: boolean
  entries: StudyEntry[]
}

export function useStudyJournal(accessToken: string | null) {
  const [state, setState] = useState<StudyJournalState>({
    isLoading: false,
    error: null,
    folderId: localStorage.getItem(FOLDER_ID_KEY),
    docId: localStorage.getItem(DOC_ID_KEY),
    isInitialized: false,
    isSaving: false,
    entries: []
  })

  // Check if folder exists
  const verifyFolder = useCallback(async (token: string, folderId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,trashed`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return false
      const data = await response.json()
      return !data.trashed
    } catch {
      return false
    }
  }, [])

  // Check if doc exists
  const verifyDoc = useCallback(async (token: string, docId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Find existing folder by name
  const findFolderByName = useCallback(async (token: string): Promise<string | null> => {
    try {
      const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return null
      const data = await response.json()
      return data.files?.[0]?.id || null
    } catch {
      return null
    }
  }, [])

  // Find existing doc in folder by name
  const findDocInFolder = useCallback(async (token: string, folderId: string): Promise<string | null> => {
    try {
      const query = `name='${DOC_NAME}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return null
      const data = await response.json()
      return data.files?.[0]?.id || null
    } catch {
      return null
    }
  }, [])

  // Create folder in Drive
  const createFolder = useCallback(async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder'
          })
        }
      )
      if (!response.ok) return null
      const data = await response.json()
      return data.id
    } catch {
      return null
    }
  }, [])

  // Create doc in Drive
  const createDoc = useCallback(async (token: string, folderId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: DOC_NAME,
            mimeType: 'application/vnd.google-apps.document',
            parents: [folderId]
          })
        }
      )
      if (!response.ok) return null
      const data = await response.json()

      // Add initial content with data markers
      const initialContent = '📚 공부장\n\n---DATA-START---\n[]\n---DATA-END---\n'
      await fetch(
        `https://docs.googleapis.com/v1/documents/${data.id}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  location: { index: 1 },
                  text: initialContent
                }
              }
            ]
          })
        }
      )

      return data.id
    } catch {
      return null
    }
  }, [])

  // Extract text from document
  const extractDocText = useCallback((doc: any): string => {
    const content = doc.body?.content || []
    let text = ''
    for (const element of content) {
      if (element.paragraph?.elements) {
        for (const el of element.paragraph.elements) {
          if (el.textRun?.content) {
            text += el.textRun.content
          }
        }
      }
    }
    return text
  }, [])

  // Parse entries from document text
  const parseEntries = useCallback((text: string): StudyEntry[] => {
    try {
      const match = text.match(/---DATA-START---\n([\s\S]*?)\n---DATA-END---/)
      if (!match) return []
      const jsonStr = match[1].trim()
      if (!jsonStr || jsonStr === '[]') return []
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('[StudyJournal] Parse error:', error)
      return []
    }
  }, [])

  // Fetch document content
  const fetchContent = useCallback(async (token: string, docId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!response.ok) {
        throw new Error('문서를 불러올 수 없습니다')
      }

      const doc = await response.json()
      const text = extractDocText(doc)
      const entries = parseEntries(text)

      setState(prev => ({
        ...prev,
        entries,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '오류가 발생했습니다'
      }))
    }
  }, [extractDocText, parseEntries])

  // Initialize folder and doc
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      let folderId = state.folderId
      let docId = state.docId

      // Verify or create folder
      if (folderId) {
        const isValid = await verifyFolder(accessToken, folderId)
        if (!isValid) {
          folderId = null
          localStorage.removeItem(FOLDER_ID_KEY)
        }
      }
      if (!folderId) {
        folderId = await createFolder(accessToken)
        if (!folderId) {
          setState(prev => ({ ...prev, isLoading: false, error: '폴더를 생성할 수 없습니다' }))
          return false
        }
        localStorage.setItem(FOLDER_ID_KEY, folderId)
      }

      // Verify or create doc
      if (docId) {
        const isValid = await verifyDoc(accessToken, docId)
        if (!isValid) {
          docId = null
          localStorage.removeItem(DOC_ID_KEY)
        }
      }
      if (!docId) {
        docId = await createDoc(accessToken, folderId)
        if (!docId) {
          setState(prev => ({ ...prev, isLoading: false, error: '문서를 생성할 수 없습니다' }))
          return false
        }
        localStorage.setItem(DOC_ID_KEY, docId)
      }

      setState(prev => ({
        ...prev,
        folderId,
        docId,
        isInitialized: true,
        isLoading: false
      }))

      await fetchContent(accessToken, docId)
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '초기화 오류'
      }))
      return false
    }
  }, [accessToken, state.folderId, state.docId, verifyFolder, verifyDoc, createFolder, createDoc, fetchContent])

  // Save entries to document
  const saveEntries = useCallback(async (token: string, docId: string, entries: StudyEntry[]): Promise<boolean> => {
    try {
      // Get current document to find data section
      const docResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!docResponse.ok) return false

      const doc = await docResponse.json()
      const text = extractDocText(doc)

      // Find data section indices
      const startMarker = '---DATA-START---\n'
      const endMarker = '\n---DATA-END---'
      const startIdx = text.indexOf(startMarker)
      const endIdx = text.indexOf(endMarker)

      if (startIdx === -1 || endIdx === -1) {
        console.error('[StudyJournal] Data markers not found')
        return false
      }

      // Calculate document indices (add 1 for document index offset)
      const dataStartIndex = startIdx + startMarker.length + 1
      const dataEndIndex = endIdx + 1

      const newDataText = JSON.stringify(entries, null, 2)

      // Delete old data and insert new
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                deleteContentRange: {
                  range: {
                    startIndex: dataStartIndex,
                    endIndex: dataEndIndex
                  }
                }
              },
              {
                insertText: {
                  location: { index: dataStartIndex },
                  text: newDataText
                }
              }
            ]
          })
        }
      )

      return response.ok
    } catch (error) {
      console.error('[StudyJournal] Save error:', error)
      return false
    }
  }, [extractDocText])

  // Add new entry
  const addEntry = useCallback(async (title: string, content: string): Promise<boolean> => {
    if (!accessToken || !state.docId || !title.trim()) return false

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      const now = new Date()
      const newEntry: StudyEntry = {
        id: `study_${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        createdAt: format(now, 'yyyy-MM-dd HH:mm', { locale: ko })
      }

      const newEntries = [newEntry, ...state.entries] // 최신순으로 추가
      const success = await saveEntries(accessToken, state.docId, newEntries)

      if (success) {
        setState(prev => ({ ...prev, entries: newEntries, isSaving: false }))
      } else {
        throw new Error('저장 실패')
      }

      return success
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : '저장 오류'
      }))
      return false
    }
  }, [accessToken, state.docId, state.entries, saveEntries])

  // Delete entry
  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    if (!accessToken || !state.docId) return false

    const newEntries = state.entries.filter(entry => entry.id !== id)
    const success = await saveEntries(accessToken, state.docId, newEntries)

    if (success) {
      setState(prev => ({ ...prev, entries: newEntries }))
    }

    return success
  }, [accessToken, state.docId, state.entries, saveEntries])

  // Refresh content
  const refresh = useCallback(() => {
    if (accessToken && state.docId && state.isInitialized) {
      fetchContent(accessToken, state.docId)
    }
  }, [accessToken, state.docId, state.isInitialized, fetchContent])

  // Open doc in new tab
  const openDoc = useCallback(() => {
    if (state.docId) {
      window.open(`https://docs.google.com/document/d/${state.docId}/edit`, '_blank')
    }
  }, [state.docId])

  // Open folder in new tab
  const openFolder = useCallback(() => {
    if (state.folderId) {
      window.open(`https://drive.google.com/drive/folders/${state.folderId}`, '_blank')
    }
  }, [state.folderId])

  // Auto-initialize on mount
  useEffect(() => {
    if (!accessToken) {
      setState(prev => ({
        ...prev,
        isInitialized: false,
        isLoading: false,
        entries: []
      }))
      return
    }

    const init = async () => {
      setState(prev => ({ ...prev, isLoading: true }))

      let folderId = state.folderId
      let docId = state.docId

      // If we have stored IDs, verify them
      if (folderId && docId) {
        const [folderValid, docValid] = await Promise.all([
          verifyFolder(accessToken, folderId),
          verifyDoc(accessToken, docId)
        ])

        if (folderValid && docValid) {
          setState(prev => ({ ...prev, isInitialized: true, isLoading: false }))
          await fetchContent(accessToken, docId!)
          return
        }

        // Clear invalid IDs
        if (!folderValid) {
          localStorage.removeItem(FOLDER_ID_KEY)
          folderId = null
        }
        if (!docValid) {
          localStorage.removeItem(DOC_ID_KEY)
          docId = null
        }
      }

      // Try to find existing folder and doc in Drive
      if (!folderId) {
        folderId = await findFolderByName(accessToken)
        if (folderId) {
          localStorage.setItem(FOLDER_ID_KEY, folderId)
        }
      }

      if (folderId && !docId) {
        docId = await findDocInFolder(accessToken, folderId)
        if (docId) {
          localStorage.setItem(DOC_ID_KEY, docId)
        }
      }

      // If both found, load data
      if (folderId && docId) {
        setState(prev => ({
          ...prev,
          folderId,
          docId,
          isInitialized: true,
          isLoading: false
        }))
        await fetchContent(accessToken, docId)
      } else {
        // Auto-create folder and doc if not found
        if (!folderId) {
          folderId = await createFolder(accessToken)
          if (folderId) {
            localStorage.setItem(FOLDER_ID_KEY, folderId)
          }
        }

        if (folderId && !docId) {
          docId = await createDoc(accessToken, folderId)
          if (docId) {
            localStorage.setItem(DOC_ID_KEY, docId)
          }
        }

        if (folderId && docId) {
          setState(prev => ({
            ...prev,
            folderId,
            docId,
            isInitialized: true,
            isLoading: false
          }))
          await fetchContent(accessToken, docId)
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: '폴더 또는 문서를 생성할 수 없습니다'
          }))
        }
      }
    }

    init()
  }, [accessToken, state.folderId, state.docId, verifyFolder, verifyDoc, findFolderByName, findDocInFolder, createFolder, createDoc, fetchContent])

  return {
    ...state,
    initialize,
    addEntry,
    deleteEntry,
    refresh,
    openDoc,
    openFolder
  }
}
