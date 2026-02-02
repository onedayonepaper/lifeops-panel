import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

interface GoogleAuthContextType {
  isSignedIn: boolean
  isLoading: boolean
  userEmail: string | null
  signIn: () => void
  signOut: () => void
  /** @deprecated Use backend API instead. This will be removed in a future version. */
  accessToken: string | null
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null)

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Check auth status from backend
  const checkAuthStatus = useCallback(async () => {
    try {
      const status = await api.getAuthStatus()
      setIsSignedIn(status.authenticated)
      setUserEmail(status.email || null)
      setAccessToken(status.access_token || null)
    } catch (error) {
      console.error('[Auth] Failed to check auth status:', error)
      setIsSignedIn(false)
      setUserEmail(null)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check for auth callback result in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authSuccess = params.get('auth_success')
    const authError = params.get('auth_error')

    if (authSuccess === 'true') {
      // Clean up URL
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
    try {
      const authUrl = await api.getLoginUrl()
      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error('[Auth] Failed to get login URL:', error)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api.logout()
      setIsSignedIn(false)
      setUserEmail(null)
      setAccessToken(null)
    } catch (error) {
      console.error('[Auth] Failed to logout:', error)
    }
  }, [])

  return (
    <GoogleAuthContext.Provider value={{ isSignedIn, isLoading, userEmail, signIn, signOut, accessToken }}>
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
