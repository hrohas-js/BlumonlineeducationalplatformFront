/**
 * Доменные типы приложения — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §5):
 * Этот файл содержит domain-модели (User, ApiResponse, etc.).
 * DTO (форматы запросов/ответов API) хранятся в services/api/types.ts.
 * Такое разделение позволяет изменять API-контракты без изменения доменной логики.
 */

// ===== USER =====

export interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  email_verified: boolean
  has_paid: boolean
  created_at: string
  updated_at: string
  middle_name?: string
  phone?: string
  date_of_birth?: string
}

// ===== API UTILITIES =====

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string | number
  field?: string
}

// ===== AUTH =====

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword?: string
  phone?: string
  firstName?: string
  lastName?: string
  middleName?: string
  dateOfBirth?: string
}

// ===== NOTIFICATIONS =====

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

// ===== WINDOW EXTENSIONS =====

declare global {
  interface Window {
    __windowResizeListenerAdded?: boolean
  }
}
