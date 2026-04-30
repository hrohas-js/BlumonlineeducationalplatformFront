import type { Pinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

/**
 * Единая точка инициализации auth-сессии при старте SPA.
 * Вызывается из main.ts до монтирования приложения.
 */
export async function bootstrapAuthSession(pinia: Pinia): Promise<void> {
  const authStore = useAuthStore(pinia)
  await authStore.initializeAuth()
}
