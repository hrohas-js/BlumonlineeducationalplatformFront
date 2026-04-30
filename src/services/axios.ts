/**
 * Axios instance — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Зеркало plugins/axios.client.ts из mirror-frontend, адаптированное для
 * plain Vue 3 + Vite (без Nuxt). Ключевые отличия:
 * - Нет useNuxtApp(), useCookie() — только localStorage
 * - Нет process.client — браузер всегда клиент в SPA
 * - baseURL берётся из import.meta.env.VITE_API_BASE_URL
 *
 * Экземпляр создаётся один раз и экспортируется.
 * Затем он предоставляется через src/plugins/axios.ts (app.provide).
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { AUTH_ENDPOINTS } from '@/services/api/endpoints/auth.contract'

const TOKEN_STORAGE_KEY = 'auth-token'
const LOGIN_ROUTE_PATH = '/login'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  access_token?: string
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

    // Для FormData браузер сам выставит Content-Type с boundary
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

      try {
        const refreshClient = axios.create({
          baseURL: apiClient.defaults.baseURL,
          timeout: apiClient.defaults.timeout,
        })
        const refreshResponse = await refreshClient.post<RefreshResponse>(AUTH_ENDPOINTS.refresh)
        const nextToken = refreshResponse.data?.access_token ?? refreshResponse.data?.token

        if (nextToken) {
          localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${nextToken}`
          return apiClient.request(originalRequest as AxiosRequestConfig)
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
      }

      localStorage.removeItem(TOKEN_STORAGE_KEY)
      if (window.location.pathname !== LOGIN_ROUTE_PATH) {
        window.location.assign(LOGIN_ROUTE_PATH)
      }
    }

    return Promise.reject(error)
  }
)
