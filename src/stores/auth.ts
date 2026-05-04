/**
 * Auth Store — Doktor Blum
 *
 * Pinia setup-store. Хранит state, токены (access + refresh) в localStorage,
 * проксирует все методы authService.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api/endpoints/auth'
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/services/axios'
import type { User, RegisterData, LoginCredentials } from '@/types'
import type { RegisterRequest, LoginApiResponse, RefreshTokenResponse } from '@/services/api/types'

const studentNameBadgePlaceholder = 'Имя пользователя'

export const useAuthStore = defineStore('auth', () => {
  // ===== STATE =====
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ===== GETTERS =====
  const isAuthenticated = computed((): boolean => !!token.value && !!user.value)

  const userName = computed((): string => {
    if (user.value?.first_name || user.value?.last_name) {
      return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ') || 'Гость'
    }
    return 'Гость'
  })

  const studentNameBadgeLabel = computed((): string => {
    const parts = [
      user.value?.first_name?.trim(),
      user.value?.middle_name?.trim(),
      user.value?.last_name?.trim(),
    ].filter((p): p is string => Boolean(p && p.length > 0))

    const joined = parts.join(' ').trim()
    return joined.length > 0 ? joined : studentNameBadgePlaceholder
  })

  const userEmail = computed((): string => user.value?.email || '')

  // ===== STORAGE HELPERS =====
  function saveTokens(access: string, refresh?: string | null): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, access)
      if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh)
      }
    } catch (e) {
      console.warn('[authStore] Failed to save tokens:', e)
    }
  }

  function loadTokens(): { access: string | null; refresh: string | null } {
    try {
      return {
        access: localStorage.getItem(TOKEN_STORAGE_KEY),
        refresh: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
      }
    } catch {
      return { access: null, refresh: null }
    }
  }

  function clearStoredTokens(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  function resolveAccessToken(payload: LoginApiResponse | RefreshTokenResponse): string | null {
    if (typeof payload.access_token === 'string' && payload.access_token.length > 0) {
      return payload.access_token
    }
    return null
  }

  function clearSession(): void {
    user.value = null
    token.value = null
    refreshToken.value = null
    error.value = null
    clearStoredTokens()
  }

  // ===== ACTIONS =====

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    const result = await authService.login(credentials)

    if (result.success && result.data) {
      const loginResponse = result.data
      const nextToken = resolveAccessToken(loginResponse)

      if (!nextToken) {
        loading.value = false
        error.value = 'Не удалось получить access token'
        return { success: false, error: error.value }
      }

      token.value = nextToken
      refreshToken.value = loginResponse.refresh_token
      saveTokens(nextToken, loginResponse.refresh_token)
      user.value = loginResponse.user

      loading.value = false
      return { success: true }
    }

    error.value = result.error || 'Ошибка входа'
    loading.value = false
    return { success: false, error: error.value }
  }

  async function register(userData: RegisterData) {
    loading.value = true
    error.value = null

    const apiData: RegisterRequest = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
    }

    const result = await authService.register(apiData)

    if (result.success && result.data) {
      loading.value = false
      return { success: true, message: result.data.message }
    }

    error.value = result.error || 'Ошибка регистрации'
    loading.value = false
    return { success: false, error: error.value }
  }

  async function logout() {
    if (refreshToken.value) {
      try {
        await authService.logout(refreshToken.value)
      } catch (e) {
        console.error('[authStore] Logout error:', e)
      }
    }

    clearSession()
  }

  async function logoutAll() {
    try {
      await authService.logoutAll()
    } catch (e) {
      console.error('[authStore] Logout-all error:', e)
    }
    clearSession()
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    const result = await authService.getCurrentUser()

    if (result.success && result.data) {
      user.value = result.data
    } else if (result.error?.includes('401') || result.error?.includes('Unauthorized')) {
      clearSession()
    }

    loading.value = false
  }

  async function initializeAuth() {
    const { access, refresh } = loadTokens()
    if (access) {
      token.value = access
      refreshToken.value = refresh
      await fetchUser()
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      clearSession()
      return { success: false as const, error: 'Отсутствует refresh token' }
    }

    const result = await authService.refreshToken(refreshToken.value)

    if (!result.success || !result.data) {
      clearSession()
      return { success: false as const, error: result.error || 'Не удалось обновить сессию' }
    }

    const nextToken = resolveAccessToken(result.data)
    if (!nextToken) {
      clearSession()
      return { success: false as const, error: 'Ответ refresh не содержит access token' }
    }

    token.value = nextToken
    const nextRefresh = result.data.refresh_token ?? refreshToken.value
    refreshToken.value = nextRefresh
    saveTokens(nextToken, nextRefresh)
    return { success: true as const, token: nextToken }
  }

  async function forgotPassword(email: string) {
    loading.value = true
    error.value = null
    const result = await authService.forgotPassword(email)
    loading.value = false
    if (!result.success) {
      error.value = result.error || 'Не удалось отправить письмо'
      return { success: false, error: error.value }
    }
    return { success: true, message: result.data?.message }
  }

  async function resetPassword(token: string, newPassword: string) {
    loading.value = true
    error.value = null
    const result = await authService.resetPassword(token, newPassword)
    loading.value = false
    if (!result.success) {
      error.value = result.error || 'Не удалось сбросить пароль'
      return { success: false, error: error.value }
    }
    return { success: true, message: result.data?.message }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    loading.value = true
    error.value = null
    const result = await authService.changePassword(oldPassword, newPassword)
    loading.value = false
    if (!result.success) {
      error.value = result.error || 'Не удалось изменить пароль'
      return { success: false, error: error.value }
    }
    return { success: true, message: result.data?.message }
  }

  async function resendVerification(email: string) {
    const result = await authService.resendVerification(email)
    if (!result.success) {
      return { success: false, error: result.error || 'Не удалось отправить письмо подтверждения' }
    }
    return { success: true, message: result.data?.message }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    error,
    // Getters
    isAuthenticated,
    userName,
    studentNameBadgePlaceholder,
    studentNameBadgeLabel,
    userEmail,
    // Actions
    login,
    register,
    logout,
    logoutAll,
    fetchUser,
    initializeAuth,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changePassword,
    resendVerification,
    clearSession,
    clearError,
  }
})
