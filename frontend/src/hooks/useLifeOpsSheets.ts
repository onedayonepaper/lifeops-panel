import { useState, useCallback, useEffect } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files'
const SPREADSHEET_NAME = 'LifeOps Data'
const SPREADSHEET_ID_KEY = 'lifeops_data_spreadsheet_id'

export interface SheetConfig {
  sheetName: string
  headers: readonly string[]
}

// 시트 설정 상수
export const SHEET_CONFIGS = {
  japanese: {
    sheetName: '일본어 학습',
    headers: ['id', 'date', 'characters', 'practiceCount', 'note']
  },
  portfolio: {
    sheetName: '포트폴리오 작업',
    headers: ['id', 'date', 'projectName', 'problem', 'action', 'tech', 'result', 'link', 'screenshots', 'demoVideo']
  },
  experience: {
    sheetName: '공고 수집',
    headers: ['id', 'date', 'companyName', 'position', 'url', 'deadline', 'notes']
  },
  application: {
    sheetName: '지원 현황',
    headers: ['id', 'name', 'logo', 'tier', 'position', 'status', 'deadline', 'appliedDate', 'notes', 'salary', 'techStack', 'url']
  },
  todayTasks: {
    sheetName: '오늘 할일',
    headers: ['id', 'title', 'completed', 'due', 'createdAt']
  },
  routineTemplate: {
    sheetName: '루틴 템플릿',
    headers: ['id', 'label', 'detail', 'category', 'order', 'actionUrl', 'actionLabel']
  },
  routineLog: {
    sheetName: '루틴 기록',
    headers: ['id', 'routineId', 'label', 'detail', 'date', 'completed', 'completedAt']
  },
  appliedCompany: {
    sheetName: '지원회사',
    headers: ['id', 'companyName', 'position', 'appliedDate', 'status', 'deadline', 'notes', 'result', 'url']
  },
  weakPoints: {
    sheetName: '부족한점',
    headers: ['id', 'name', 'category', 'currentLevel', 'targetLevel', 'status', 'notes', 'acquiredDate']
  }
} as const

export function useLifeOpsSheets<T>(
  config: SheetConfig,
  rowToObject: (row: string[], headers: string[]) => T,
  objectToRow: (obj: T) => string[]
) {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    () => localStorage.getItem(SPREADSHEET_ID_KEY)
  )

  // 스프레드시트 ID 가져오기 또는 생성
  const getOrCreateSpreadsheet = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null

    // 캐시된 ID 확인
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
        // 캐시된 ID가 유효하지 않음
      }
      localStorage.removeItem(SPREADSHEET_ID_KEY)
    }

    // Drive에서 기존 스프레드시트 검색
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

    // 스프레드시트 생성
    try {
      const createResponse = await fetch(SHEETS_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: SPREADSHEET_NAME },
          sheets: [
            { properties: { title: SHEET_CONFIGS.japanese.sheetName } },
            { properties: { title: SHEET_CONFIGS.portfolio.sheetName } },
            { properties: { title: SHEET_CONFIGS.experience.sheetName } },
            { properties: { title: SHEET_CONFIGS.application.sheetName } },
            { properties: { title: SHEET_CONFIGS.todayTasks.sheetName } },
            { properties: { title: SHEET_CONFIGS.routineTemplate.sheetName } },
            { properties: { title: SHEET_CONFIGS.routineLog.sheetName } },
            { properties: { title: SHEET_CONFIGS.appliedCompany.sheetName } },
            { properties: { title: SHEET_CONFIGS.weakPoints.sheetName } }
          ]
        })
      })

      if (createResponse.ok) {
        const data = await createResponse.json()
        localStorage.setItem(SPREADSHEET_ID_KEY, data.spreadsheetId)
        setSpreadsheetId(data.spreadsheetId)
        return data.spreadsheetId
      }
    } catch (err) {
      console.error('Spreadsheet creation error:', err)
    }

    return null
  }, [accessToken])

  // 시트 존재 확인 및 생성
  const ensureSheet = useCallback(async (sheetId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      // 스프레드시트 메타데이터 가져오기
      const metaResponse = await fetch(
        `${SHEETS_API}/${sheetId}?fields=sheets.properties.title`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!metaResponse.ok) return false

      const meta = await metaResponse.json()
      const sheetExists = meta.sheets?.some(
        (s: { properties: { title: string } }) => s.properties.title === config.sheetName
      )

      if (!sheetExists) {
        // 시트 생성
        await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{
              addSheet: { properties: { title: config.sheetName } }
            }]
          })
        })
      }

      // 헤더 확인 및 설정/업데이트
      const headerResponse = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(config.sheetName)}'!1:1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (headerResponse.ok) {
        const headerData = await headerResponse.json()
        const existingHeaders = headerData.values?.[0] || []
        const expectedHeaders = [...config.headers]

        // 헤더가 없거나 다르면 업데이트
        const headersMatch = existingHeaders.length === expectedHeaders.length &&
          existingHeaders.every((h: string, i: number) => h === expectedHeaders[i])

        if (!headersMatch) {
          // 헤더 설정/업데이트
          await fetch(
            `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(config.sheetName)}'!A1?valueInputOption=RAW`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ values: [expectedHeaders] })
            }
          )
        }
      }

      return true
    } catch (err) {
      console.error('Ensure sheet error:', err)
      return false
    }
  }, [accessToken, config.sheetName, config.headers])

  // 데이터 로드
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

      await ensureSheet(sheetId)

      const response = await fetch(
        `${SHEETS_API}/${sheetId}/values/'${encodeURIComponent(config.sheetName)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) {
        setIsLoading(false)
        return
      }

      const result = await response.json()
      const rows = result.values || []

      if (rows.length <= 1) {
        setData([])
        setIsLoading(false)
        return
      }

      // config.headers 사용 (시트 헤더가 업데이트되지 않았을 경우를 대비)
      const headers = [...config.headers] as string[]
      const items = rows.slice(1).map((row: string[]) => rowToObject(row, headers))
      setData(items)
      setIsLoading(false)
    } catch (err) {
      console.error('Load data error:', err)
      setError('데이터를 읽는 중 오류가 발생했습니다')
      setIsLoading(false)
    }
  }, [accessToken, isSignedIn, config.sheetName, config.headers, getOrCreateSpreadsheet, ensureSheet, rowToObject])

  // 데이터 추가
  const addItem = useCallback(async (item: T): Promise<boolean> => {
    if (!accessToken || !isSignedIn || !spreadsheetId) return false

    setIsSaving(true)
    setError(null)

    try {
      const values = objectToRow(item)
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(config.sheetName)}'!A:A:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [values] })
        }
      )

      if (response.ok) {
        setData(prev => [item, ...prev])
      }

      setIsSaving(false)
      return response.ok
    } catch (err) {
      console.error('Add item error:', err)
      setError('데이터를 저장하는 중 오류가 발생했습니다')
      setIsSaving(false)
      return false
    }
  }, [accessToken, isSignedIn, spreadsheetId, config.sheetName, objectToRow])

  // 데이터 업데이트
  const updateItem = useCallback(async (id: string, item: T): Promise<boolean> => {
    if (!accessToken || !isSignedIn || !spreadsheetId) return false

    setIsSaving(true)
    setError(null)

    try {
      // 모든 데이터 읽기
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(config.sheetName)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) {
        setIsSaving(false)
        return false
      }

      const result = await response.json()
      const rows = result.values || []

      // ID로 행 찾기
      const rowIndex = rows.findIndex((row: string[], idx: number) => idx > 0 && row[0] === id)

      if (rowIndex === -1) {
        setIsSaving(false)
        return false
      }

      const values = objectToRow(item)
      const updateResponse = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(config.sheetName)}'!A${rowIndex + 1}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [values] })
        }
      )

      if (updateResponse.ok) {
        setData(prev => prev.map(d => (d as any).id === id ? item : d))
      }

      setIsSaving(false)
      return updateResponse.ok
    } catch (err) {
      console.error('Update item error:', err)
      setError('데이터를 업데이트하는 중 오류가 발생했습니다')
      setIsSaving(false)
      return false
    }
  }, [accessToken, isSignedIn, spreadsheetId, config.sheetName, objectToRow])

  // 데이터 삭제
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    if (!accessToken || !isSignedIn || !spreadsheetId) return false

    setIsSaving(true)
    setError(null)

    try {
      // 스프레드시트 메타데이터에서 시트 ID 가져오기
      const metaResponse = await fetch(
        `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!metaResponse.ok) {
        setIsSaving(false)
        return false
      }

      const meta = await metaResponse.json()
      const sheet = meta.sheets?.find(
        (s: { properties: { title: string; sheetId: number } }) =>
          s.properties.title === config.sheetName
      )

      if (!sheet) {
        setIsSaving(false)
        return false
      }

      const sheetIdNum = sheet.properties.sheetId

      // 모든 데이터 읽기
      const response = await fetch(
        `${SHEETS_API}/${spreadsheetId}/values/'${encodeURIComponent(config.sheetName)}'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!response.ok) {
        setIsSaving(false)
        return false
      }

      const result = await response.json()
      const rows = result.values || []

      // ID로 행 찾기
      const rowIndex = rows.findIndex((row: string[], idx: number) => idx > 0 && row[0] === id)

      if (rowIndex === -1) {
        setIsSaving(false)
        return false
      }

      // 행 삭제
      const deleteResponse = await fetch(
        `${SHEETS_API}/${spreadsheetId}:batchUpdate`,
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
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1
                }
              }
            }]
          })
        }
      )

      if (deleteResponse.ok) {
        setData(prev => prev.filter(d => (d as any).id !== id))
      }

      setIsSaving(false)
      return deleteResponse.ok
    } catch (err) {
      console.error('Delete item error:', err)
      setError('데이터를 삭제하는 중 오류가 발생했습니다')
      setIsSaving(false)
      return false
    }
  }, [accessToken, isSignedIn, spreadsheetId, config.sheetName])

  // 초기 로드
  useEffect(() => {
    if (isSignedIn && accessToken) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, accessToken, loadData])

  // Google Sheets 직접 링크
  const spreadsheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    : null

  return {
    data,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    refresh: loadData,
    addItem,
    updateItem,
    deleteItem,
    spreadsheetUrl
  }
}
