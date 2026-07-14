<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Продолжить',
})

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const emit = defineEmits<Emits>()

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onConfirm = () => {
  emit('confirm')
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="admin-info-modal" @click="onOverlayClick">
      <div
        class="admin-info-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-info-modal-title"
        @click.stop
      >
        <h2 id="admin-info-modal-title" class="admin-info-modal__title">{{ props.title }}</h2>
        <p class="admin-info-modal__message">{{ props.message }}</p>
        <BaseButton
          class="admin-info-modal__confirm"
          variant="primary"
          shape="rounded"
          :text="props.confirmLabel"
          @click="onConfirm"
        />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-info-modal {
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

.admin-info-modal__content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border: 1px solid #010307;
  border-radius: 20px;
  background-color: var(--white);
}

.admin-info-modal__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: 700;
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-info-modal__message {
  margin: 0;
  max-width: 285px;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

:deep(.admin-info-modal__confirm.base-button_primary) {
  background-color: var(--knopka);
  border-color: var(--knopka);

  &:hover:not(.base-button_disabled) {
    background-color: color-mix(in srgb, var(--knopka) 92%, black);
    border-color: color-mix(in srgb, var(--knopka) 92%, black);
  }
}

@media (max-width: 479px) {
  .admin-info-modal__content {
    padding: var(--sp-24);
    gap: var(--sp-24);
  }

  .admin-info-modal__title,
  .admin-info-modal__message {
    font-size: var(--size-20);
  }

  :deep(.admin-info-modal__confirm) {
    width: 100%;
    min-height: 44px;
  }
}
</style>
