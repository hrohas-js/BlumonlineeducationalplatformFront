<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import ModalCloseButton from '@/components/atoms/ModalCloseButton.vue'
import SupportContactsGrid from '@/components/molecules/SupportContactsGrid.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const closeModal = () => {
  emit('close')
}

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
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
  { immediate: true },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onEscapeKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="technical-support-modal" @click="onOverlayClick">
      <div
        class="technical-support-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="technical-support-modal-title"
        @click.stop
      >
        <div class="technical-support-modal__close-wrap">
          <ModalCloseButton class="technical-support-modal__close" @click="closeModal" />
        </div>

        <h2 id="technical-support-modal-title" class="technical-support-modal__title">
          Техническая поддержка
        </h2>

        <SupportContactsGrid compact />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.technical-support-modal {
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

.technical-support-modal__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  padding: 40px;
  border: 1px solid #010307;
  border-radius: 20px;
  background-color: var(--white);
}

.technical-support-modal__close-wrap {
  position: absolute;
  top: var(--sp-16);
  right: var(--sp-16);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  box-sizing: border-box;
}

.technical-support-modal__close {
  width: 23px;
  height: 23px;
}

.technical-support-modal__title {
  margin: 0 0 var(--sp-20);
  font-family: var(--font-family);
  font-weight: var(--font-bold);
  font-size: var(--size-20);
  line-height: normal;
  text-align: center;
  color: var(--text-accent);
}

@media (max-width: 479px) {
  .technical-support-modal__content {
    padding: var(--sp-24);
  }

  .technical-support-modal__title {
    font-size: var(--size-15);
  }
}
</style>
