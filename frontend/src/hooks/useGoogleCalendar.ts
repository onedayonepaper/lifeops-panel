import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { api } from '../lib/api'

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
  const { isSignedIn, isLoading: authLoading, signIn, signOut } = useGoogleAuth()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch events from backend API
  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!isSignedIn) return

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

      const items = await api.getCalendarEvents({
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        maxResults: 100
      })

      setEvents(items.map(parseEvent))
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        signOut()
        return
      }
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, signOut])

  // Fetch events when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchEvents()
    } else {
      setEvents([])
    }
  }, [isSignedIn, fetchEvents])

  // Add event to Google Calendar
  const addEvent = useCallback(async (eventData: NewEventData): Promise<boolean> => {
    if (!isSignedIn) return false

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

      await api.createCalendarEvent(event)
      await fetchEvents()
      return true
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        signOut()
      }
      console.error('Failed to add event:', err)
      return false
    }
  }, [isSignedIn, fetchEvents, signOut])

  // Batch add events
  const addBatchEvents = useCallback(async (date: string, batchEvents: BatchEventData[]): Promise<{ success: number; failed: number }> => {
    if (!isSignedIn) return { success: 0, failed: batchEvents.length }

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

        await api.createCalendarEvent(event)
        success++
      } catch {
        failed++
      }
    }

    await fetchEvents()
    return { success, failed }
  }, [isSignedIn, fetchEvents])

  // Toggle event complete status
  const toggleEventComplete = useCallback(async (eventId: string, currentTitle: string): Promise<boolean> => {
    if (!isSignedIn) return false

    try {
      const isCompleted = currentTitle.startsWith('✅ ')
      const newTitle = isCompleted
        ? currentTitle.replace('✅ ', '')
        : `✅ ${currentTitle}`

      await api.updateCalendarEvent(eventId, { summary: newTitle })
      await fetchEvents()
      return true
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        signOut()
      }
      console.error('Failed to toggle event:', err)
      return false
    }
  }, [isSignedIn, fetchEvents, signOut])

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    if (!isSignedIn) return false

    try {
      await api.deleteCalendarEvent(eventId)
      await fetchEvents()
      return true
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        signOut()
      }
      console.error('Failed to delete event:', err)
      return false
    }
  }, [isSignedIn, fetchEvents, signOut])

  // Update event
  const updateEvent = useCallback(async (eventId: string, data: UpdateEventData): Promise<boolean> => {
    if (!isSignedIn) return false

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

      await api.updateCalendarEvent(eventId, event)
      await fetchEvents()
      return true
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        signOut()
      }
      console.error('Failed to update event:', err)
      return false
    }
  }, [isSignedIn, fetchEvents, signOut])

  const refresh = useCallback((startDate?: Date, endDate?: Date) => {
    fetchEvents(startDate, endDate)
  }, [fetchEvents])

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
    updateEvent
  }
}
