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

/** FastAPI / OpenAPI: detail может быть строкой, массивом объектов { loc, msg, type } или вложенным */
function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const ax = error as AxiosError<{ detail?: unknown; message?: string }>
    const data = ax.response?.data
    if (data && typeof data.message === 'string' && data.message.length) {
      return data.message
    }
    const d = data?.detail
    if (typeof d === 'string' && d.length) return d
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
      if (parts.length) return parts.join('; ')
    }
  }
  if (error instanceof Error) return error.message
  return fallback
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
      return { data: response.data, error: null, success: true }
    } catch (error: unknown) {
      console.error(errorMessage, error)
      const message = extractApiErrorMessage(error, errorMessage)
      return { data: null, error: message, success: false }
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

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    /** Прямой доступ к axios instance для сложных сценариев (FormData upload) */
    raw: $api,
  }
}
