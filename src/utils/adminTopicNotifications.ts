import type { AdminStudentRow } from '@/utils/adminMockStudents'
import { mockStudentsForAdminSection } from '@/utils/adminMockStudents'

export interface AdminTopicNotificationRecipient {
  id: string
  name: string
  email: string
  selectedByDefault: boolean
}

export interface AdminTopicNotificationTemplate {
  id: string
  label: string
  subject: string
  body: string
}

export const ADMIN_TOPIC_NOTIFICATION_PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export type AdminTopicNotificationPageSize =
  (typeof ADMIN_TOPIC_NOTIFICATION_PAGE_SIZE_OPTIONS)[number]

const MOCK_TEMPLATES: AdminTopicNotificationTemplate[] = [
  {
    id: 'tpl-welcome',
    label: 'Приветственное письмо',
    subject: 'Добро пожаловать на курс',
    body: 'Здравствуйте!\n\nРады приветствовать вас на платформе Doktor Blum.',
  },
  {
    id: 'tpl-deadline',
    label: 'Напоминание о дедлайне',
    subject: 'Напоминание: приближается дедлайн',
    body: 'Уважаемый участник,\n\nНапоминаем о сроке доступа к материалам темы.',
  },
  {
    id: 'tpl-custom',
    label: 'Пустой шаблон',
    subject: '',
    body: '',
  },
]

function expandRecipients(rows: AdminStudentRow[]): AdminTopicNotificationRecipient[] {
  const base = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    selectedByDefault: index < 8,
  }))

  const extra: AdminTopicNotificationRecipient[] = Array.from({ length: 2 }, (_, i) => ({
    id: `topic-notify-extra-${i}`,
    name: 'Здесь имя ученика',
    email: 'Здесь почта',
    selectedByDefault: false,
  }))

  return [...base, ...extra]
}

/** Список получателей для экрана уведомлений темы (мок до API). */
export function getMockTopicNotificationRecipients(): AdminTopicNotificationRecipient[] {
  const rows = mockStudentsForAdminSection('courses')
  return expandRecipients(rows)
}

export function getMockTopicNotificationTemplates(): AdminTopicNotificationTemplate[] {
  return MOCK_TEMPLATES.map((t) => ({ ...t }))
}

/** Всего получателей по продукту/теме (мок). */
export const MOCK_TOPIC_NOTIFICATION_TOTAL_RECIPIENTS = 320
