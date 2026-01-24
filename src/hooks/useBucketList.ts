import { useState, useEffect, useCallback } from 'react'

const FOLDER_ID_KEY = 'lifeops_bucket_folder_id'
const DOC_ID_KEY = 'lifeops_bucket_doc_id'
const FOLDER_NAME = 'LifeOps 버킷리스트'
const DOC_NAME = '버킷리스트'

export interface BucketItem {
  id: string
  title: string
  category: string
  status: 'todo' | 'in_progress' | 'completed'
  createdAt: string
}

const CATEGORIES = ['여행', '커리어', '건강', '학습', '경험', '관계', '재정', '기타']

interface BucketListState {
  items: BucketItem[]
  isLoading: boolean
  error: string | null
  folderId: string | null
  docId: string | null
  isInitialized: boolean
}

export function useBucketList(accessToken: string | null) {
  const [state, setState] = useState<BucketListState>({
    items: [],
    isLoading: false,
    error: null,
    folderId: localStorage.getItem(FOLDER_ID_KEY),
    docId: localStorage.getItem(DOC_ID_KEY),
    isInitialized: false
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

  // Create folder in Drive
  const createFolder = useCallback(async (token: string): Promise<string | null> => {
    try {
      console.log('[BucketList] Creating folder...')
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
      console.log('[BucketList] Folder created:', data.id)
      return data.id
    } catch (error) {
      console.error('[BucketList] Folder creation error:', error)
      return null
    }
  }, [])

  // Create doc in Drive with initial structure
  const createDoc = useCallback(async (token: string, folderId: string): Promise<string | null> => {
    try {
      console.log('[BucketList] Creating doc...')
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
      console.log('[BucketList] Doc created:', data.id)

      // Add initial content
      const initialContent = '🎯 버킷리스트\n\n---DATA-START---\n[]\n---DATA-END---\n'
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
    } catch (error) {
      console.error('[BucketList] Doc creation error:', error)
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

  // Parse items from document text
  const parseItems = useCallback((text: string): BucketItem[] => {
    try {
      const match = text.match(/---DATA-START---\n([\s\S]*?)\n---DATA-END---/)
      if (!match) return []
      const jsonStr = match[1].trim()
      if (!jsonStr || jsonStr === '[]') return []
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('[BucketList] Parse error:', error)
      return []
    }
  }, [])

  // Fetch items from document
  const fetchItems = useCallback(async (token: string, docId: string) => {
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
      const items = parseItems(text)

      setState(prev => ({
        ...prev,
        items,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('[BucketList] Fetch error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '오류가 발생했습니다'
      }))
    }
  }, [extractDocText, parseItems])

  // Save items to document
  const saveItems = useCallback(async (token: string, docId: string, items: BucketItem[]): Promise<boolean> => {
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
        console.error('[BucketList] Data markers not found')
        return false
      }

      // Calculate document indices (add 1 for document index offset)
      const dataStartIndex = startIdx + startMarker.length + 1
      const dataEndIndex = endIdx + 1

      const newDataText = JSON.stringify(items, null, 2)

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
      console.error('[BucketList] Save error:', error)
      return false
    }
  }, [extractDocText])

  // Initialize folder and doc
  const initializeSheet = useCallback(async (): Promise<boolean> => {
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

      // Fetch items
      await fetchItems(accessToken, docId)

      return true
    } catch (error) {
      console.error('[BucketList] Initialize error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '초기화 오류'
      }))
      return false
    }
  }, [accessToken, state.folderId, state.docId, verifyFolder, verifyDoc, createFolder, createDoc, fetchItems])

  // Auto-initialize on mount
  useEffect(() => {
    if (!accessToken) {
      setState(prev => ({
        ...prev,
        items: [],
        isInitialized: false,
        isLoading: false
      }))
      return
    }

    const init = async () => {
      if (state.folderId && state.docId) {
        const [folderValid, docValid] = await Promise.all([
          verifyFolder(accessToken, state.folderId),
          verifyDoc(accessToken, state.docId)
        ])

        if (folderValid && docValid) {
          setState(prev => ({ ...prev, isInitialized: true }))
          await fetchItems(accessToken, state.docId!)
        } else {
          if (!folderValid) {
            localStorage.removeItem(FOLDER_ID_KEY)
            setState(prev => ({ ...prev, folderId: null }))
          }
          if (!docValid) {
            localStorage.removeItem(DOC_ID_KEY)
            setState(prev => ({ ...prev, docId: null }))
          }
        }
      }
    }

    init()
  }, [accessToken, state.folderId, state.docId, verifyFolder, verifyDoc, fetchItems])

  // Refresh items
  const refresh = useCallback(() => {
    if (accessToken && state.docId && state.isInitialized) {
      fetchItems(accessToken, state.docId)
    }
  }, [accessToken, state.docId, state.isInitialized, fetchItems])

  // Add new item
  const addItem = useCallback(async (item: Omit<BucketItem, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    if (!accessToken || !state.docId) return false

    const newItem: BucketItem = {
      id: `bucket_${Date.now()}`,
      title: item.title,
      category: item.category,
      status: 'todo',
      createdAt: new Date().toISOString().split('T')[0]
    }

    const newItems = [...state.items, newItem]
    const success = await saveItems(accessToken, state.docId, newItems)

    if (success) {
      setState(prev => ({ ...prev, items: newItems }))
    }

    return success
  }, [accessToken, state.docId, state.items, saveItems])

  // Update item status
  const updateStatus = useCallback(async (id: string, status: BucketItem['status']): Promise<boolean> => {
    if (!accessToken || !state.docId) return false

    const newItems = state.items.map(item =>
      item.id === id ? { ...item, status } : item
    )

    const success = await saveItems(accessToken, state.docId, newItems)

    if (success) {
      setState(prev => ({ ...prev, items: newItems }))
    }

    return success
  }, [accessToken, state.docId, state.items, saveItems])

  // Delete item
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    if (!accessToken || !state.docId) return false

    const newItems = state.items.filter(item => item.id !== id)
    const success = await saveItems(accessToken, state.docId, newItems)

    if (success) {
      setState(prev => ({ ...prev, items: newItems }))
    }

    return success
  }, [accessToken, state.docId, state.items, saveItems])

  return {
    ...state,
    categories: CATEGORIES,
    initializeSheet,
    addItem,
    updateStatus,
    deleteItem,
    refresh
  }
}
