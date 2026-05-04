/**
 * Axios instance — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Зеркало plugins/axios.client.ts из mirror-frontend, адаптированное для
 * plain Vue 3 + Vite. baseURL берётся из import.meta.env.VITE_API_BASE_URL.
 *
 * Хранение токенов — localStorage (singleton-ключи экспортируются в auth-стор).
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { AUTH_ENDPOINTS } from '@/services/api/endpoints/auth.contract'

export const TOKEN_STORAGE_KEY = 'auth-token'
export const REFRESH_TOKEN_STORAGE_KEY = 'auth-refresh-token'
const LOGIN_ROUTE_PATH = '/login'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  access_token?: string
  refresh_token?: string
  token?: string
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
})

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    console.error('Response error:', error.response?.status, error.config?.url)

    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isRefreshCall = originalRequest?.url?.includes(AUTH_ENDPOINTS.refresh)
    const shouldHandleUnauthorized =
      error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshCall

    if (shouldHandleUnauthorized) {
      originalRequest._retry = true

      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
      if (!storedRefreshToken) {
        clearStoredTokens()
        redirectToLoginIfNeeded()
        return Promise.reject(error)
      }

      try {
        const refreshClient = axios.create({
          baseURL: apiClient.defaults.baseURL,
          timeout: apiClient.defaults.timeout,
        })
        const refreshResponse = await refreshClient.post<RefreshResponse>(
          AUTH_ENDPOINTS.refresh,
          { refresh_token: storedRefreshToken }
        )
        const nextToken = refreshResponse.data?.access_token ?? refreshResponse.data?.token
        const nextRefreshToken = refreshResponse.data?.refresh_token

        if (nextToken) {
          localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
          if (nextRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, nextRefreshToken)
          }
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${nextToken}`
          return apiClient.request(originalRequest as AxiosRequestConfig)
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
      }

      clearStoredTokens()
      redirectToLoginIfNeeded()
    }

    return Promise.reject(error)
  }
)

function clearStoredTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

function redirectToLoginIfNeeded() {
  if (window.location.pathname !== LOGIN_ROUTE_PATH) {
    window.location.assign(LOGIN_ROUTE_PATH)
  }
}
