import type { User } from '@/types'

/**
 * В `npm run dev` разрешает /admin без роли admin на бэкенде.
 * Отключить: VITE_DEV_ALLOW_ADMIN=false в .env
 */
export function isDevAdminBypass(): boolean {
  if (!import.meta.env.DEV) return false
  return import.meta.env.VITE_DEV_ALLOW_ADMIN !== 'false'
}

export function userHasAdminRole(user: User | null | undefined): boolean {
  if (!user) return false
  const role = String(user.role ?? '').trim().toLowerCase()
  return role === 'admin' || role === 'administrator'
}

export function canAccessAdmin(user: User | null | undefined): boolean {
  return isDevAdminBypass() || userHasAdminRole(user)
}
