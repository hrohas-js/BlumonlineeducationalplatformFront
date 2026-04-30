/**
 * API DTO — Request/Response типы
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §5):
 * Этот файл содержит типы для сетевого слоя (форматы запросов к API
 * и форматы ответов сервера). Доменные типы (User, etc.) — в types/index.ts.
 *
 * Утилитарный тип ApiServiceResponse<T> используется как возвращаемый тип
 * всех методов сервисов — зеркало mirror-frontend/services/api/types.ts.
 */

import type { User } from '@/types'

// ===== UTILITY TYPES =====

/** Стандартный результат любого API-вызова из useApi() */
export interface ApiResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

/** Возвращаемый тип всех методов сервисов */
export type ApiServiceResponse<T> = Promise<ApiResult<T>>

// ===== AUTH =====

export interface LoginCredentials {
  email: string
  password: string
}

/** Тело POST /api/v1/auth/login (application/json) */
export interface LoginRequest {
  email: string
  password: string
}

/** Ответ сервера на успешный вход */
export interface LoginApiResponse {
  access_token: string
  refresh_token: string
  user: User
}

/** Ответ-обёртка для клиентской логики */
export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface RegisterResponse {
  user_id: string
  email: string
  message: string
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  middle_name?: string
  phone?: string
  date_of_birth?: string
  bio?: string
  city?: string
  sex?: 'male' | 'female'
}

export interface LoginByPhoneRequest {
  phone: string
  code: string
}

export interface LoginByPhoneResponse {
  access_token: string
  token_type: string
  refresh_token?: string
}

export interface RefreshTokenResponse {
  access_token: string
  token_type?: string
  refresh_token?: string
}

// ===== PAGINATION =====

export interface PaginationParams {
  page?: number
  limit?: number
}
