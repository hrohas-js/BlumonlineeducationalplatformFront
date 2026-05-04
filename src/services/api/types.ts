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

/** Универсальный ответ-сообщение (MessageResponse) */
export interface MessageResponse {
  message: string
}

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

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  token_type?: string
  refresh_token?: string
}

export interface LogoutRequest {
  refresh_token: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// ===== PRODUCTS =====

export interface ProductResponse {
  id: string
  product_type: string
  title: string
  description: string | null
  price: string
  image_url: string | null
  created_by: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  items: ProductResponse[]
  total: number
  skip: number
  limit: number
}

export interface FileResponse {
  id: string
  file_name: string
  file_type?: string | null
  file_url: string
  file_size?: number | null
  lesson_id?: string | null
  module_id?: string | null
  product_id?: string | null
  uploaded_by: string
  created_at: string
}

export interface LessonResponse {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string | null
  order_index: number
  files: FileResponse[]
  created_at: string
  updated_at: string
}

export interface ModuleResponse {
  id: string
  product_id: string
  title: string
  description: string | null
  order_index: number
  lessons: LessonResponse[]
  created_at: string
  updated_at: string
}

export interface ProductDetailResponse extends ProductResponse {
  modules: ModuleResponse[]
}

export interface LessonWithProgress extends LessonResponse {
  is_completed: boolean
  completed_at: string | null
  watch_time: number
}

export interface ModuleProgressResponse {
  module_id: string
  title: string
  lessons: LessonWithProgress[]
}

export interface ProductProgressResponse {
  product_id: string
  total_lessons: number
  completed_lessons: number
  progress_percent: number
  deadline: string | null
  days_left: number | null
  modules: ModuleProgressResponse[]
}

export interface LessonProgressCreate {
  watch_time?: number | null
}

export interface LessonProgressResponse {
  id: string
  user_id: string
  lesson_id: string
  is_completed: boolean
  completed_at: string | null
  watch_time: number
  created_at: string
  updated_at: string
}

export interface ProductsQuery {
  product_type?: string
  skip?: number
  limit?: number
}

// ===== PAYMENTS =====

export interface PaymentCreateRequest {
  product_id: string
  email: string
  payment_type?: string
}

export interface PaymentCreateResponse {
  payment_url: string
  inv_id: number
}

export interface PaymentRenewRequest {
  product_id: string
}

export interface PaymentResponse {
  id: string
  user_email: string
  user_id: string | null
  product_id: string
  product_type: string
  amount: string
  currency: string
  robokassa_inv_id: number
  robokassa_transaction_id: string | null
  status: string
  payment_method: string | null
  description: string
  payment_type: string
  created_at: string
  paid_at: string | null
  updated_at: string
}

export interface PaymentHistoryResponse {
  payments: PaymentResponse[]
  total: number
}

export interface PaymentStatusResponse {
  status: string
  message: string
  payment: PaymentResponse | null
}

// ===== PROTECTED CONTENT =====

export interface VideoTokenResponse {
  token: string
  video_id: string
  user_id: string
  product_id: string
  timestamp: number
  expiration: number
  watermark: string
  expires_in: number
}

export interface SignedUrlResponse {
  signed_url: string
  expires_in_minutes: number
}

export interface HLSEncryptionKeyResponse {
  key: string
  key_uri: string
  iv: string | null
}

export interface ContentAccessLogResponse {
  success: boolean
  message: string
}

// ===== PAGINATION =====

export interface PaginationParams {
  page?: number
  limit?: number
}
