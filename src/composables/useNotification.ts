/**
 * useNotification Composable — Doktor Blum
 *
 * Глобальная система уведомлений.
 * Адаптация composables/useNotification.ts из mirror-frontend.
 *
 * Использование в компоненте:
 *   const { notify } = useNotification()
 *   notify({ type: 'success', message: 'Сохранено!' })
 *   notify({ type: 'error', message: 'Ошибка сети', duration: 5000 })
 */
import { ref } from 'vue'
import type { Notification, NotificationType } from '@/types'

const notifications = ref<Notification[]>([])

let idCounter = 0

export function useNotification() {
  const notify = (options: {
    type: NotificationType
    message: string
    duration?: number
  }) => {
    const id = String(++idCounter)
    const notification: Notification = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration ?? 3000,
    }

    notifications.value.push(notification)

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => dismiss(id), notification.duration)
    }
  }

  const dismiss = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
  }

  return {
    notifications,
    notify,
    dismiss,
  }
}
