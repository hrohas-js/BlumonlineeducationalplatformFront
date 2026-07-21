import type {
  AdminBroadcastItem,
  AdminBroadcastTemplate,
  AdminStudentItem,
} from '@/services/api/types'
import type { AdminNotificationMailingRow } from '@/utils/adminNotificationsMailings'
import type { AdminTopicNotificationTemplate } from '@/utils/adminTopicNotifications'

export function mapStudentToRecipient(s: AdminStudentItem) {
  const name = [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || s.email
  return {
    id: s.user_id,
    name,
    email: s.email,
    selectedByDefault: true,
  }
}

export function mapBroadcastToMailingRow(item: AdminBroadcastItem): AdminNotificationMailingRow {
  const dateSource =
    item.completed_at || item.started_at || item.scheduled_at || item.created_at || ''
  return {
    id: item.id,
    subject: item.subject,
    productTitle: item.product_title || item.product_id,
    topicTitle: item.module_title || item.module_id,
    sentCount: item.sent_count,
    sentDate: formatSentDate(dateSource),
    status: item.status,
  }
}

export function mapTemplateToUi(t: AdminBroadcastTemplate): AdminTopicNotificationTemplate {
  return {
    id: t.id,
    label: t.name,
    subject: t.subject,
    body: t.body,
  }
}

/** AdminDateField gives `YYYY-MM-DD` → ISO for `scheduled_at`. */
export function toScheduledAtIso(dateYmd: string): string {
  const trimmed = dateYmd.trim()
  if (!trimmed) return ''
  if (trimmed.includes('T')) return trimmed
  return `${trimmed}T00:00:00.000Z`
}

export function scheduledAtToDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})/)
    return match?.[1] ?? ''
  }
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatSentDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ru-RU')
}
