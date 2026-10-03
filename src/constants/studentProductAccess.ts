import type { AdminStudentAccessStatus } from '@/services/api/types'

/** Надпись ученику, когда доступ к продукту заблокирован администратором. */
export const STUDENT_PRODUCT_BLOCKED_MESSAGE = 'Нет доступа, обратитесь к администратору'

/** Надпись ученику, когда доступ к продукту поставлен на паузу. */
export const STUDENT_PRODUCT_PAUSED_MESSAGE = 'Доступ на паузе'

export type StudentProductAccessStatus = AdminStudentAccessStatus

const KNOWN_STATUSES: readonly StudentProductAccessStatus[] = ['active', 'paused', 'blocked', 'deleted']

export function readStudentProductAccessStatus(
  status: string | null | undefined,
): StudentProductAccessStatus | null {
  if (status && (KNOWN_STATUSES as readonly string[]).includes(status)) {
    return status as StudentProductAccessStatus
  }
  return null
}

/** Неизвестное или пустое значение считается активным доступом. */
export function resolveStudentProductAccessStatus(
  status: string | null | undefined,
): StudentProductAccessStatus {
  return readStudentProductAccessStatus(status) ?? 'active'
}

export function isStudentProductVisible(status: string | null | undefined): boolean {
  return resolveStudentProductAccessStatus(status) !== 'deleted'
}

export function canEnterStudentProduct(status: string | null | undefined): boolean {
  return resolveStudentProductAccessStatus(status) === 'active'
}

export function canReceiveDeadlineAlert(status: string | null | undefined): boolean {
  const resolved = resolveStudentProductAccessStatus(status)
  return resolved === 'active' || resolved === 'paused'
}

export function isStudentProductBlocked(status: string | null | undefined): boolean {
  return resolveStudentProductAccessStatus(status) === 'blocked'
}
