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
  /** Код ошибки API (`error.code` из API.md). */
  errorCode: string | null
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
  phone?: string
  about?: string
  avatar_url?: string
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
  is_archived?: boolean
  access_duration?: string | null
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

export interface LessonChapter {
  time_seconds: number
  title: string
}

/** Видео урока (мульти-видео модель). */
export interface LessonVideoResponse {
  id: string
  title?: string | null
  order_index: number
  video_url?: string | null
}

export interface LessonResponse {
  id: string
  module_id: string
  title: string
  description: string | null
  /** Пустые/`null` с бэка нормализуются как `[]`. */
  videos?: LessonVideoResponse[] | null
  order_index: number
  /** Пустые/`null` с бэка нормализуются как `[]`. */
  chapters?: LessonChapter[] | null
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
  /** Дедлайн (общий) для конкретной темы/модуля. */
  access_duration?: string | null
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

// ===== ADMIN =====

export interface AdminProductsQuery {
  product_type?: string
  is_published?: boolean
  is_archived?: boolean
  skip?: number
  limit?: number
}

export interface AdminProductCreateRequest {
  product_type: string
  title: string
  description: string
  price: number | string
  is_published?: boolean
}

export interface AdminProductUpdateRequest {
  title?: string
  description?: string
  price?: number | string
  is_published?: boolean
  access_duration?: string | null
}

export interface AdminProductListResponse {
  items: ProductResponse[]
  total: number
  skip: number
  limit: number
}

export interface AdminModuleCreateRequest {
  title: string
  description?: string
}

export interface AdminModuleUpdateRequest {
  title?: string
  description?: string
  access_duration?: string | null
}

export interface AdminLessonCreateRequest {
  title: string
  description?: string
  chapters?: LessonChapter[]
}

export interface AdminLessonUpdateRequest {
  title?: string
  description?: string
  /** Передать `[]` — очистить таймкоды. Не передавать поле — оставить как есть. */
  chapters?: LessonChapter[]
}

export interface AdminModuleReorderItem {
  module_id: string
  order_index: number
}

export interface AdminLessonReorderItem {
  lesson_id: string
  order_index: number
}

export interface AdminModuleReorderRequest {
  modules: AdminModuleReorderItem[]
}

export interface AdminLessonReorderRequest {
  lessons: AdminLessonReorderItem[]
}

export interface AdminModuleCopyRequest {
  target_product_id: string
}

export interface AdminLessonCopyRequest {
  target_module_id: string
}

export interface AdminFileUploadResponse {
  file_url: string
  file_name: string
  file_size: number
  file_type: string
}

/** Presigned upload request (filename + optional content_type). */
export interface AdminLessonVideoUploadUrlRequest {
  filename: string
  content_type?: string | null
}

export interface AdminLessonVideoUploadUrlResponse {
  upload_url: string
  file_key: string
}

export interface LessonVideoConfirmRequest {
  file_key: string
  title?: string | null
}

export interface LessonVideoUpdate {
  title?: string | null
  order_index?: number | null
}

export interface LessonVideoReorderItem {
  video_id: string
  order_index: number
}

export interface LessonVideoReorderRequest {
  videos: LessonVideoReorderItem[]
}

/** @deprecated Use LessonVideoConfirmRequest */
export type AdminLessonVideoConfirmRequest = LessonVideoConfirmRequest

/** @deprecated Confirm now returns LessonVideoResponse */
export type AdminLessonVideoConfirmResponse = LessonVideoResponse

export type AdminAccessType = 'immediate' | 'delayed' | 'manual'

export interface AdminGrantAccessRequest {
  product_id: string
  access_type: AdminAccessType
  delay_days?: number
  deadline?: string
}

export interface AdminDeadlineUpdateRequest {
  deadline: string
}

export type AdminStudentAccessStatus = 'active' | 'paused' | 'blocked' | 'deleted'

export interface AdminStudentProductItem {
  product_id: string
  title: string
  product_type: string
  image_url: string | null
  is_archived: boolean
  access_type: string
  status: AdminStudentAccessStatus | string
  access_granted_at: string | null
  deadline: string | null
  days_left: number | null
  is_expired: boolean
  is_completed: boolean
  total_lessons: number
  completed_lessons: number
  progress_percent: number
}

export interface AdminStudentProductsResponse {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
  items: AdminStudentProductItem[]
  total: number
  skip: number
  limit: number
}

export interface AdminStudentAccessUpdateRequest {
  status?: AdminStudentAccessStatus
  deadline?: string | null
  notify_email?: boolean
}

export interface AdminStudentAccessUpdateResponse {
  id: string
  user_id: string
  product_id: string
  access_type: string
  status: AdminStudentAccessStatus
  delay_days: number | null
  access_granted_at: string | null
  deadline: string | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminStudentItem {
  user_id: string
  email: string
  first_name: string
  last_name: string
  access_type: AdminAccessType | string
  access_granted_at: string | null
  deadline: string | null
  is_completed: boolean
  progress_percent: number
}

export interface AdminStudentsListResponse {
  items: AdminStudentItem[]
  total: number
  skip?: number
  limit?: number
}

export interface AdminBulkStudentItem {
  email: string
  first_name: string
  last_name: string
}

export interface AdminBulkStudentsRequest {
  students: AdminBulkStudentItem[]
  product_ids?: string[]
}

export interface AdminBulkStudentResult {
  email: string
  user_id: string
  first_name: string
  last_name: string
  created: boolean
  password: string | null
  access_granted: boolean
}

export interface AdminBulkStudentsResponse {
  results: AdminBulkStudentResult[]
  created_count: number
  existing_count: number
}

export interface AdminPaymentsQuery {
  status_filter?: string
  limit?: number
  offset?: number
}

export interface AdminPaymentItem {
  id: string
  product_id?: string
  amount: number | string
  status: string
  payment_type?: string
  created_at: string
  user_email?: string
}

export interface AdminPaymentsListResponse {
  payments: AdminPaymentItem[]
  total: number
}

// ===== ADMIN BROADCASTS =====

export interface AdminBroadcastTemplate {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
}

export interface AdminBroadcastTemplateCreateRequest {
  name: string
  subject: string
  body: string
}

export type AdminBroadcastTemplateUpdateRequest = AdminBroadcastTemplateCreateRequest

export interface AdminBroadcastItem {
  id: string
  subject: string
  body: string
  product_id: string
  product_title?: string | null
  module_id: string
  module_title?: string | null
  template_id?: string | null
  status: string
  scheduled_at?: string | null
  total_recipients: number
  sent_count: number
  created_at: string
  started_at?: string | null
  completed_at?: string | null
}

export interface AdminBroadcastsListQuery {
  skip?: number
  limit?: number
}

export interface AdminBroadcastsListResponse {
  items: AdminBroadcastItem[]
  total: number
}

export interface AdminBroadcastCreateRequest {
  subject: string
  body: string
  product_id: string
  module_id: string
  template_id?: string | null
  scheduled_at?: string | null
  user_ids?: string[]
  all_recipients?: boolean
  send?: boolean
}
