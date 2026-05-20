import type { User } from '@/types'

/** API может вернуть `id` или `user_id` — приводим к единому User. */
export function normalizeUser(raw: Record<string, unknown> | User): User {
  const r = raw as Record<string, unknown>
  const id = String(r.id ?? r.user_id ?? '')
  return {
    id,
    user_id: id,
    email: String(r.email ?? ''),
    first_name: String(r.first_name ?? ''),
    last_name: String(r.last_name ?? ''),
    role: String(r.role ?? 'user'),
    email_verified: Boolean(r.email_verified),
    has_paid: Boolean(r.has_paid),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
    middle_name: r.middle_name != null ? String(r.middle_name) : undefined,
    phone: r.phone != null ? String(r.phone) : undefined,
    date_of_birth: r.date_of_birth != null ? String(r.date_of_birth) : undefined,
  }
}
