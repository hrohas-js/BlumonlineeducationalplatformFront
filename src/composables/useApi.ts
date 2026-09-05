/**
 * useApi Composable — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Адаптация composables/useApi.ts из mirror-frontend для plain Vue 3.
 * Ключевое отличие: вместо useNuxtApp().$api используем inject(AxiosInstanceKey).
 *
 * Этот composable — единая точка для всех HTTP-запросов в сервисах.
 * Оборачивает axios в try/catch и возвращает { data, error, success }.
 *
 * ВАЖНО: inject() работает в setup и в дочерних вызовах из setup. В Pinia actions
 * контекста inject нет — используем тот же singleton apiClient, что и в плагине.
 */
import { getCurrentInstance, inject } from 'vue'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { AxiosInstanceKey } from '@/plugins/axios'
import { apiClient } from '@/services/axios'
import type { ApiResult } from '@/services/api/types'

interface ApiErrorBody {
  detail?: unknown
  message?: string
  error?: { code?: string; message?: string }
}

function extractApiError(error: unknown, fallback: string): { message: string; code: string | null } {
  if (error && typeof error === 'object' && 'response' in error) {
    const ax = error as AxiosError<ApiErrorBody>
    const data = ax.response?.data
    const deniedByStatus = ax.response?.status === 403 ? 'permission_denied' : null
    if (data?.error && typeof data.error === 'object') {
      const code = typeof data.error.code === 'string' ? data.error.code : deniedByStatus
      const message =
        typeof data.error.message === 'string' && data.error.message.length
          ? data.error.message
          : fallback
      return { message, code }
    }
    if (data && typeof data.message === 'string' && data.message.length) {
      return { message: data.message, code: deniedByStatus }
    }
    const d = data?.detail
    if (typeof d === 'string' && d.length) return { message: d, code: deniedByStatus }
    if (Array.isArray(d)) {
      const parts = d
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg: string }).msg)
          }
          if (typeof item === 'string') return item
          return ''
        })
        .filter(Boolean)
      if (parts.length) return { message: parts.join('; '), code: deniedByStatus }
    }
    if (deniedByStatus) return { message: fallback, code: deniedByStatus }
  }
  if (error instanceof Error) return { message: error.message, code: null }
  return { message: fallback, code: null }
}

export const useApi = () => {
  const $api = getCurrentInstance()
    ? (inject<AxiosInstance | undefined>(AxiosInstanceKey) ?? apiClient)
    : apiClient

  const apiCall = async <T>(
    request: () => Promise<{ data: T }>,
    errorMessage = 'API call failed'
  ): Promise<ApiResult<T>> => {
    try {
      const response = await request()
      return { data: response.data, error: null, errorCode: null, success: true }
    } catch (error: unknown) {
      console.error(errorMessage, error)
      const { message, code } = extractApiError(error, errorMessage)
      return { data: null, error: message, errorCode: code, success: false }
    }
  }

  const get = <T>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>(() => $api.get(url, config), `GET ${url} failed`)

  const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(() => $api.post(url, data, config), `POST ${url} failed`)

  const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(() => $api.put(url, data, config), `PUT ${url} failed`)

  const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiCall<T>(() => $api.patch(url, data, config), `PATCH ${url} failed`)

  const del = <T>(url: string, config?: AxiosRequestConfig) =>
    apiCall<T>(() => $api.delete(url, config), `DELETE ${url} failed`)

  const uploadFile = async <T>(
    url: string,
    file: File,
    fieldName = 'file',
    method: 'post' | 'put' = 'post'
  ): Promise<ApiResult<T>> => {
    const form = new FormData()
    form.append(fieldName, file)
    const request =
      method === 'put'
        ? () => $api.put<T>(url, form)
        : () => $api.post<T>(url, form)
    return apiCall<T>(request, `${method.toUpperCase()} ${url} failed`)
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    uploadFile,
    /** Прямой доступ к axios instance для сложных сценариев (FormData upload) */
    raw: $api,
  }
}
