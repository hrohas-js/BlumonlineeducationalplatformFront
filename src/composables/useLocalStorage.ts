/**
 * useLocalStorage Composable — Doktor Blum
 *
 * Реактивная обёртка над localStorage.
 * Автоматически сериализует/десериализует JSON.
 * Обрабатывает недоступность localStorage (инкогнито-режим).
 *
 * Использование:
 *   const [token, setToken, removeToken] = useLocalStorage<string>('auth-token')
 *   setToken('my-jwt-token')
 *   console.log(token.value) // 'my-jwt-token'
 */
import { ref, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): [Ref<T | null>, (value: T) => void, () => void] {
  const read = (): T | null => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  const storedValue = ref<T | null>(read()) as Ref<T | null>

  const setValue = (value: T): void => {
    try {
      storedValue.value = value
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to set "${key}":`, error)
    }
  }

  const removeValue = (): void => {
    try {
      storedValue.value = null
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to remove "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}
