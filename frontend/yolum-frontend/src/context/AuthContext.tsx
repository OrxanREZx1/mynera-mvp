import * as React from 'react'
import type { AuthUser, UserRole } from '@/types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/services/api/client'
import { authApi } from '@/services/api/endpoints'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (patch: Partial<AuthUser>) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'yolum_user'

function readStoredUser(): AuthUser | null {
  try {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY) && !localStorage.getItem(REFRESH_TOKEN_KEY)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // The read is synchronous (localStorage), so we seed state lazily on first
  // render instead of doing it in an effect — there is no real "loading"
  // period to model here.
  const [user, setUser] = React.useState<AuthUser | null>(readStoredUser)

  const login = React.useCallback((nextUser: AuthUser) => {
    // Access/refresh tokens are already written to localStorage by
    // authApi.login/register (services/api/endpoints.ts) at this point —
    // this only persists the user profile shown in the UI.
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }, [])

  const logout = React.useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    // Fire-and-forget: blacklists the refresh token server-side. Local
    // state is cleared immediately regardless of whether this succeeds.
    void authApi.logout()
  }, [])

  const updateUser = React.useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // If the api client couldn't refresh an expired access token, it clears
  // storage and fires this event — sync React state so protected routes
  // redirect to /login instead of showing a stale "logged in" UI.
  React.useEffect(() => {
    const handleSessionExpired = () => setUser(null)
    window.addEventListener('yolum:session-expired', handleSessionExpired)
    return () => window.removeEventListener('yolum:session-expired', handleSessionExpired)
  }, [])

  const value = React.useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading: false, login, logout, updateUser }),
    [user, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function roleHome(role: UserRole) {
  return role === 'mentor' ? '/mentor/dashboard' : '/chat'
}
