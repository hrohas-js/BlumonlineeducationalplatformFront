/** Надпись ученику, когда доступ к продукту заблокирован администратором. */
export const STUDENT_PRODUCT_BLOCKED_MESSAGE = 'Нет доступа, обратитесь к администратору'

export function isStudentProductBlocked(status: string | null | undefined): boolean {
  return status === 'blocked'
}
