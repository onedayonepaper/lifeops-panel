import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file'

interface GoogleAuthContextType {
  isSignedIn: boolean
  isLoading: boolean
  accessToken: string | null
  signIn: () => void
  signOut: () => void
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null)

// Load Google Identity Services script
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity-script')) {
      if ((window as any).google?.accounts?.oauth2) {
        resolve()
      } else {
        const checkGoogle = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(checkGoogle)
            resolve()
          }
        }, 100)
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
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script load failed'))
    document.head.appendChild(script)
  })
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('google_calendar_token')
  )
  const [tokenClient, setTokenClient] = useState<any>(null)

  const hasLoggedInBefore = localStorage.getItem('google_calendar_has_logged_in') === 'true'

  // Verify token is valid
  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setIsLoading(false)
      return
    }

    loadGoogleScript()
      .then(async () => {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              localStorage.setItem('google_calendar_token', response.access_token)
              localStorage.setItem('google_calendar_has_logged_in', 'true')
              setAccessToken(response.access_token)
              setIsSignedIn(true)
              setIsLoading(false)
            } else if (response.error) {
              setIsLoading(false)
            }
          }
        })
        setTokenClient(client)

        // Check existing token
        if (accessToken) {
          const isValid = await verifyToken(accessToken)
          if (isValid) {
            setIsSignedIn(true)
            setIsLoading(false)
          } else {
            localStorage.removeItem('google_calendar_token')
            setAccessToken(null)
            setIsLoading(false)
          }
        } else if (hasLoggedInBefore) {
          // Try silent refresh
          const silentRefreshTimeout = setTimeout(() => {
            setIsLoading(false)
          }, 3000)

          try {
            client.requestAccessToken({ prompt: '' })
          } catch {
            clearTimeout(silentRefreshTimeout)
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  const signIn = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    }
  }, [tokenClient])

  const signOut = useCallback(() => {
    localStorage.removeItem('google_calendar_token')
    localStorage.removeItem('google_calendar_has_logged_in')
    setAccessToken(null)
    setIsSignedIn(false)
  }, [])

  return (
    <GoogleAuthContext.Provider value={{ isSignedIn, isLoading, accessToken, signIn, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  )
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext)
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  }
  return context
}
