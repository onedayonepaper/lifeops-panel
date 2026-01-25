import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file'

// Token expires in 1 hour (3600 seconds), refresh 5 minutes before
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000 // 5 minutes in ms

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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasLoggedInBefore = localStorage.getItem('google_calendar_has_logged_in') === 'true'

  // Clear refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresIn: number, client: any) => {
    clearRefreshTimer()

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = Math.max((expiresIn * 1000) - TOKEN_REFRESH_MARGIN, 60000) // At least 1 minute

    console.log(`[Auth] Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`)

    refreshTimerRef.current = setTimeout(() => {
      console.log('[Auth] Refreshing token...')
      try {
        client.requestAccessToken({ prompt: '' })
      } catch (error) {
        console.error('[Auth] Silent refresh failed:', error)
      }
    }, refreshTime)
  }, [clearRefreshTimer])

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

              // Store token expiry time
              const expiresIn = response.expires_in || 3600 // Default 1 hour
              const expiryTime = Date.now() + (expiresIn * 1000)
              localStorage.setItem('google_calendar_token_expiry', expiryTime.toString())

              setAccessToken(response.access_token)
              setIsSignedIn(true)
              setIsLoading(false)

              // Schedule next refresh
              scheduleTokenRefresh(expiresIn, client)
            } else if (response.error) {
              console.error('[Auth] Token error:', response.error)
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

            // Check if we need to refresh soon
            const expiryTime = parseInt(localStorage.getItem('google_calendar_token_expiry') || '0')
            const timeUntilExpiry = expiryTime - Date.now()

            if (timeUntilExpiry > TOKEN_REFRESH_MARGIN) {
              // Token still valid, schedule refresh
              scheduleTokenRefresh(Math.floor(timeUntilExpiry / 1000), client)
            } else {
              // Token expired or expiring soon, refresh now
              console.log('[Auth] Token expiring soon, refreshing...')
              try {
                client.requestAccessToken({ prompt: '' })
              } catch {
                setIsLoading(false)
              }
            }
          } else {
            // Token invalid, try silent refresh
            localStorage.removeItem('google_calendar_token')
            localStorage.removeItem('google_calendar_token_expiry')
            setAccessToken(null)

            if (hasLoggedInBefore) {
              console.log('[Auth] Token invalid, attempting silent refresh...')
              try {
                client.requestAccessToken({ prompt: '' })
              } catch {
                setIsLoading(false)
              }
            } else {
              setIsLoading(false)
            }
          }
        } else if (hasLoggedInBefore) {
          // No token but has logged in before, try silent refresh
          console.log('[Auth] No token, attempting silent refresh...')
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

    // Cleanup on unmount
    return () => {
      clearRefreshTimer()
    }
  }, [])

  // Also refresh token when window gains focus (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSignedIn && tokenClient) {
        const expiryTime = parseInt(localStorage.getItem('google_calendar_token_expiry') || '0')
        const timeUntilExpiry = expiryTime - Date.now()

        // If token expires in less than 10 minutes, refresh it
        if (timeUntilExpiry < 10 * 60 * 1000) {
          console.log('[Auth] Tab visible, token expiring soon, refreshing...')
          try {
            tokenClient.requestAccessToken({ prompt: '' })
          } catch (error) {
            console.error('[Auth] Visibility refresh failed:', error)
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSignedIn, tokenClient])

  const signIn = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    }
  }, [tokenClient])

  const signOut = useCallback(() => {
    clearRefreshTimer()
    localStorage.removeItem('google_calendar_token')
    localStorage.removeItem('google_calendar_token_expiry')
    localStorage.removeItem('google_calendar_has_logged_in')
    setAccessToken(null)
    setIsSignedIn(false)
  }, [clearRefreshTimer])

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
