import axios from 'axios'
import { getSessionId } from '@/utils/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const AUTH_REQUEST_TIMEOUT_MS = 75_000

/**
 * Central axios instance, wired to the real Django REST API
 * (see backend/config/urls.py for the route map).
 *
 * Auth: the backend issues a SimpleJWT access/refresh pair
 * (POST /auth/login/, /auth/register/). The access token is short-lived
 * (see JWT_ACCESS_TOKEN_LIFETIME_MIN in backend/.env) so this client
 * transparently refreshes it on a 401 using the refresh token, and only
 * logs the user out if the refresh itself fails/expires.
 */

export const ACCESS_TOKEN_KEY = 'yolum_token'
export const REFRESH_TOKEN_KEY = 'yolum_refresh_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

let backendWarmupPromise: Promise<boolean> | null = null

/**
 * Wake Render before a visitor reaches an API-heavy screen. This intentionally
 * bypasses apiClient so the anonymous X-Session-Id header does not trigger a
 * preflight request for the health check itself.
 */
export function warmBackend(): Promise<boolean> {
  if (backendWarmupPromise) return backendWarmupPromise

  backendWarmupPromise = (async () => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS)

    try {
      const baseUrl = API_BASE_URL.replace(/\/$/, '')
      const response = await fetch(`${baseUrl}/health/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      })
      return response.ok
    } catch {
      return false
    } finally {
      window.clearTimeout(timeoutId)
    }
  })()

  return backendWarmupPromise
}

apiClient.interceptors.request.use((config) => {
  // Sprint 1 anonymous identity: every request carries the same UUID so
  // server-side events and anonymous records can be claimed after signup.
  config.headers['X-Session-Id'] = getSessionId()

  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Automatic access-token refresh -----------------------------------
// Concurrent requests that all hit a 401 at once should trigger only one
// refresh call; everyone else waits on the same in-flight promise.
let refreshPromise: Promise<string | null> | null = null

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('yolum_user')
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refresh) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${apiClient.defaults.baseURL}/auth/token/refresh/`, { refresh })
      .then((res) => {
        const newAccess = res.data.access as string
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccess)
        return newAccess
      })
      .catch(() => {
        clearSession()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register')

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
      clearSession()
      // Let the app know the session ended so React state (AuthContext) can
      // clear itself even though this happened outside of a component.
      window.dispatchEvent(new Event('yolum:session-expired'))
    }
    return Promise.reject(error)
  }
)
