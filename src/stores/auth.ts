/**
 * Auth Store — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Адаптация stores/auth.ts из mirror-frontend для plain Vue 3.
 * Ключевые отличия:
 * - Нет useCookie() / process.client (Nuxt) — только localStorage
 * - Нет navigateTo() (Nuxt) — используем router.push() из Vue Router
 * - Нет initializeAuth() через Nuxt plugin — вызывается из App.vue onMounted()
 *
 * Паттерн: Pinia setup-store (defineStore с функцией).
 * Все stores используют этот паттерн (см. ARCHITECTURE_ANALYSIS.md §4).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api/endpoints/auth'
import type { User, RegisterData, LoginCredentials } from '@/types'
import type { RegisterRequest, LoginApiResponse, RefreshTokenResponse } from '@/services/api/types'

const TOKEN_STORAGE_KEY = 'auth-token'

/** Текст плашки имени ученика на профиле и в «Моё обучение», если ФИО не задано */
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
    if (joined.length > 0) {
      return joined
    }
    return studentNameBadgePlaceholder
  })

  const userEmail = computed((): string => user.value?.email || '')

  // ===== PRIVATE HELPERS =====
  function saveToken(t: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, t)
    } catch (e) {
      console.warn('[authStore] Failed to save token:', e)
    }
  }

  function loadToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  }

  function clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
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
    clearToken()
  }

  // ===== ACTIONS =====

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    const result = await authService.login(credentials)

    if (result.success && result.data) {
      const loginResponse = result.data as LoginApiResponse
      const nextToken = resolveAccessToken(loginResponse)

      if (!nextToken) {
        loading.value = false
        error.value = 'Не удалось получить access token'
        return { success: false, error: error.value }
      }

      token.value = nextToken
      refreshToken.value = loginResponse.refresh_token
      saveToken(nextToken)
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
    try {
      await authService.logout()
    } catch (e) {
      console.error('[authStore] Logout error:', e)
    }

    clearSession()

    // В компоненте, вызывающем logout(), используй useRouter() для редиректа.
    // Пример: const router = useRouter(); await authStore.logout(); router.push('/login')
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

  /** Вызывается из App.vue onMounted() — инициализация auth при старте SPA */
  async function initializeAuth() {
    const savedToken = loadToken()
    if (savedToken) {
      token.value = savedToken
      await fetchUser()
    }
  }

  async function refreshAccessToken() {
    const result = await authService.refreshToken(refreshToken.value ?? undefined)

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
    refreshToken.value = result.data.refresh_token ?? refreshToken.value
    saveToken(nextToken)
    return { success: true as const, token: nextToken }
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
    fetchUser,
    initializeAuth,
    refreshAccessToken,
    clearSession,
    clearError,
  }
})
