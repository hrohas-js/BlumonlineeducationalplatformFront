export type AdminNotificationMailingStatus =
  | 'completed'
  | 'pending'
  | 'failed'
  | 'scheduled'
  | 'running'
  | 'stopped'
  | 'draft'

export interface AdminNotificationMailingRow {
  id: string
  subject: string
  productTitle: string
  topicTitle: string
  sentCount: number
  sentDate: string
  status: AdminNotificationMailingStatus | string
}

export const ADMIN_NOTIFICATION_MAILING_STATUS_LABELS: Record<
  AdminNotificationMailingStatus,
  string
> = {
  completed: 'Выполнено',
  pending: 'В ожидании',
  failed: 'Ошибка',
  scheduled: 'Запланировано',
  running: 'В процессе',
  stopped: 'Остановлено',
  draft: 'Черновик',
}

export function getMailingStatusLabel(status: string): string {
  if (status in ADMIN_NOTIFICATION_MAILING_STATUS_LABELS) {
    return ADMIN_NOTIFICATION_MAILING_STATUS_LABELS[status as AdminNotificationMailingStatus]
  }
  return status || '—'
}
