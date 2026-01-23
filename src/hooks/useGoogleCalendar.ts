import { useState, useEffect, useCallback } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  location?: string
  color?: string
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
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script load failed'))
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

  // Fetch events from Google Calendar API
  const fetchEvents = useCallback(async (token: string) => {
    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7) // Next 7 days

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
        // Token expired
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

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null // No error, just not configured
      }))
      return
    }

    loadGoogleScript()
      .then(() => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              localStorage.setItem('google_calendar_token', response.access_token)
              setAccessToken(response.access_token)
              fetchEvents(response.access_token)
            }
          }
        })
        setTokenClient(client)

        // If we have a stored token, try to use it
        if (accessToken) {
          fetchEvents(accessToken)
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      })
      .catch(() => {
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

  return { ...state, signIn, signOut, refresh }
}
