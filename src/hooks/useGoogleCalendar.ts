import { useState, useEffect, useCallback } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/calendar.events'

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

interface GoogleCalendarState {
  events: CalendarEvent[]
  isLoading: boolean
  error: string | null
  isSignedIn: boolean
}

// Load Google Identity Services script
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity-script')) {
      // Script already exists, check if google object is available
      if ((window as any).google?.accounts?.oauth2) {
        resolve()
      } else {
        // Script exists but not loaded yet, wait for it
        const checkGoogle = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(checkGoogle)
            resolve()
          }
        }, 100)
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkGoogle)
          reject(new Error('Google script timeout'))
        }, 5000)
      }
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('[Calendar] Google script loaded')
      resolve()
    }
    script.onerror = (e) => {
      console.error('[Calendar] Google script load error:', e)
      reject(new Error('Google script load failed'))
    }
    document.head.appendChild(script)
  })
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

export function useGoogleCalendar(): GoogleCalendarState & {
  signIn: () => void
  signOut: () => void
  refresh: () => void
  addEvent: (eventData: NewEventData) => Promise<boolean>
  toggleEventComplete: (eventId: string, currentTitle: string) => Promise<boolean>
  accessToken: string | null
} {
  const [state, setState] = useState<GoogleCalendarState>({
    events: [],
    isLoading: true,
    error: null,
    isSignedIn: false
  })
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('google_calendar_token')
  )

  // Check if user has ever logged in before (for silent refresh)
  const hasLoggedInBefore = localStorage.getItem('google_calendar_has_logged_in') === 'true'

  // Fetch events from Google Calendar API
  const fetchEvents = useCallback(async (token: string) => {
    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${startOfDay.toISOString()}&` +
        `timeMax=${endOfDay.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {
        localStorage.removeItem('google_calendar_token')
        setAccessToken(null)
        setState(prev => ({
          ...prev,
          isSignedIn: false,
          isLoading: false,
          error: null,
          events: []
        }))
        return
      }

      if (!response.ok) {
        throw new Error('캘린더 정보를 가져올 수 없습니다')
      }

      const data = await response.json()
      const events = (data.items || []).map(parseEvent)

      setState({
        events,
        isLoading: false,
        error: null,
        isSignedIn: true
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '오류가 발생했습니다'
      }))
    }
  }, [])

  // Add event to Google Calendar
  const addEvent = useCallback(async (eventData: NewEventData): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const event: any = {
        summary: eventData.title,
      }

      if (eventData.isAllDay) {
        event.start = { date: eventData.date }
        // For all-day events, end date should be the next day
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
        localStorage.removeItem('google_calendar_token')
        setAccessToken(null)
        setState(prev => ({ ...prev, isSignedIn: false }))
        return false
      }

      if (!response.ok) {
        throw new Error('이벤트를 추가할 수 없습니다')
      }

      // Refresh events after adding
      await fetchEvents(accessToken)
      return true
    } catch (error) {
      console.error('Failed to add event:', error)
      return false
    }
  }, [accessToken, fetchEvents])

  // Initialize Google Identity Services
  useEffect(() => {
    console.log('[Calendar] Init - Client ID:', GOOGLE_CLIENT_ID ? 'SET' : 'MISSING')

    if (!GOOGLE_CLIENT_ID) {
      console.log('[Calendar] No client ID, skipping Google init')
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }))
      return
    }

    let client: any = null

    loadGoogleScript()
      .then(() => {
        console.log('[Calendar] Script loaded, initializing client...')
        client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            console.log('[Calendar] OAuth callback:', response.error || 'success')
            if (response.access_token) {
              localStorage.setItem('google_calendar_token', response.access_token)
              localStorage.setItem('google_calendar_has_logged_in', 'true')
              setAccessToken(response.access_token)
              fetchEvents(response.access_token)
            } else if (response.error) {
              // Silent refresh failed, user needs to click login
              console.log('[Calendar] Silent refresh failed:', response.error)
              setState(prev => ({ ...prev, isLoading: false }))
            }
          }
        })
        setTokenClient(client)
        console.log('[Calendar] Token client initialized')

        if (accessToken) {
          console.log('[Calendar] Existing token found, fetching events...')
          fetchEvents(accessToken)
        } else if (hasLoggedInBefore) {
          // Only try silent refresh if user has logged in before
          console.log('[Calendar] Attempting silent token refresh...')
          try {
            client.requestAccessToken({ prompt: '' })
          } catch (e) {
            console.log('[Calendar] Silent refresh not available')
            setState(prev => ({ ...prev, isLoading: false }))
          }
        } else {
          // First time user - show login button immediately
          console.log('[Calendar] First time user, showing login button')
          setState(prev => ({ ...prev, isLoading: false }))
        }
      })
      .catch((err) => {
        console.error('[Calendar] Init error:', err)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Google 스크립트를 불러올 수 없습니다'
        }))
      })
  }, [accessToken, fetchEvents])

  const signIn = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    }
  }, [tokenClient])

  const signOut = useCallback(() => {
    localStorage.removeItem('google_calendar_token')
    localStorage.removeItem('google_calendar_has_logged_in')
    setAccessToken(null)
    setState({
      events: [],
      isLoading: false,
      error: null,
      isSignedIn: false
    })
  }, [])

  const refresh = useCallback(() => {
    if (accessToken) {
      setState(prev => ({ ...prev, isLoading: true }))
      fetchEvents(accessToken)
    }
  }, [accessToken, fetchEvents])

  // Toggle event complete status (add/remove ✅ from title)
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
        localStorage.removeItem('google_calendar_token')
        setAccessToken(null)
        setState(prev => ({ ...prev, isSignedIn: false }))
        return false
      }

      if (!response.ok) return false

      // Refresh events after toggling
      await fetchEvents(accessToken)
      return true
    } catch (error) {
      console.error('Failed to toggle event:', error)
      return false
    }
  }, [accessToken, fetchEvents])

  return { ...state, signIn, signOut, refresh, addEvent, toggleEventComplete, accessToken }
}
