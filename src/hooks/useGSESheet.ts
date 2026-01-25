import { useState, useEffect, useCallback } from 'react'

const SHEET_ID_KEY = 'lifeops_gse_sheet_id'
const SHEET_NAME = 'LifeOps GSE'

export interface RoutineItem {
  id: string
  title: string
  completed: boolean
}

export interface Indicator {
  id: string
  title: string
  progress: number
  target: string
}

export interface GSEData {
  goal: string
  twoWeekGoal: string
  milestone: string
  routines: RoutineItem[]
  indicators: Indicator[]
  lastUpdated: string
}

const DEFAULT_DATA: GSEData = {
  goal: 'LINE Japan 백엔드 지원 가능 상태 + JLPT N2',
  twoWeekGoal: '지원서류 패키지 작성하기',
  milestone: '12주 마일스톤',
  routines: [
    { id: 'vocab', title: 'JLPT N2 단어/한자', completed: false },
    { id: 'grammar', title: 'JLPT N2 문법', completed: false },
    { id: 'reading', title: 'JLPT N2 독해', completed: false },
    { id: 'listening', title: 'JLPT N2 청해/쉐도잉', completed: false },
  ],
  indicators: [
    { id: 'jlpt', title: 'JLPT', progress: 0, target: 'N2 합격' },
    { id: 'docs', title: '서류', progress: 0, target: '이력서/포폴 완성' },
    { id: 'aws', title: 'AWS', progress: 0, target: '자격증 취득' },
  ],
  lastUpdated: new Date().toISOString().split('T')[0]
}

export function useGSESheet(accessToken: string | null) {
  const [data, setData] = useState<GSEData>(DEFAULT_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sheetId, setSheetId] = useState<string | null>(() =>
    localStorage.getItem(SHEET_ID_KEY)
  )
  const [isInitialized, setIsInitialized] = useState(false)

  // Find existing sheet by name
  const findSheetByName = useCallback(async (token: string): Promise<string | null> => {
    try {
      const query = `name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return null
      const result = await response.json()
      return result.files?.[0]?.id || null
    } catch {
      return null
    }
  }, [])

  // Create new sheet
  const createSheet = useCallback(async (token: string): Promise<string | null> => {
    try {
      // Create spreadsheet
      const createResponse = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: SHEET_NAME },
            sheets: [{
              properties: { title: 'Data' }
            }]
          })
        }
      )

      if (!createResponse.ok) return null
      const sheet = await createResponse.json()
      const newSheetId = sheet.spreadsheetId

      // Initialize with default data
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${newSheetId}/values/Data!A1:B10?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['goal', DEFAULT_DATA.goal],
              ['twoWeekGoal', DEFAULT_DATA.twoWeekGoal],
              ['milestone', DEFAULT_DATA.milestone],
              ['routines', JSON.stringify(DEFAULT_DATA.routines)],
              ['indicators', JSON.stringify(DEFAULT_DATA.indicators)],
              ['lastUpdated', DEFAULT_DATA.lastUpdated]
            ]
          })
        }
      )

      return newSheetId
    } catch (error) {
      console.error('[GSE] Create sheet error:', error)
      return null
    }
  }, [])

  // Fetch data from sheet
  const fetchData = useCallback(async (token: string, id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Data!A1:B10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!response.ok) {
        if (response.status === 404) {
          // Sheet not found, clear stored ID
          localStorage.removeItem(SHEET_ID_KEY)
          setSheetId(null)
          setIsLoading(false)
          return
        }
        throw new Error('데이터를 불러올 수 없습니다')
      }

      const result = await response.json()
      const values = result.values || []

      // Parse values into data object
      const dataMap: Record<string, string> = {}
      for (const row of values) {
        if (row[0] && row[1]) {
          dataMap[row[0]] = row[1]
        }
      }

      const today = new Date().toISOString().split('T')[0]
      let routines = DEFAULT_DATA.routines
      try {
        routines = JSON.parse(dataMap.routines || '[]')
      } catch {}

      let indicators = DEFAULT_DATA.indicators
      try {
        indicators = JSON.parse(dataMap.indicators || '[]')
      } catch {}

      // Reset routines if it's a new day
      const lastUpdated = dataMap.lastUpdated || ''
      if (lastUpdated !== today) {
        routines = routines.map(r => ({ ...r, completed: false }))
      }

      const newData: GSEData = {
        goal: dataMap.goal || DEFAULT_DATA.goal,
        twoWeekGoal: dataMap.twoWeekGoal || DEFAULT_DATA.twoWeekGoal,
        milestone: dataMap.milestone || DEFAULT_DATA.milestone,
        routines,
        indicators,
        lastUpdated: today
      }

      setData(newData)

      // Update lastUpdated in sheet if it changed
      if (lastUpdated !== today) {
        await saveData(token, id, newData)
      }
    } catch (error) {
      console.error('[GSE] Fetch error:', error)
      setError(error instanceof Error ? error.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save data to sheet
  const saveData = useCallback(async (token: string, id: string, newData: GSEData): Promise<boolean> => {
    try {
      setIsSaving(true)

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Data!A1:B10?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['goal', newData.goal],
              ['twoWeekGoal', newData.twoWeekGoal],
              ['milestone', newData.milestone],
              ['routines', JSON.stringify(newData.routines)],
              ['indicators', JSON.stringify(newData.indicators)],
              ['lastUpdated', newData.lastUpdated]
            ]
          })
        }
      )

      return response.ok
    } catch (error) {
      console.error('[GSE] Save error:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Initialize
  useEffect(() => {
    if (!accessToken) {
      setIsInitialized(false)
      setData(DEFAULT_DATA)
      return
    }

    const init = async () => {
      setIsLoading(true)

      let id = sheetId

      // Verify existing sheet
      if (id) {
        try {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=spreadsheetId`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (!response.ok) {
            localStorage.removeItem(SHEET_ID_KEY)
            id = null
          }
        } catch {
          localStorage.removeItem(SHEET_ID_KEY)
          id = null
        }
      }

      // Find or create sheet
      if (!id) {
        id = await findSheetByName(accessToken)
        if (!id) {
          id = await createSheet(accessToken)
        }
        if (id) {
          localStorage.setItem(SHEET_ID_KEY, id)
          setSheetId(id)
        }
      }

      if (id) {
        await fetchData(accessToken, id)
        setIsInitialized(true)
      } else {
        setError('시트를 생성할 수 없습니다')
        setIsLoading(false)
      }
    }

    init()
  }, [accessToken, sheetId, findSheetByName, createSheet, fetchData])

  // Update functions
  const updateData = useCallback(async (updates: Partial<GSEData>) => {
    if (!accessToken || !sheetId) return false

    const newData = { ...data, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
    setData(newData)

    return await saveData(accessToken, sheetId, newData)
  }, [accessToken, sheetId, data, saveData])

  const toggleRoutine = useCallback(async (id: string) => {
    const newRoutines = data.routines.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    )
    return await updateData({ routines: newRoutines })
  }, [data.routines, updateData])

  const updateIndicator = useCallback(async (id: string, progress: number) => {
    const newIndicators = data.indicators.map(ind =>
      ind.id === id ? { ...ind, progress: Math.min(100, Math.max(0, progress)) } : ind
    )
    return await updateData({ indicators: newIndicators })
  }, [data.indicators, updateData])

  const refresh = useCallback(() => {
    if (accessToken && sheetId) {
      fetchData(accessToken, sheetId)
    }
  }, [accessToken, sheetId, fetchData])

  const openSheet = useCallback(() => {
    if (sheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank')
    }
  }, [sheetId])

  return {
    data,
    isLoading,
    isSaving,
    error,
    isInitialized,
    updateData,
    toggleRoutine,
    updateIndicator,
    refresh,
    openSheet
  }
}
