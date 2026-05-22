import type { RouteLocationRaw } from 'vue-router'
import type { User } from '@/types'
import { userHasAdminRole } from '@/utils/adminAccess'

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
