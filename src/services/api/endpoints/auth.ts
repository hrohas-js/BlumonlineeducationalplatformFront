/**
 * Auth Service — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Зеркало services/api/endpoints/auth.ts из mirror-frontend.
 * Паттерн: plain object с async-методами, каждый возвращает ApiServiceResponse<T>.
 * useApi() используется внутри метода (не на уровне модуля) для корректного
 * inject()-а из контекста компонента или store.
 */

import { useApi } from '@/composables/useApi'
import type { User } from '@/types'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginCredentials,
  LoginRequest,
  LoginApiResponse,
  RefreshTokenResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  LogoutRequest,
  MessageResponse,
  ApiServiceResponse,
} from '../types'
import { AUTH_ENDPOINTS } from './auth.contract'

export const authService = {
  /** POST /api/v1/auth/register */
  async register(data: RegisterRequest): ApiServiceResponse<RegisterResponse> {
    const api = useApi()
    return api.post<RegisterResponse>(AUTH_ENDPOINTS.register, data)
  },

  /** POST /api/v1/auth/login */
  async login(credentials: LoginCredentials): ApiServiceResponse<LoginApiResponse> {
    const api = useApi()
    const body: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
    }
    return api.post<LoginApiResponse>(AUTH_ENDPOINTS.login, body)
  },

  /** POST /api/v1/auth/logout */
  async logout(refreshToken: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    const body: LogoutRequest = { refresh_token: refreshToken }
    return api.post<MessageResponse>(AUTH_ENDPOINTS.logout, body)
  },

  /** POST /api/v1/auth/logout-all — завершить все активные сессии */
  async logoutAll(): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.post<MessageResponse>(AUTH_ENDPOINTS.logoutAll)
  },

  /** GET /api/v1/auth/me */
  async getCurrentUser(): ApiServiceResponse<User> {
    const api = useApi()
    return api.get<User>(AUTH_ENDPOINTS.me)
  },

  /** POST /api/v1/auth/refresh */
  async refreshToken(refreshToken: string): ApiServiceResponse<RefreshTokenResponse> {
    const api = useApi()
    return api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.refresh, {
      refresh_token: refreshToken,
    })
  },

  /** POST /api/v1/auth/verify-email */
  async verifyEmail(token: string): ApiServiceResponse<User> {
    const api = useApi()
    const body: VerifyEmailRequest = { token }
    return api.post<User>(AUTH_ENDPOINTS.verifyEmail, body)
  },

  /** POST /api/v1/auth/resend-verification */
  async resendVerification(email: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    const body: ResendVerificationRequest = { email }
    return api.post<MessageResponse>(AUTH_ENDPOINTS.resendVerification, body)
  },

  /** POST /api/v1/auth/forgot-password */
  async forgotPassword(email: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    const body: ForgotPasswordRequest = { email }
    return api.post<MessageResponse>(AUTH_ENDPOINTS.forgotPassword, body)
  },

  /** POST /api/v1/auth/reset-password */
  async resetPassword(token: string, newPassword: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    const body: ResetPasswordRequest = { token, new_password: newPassword }
    return api.post<MessageResponse>(AUTH_ENDPOINTS.resetPassword, body)
  },

  /** POST /api/v1/auth/change-password — для авторизованного пользователя */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    const body: ChangePasswordRequest = { old_password: oldPassword, new_password: newPassword }
    return api.post<MessageResponse>(AUTH_ENDPOINTS.changePassword, body)
  },
}
