import type { RouteLocationRaw } from 'vue-router'
import type { User } from '@/types'
import { userHasAdminRole } from '@/utils/adminAccess'
import type { useAuthStore } from '@/stores/auth'

type AuthStoreForRouting = Pick<
  ReturnType<typeof useAuthStore>,
  'isSessionValid' | 'user'
>

/**
 * Домашний маршрут после входа или для авторизованного гостя на /login и /.
 * Только реальная роль admin — без dev-bypass (см. canAccessAdmin).
 */
export function resolvePostAuthRoute(user: User | null | undefined): RouteLocationRaw {
  if (userHasAdminRole(user)) {
    return { name: 'admin' }
  }
  return { name: 'home-section', params: { section: 'profile' } }
}

/** Редирект с корня `/` по результату проверки сохранённой сессии. */
export function resolveRootRoute(authStore: AuthStoreForRouting): RouteLocationRaw {
  if (!authStore.isSessionValid()) {
    return { name: 'login', replace: true }
  }
  const destination = resolvePostAuthRoute(authStore.user)
  if (typeof destination === 'string') {
    return { path: destination, replace: true }
  }
  return { ...destination, replace: true }
}
