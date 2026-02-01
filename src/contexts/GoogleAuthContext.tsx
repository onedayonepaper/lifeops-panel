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
  const isRefreshingRef = useRef<boolean>(false)
  const userEmailRef = useRef<string | null>(localStorage.getItem('google_user_email'))

  // Clear refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  // Attempt silent token refresh
  const attemptSilentRefresh = useCallback((client: any) => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true

    console.log('[Auth] Attempting silent token refresh...')

    // Try to get a new token without user interaction
    const hint = userEmailRef.current
    client.requestAccessToken({
      prompt: '', // Empty string = silent refresh attempt
      hint: hint || undefined
    })
  }, [])

  // Schedule token refresh (tries silent first)
  const scheduleTokenRefresh = useCallback((expiresIn: number, client: any) => {
    clearRefreshTimer()

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = Math.max((expiresIn * 1000) - TOKEN_REFRESH_MARGIN, 60000) // At least 1 minute

    console.log(`[Auth] Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`)

    refreshTimerRef.current = setTimeout(() => {
      attemptSilentRefresh(client)
    }, refreshTime)
  }, [clearRefreshTimer, attemptSilentRefresh])

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
          callback: async (response: any) => {
            isRefreshingRef.current = false

            if (response.access_token) {
              localStorage.setItem('google_calendar_token', response.access_token)
              localStorage.setItem('google_calendar_has_logged_in', 'true')

              // Store token expiry time
              const expiresIn = response.expires_in || 3600 // Default 1 hour
              const expiryTime = Date.now() + (expiresIn * 1000)
              localStorage.setItem('google_calendar_token_expiry', expiryTime.toString())

              // Fetch and store user email for silent refresh
              try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` }
                })
                if (userInfoResponse.ok) {
                  const userInfo = await userInfoResponse.json()
                  if (userInfo.email) {
                    localStorage.setItem('google_user_email', userInfo.email)
                    userEmailRef.current = userInfo.email
                  }
                }
              } catch (e) {
                console.log('[Auth] Could not fetch user info')
              }

              setAccessToken(response.access_token)
              setIsSignedIn(true)
              setIsLoading(false)

              console.log('[Auth] Token refreshed successfully')

              // Schedule next refresh
              scheduleTokenRefresh(expiresIn, client)
            } else if (response.error) {
              console.error('[Auth] Token error:', response.error)
              // If silent refresh failed, don't clear existing token
              // User can still use the app until they try an API call
              if (response.error === 'interaction_required' || response.error === 'consent_required') {
                console.log('[Auth] Silent refresh failed, user interaction needed')
              }
              setIsLoading(false)
            }
          }
        })
        setTokenClient(client)

        // Check existing token - trust localStorage if not expired
        if (accessToken) {
          const expiryTime = parseInt(localStorage.getItem('google_calendar_token_expiry') || '0')
          const timeUntilExpiry = expiryTime - Date.now()

          // If token hasn't expired yet, trust it without verification
          if (timeUntilExpiry > 0) {
            setIsSignedIn(true)
            setIsLoading(false)

            if (timeUntilExpiry > TOKEN_REFRESH_MARGIN) {
              scheduleTokenRefresh(Math.floor(timeUntilExpiry / 1000), client)
            }
          } else {
            // Token expired - verify if it's still somehow valid
            const isValid = await verifyToken(accessToken)
            if (isValid) {
              // Token still works, update expiry (assume 1 hour)
              const newExpiryTime = Date.now() + (3600 * 1000)
              localStorage.setItem('google_calendar_token_expiry', newExpiryTime.toString())
              setIsSignedIn(true)
              setIsLoading(false)
              scheduleTokenRefresh(3600, client)
            } else {
              // Token truly invalid - clear it
              localStorage.removeItem('google_calendar_token')
              localStorage.removeItem('google_calendar_token_expiry')
              setAccessToken(null)
              setIsLoading(false)
            }
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

  // Check token validity when window gains focus and attempt silent refresh if needed
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isSignedIn && accessToken && tokenClient) {
        const expiryTime = parseInt(localStorage.getItem('google_calendar_token_expiry') || '0')
        const timeUntilExpiry = expiryTime - Date.now()

        // If token expired or expiring soon, attempt silent refresh
        if (timeUntilExpiry < TOKEN_REFRESH_MARGIN) {
          console.log('[Auth] Token expired or expiring soon, attempting refresh...')
          attemptSilentRefresh(tokenClient)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSignedIn, accessToken, tokenClient, attemptSilentRefresh])

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
    localStorage.removeItem('google_user_email')
    userEmailRef.current = null
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
