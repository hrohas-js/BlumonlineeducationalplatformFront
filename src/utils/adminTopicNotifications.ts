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
