export type AdminNotificationMailingStatus = 'completed' | 'pending' | 'failed'

export interface AdminNotificationMailingRow {
  id: string
  subject: string
  productTitle: string
  topicTitle: string
  sentCount: number
  sentDate: string
  status: AdminNotificationMailingStatus
}

export const ADMIN_NOTIFICATION_MAILING_STATUS_LABELS: Record<AdminNotificationMailingStatus, string> = {
  completed: 'Выполнено',
  pending: 'В ожидании',
  failed: 'Ошибка',
}

const MOCK_MAILINGS: AdminNotificationMailingRow[] = [
  {
    id: 'mailing-1',
    subject: 'Предновогодняя акция',
    productTitle: 'Закрытый клуб',
    topicTitle: '5 тема',
    sentCount: 356,
    sentDate: '12.12.2025',
    status: 'completed',
  },
  {
    id: 'mailing-2',
    subject: 'Новый поток',
    productTitle: 'Вертоград',
    topicTitle: '1 тема',
    sentCount: 1278,
    sentDate: '01.01.2026',
    status: 'completed',
  },
]

/** Список рассылок для вкладки «Рассылки» (мок до API). */
export function getMockNotificationMailings(): AdminNotificationMailingRow[] {
  return MOCK_MAILINGS.map((row) => ({ ...row }))
}
