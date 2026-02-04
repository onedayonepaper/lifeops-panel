import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files'
const SPREADSHEET_NAME = 'LifeOps Data'
const SPREADSHEET_ID_KEY = 'lifeops_data_spreadsheet_id'

const TEMPLATE_SHEET = '루틴 템플릿'
const LOG_SHEET = '루틴 기록'

// 기본 루틴 템플릿
const DEFAULT_ROUTINES = [
  { id: 'r-1', label: '(스펙) 일본어 JLPT 공부', detail: 'JLPT 강의 1개 > JLPT 책 10분 > 단어/문법 10개 암기', category: '스펙', order: 1, actionUrl: '/japanese', actionLabel: '일본어' },
  { id: 'r-2', label: '(스펙) 토익스피킹 자격증 따기', detail: '토익스피킹 문제 풀이 or 모범답안 암기 or 실전 연습', category: '스펙', order: 2 },
  { id: 'r-3', label: '(취업) 취업루틴', detail: '공고 1개 체크 > 이력서 1줄 수정 > 포폴 1개 정리', category: '취업', order: 3, actionUrl: '/employment', actionLabel: '취업관리' },
]

export interface RoutineTemplate {
  id: string
  label: string
  detail?: string
  category?: string
  order: number
  actionUrl?: string
  actionLabel?: string
}

export interface RoutineLogItem {
  id: string
  routineId: string
  label: string
  detail?: string
  date: string  // YYYY-MM-DD
  completed: boolean
  completedAt?: string  // ISO datetime
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function useDailyRoutineSheet() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [templates, setTemplates] = useState<RoutineTemplate[]>([])
  const [todayLogs, setTodayLogs] = useState<RoutineLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    () => localStorage.getItem(SPREADSHEET_ID_KEY)
  )

  // 스프레드시트 찾기 또는 생성
  const getOrCreateSpreadsheet = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null

    const cachedId = localStorage.getItem(SPREADSHEET_ID_KEY)
    if (cachedId) {
      try {
        const response = await fetch(`${SHEETS_API}/${cachedId}?fields=spreadsheetId`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (response.ok) {
          setSpreadsheetId(cachedId)
          return cachedId
        }
      } catch {
        // 캐시 무효
      }
      localStorage.removeItem(SPREADSHEET_ID_KEY)
    }

    // Drive에서 검색
    try {
      const searchResponse = await fetch(
        `${DRIVE_API}?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (searchResponse.ok) {
        const data = await searchResponse.json()
        if (data.files && data.files.length > 0) {
          const id = data.files[0].id
          localStorage.setItem(SPREADSHEET_ID_KEY, id)
          setSpreadsheetId(id)
          return id
        }
      }
    } catch (err) {
      console.error('Drive search error:', err)
    }

    return null
  }, [accessToken])

  // 시트 존재 확인 및 생성
  const ensureSheets = useCallback(async (sheetId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const metaResponse = await fetch(
        `${SHEETS_API}/${sheetId}?fields=sheets.properties.title`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!metaResponse.ok) return false

      const meta = await metaResponse.json()
      const existingSheets = meta.sheets?.map((s: any) => s.properties.title) || []

      const requests: any[] = []

      // 템플릿 시트
      if (!existingSheets.includes(TEMPLATE_SHEET)) {
        requests.push({ addSheet: { properties: { title: TEMPLATE_SHEET } } })
      }

      // 로그 시트
      if (!existingSheets.includes(LOG_SHEET)) {
        requests.push({ addSheet: { properties: { title: LOG_SHEET } } })
      }

      if (requests.length > 0) {
        await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests })
        })
      }

      // 헤더 설정
      const templateHeaders = ['id', 'label', 'detail', 'category', 'order', 'actionUrl', 'actionLabel']
      const logHeaders = ['id', 'routineId', 'label', 'detail', 'date', 'completed', 'completedAt']

      // 템플릿 헤더 확인
      const templateHeaderResponse = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'!1:1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const templateHeaderData = await templateHeaderResponse.json()
      if (!templateHeaderData.values || templateHeaderData.values[0]?.length !== templateHeaders.length) {
        await fetch(
          `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'!A1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [templateHeaders] })
          }
        )
      }

      // 로그 헤더 확인
      const logHeaderResponse = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!1:1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const logHeaderData = await logHeaderResponse.json()
      if (!logHeaderData.values || logHeaderData.values[0]?.length !== logHeaders.length) {
        await fetch(
          `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!A1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [logHeaders] })
          }
        )
      }

      return true
    } catch (err) {
      console.error('Ensure sheets error:', err)
      return false
    }
  }, [accessToken])

  // 템플릿 로드
  const loadTemplates = useCallback(async (sheetId: string): Promise<RoutineTemplate[]> => {
    if (!accessToken) return []

    try {
      const response = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) return []

      const data = await response.json()
      const rows = data.values || []

      if (rows.length <= 1) {
        // 기본 템플릿 추가
        const values = DEFAULT_ROUTINES.map(r => [
          r.id, r.label, r.detail || '', r.category || '', r.order, r.actionUrl || '', r.actionLabel || ''
        ])

        await fetch(
          `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values })
          }
        )

        return DEFAULT_ROUTINES
      }

      return rows.slice(1).map((row: string[]) => ({
        id: row[0] || '',
        label: row[1] || '',
        detail: row[2] || undefined,
        category: row[3] || undefined,
        order: parseInt(row[4]) || 0,
        actionUrl: row[5] || undefined,
        actionLabel: row[6] || undefined
      })).sort((a: RoutineTemplate, b: RoutineTemplate) => a.order - b.order)
    } catch (err) {
      console.error('Load templates error:', err)
      return []
    }
  }, [accessToken])

  // 오늘 로그 로드
  const loadTodayLogs = useCallback(async (sheetId: string): Promise<RoutineLogItem[]> => {
    if (!accessToken) return []

    const today = getTodayKey()

    try {
      const response = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(LOG_SHEET)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) return []

      const data = await response.json()
      const rows = data.values || []

      if (rows.length <= 1) return []

      return rows.slice(1)
        .map((row: string[], index: number) => ({
          id: row[0] || '',
          routineId: row[1] || '',
          label: row[2] || '',
          detail: row[3] || undefined,
          date: row[4] || '',
          completed: row[5] === 'true',
          completedAt: row[6] || undefined,
          _rowIndex: index + 2  // 행 번호 (1-based, 헤더 제외)
        }))
        .filter((log: RoutineLogItem) => log.date === today)
    } catch (err) {
      console.error('Load today logs error:', err)
      return []
    }
  }, [accessToken])

  // 오늘 로그 생성 (템플릿 기반, 기존 로그의 routineId는 제외)
  const createTodayLogs = useCallback(async (
    sheetId: string,
    templates: RoutineTemplate[],
    existingRoutineIds: Set<string> = new Set()
  ): Promise<RoutineLogItem[]> => {
    if (!accessToken || templates.length === 0) return []

    const today = getTodayKey()

    // 이미 존재하는 routineId는 제외
    const templatesToCreate = templates.filter(t => !existingRoutineIds.has(t.id))

    if (templatesToCreate.length === 0) return []

    const newLogs: RoutineLogItem[] = templatesToCreate.map(t => ({
      id: `log_${t.id}_${today}`,
      routineId: t.id,
      label: t.label,
      detail: t.detail,
      date: today,
      completed: false
    }))

    const values = newLogs.map(log => [
      log.id, log.routineId, log.label, log.detail || '', log.date, 'false', ''
    ])

    try {
      await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values })
        }
      )

      return newLogs
    } catch (err) {
      console.error('Create today logs error:', err)
      return []
    }
  }, [accessToken])

  // 초기 로드
  const loadData = useCallback(async () => {
    if (!accessToken || !isSignedIn) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sheetId = await getOrCreateSpreadsheet()
      if (!sheetId) {
        setError('스프레드시트를 찾을 수 없습니다')
        setIsLoading(false)
        return
      }

      await ensureSheets(sheetId)

      const loadedTemplates = await loadTemplates(sheetId)
      setTemplates(loadedTemplates)

      let logs = await loadTodayLogs(sheetId)

      // 중복 로그 제거 (routineId 기준, 첫 번째만 유지)
      const seenRoutineIds = new Set<string>()
      logs = logs.filter(log => {
        if (seenRoutineIds.has(log.routineId)) {
          return false
        }
        seenRoutineIds.add(log.routineId)
        return true
      })

      // 기존 로그에 없는 템플릿만 추가 생성
      if (loadedTemplates.length > 0) {
        const existingRoutineIds = new Set(logs.map(l => l.routineId))
        const newLogs = await createTodayLogs(sheetId, loadedTemplates, existingRoutineIds)
        logs = [...logs, ...newLogs]
      }

      setTodayLogs(logs)
    } catch (err) {
      console.error('Load data error:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다')
    }

    setIsLoading(false)
  }, [accessToken, isSignedIn, getOrCreateSpreadsheet, ensureSheets, loadTemplates, loadTodayLogs, createTodayLogs])

  // 로그인 시 데이터 로드
  useEffect(() => {
    if (isSignedIn && accessToken) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, accessToken, loadData])

  // 항목 토글
  const toggleItem = useCallback(async (logId: string) => {
    if (!accessToken || !spreadsheetId) return

    const log = todayLogs.find(l => l.id === logId)
    if (!log) return

    const newCompleted = !log.completed
    const completedAt = newCompleted ? new Date().toISOString() : ''

    setIsSaving(true)

    try {
      // 전체 로그 데이터 로드해서 행 번호 찾기
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) throw new Error('로그 조회 실패')

      const data = await response.json()
      const rows = data.values || []

      const rowIndex = rows.findIndex((row: string[], idx: number) => idx > 0 && row[0] === logId)

      if (rowIndex === -1) throw new Error('로그를 찾을 수 없습니다')

      // 업데이트
      await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!F${rowIndex + 1}:G${rowIndex + 1}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[String(newCompleted), completedAt]] })
        }
      )

      // 상태 업데이트
      setTodayLogs(prev => prev.map(l =>
        l.id === logId ? { ...l, completed: newCompleted, completedAt: completedAt || undefined } : l
      ))
    } catch (err) {
      console.error('Toggle error:', err)
      setError('상태 업데이트 실패')
    }

    setIsSaving(false)
  }, [accessToken, spreadsheetId, todayLogs])

  // 항목 추가 (템플릿 + 오늘 로그)
  const addItem = useCallback(async (label: string, detail?: string) => {
    if (!accessToken || !spreadsheetId || !label.trim()) return

    setIsSaving(true)

    const today = getTodayKey()
    const newId = `r-${Date.now()}`
    const order = templates.length + 1

    try {
      // 템플릿에 추가
      await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[newId, label, detail || '', '', order, '', '']] })
        }
      )

      // 오늘 로그에 추가
      const logId = `log_${newId}_${today}`
      await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[logId, newId, label, detail || '', today, 'false', '']] })
        }
      )

      // 상태 업데이트
      const newTemplate: RoutineTemplate = { id: newId, label, detail, order }
      const newLog: RoutineLogItem = { id: logId, routineId: newId, label, detail, date: today, completed: false }

      setTemplates(prev => [...prev, newTemplate])
      setTodayLogs(prev => [...prev, newLog])
    } catch (err) {
      console.error('Add item error:', err)
      setError('항목 추가 실패')
    }

    setIsSaving(false)
  }, [accessToken, spreadsheetId, templates])

  // 항목 삭제 (템플릿에서 삭제, 로그는 유지)
  const removeItem = useCallback(async (routineId: string) => {
    if (!accessToken || !spreadsheetId) return

    setIsSaving(true)

    try {
      // 스프레드시트 메타데이터에서 시트 ID 가져오기
      const metaResponse = await fetch(
        `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!metaResponse.ok) throw new Error('메타데이터 조회 실패')

      const meta = await metaResponse.json()
      const templateSheet = meta.sheets?.find((s: any) => s.properties.title === TEMPLATE_SHEET)

      if (!templateSheet) throw new Error('시트를 찾을 수 없습니다')

      const templateSheetId = templateSheet.properties.sheetId

      // 템플릿에서 행 찾기
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(TEMPLATE_SHEET)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) throw new Error('템플릿 조회 실패')

      const data = await response.json()
      const rows = data.values || []

      const rowIndex = rows.findIndex((row: string[], idx: number) => idx > 0 && row[0] === routineId)

      if (rowIndex === -1) throw new Error('항목을 찾을 수 없습니다')

      // 행 삭제
      await fetch(
        `${SHEETS_API}/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: templateSheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }]
          })
        }
      )

      // 상태 업데이트
      setTemplates(prev => prev.filter(t => t.id !== routineId))
      setTodayLogs(prev => prev.filter(l => l.routineId !== routineId))
    } catch (err) {
      console.error('Remove item error:', err)
      setError('항목 삭제 실패')
    }

    setIsSaving(false)
  }, [accessToken, spreadsheetId])

  // 내일로 미루기
  const postponeItem = useCallback(async (logId: string) => {
    if (!accessToken || !spreadsheetId) return

    const log = todayLogs.find(l => l.id === logId)
    if (!log) return

    setIsSaving(true)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    try {
      // 전체 로그 데이터 로드
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) throw new Error('로그 조회 실패')

      const data = await response.json()
      const rows = data.values || []

      const rowIndex = rows.findIndex((row: string[], idx: number) => idx > 0 && row[0] === logId)

      if (rowIndex === -1) throw new Error('로그를 찾을 수 없습니다')

      // 날짜 업데이트
      await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'!E${rowIndex + 1}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [[tomorrowStr]] })
        }
      )

      // 상태 업데이트 (오늘 목록에서 제거)
      setTodayLogs(prev => prev.filter(l => l.id !== logId))
    } catch (err) {
      console.error('Postpone error:', err)
      setError('미루기 실패')
    }

    setIsSaving(false)
  }, [accessToken, spreadsheetId, todayLogs])

  // 오늘 초기화 (새 로그 생성)
  const resetToday = useCallback(async () => {
    if (!accessToken || !spreadsheetId || templates.length === 0) return
    if (!confirm('오늘 체크리스트를 초기화할까요?')) return

    setIsSaving(true)

    try {
      const today = getTodayKey()

      // 오늘 로그 삭제 (시트에서)
      const metaResponse = await fetch(
        `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!metaResponse.ok) throw new Error('메타데이터 조회 실패')

      const meta = await metaResponse.json()
      const logSheet = meta.sheets?.find((s: any) => s.properties.title === LOG_SHEET)

      if (logSheet) {
        const logSheetId = logSheet.properties.sheetId

        // 전체 로그 조회
        const response = await fetch(
          `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(LOG_SHEET)}'`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        if (response.ok) {
          const data = await response.json()
          const rows = data.values || []

          // 오늘 날짜 행 찾기 (역순으로 삭제)
          const todayRowIndices = rows
            .map((row: string[], idx: number) => ({ row, idx }))
            .filter(({ row, idx }: { row: string[], idx: number }) => idx > 0 && row[4] === today)
            .map(({ idx }: { idx: number }) => idx)
            .reverse()

          for (const idx of todayRowIndices) {
            await fetch(
              `${SHEETS_API}/${spreadsheetId}:batchUpdate`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  requests: [{
                    deleteDimension: {
                      range: { sheetId: logSheetId, dimension: 'ROWS', startIndex: idx, endIndex: idx + 1 }
                    }
                  }]
                })
              }
            )
          }
        }
      }

      // 새 로그 생성
      const newLogs = await createTodayLogs(spreadsheetId, templates)
      setTodayLogs(newLogs)
    } catch (err) {
      console.error('Reset error:', err)
      setError('초기화 실패')
    }

    setIsSaving(false)
  }, [accessToken, spreadsheetId, templates, createTodayLogs])

  // 통계
  const stats = useMemo(() => {
    const total = todayLogs.length
    const completed = todayLogs.filter(l => l.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [todayLogs])

  // 스프레드시트 URL
  const spreadsheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    : null

  return {
    templates,
    todayLogs,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    toggleItem,
    addItem,
    removeItem,
    postponeItem,
    resetToday,
    refresh: loadData,
    stats,
    spreadsheetUrl
  }
}
