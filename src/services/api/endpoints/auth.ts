/**
 * Auth Service — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Зеркало services/api/endpoints/auth.ts из mirror-frontend.
 * Паттерн: plain object с async-методами, каждый возвращает ApiServiceResponse<T>.
 * useApi() используется внутри метода (не на уровне модуля) для корректного
 * inject()-а из контекста компонента или store.
 *
 * Для добавления нового сервиса (например, doctorsService):
 * 1. Создай src/services/api/endpoints/doctors.ts
 * 2. Следуй этому паттерну
 * 3. Реэкспортируй из services/api/index.ts
 */

import { useApi } from '@/composables/useApi'
import type { User } from '@/types'
import type {
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  LoginCredentials,
  LoginRequest,
  LoginApiResponse,
  LoginByPhoneRequest,
  LoginByPhoneResponse,
  RefreshTokenResponse,
  VerifyEmailRequest,
  ApiServiceResponse,
} from '../types'
import { AUTH_ENDPOINTS } from './auth.contract'

export const authService = {
  /**
   * Регистрация нового пользователя
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): ApiServiceResponse<RegisterResponse> {
    const api = useApi()
    return api.post<RegisterResponse>(AUTH_ENDPOINTS.register, data)
  },

  /**
   * Вход через email/пароль
   * POST /api/v1/auth/login
   * Тело: application/json { email, password }
   */
  async login(credentials: LoginCredentials): ApiServiceResponse<LoginApiResponse> {
    const api = useApi()
    const body: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
    }
    return api.post<LoginApiResponse>(AUTH_ENDPOINTS.login, body)
  },

  /**
   * Вход через телефон
   * POST /api/v1/auth/login-by-phone
   */
  async loginByPhone(data: LoginByPhoneRequest): ApiServiceResponse<LoginByPhoneResponse> {
    const api = useApi()
    return api.post<LoginByPhoneResponse>(AUTH_ENDPOINTS.loginByPhone, data)
  },

  /**
   * Выход
   * POST /api/v1/auth/logout
   */
  async logout(): ApiServiceResponse<{ success: boolean }> {
    const api = useApi()
    return api.post<{ success: boolean }>(AUTH_ENDPOINTS.logout)
  },

  /**
   * Получение текущего пользователя
   * GET /api/v1/users/me
   */
  async getCurrentUser(): ApiServiceResponse<User> {
    const api = useApi()
    return api.get<User>(AUTH_ENDPOINTS.me)
  },

  /**
   * Получение пользователя по ID
   * GET /api/v1/users/{id}
   */
  async getUserById(userId: string): ApiServiceResponse<User> {
    const api = useApi()
    return api.get<User>(`/api/v1/users/${userId}`)
  },

  /**
   * Обновление профиля пользователя
   * PUT /api/v1/profile/
   */
  async updateUser(userId: string, data: UpdateUserRequest): ApiServiceResponse<User> {
    const api = useApi()
    return api.put<User>(`/api/v1/profile/`, data)
  },

  /**
   * Обновление токена
   * POST /api/v1/auth/refresh
   */
  async refreshToken(refreshToken?: string): ApiServiceResponse<RefreshTokenResponse> {
    const api = useApi()
    if (!refreshToken) {
      return api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.refresh)
    }

    return api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.refresh, { refresh_token: refreshToken })
  },

  /**
   * Подтверждение email по токену из письма
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(token: string): ApiServiceResponse<User> {
    const api = useApi()
    const body: VerifyEmailRequest = { token }
    return api.post<User>(AUTH_ENDPOINTS.verifyEmail, body)
  },
}
