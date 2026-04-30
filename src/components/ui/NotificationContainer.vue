<script setup lang="ts">
/**
 * NotificationContainer — компонент для отображения глобальных уведомлений.
 * Зеркало components/ui/NotificationContainer.vue из mirror-frontend.
 * Использует <Teleport to="body"> — паттерн из исходного проекта.
 */
import type { Notification } from '@/types'

interface Props {
  notifications: Notification[]
}

interface Emits {
  (e: 'dismiss', id: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <Teleport to="body">
    <div class="notification-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="`notification_${notification.type}`"
          role="alert"
        >
          <span class="notification__message">{{ notification.message }}</span>
          <button
            type="button"
            class="notification__close"
            aria-label="Закрыть уведомление"
            @click="$emit('dismiss', notification.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: var(--sp-20);
  right: var(--sp-20);
  z-index: var(--z-notification);
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
  max-width: var(--size-360);
  width: 100%;
}

.notification {
  @include inter-medium;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-12);
  padding: var(--sp-12) var(--sp-16);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  box-shadow: var(--shadow-notification);

  &_success {
    background-color: var(--success-bg);
    color: var(--success);
    border: var(--border-1) solid color-mix(in srgb, var(--success) 20%, transparent);
  }

  &_error {
    background-color: var(--error-bg);
    color: var(--error);
    border: var(--border-1) solid color-mix(in srgb, var(--error) 20%, transparent);
  }

  &_warning {
    background-color: var(--warning-bg);
    color: var(--warning);
    border: var(--border-1) solid color-mix(in srgb, var(--warning) 20%, transparent);
  }

  &_info {
    background-color: var(--info-bg);
    color: var(--info);
    border: var(--border-1) solid color-mix(in srgb, var(--info) 20%, transparent);
  }

  &__message {
    flex: 1;
  }

  &__close {
    @include inter-bold;
    font-size: var(--size-18);
    line-height: 1;
    opacity: var(--opacity-muted);
    transition: opacity 0.15s;
    padding: 0 var(--size-4);

    &:hover {
      opacity: var(--opacity-full);
    }
  }
}

// TransitionGroup animations
.notification-enter-active,
.notification-leave-active {
  transition: all 0.25s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: var(--motion-slide-in);
}

.notification-leave-to {
  opacity: 0;
  transform: var(--motion-slide-in);
}
</style>
