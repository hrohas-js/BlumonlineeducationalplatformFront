/**
 * useMediaQuery Composable — Doktor Blum
 *
 * Реактивная обёртка над window.matchMedia.
 * Позволяет отслеживать медиа-запросы в компонентах.
 *
 * Примечание по архитектуре (см. ARCHITECTURE_ANALYSIS.md §7):
 * В исходном проекте адаптивность реализована преимущественно через fluid-calc()
 * без JS-медиа-запросов. Этот composable предназначен для структурных изменений
 * layout-а (например, скрытие/показ sidebar на мобильных).
 *
 * Использование:
 *   const isMobile = useMediaQuery('(max-width: 768px)')
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
 */
import { ref, onMounted, onUnmounted } from 'vue'

/** Предустановленные брейкпоинты проекта */
export const BREAKPOINTS = {
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1920px)',
} as const

export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const handler = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handler)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handler)
  })

  return matches
}
