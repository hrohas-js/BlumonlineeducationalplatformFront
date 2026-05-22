<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

interface Props {
  isOpen: boolean
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLoading: false,
})

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const emit = defineEmits<Emits>()

const titleId = 'admin-logout-confirm-title'

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onYes = () => {
  if (props.confirmLoading) return
  emit('confirm')
}

const onNo = () => {
  closeModal()
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen && !props.confirmLoading) {
    closeModal()
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onEscapeKey)
    } else {
      document.removeEventListener('keydown', onEscapeKey)
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onEscapeKey)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.isOpen"
      class="admin-logout-confirm-modal"
      @click="onOverlayClick"
    >
      <div
        class="admin-logout-confirm-modal__content"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.stop
      >
        <h2 :id="titleId" class="admin-logout-confirm-modal__title">
          Вы действительно хотите выйти?
        </h2>

        <div class="admin-logout-confirm-modal__actions">
          <button
            type="button"
            class="admin-logout-confirm-modal__btn"
            :disabled="props.confirmLoading"
            @click="onYes"
          >
            Да
          </button>
          <button
            type="button"
            class="admin-logout-confirm-modal__btn"
            :disabled="props.confirmLoading"
            @click="onNo"
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-logout-confirm-modal {
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

.admin-logout-confirm-modal__content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-40);
  width: 100%;
  max-width: 297px;
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
}

.admin-logout-confirm-modal__title {
  margin: 0;
  max-width: 257px;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-logout-confirm-modal__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 47px;
}

.admin-logout-confirm-modal__btn {
  margin: 0;
  padding: 7px var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover:not(:disabled) {
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@media (max-width: 479px) {
  .admin-logout-confirm-modal__content {
    gap: var(--sp-24);
    padding: var(--sp-24);
  }

  .admin-logout-confirm-modal__title {
    font-size: var(--size-20);
  }

  .admin-logout-confirm-modal__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--sp-16);
  }

  .admin-logout-confirm-modal__btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>
