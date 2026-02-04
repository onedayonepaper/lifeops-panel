import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => {
            requestAccessToken: () => void
          }
          revoke: (token: string, callback: () => void) => void
        }
      }
    }
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/gmail.send'
].join(' ')

const TOKEN_KEY = 'lifeops_access_token'
const TOKEN_EXPIRY_KEY = 'lifeops_token_expiry'
const USER_EMAIL_KEY = 'lifeops_user_email'

interface GoogleAuthContextType {
  isSignedIn: boolean
  isLoading: boolean
  userEmail: string | null
  signIn: () => void
  signOut: () => void
  accessToken: string | null
  isClientMode: boolean // true if using client-side OAuth
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null)

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isClientMode, setIsClientMode] = useState(false)
  const [tokenClient, setTokenClient] = useState<{ requestAccessToken: () => void } | null>(null)

  // Initialize Google Identity Services
  useEffect(() => {
    const initGIS = () => {
      if (window.google?.accounts?.oauth2 && CLIENT_ID) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              handleClientToken(response.access_token)
            } else if (response.error) {
              console.error('[Auth] Client OAuth error:', response.error)
            }
          }
        })
        setTokenClient(client)
      }
    }

    // Wait for GIS to load
    if (window.google?.accounts?.oauth2) {
      initGIS()
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          initGIS()
          clearInterval(checkInterval)
        }
      }, 100)

      // Give up after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000)
    }
  }, [])

  // Handle token from client-side OAuth
  const handleClientToken = useCallback(async (token: string) => {
    try {
      // Get user info
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userInfo = await response.json()

      // Store token (expires in 1 hour)
      const expiry = Date.now() + 3600 * 1000
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())
      localStorage.setItem(USER_EMAIL_KEY, userInfo.email || '')

      setAccessToken(token)
      setUserEmail(userInfo.email || null)
      setIsSignedIn(true)
      setIsClientMode(true)
    } catch (error) {
      console.error('[Auth] Failed to get user info:', error)
    }
  }, [])

  // Check for stored client token
  const checkStoredToken = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY)

    if (storedToken && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10)
      if (Date.now() < expiry) {
        setAccessToken(storedToken)
        setUserEmail(storedEmail)
        setIsSignedIn(true)
        setIsClientMode(true)
        return true
      } else {
        // Token expired, clear storage
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
        localStorage.removeItem(USER_EMAIL_KEY)
      }
    }
    return false
  }, [])

  // Check auth status from backend
  const checkAuthStatus = useCallback(async () => {
    try {
      const status = await api.getAuthStatus()
      if (status.authenticated) {
        setIsSignedIn(true)
        setUserEmail(status.email || null)
        setAccessToken(status.access_token || null)
        setIsClientMode(false)
        setIsLoading(false)
        return true
      }
    } catch (error) {
      console.log('[Auth] Backend unavailable, checking client token...')
    }

    // Backend unavailable or not authenticated, check client token
    const hasClientToken = checkStoredToken()
    setIsLoading(false)
    return hasClientToken
  }, [checkStoredToken])

  // Check for auth callback result in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authSuccess = params.get('auth_success')
    const authError = params.get('auth_error')

    if (authSuccess === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      console.log('[Auth] Login successful')
    } else if (authError) {
      console.error('[Auth] Login error:', authError)
      window.history.replaceState({}, '', window.location.pathname)
    }

    checkAuthStatus()
  }, [checkAuthStatus])

  // Periodically check auth status (every 5 minutes)
  useEffect(() => {
    if (!isSignedIn) return

    const interval = setInterval(() => {
      checkAuthStatus()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isSignedIn, checkAuthStatus])

  // Check auth status when window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkAuthStatus])

  const signIn = useCallback(async () => {
    // Try backend OAuth first
    try {
      const authUrl = await api.getLoginUrl()
      window.location.href = authUrl
      return
    } catch (error) {
      console.log('[Auth] Backend unavailable, using client OAuth...')
    }

    // Fall back to client-side OAuth popup
    if (tokenClient) {
      tokenClient.requestAccessToken()
    } else {
      console.error('[Auth] Google Identity Services not initialized')
      alert('Google 로그인을 사용할 수 없습니다. 페이지를 새로고침해 주세요.')
    }
  }, [tokenClient])

  const signOut = useCallback(async () => {
    // Try backend logout
    try {
      await api.logout()
    } catch (error) {
      console.log('[Auth] Backend logout failed, clearing client token...')
    }

    // Clear client token
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token, () => {
        console.log('[Auth] Token revoked')
      })
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(USER_EMAIL_KEY)

    setIsSignedIn(false)
    setUserEmail(null)
    setAccessToken(null)
    setIsClientMode(false)
  }, [])

  return (
    <GoogleAuthContext.Provider value={{ isSignedIn, isLoading, userEmail, signIn, signOut, accessToken, isClientMode }}>
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
