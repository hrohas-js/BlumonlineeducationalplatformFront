<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const titleId = 'password-reset-sent-modal-title'
const titleText = 'Письмо для смены пароля\nуспешно отправлено\nна вашу почту!'

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

function onEscapeKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.isOpen) return
  event.stopImmediatePropagation()
  closeModal()
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
    <div v-if="props.isOpen" class="password-reset-sent-modal" @click="onOverlayClick">
      <div
        class="password-reset-sent-modal__content"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.stop
      >
        <h2 :id="titleId" class="password-reset-sent-modal__title">{{ titleText }}</h2>
        <BaseButton
          class="password-reset-sent-modal__confirm"
          variant="primary"
          shape="rounded"
          text="Продолжить"
          @click="onConfirm"
        />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.password-reset-sent-modal {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-notification) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-20);
  box-sizing: border-box;
  background-color: rgba(1, 3, 7, 0.4);

  &__content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-24);
    width: 100%;
    max-width: 300px;
    padding: var(--sp-32) var(--sp-20);
    border: var(--border-1) solid #010307;
    border-radius: var(--radius-20);
    background-color: var(--white);
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    line-height: normal;
    text-align: center;
    color: #010307;
    white-space: pre-line;
  }
}

@media (max-width: 768px) {
  .password-reset-sent-modal__title {
    font-size: var(--size-15);
  }
}
</style>
