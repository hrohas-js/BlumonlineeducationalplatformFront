/**
 * useFetch Composable — Doktor Blum
 *
 * Универсальный composable для загрузки данных с состоянием.
 * Возвращает реактивные data, loading, error и функцию execute() для
 * повторного запроса.
 *
 * Использование:
 *   const { data, loading, error, execute } = useFetch(() => authService.getCurrentUser())
 *   // data — Ref<User | null>
 *   // loading — Ref<boolean>
 *   // error — Ref<string | null>
 */
import { ref, type Ref } from 'vue'
import type { ApiResult } from '@/services/api/types'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: () => Promise<void>
}

export function useFetch<T>(
  fetcher: () => Promise<ApiResult<T>>,
  options: { immediate?: boolean } = { immediate: true }
): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    const result = await fetcher()

    if (result.success && result.data !== null) {
      data.value = result.data
    } else {
      error.value = result.error
    }

    loading.value = false
  }

  if (options.immediate) {
    execute()
  }

  return { data, loading, error, execute }
}
