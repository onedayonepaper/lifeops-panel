import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { api } from '../lib/api'

const SPREADSHEET_ID_KEY = 'lifeops_spreadsheet_id'
const SHEET_NAME = 'DailyLog'

export interface DailyLogEntry {
  date: string
  mood: number // 1-5
  energy: number // 1-5
  note: string
}

interface GoogleSheetsState {
  entries: DailyLogEntry[]
  isLoading: boolean
  error: string | null
  spreadsheetId: string | null
  isInitialized: boolean
}

export function useGoogleSheets(): GoogleSheetsState & {
  initializeSheet: () => Promise<boolean>
  addEntry: (entry: Omit<DailyLogEntry, 'date'>) => Promise<boolean>
  updateEntry: (date: string, entry: Partial<Omit<DailyLogEntry, 'date'>>) => Promise<boolean>
  getTodayEntry: () => DailyLogEntry | null
  refresh: () => void
} {
  const { isSignedIn } = useGoogleAuth()

  const [state, setState] = useState<GoogleSheetsState>({
    entries: [],
    isLoading: false,
    error: null,
    spreadsheetId: localStorage.getItem(SPREADSHEET_ID_KEY),
    isInitialized: false
  })

  // Check if spreadsheet exists and has correct structure
  const verifySpreadsheet = useCallback(async (sheetId: string): Promise<boolean> => {
    try {
      const data = await api.getSpreadsheet(sheetId, 'sheets.properties.title')
      const hasSheet = data.sheets?.some((s: any) => s.properties?.title === SHEET_NAME)
      return hasSheet
    } catch {
      return false
    }
  }, [])

  // Create new spreadsheet with DailyLog sheet
  const createSpreadsheet = useCallback(async (): Promise<string | null> => {
    try {
      const data = await api.createSpreadsheet({
        properties: {
          title: 'LifeOps Daily Log'
        },
        sheets: [{
          properties: {
            title: SHEET_NAME
          }
        }]
      })

      const spreadsheetId = data.spreadsheetId

      // Add header row
      await api.updateSheetValues(spreadsheetId, `${SHEET_NAME}!A1:D1`, [['날짜', '기분', '에너지', '메모']])

      return spreadsheetId
    } catch (error) {
      console.error('Failed to create spreadsheet:', error)
      return null
    }
  }, [])

  // Initialize spreadsheet
  const initializeSheet = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      let sheetId = state.spreadsheetId

      // Check existing spreadsheet
      if (sheetId) {
        const isValid = await verifySpreadsheet(sheetId)
        if (!isValid) {
          sheetId = null
          localStorage.removeItem(SPREADSHEET_ID_KEY)
        }
      }

      // Create new if needed
      if (!sheetId) {
        sheetId = await createSpreadsheet()
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
  }, [isSignedIn, state.spreadsheetId, verifySpreadsheet, createSpreadsheet])

  // Fetch entries
  const fetchEntries = useCallback(async (sheetId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const data = await api.getSheetValues(sheetId, `${SHEET_NAME}!A2:D100`)

      const entries: DailyLogEntry[] = (data.values || []).map((row: string[]) => ({
        date: row[0] || '',
        mood: parseInt(row[1]) || 3,
        energy: parseInt(row[2]) || 3,
        note: row[3] || ''
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
    if (!isSignedIn) {
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
        const isValid = await verifySpreadsheet(state.spreadsheetId)
        if (isValid) {
          setState(prev => ({ ...prev, isInitialized: true }))
          await fetchEntries(state.spreadsheetId!)
        } else {
          localStorage.removeItem(SPREADSHEET_ID_KEY)
          setState(prev => ({ ...prev, spreadsheetId: null, isInitialized: false }))
        }
      }
    }

    init()
  }, [isSignedIn, state.spreadsheetId, verifySpreadsheet, fetchEntries])

  // Refresh entries
  const refresh = useCallback(() => {
    if (isSignedIn && state.spreadsheetId && state.isInitialized) {
      fetchEntries(state.spreadsheetId)
    }
  }, [isSignedIn, state.spreadsheetId, state.isInitialized, fetchEntries])

  // Add new entry
  const addEntry = useCallback(async (entry: Omit<DailyLogEntry, 'date'>): Promise<boolean> => {
    if (!isSignedIn || !state.spreadsheetId) return false

    const today = format(new Date(), 'yyyy-MM-dd')

    // Check if entry exists for today
    const existingEntry = state.entries.find(e => e.date === today)
    if (existingEntry) {
      // Update instead
      return updateEntry(today, entry)
    }

    try {
      await api.appendSheetValues(
        state.spreadsheetId,
        `${SHEET_NAME}!A:D`,
        [[today, entry.mood, entry.energy, entry.note]]
      )
      await fetchEntries(state.spreadsheetId)
      return true
    } catch (error) {
      console.error('Failed to add entry:', error)
      return false
    }
  }, [isSignedIn, state.spreadsheetId, state.entries, fetchEntries])

  // Update existing entry
  const updateEntry = useCallback(async (date: string, entry: Partial<Omit<DailyLogEntry, 'date'>>): Promise<boolean> => {
    if (!isSignedIn || !state.spreadsheetId) return false

    // Find row index
    const rowIndex = state.entries.findIndex(e => e.date === date)
    if (rowIndex === -1) return false

    const existingEntry = state.entries[rowIndex]
    const updatedEntry = {
      mood: entry.mood ?? existingEntry.mood,
      energy: entry.energy ?? existingEntry.energy,
      note: entry.note ?? existingEntry.note
    }

    try {
      await api.updateSheetValues(
        state.spreadsheetId,
        `${SHEET_NAME}!A${rowIndex + 2}:D${rowIndex + 2}`,
        [[date, updatedEntry.mood, updatedEntry.energy, updatedEntry.note]]
      )
      await fetchEntries(state.spreadsheetId)
      return true
    } catch (error) {
      console.error('Failed to update entry:', error)
      return false
    }
  }, [isSignedIn, state.spreadsheetId, state.entries, fetchEntries])

  // Get today's entry
  const getTodayEntry = useCallback((): DailyLogEntry | null => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return state.entries.find(e => e.date === today) || null
  }, [state.entries])

  return {
    ...state,
    initializeSheet,
    addEntry,
    updateEntry,
    getTodayEntry,
    refresh
  }
}
