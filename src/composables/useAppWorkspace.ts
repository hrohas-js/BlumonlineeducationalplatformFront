import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const STUDENT_CABINET_PREFIXES = [
  '/profile',
  '/learning',
  '/renewal',
  '/glossary',
  '/review',
] as const

/** Сохраняется между монтированиями меню в рамках SPA-сессии. */
const persistedAdminWorkspace = ref<boolean | null>(null)

function isAdminPath(path: string): boolean {
  return path.startsWith('/admin')
}

function isStudentCabinetPath(path: string): boolean {
  if (path.startsWith('/course/')) return true
  return STUDENT_CABINET_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * Режим админки для шапки/мобильного меню.
 * На /admin — админ; в кабинете ученика — ученик; на общих страницах
 * (например /about-doctor) сохраняется последний режим.
 */
export function useAppWorkspace() {
  const route = useRoute()
  const authStore = useAuthStore()

  watch(
    () => route.path,
    (path) => {
      if (isAdminPath(path)) {
        persistedAdminWorkspace.value = true
        return
      }
      if (isStudentCabinetPath(path)) {
        persistedAdminWorkspace.value = false
      }
    },
    { immediate: true },
  )

  const isAdminMode = computed(() => {
    if (isAdminPath(route.path)) return true
    if (isStudentCabinetPath(route.path)) return false
    if (persistedAdminWorkspace.value != null) return persistedAdminWorkspace.value
    return authStore.isAdmin
  })

  return { isAdminMode }
}
