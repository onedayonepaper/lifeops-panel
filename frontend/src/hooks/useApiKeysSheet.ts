import { useState, useEffect, useCallback } from 'react'

const SPREADSHEET_ID_KEY = 'lifeops_apikeys_spreadsheet_id'
const FOLDER_ID_KEY = 'lifeops_folder_id'
const SHEET_NAME = 'ApiKeys'
const FOLDER_NAME = 'LifeOps'

export interface ApiKeyEntry {
  id: string
  serviceName: string
  keyName: string
  apiKey: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface ApiKeysSheetState {
  entries: ApiKeyEntry[]
  isLoading: boolean
  error: string | null
  spreadsheetId: string | null
  isInitialized: boolean
}

export function useApiKeysSheet(accessToken: string | null): ApiKeysSheetState & {
  initializeSheet: () => Promise<boolean>
  addEntry: (entry: Omit<ApiKeyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updateEntry: (id: string, entry: Partial<Omit<ApiKeyEntry, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>
  deleteEntry: (id: string) => Promise<boolean>
  refresh: () => void
} {
  const [state, setState] = useState<ApiKeysSheetState>({
    entries: [],
    isLoading: false,
    error: null,
    spreadsheetId: localStorage.getItem(SPREADSHEET_ID_KEY),
    isInitialized: false
  })

  // Check if spreadsheet exists and has correct structure
  const verifySpreadsheet = useCallback(async (token: string, sheetId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) return false

      const data = await response.json()
      const hasSheet = data.sheets?.some((s: any) => s.properties?.title === SHEET_NAME)
      return hasSheet
    } catch {
      return false
    }
  }, [])

  // Find or create LifeOps folder in Google Drive
  const getOrCreateFolder = useCallback(async (token: string): Promise<string | null> => {
    try {
      // Check localStorage first
      const savedFolderId = localStorage.getItem(FOLDER_ID_KEY)
      if (savedFolderId) {
        // Verify folder still exists
        const verifyResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${savedFolderId}?fields=id,name,trashed`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (verifyResponse.ok) {
          const folder = await verifyResponse.json()
          if (!folder.trashed) return savedFolderId
        }
        localStorage.removeItem(FOLDER_ID_KEY)
      }

      // Search for existing folder
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.files && searchData.files.length > 0) {
          const folderId = searchData.files[0].id
          localStorage.setItem(FOLDER_ID_KEY, folderId)
          return folderId
        }
      }

      // Create new folder
      const createResponse = await fetch(
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

      if (!createResponse.ok) return null

      const newFolder = await createResponse.json()
      localStorage.setItem(FOLDER_ID_KEY, newFolder.id)
      return newFolder.id
    } catch (error) {
      console.error('Failed to get or create folder:', error)
      return null
    }
  }, [])

  // Search for existing spreadsheet in LifeOps folder
  const searchSpreadsheet = useCallback(async (token: string): Promise<string | null> => {
    try {
      const folderId = await getOrCreateFolder(token)
      if (!folderId) return null

      const query = encodeURIComponent(`name='LifeOps API Keys' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`)
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!searchResponse.ok) return null

      const searchData = await searchResponse.json()
      if (searchData.files && searchData.files.length > 0) {
        const sheetId = searchData.files[0].id
        const isValid = await verifySpreadsheet(token, sheetId)
        if (isValid) return sheetId
      }

      return null
    } catch (error) {
      console.error('Failed to search spreadsheet:', error)
      return null
    }
  }, [getOrCreateFolder, verifySpreadsheet])

  // Create new spreadsheet with ApiKeys sheet in LifeOps folder
  const createSpreadsheet = useCallback(async (token: string): Promise<string | null> => {
    try {
      // Get or create folder first
      const folderId = await getOrCreateFolder(token)
      if (!folderId) {
        console.error('Failed to get or create folder')
        return null
      }

      // Create spreadsheet
      const response = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: 'LifeOps API Keys'
            },
            sheets: [{
              properties: {
                title: SHEET_NAME
              }
            }]
          })
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      const spreadsheetId = data.spreadsheetId

      // Move spreadsheet to LifeOps folder
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Add header row
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_NAME}!A1:G1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [['ID', '서비스명', '키 이름', 'API Key', '설명', '생성일', '수정일']]
          })
        }
      )

      return spreadsheetId
    } catch (error) {
      console.error('Failed to create spreadsheet:', error)
      return null
    }
  }, [getOrCreateFolder])

  // Initialize spreadsheet
  const initializeSheet = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      let sheetId = state.spreadsheetId

      // Check existing spreadsheet
      if (sheetId) {
        const isValid = await verifySpreadsheet(accessToken, sheetId)
        if (!isValid) {
          sheetId = null
          localStorage.removeItem(SPREADSHEET_ID_KEY)
        }
      }

      // Search existing before creating new
      if (!sheetId) {
        sheetId = await searchSpreadsheet(accessToken)
      }

      // Create new if still not found
      if (!sheetId) {
        sheetId = await createSpreadsheet(accessToken)
        if (!sheetId) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: '스프레드시트를 생성할 수 없습니다'
          }))
          return false
        }
        localStorage.setItem(SPREADSHEET_ID_KEY, sheetId)
      }

      setState(prev => ({
        ...prev,
        spreadsheetId: sheetId,
        isInitialized: true,
        isLoading: false
      }))

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '오류가 발생했습니다'
      }))
      return false
    }
  }, [accessToken, state.spreadsheetId, verifySpreadsheet, searchSpreadsheet, createSpreadsheet])

  // Fetch entries
  const fetchEntries = useCallback(async (token: string, sheetId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${SHEET_NAME}!A2:G500`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.status === 401) {
        setState(prev => ({ ...prev, isLoading: false, error: null, entries: [] }))
        return
      }

      if (!response.ok) {
        throw new Error('데이터를 가져올 수 없습니다')
      }

      const data = await response.json()
      const entries: ApiKeyEntry[] = (data.values || []).map((row: string[]) => ({
        id: row[0] || '',
        serviceName: row[1] || '',
        keyName: row[2] || '',
        apiKey: row[3] || '',
        description: row[4] || '',
        createdAt: row[5] || '',
        updatedAt: row[6] || ''
      }))

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
  }, [])

  // Auto-initialize and fetch on mount
  useEffect(() => {
    if (!accessToken) {
      setState(prev => ({
        ...prev,
        entries: [],
        isInitialized: false,
        isLoading: false
      }))
      return
    }

    const init = async () => {
      if (state.spreadsheetId) {
        const isValid = await verifySpreadsheet(accessToken, state.spreadsheetId)
        if (isValid) {
          setState(prev => ({ ...prev, isInitialized: true }))
          await fetchEntries(accessToken, state.spreadsheetId!)
        } else {
          localStorage.removeItem(SPREADSHEET_ID_KEY)
          setState(prev => ({ ...prev, spreadsheetId: null, isInitialized: false }))
        }
      }
    }

    init()
  }, [accessToken, state.spreadsheetId, verifySpreadsheet, fetchEntries])

  // Refresh entries
  const refresh = useCallback(() => {
    if (accessToken && state.spreadsheetId && state.isInitialized) {
      fetchEntries(accessToken, state.spreadsheetId)
    }
  }, [accessToken, state.spreadsheetId, state.isInitialized, fetchEntries])

  // Add new entry
  const addEntry = useCallback(async (entry: Omit<ApiKeyEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (!accessToken || !state.spreadsheetId) return false

    const now = new Date().toISOString()
    const id = Date.now().toString()

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}/values/${SHEET_NAME}!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[id, entry.serviceName, entry.keyName, entry.apiKey, entry.description || '', now, now]]
          })
        }
      )

      if (!response.ok) return false

      await fetchEntries(accessToken, state.spreadsheetId)
      return true
    } catch (error) {
      console.error('Failed to add entry:', error)
      return false
    }
  }, [accessToken, state.spreadsheetId, fetchEntries])

  // Update existing entry
  const updateEntry = useCallback(async (id: string, entry: Partial<Omit<ApiKeyEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    if (!accessToken || !state.spreadsheetId) return false

    const rowIndex = state.entries.findIndex(e => e.id === id)
    if (rowIndex === -1) return false

    const existingEntry = state.entries[rowIndex]
    const now = new Date().toISOString()
    const updatedEntry = {
      serviceName: entry.serviceName ?? existingEntry.serviceName,
      keyName: entry.keyName ?? existingEntry.keyName,
      apiKey: entry.apiKey ?? existingEntry.apiKey,
      description: entry.description ?? existingEntry.description
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}/values/${SHEET_NAME}!A${rowIndex + 2}:G${rowIndex + 2}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[id, updatedEntry.serviceName, updatedEntry.keyName, updatedEntry.apiKey, updatedEntry.description, existingEntry.createdAt, now]]
          })
        }
      )

      if (!response.ok) return false

      await fetchEntries(accessToken, state.spreadsheetId)
      return true
    } catch (error) {
      console.error('Failed to update entry:', error)
      return false
    }
  }, [accessToken, state.spreadsheetId, state.entries, fetchEntries])

  // Delete entry
  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    if (!accessToken || !state.spreadsheetId) return false

    const rowIndex = state.entries.findIndex(e => e.id === id)
    if (rowIndex === -1) return false

    try {
      // Get sheet ID first
      const sheetInfoResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}?fields=sheets.properties`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      if (!sheetInfoResponse.ok) return false

      const sheetInfo = await sheetInfoResponse.json()
      const sheet = sheetInfo.sheets?.find((s: any) => s.properties?.title === SHEET_NAME)
      if (!sheet) return false

      const sheetIdNum = sheet.properties.sheetId

      // Delete row
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: sheetIdNum,
                  dimension: 'ROWS',
                  startIndex: rowIndex + 1,
                  endIndex: rowIndex + 2
                }
              }
            }]
          })
        }
      )

      if (!response.ok) return false

      await fetchEntries(accessToken, state.spreadsheetId)
      return true
    } catch (error) {
      console.error('Failed to delete entry:', error)
      return false
    }
  }, [accessToken, state.spreadsheetId, state.entries, fetchEntries])

  return {
    ...state,
    initializeSheet,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh
  }
}
