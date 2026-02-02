import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

export interface LifeAnchor {
  id: string // local id
  summary: string
  time: string // HH:mm
  eventId?: string // Google Calendar event ID
  enabled: boolean
  recurrence: 'daily' | 'weekdays'
}

interface StoredAnchors {
  anchors: LifeAnchor[]
  lastUpdated: string
}

const STORAGE_KEY = 'life-anchors'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

const DEFAULT_ANCHORS: LifeAnchor[] = [
  { id: 'wake-up', summary: '기상', time: '07:00', enabled: true, recurrence: 'daily' },
  { id: 'water', summary: '물 한 컵', time: '07:05', enabled: true, recurrence: 'daily' },
  { id: 'supplements', summary: '건강기능식품(식후)', time: '08:00', enabled: true, recurrence: 'daily' },
  { id: 'bedtime', summary: '취침 준비 시작', time: '23:00', enabled: true, recurrence: 'daily' },
]

function getRecurrenceRule(type: 'daily' | 'weekdays'): string {
  if (type === 'weekdays') {
    return 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
  }
  return 'RRULE:FREQ=DAILY'
}

function getDateTimeForTime(time: string): { start: string; end: string } {
  const today = new Date()
  const [hours, minutes] = time.split(':').map(Number)

  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0)
  const endDate = new Date(startDate.getTime() + 5 * 60 * 1000) // 5분 후

  const formatDateTime = (date: Date) => {
    // 로컬 시간을 직접 포맷 (UTC 변환 없이)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const sec = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hour}:${min}:${sec}+09:00`
  }

  return {
    start: formatDateTime(startDate),
    end: formatDateTime(endDate)
  }
}

export function useLifeAnchors() {
  const { accessToken, isSignedIn } = useGoogleAuth()
  const [anchors, setAnchors] = useState<LifeAnchor[]>([])
  const [isLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: StoredAnchors = JSON.parse(stored)
        setAnchors(data.anchors)
      } catch {
        setAnchors(DEFAULT_ANCHORS)
      }
    } else {
      setAnchors(DEFAULT_ANCHORS)
    }
  }, [])

  // Save to localStorage whenever anchors change
  const saveAnchors = useCallback((newAnchors: LifeAnchor[]) => {
    const data: StoredAnchors = {
      anchors: newAnchors,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setAnchors(newAnchors)
  }, [])

  // Search for existing event by summary
  const findExistingEvent = useCallback(async (summary: string): Promise<string | null> => {
    if (!accessToken) return null

    try {
      const response = await fetch(
        `${CALENDAR_API}?q=${encodeURIComponent(summary)}&maxResults=10&singleEvents=false`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      const event = data.items?.find((e: any) =>
        e.summary === summary && e.recurrence?.length > 0
      )

      return event?.id || null
    } catch {
      return null
    }
  }, [accessToken])

  // Create a recurring event in Google Calendar
  const createEvent = useCallback(async (anchor: LifeAnchor): Promise<string | null> => {
    if (!accessToken) return null

    const { start, end } = getDateTimeForTime(anchor.time)

    const event = {
      summary: anchor.summary,
      start: { dateTime: start, timeZone: 'Asia/Seoul' },
      end: { dateTime: end, timeZone: 'Asia/Seoul' },
      recurrence: [getRecurrenceRule(anchor.recurrence)],
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 0 }]
      }
    }

    try {
      const response = await fetch(CALENDAR_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error('이벤트 생성 실패')
      }

      const created = await response.json()
      return created.id
    } catch (err) {
      console.error('Failed to create event:', err)
      return null
    }
  }, [accessToken])

  // Update existing event
  const updateEvent = useCallback(async (anchor: LifeAnchor): Promise<boolean> => {
    if (!accessToken || !anchor.eventId) return false

    const { start, end } = getDateTimeForTime(anchor.time)

    const event = {
      summary: anchor.summary,
      start: { dateTime: start, timeZone: 'Asia/Seoul' },
      end: { dateTime: end, timeZone: 'Asia/Seoul' },
      recurrence: [getRecurrenceRule(anchor.recurrence)],
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 0 }]
      }
    }

    try {
      const response = await fetch(`${CALENDAR_API}/${anchor.eventId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      return response.ok
    } catch {
      return false
    }
  }, [accessToken])

  // Delete event from Google Calendar
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(`${CALENDAR_API}/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      return response.ok || response.status === 204 || response.status === 410
    } catch {
      return false
    }
  }, [accessToken])

  // Sync all anchors with Google Calendar
  const syncWithCalendar = useCallback(async () => {
    if (!accessToken || !isSignedIn) {
      setError('Google 로그인이 필요합니다')
      return
    }

    setIsSyncing(true)
    setError(null)

    const updatedAnchors = [...anchors]
    let hasChanges = false

    for (let i = 0; i < updatedAnchors.length; i++) {
      const anchor = updatedAnchors[i]

      if (!anchor.enabled) {
        // 비활성화된 앵커의 이벤트 삭제
        if (anchor.eventId) {
          await deleteEvent(anchor.eventId)
          updatedAnchors[i] = { ...anchor, eventId: undefined }
          hasChanges = true
        }
        continue
      }

      // 이미 eventId가 있으면 업데이트
      if (anchor.eventId) {
        const success = await updateEvent(anchor)
        if (!success) {
          // 업데이트 실패 시 이벤트가 삭제된 것일 수 있음 - 재생성
          const existingId = await findExistingEvent(anchor.summary)
          if (existingId) {
            updatedAnchors[i] = { ...anchor, eventId: existingId }
            await updateEvent({ ...anchor, eventId: existingId })
          } else {
            const newId = await createEvent(anchor)
            if (newId) {
              updatedAnchors[i] = { ...anchor, eventId: newId }
              hasChanges = true
            }
          }
        }
        continue
      }

      // eventId가 없으면 먼저 캘린더에서 검색
      const existingId = await findExistingEvent(anchor.summary)
      if (existingId) {
        updatedAnchors[i] = { ...anchor, eventId: existingId }
        hasChanges = true
        // 기존 이벤트 업데이트
        await updateEvent({ ...anchor, eventId: existingId })
      } else {
        // 새로 생성
        const newId = await createEvent(anchor)
        if (newId) {
          updatedAnchors[i] = { ...anchor, eventId: newId }
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      saveAnchors(updatedAnchors)
    }

    setIsSyncing(false)
  }, [accessToken, isSignedIn, anchors, createEvent, updateEvent, deleteEvent, findExistingEvent, saveAnchors])

  // Update a single anchor (local + calendar)
  const updateAnchor = useCallback(async (
    id: string,
    updates: Partial<Omit<LifeAnchor, 'id' | 'eventId'>>
  ) => {
    const anchorIndex = anchors.findIndex(a => a.id === id)
    if (anchorIndex === -1) return

    const anchor = anchors[anchorIndex]
    const updated = { ...anchor, ...updates }

    const newAnchors = [...anchors]
    newAnchors[anchorIndex] = updated
    saveAnchors(newAnchors)

    // 캘린더 동기화
    if (accessToken && isSignedIn) {
      setIsSyncing(true)

      if (!updated.enabled && anchor.eventId) {
        // 비활성화 시 삭제
        await deleteEvent(anchor.eventId)
        newAnchors[anchorIndex] = { ...updated, eventId: undefined }
        saveAnchors(newAnchors)
      } else if (updated.enabled && anchor.eventId) {
        // 활성화 + 기존 이벤트 있으면 업데이트
        await updateEvent(updated)
      } else if (updated.enabled && !anchor.eventId) {
        // 활성화 + 이벤트 없으면 생성
        const existingId = await findExistingEvent(updated.summary)
        if (existingId) {
          newAnchors[anchorIndex] = { ...updated, eventId: existingId }
          await updateEvent({ ...updated, eventId: existingId })
        } else {
          const newId = await createEvent(updated)
          if (newId) {
            newAnchors[anchorIndex] = { ...updated, eventId: newId }
          }
        }
        saveAnchors(newAnchors)
      }

      setIsSyncing(false)
    }
  }, [anchors, accessToken, isSignedIn, saveAnchors, updateEvent, deleteEvent, createEvent, findExistingEvent])

  // Add new anchor
  const addAnchor = useCallback((summary: string, time: string) => {
    const newAnchor: LifeAnchor = {
      id: `custom-${Date.now()}`,
      summary,
      time,
      enabled: true,
      recurrence: 'daily'
    }
    saveAnchors([...anchors, newAnchor])
  }, [anchors, saveAnchors])

  // Remove anchor
  const removeAnchor = useCallback(async (id: string) => {
    const anchor = anchors.find(a => a.id === id)
    if (!anchor) return

    // 캘린더에서 삭제
    if (anchor.eventId && accessToken) {
      await deleteEvent(anchor.eventId)
    }

    saveAnchors(anchors.filter(a => a.id !== id))
  }, [anchors, accessToken, deleteEvent, saveAnchors])

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    // 기존 이벤트 모두 삭제
    if (accessToken) {
      for (const anchor of anchors) {
        if (anchor.eventId) {
          await deleteEvent(anchor.eventId)
        }
      }
    }
    saveAnchors(DEFAULT_ANCHORS)
  }, [anchors, accessToken, deleteEvent, saveAnchors])

  return {
    anchors,
    isLoading,
    isSyncing,
    error,
    isSignedIn,
    syncWithCalendar,
    updateAnchor,
    addAnchor,
    removeAnchor,
    resetToDefaults
  }
}
