<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

export type AdminProductTopicMenuAction = 'copy' | 'deadline' | 'notifications' | 'delete'

interface Props {
  isOpen: boolean
  topicTitle?: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'close'): void
  (e: 'action', action: AdminProductTopicMenuAction): void
}

const emit = defineEmits<Emits>()

const menuRef = ref<HTMLElement | null>(null)

const menuItems: { id: AdminProductTopicMenuAction; label: string }[] = [
  { id: 'copy', label: 'Копировать тему' },
  { id: 'deadline', label: 'Настроить дедлайн' },
  { id: 'notifications', label: 'Уведомления' },
  { id: 'delete', label: 'Удалить тему' },
]

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onItemClick = (action: AdminProductTopicMenuAction) => {
  emit('action', action)
  closeModal()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.isOpen"
      class="admin-product-topic-menu-modal"
      @click="onOverlayClick"
    >
      <nav
        ref="menuRef"
        class="admin-product-topic-menu-modal__menu"
        role="menu"
        :aria-label="topicTitle ? `Действия для темы «${topicTitle}»` : 'Действия с темой'"
        @click.stop
      >
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="admin-product-topic-menu-modal__item"
          role="menuitem"
          @click="onItemClick(item.id)"
        >
          <span class="admin-product-topic-menu-modal__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(3.75 6.25)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.2197 0.21967C10.5126 -0.0732233 10.9874 -0.0732233 11.2803 0.21967L16.2803 5.21967C16.5732 5.51256 16.5732 5.98744 16.2803 6.28033L11.2803 11.2803C10.9874 11.5732 10.5126 11.5732 10.2197 11.2803C9.92678 10.9874 9.92678 10.5126 10.2197 10.2197L13.9393 6.5L5.75 6.5C5.03668 6.5 3.95002 6.72016 3.06323 7.35865C2.21468 7.9696 1.5 8.99444 1.5 10.75C1.5 11.1642 1.16421 11.5 0.75 11.5C0.335786 11.5 0 11.1642 0 10.75C0 8.50556 0.951983 7.0304 2.18677 6.14135C3.38332 5.27984 4.79665 5 5.75 5L13.9393 5L10.2197 1.28033C9.92678 0.987437 9.92678 0.512563 10.2197 0.21967Z"
                  fill="currentColor"
                />
              </g>
            </svg>
          </span>
          <span class="admin-product-topic-menu-modal__label">{{ item.label }}</span>
        </button>
      </nav>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-product-topic-menu-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-notification);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-20);
  box-sizing: border-box;
  background-color: rgba(1, 3, 7, 0.4);
}

/* Figma 480:2606 — «Дополнительное меню» */
.admin-product-topic-menu-modal__menu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-10);
  margin: 0;
  padding: var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  min-width: 280px;
}

.admin-product-topic-menu-modal__item {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: #010307;
  border-radius: 4px;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover,
  &:focus-visible {
    color: #178ef0;

    .admin-product-topic-menu-modal__icon {
      color: #178ef0;
    }
  }
}

.admin-product-topic-menu-modal__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: #010307;
  transition: color 0.15s ease;
}

.admin-product-topic-menu-modal__label {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  white-space: nowrap;
  transition: color 0.15s ease;
}

@media (max-width: 1023px) {
  .admin-product-topic-menu-modal__label {
    font-size: var(--size-15);
  }
}
</style>
