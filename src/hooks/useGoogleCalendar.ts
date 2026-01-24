import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  location?: string
  color?: string
}

export interface NewEventData {
  title: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm (optional for all-day)
  endTime?: string // HH:mm (optional for all-day)
  isAllDay: boolean
}

export interface BatchEventData {
  title: string
  startTime: string // HH:mm
  endTime: string   // HH:mm
}

export interface UpdateEventData {
  title?: string
  date?: string
  startTime?: string
  endTime?: string
  isAllDay?: boolean
}

// Parse Google Calendar event
function parseEvent(event: any): CalendarEvent {
  const start = event.start.dateTime
    ? new Date(event.start.dateTime)
    : new Date(event.start.date + 'T00:00:00')
  const end = event.end.dateTime
    ? new Date(event.end.dateTime)
    : new Date(event.end.date + 'T23:59:59')

  return {
    id: event.id,
    title: event.summary || '(제목 없음)',
    start,
    end,
    isAllDay: !event.start.dateTime,
    location: event.location,
    color: event.colorId
  }
}

export function useGoogleCalendar() {
  const { isSignedIn, isLoading: authLoading, accessToken, signIn, signOut } = useGoogleAuth()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch events from Google Calendar API
  const fetchEvents = useCallback(async (token: string, startDate?: Date, endDate?: Date) => {
    try {
      setIsLoading(true)
      setError(null)

      const now = new Date()
      const startOfDay = startDate
        ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        : new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = endDate
        ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfDay.toISOString()}&` +
        `timeMax=${endOfDay.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {
        signOut()
        return
      }

      if (!response.ok) {
        throw new Error('캘린더 정보를 가져올 수 없습니다')
      }

      const data = await response.json()
      setEvents((data.items || []).map(parseEvent))
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [signOut])

  // Fetch events when signed in
  useEffect(() => {
    if (isSignedIn && accessToken) {
      fetchEvents(accessToken)
    } else {
      setEvents([])
    }
  }, [isSignedIn, accessToken, fetchEvents])

  // Add event to Google Calendar
  const addEvent = useCallback(async (eventData: NewEventData): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const event: any = {
        summary: eventData.title,
      }

      if (eventData.isAllDay) {
        event.start = { date: eventData.date }
        const endDate = new Date(eventData.date)
        endDate.setDate(endDate.getDate() + 1)
        event.end = { date: endDate.toISOString().split('T')[0] }
      } else {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        event.start = {
          dateTime: `${eventData.date}T${eventData.startTime}:00`,
          timeZone
        }
        event.end = {
          dateTime: `${eventData.date}T${eventData.endTime}:00`,
          timeZone
        }
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )

      if (response.status === 401) {
        signOut()
        return false
      }

      if (!response.ok) {
        throw new Error('이벤트를 추가할 수 없습니다')
      }

      await fetchEvents(accessToken)
      return true
    } catch (err) {
      console.error('Failed to add event:', err)
      return false
    }
  }, [accessToken, fetchEvents, signOut])

  // Batch add events
  const addBatchEvents = useCallback(async (date: string, batchEvents: BatchEventData[]): Promise<{ success: number; failed: number }> => {
    if (!accessToken) return { success: 0, failed: batchEvents.length }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    let success = 0
    let failed = 0

    for (const eventData of batchEvents) {
      try {
        let endDate = date
        if (eventData.endTime === '00:00' || eventData.endTime < eventData.startTime) {
          const nextDay = new Date(date)
          nextDay.setDate(nextDay.getDate() + 1)
          endDate = nextDay.toISOString().split('T')[0]
        }

        const event = {
          summary: eventData.title,
          start: {
            dateTime: `${date}T${eventData.startTime}:00`,
            timeZone
          },
          end: {
            dateTime: `${endDate}T${eventData.endTime}:00`,
            timeZone
          }
        }

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          }
        )

        if (response.ok) {
          success++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }

    await fetchEvents(accessToken)
    return { success, failed }
  }, [accessToken, fetchEvents])

  // Toggle event complete status
  const toggleEventComplete = useCallback(async (eventId: string, currentTitle: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const isCompleted = currentTitle.startsWith('✅ ')
      const newTitle = isCompleted
        ? currentTitle.replace('✅ ', '')
        : `✅ ${currentTitle}`

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ summary: newTitle })
        }
      )

      if (response.status === 401) {
        signOut()
        return false
      }

      if (!response.ok) return false

      await fetchEvents(accessToken)
      return true
    } catch (err) {
      console.error('Failed to toggle event:', err)
      return false
    }
  }, [accessToken, fetchEvents, signOut])

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 401) {
        signOut()
        return false
      }

      if (!response.ok && response.status !== 204) return false

      await fetchEvents(accessToken)
      return true
    } catch (err) {
      console.error('Failed to delete event:', err)
      return false
    }
  }, [accessToken, fetchEvents, signOut])

  // Update event
  const updateEvent = useCallback(async (eventId: string, data: UpdateEventData): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const event: any = {}

      if (data.title !== undefined) {
        event.summary = data.title
      }

      if (data.date !== undefined) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (data.isAllDay) {
          event.start = { date: data.date }
          const endDate = new Date(data.date)
          endDate.setDate(endDate.getDate() + 1)
          event.end = { date: endDate.toISOString().split('T')[0] }
        } else if (data.startTime && data.endTime) {
          event.start = {
            dateTime: `${data.date}T${data.startTime}:00`,
            timeZone
          }
          event.end = {
            dateTime: `${data.date}T${data.endTime}:00`,
            timeZone
          }
        }
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )

      if (response.status === 401) {
        signOut()
        return false
      }

      if (!response.ok) return false

      await fetchEvents(accessToken)
      return true
    } catch (err) {
      console.error('Failed to update event:', err)
      return false
    }
  }, [accessToken, fetchEvents, signOut])

  const refresh = useCallback((startDate?: Date, endDate?: Date) => {
    if (accessToken) {
      fetchEvents(accessToken, startDate, endDate)
    }
  }, [accessToken, fetchEvents])

  return {
    events,
    isLoading: authLoading || isLoading,
    error,
    isSignedIn,
    signIn,
    signOut,
    refresh,
    addEvent,
    addBatchEvents,
    toggleEventComplete,
    deleteEvent,
    updateEvent,
    accessToken
  }
}
