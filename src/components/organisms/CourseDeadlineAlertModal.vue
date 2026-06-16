<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import ModalCloseButton from '@/components/atoms/ModalCloseButton.vue'
import { buildDeadlineAlertRemainderText } from '@/utils/deadlineAlert'

const props = defineProps<{
  isOpen: boolean
  courseTitle: string
  daysLeft: number
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'renew'): void
}>()

const remainderText = computed(() => buildDeadlineAlertRemainderText(props.daysLeft))

const closeModal = () => {
  emit('close')
}

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onRenew = () => {
  emit('renew')
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
    <div v-if="props.isOpen" class="course-deadline-alert-modal" @click="onOverlayClick">
      <div
        class="course-deadline-alert-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-deadline-alert-modal-title"
        @click.stop
      >
        <div class="course-deadline-alert-modal__close-wrap">
          <ModalCloseButton class="course-deadline-alert-modal__close" @click="closeModal" />
        </div>

        <h2 id="course-deadline-alert-modal-title" class="course-deadline-alert-modal__title">
          Внимание!
        </h2>

        <p class="course-deadline-alert-modal__message">
          До окончания дедлайна на курсе
          <span class="course-deadline-alert-modal__course-name">«{{ props.courseTitle }}»</span>
          {{ remainderText }}!
        </p>

        <button type="button" class="course-deadline-alert-modal__renew" @click="onRenew">
          Приобрести продление
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.course-deadline-alert-modal {
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

.course-deadline-alert-modal__content {
  position: relative;
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

.course-deadline-alert-modal__close-wrap {
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

.course-deadline-alert-modal__close {
  width: 23px;
  height: 23px;
}

.course-deadline-alert-modal__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: 700;
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: var(--error);
}

.course-deadline-alert-modal__message {
  margin: 0;
  max-width: 320px;
  font-family: var(--font-family);
  font-weight: 700;
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.course-deadline-alert-modal__course-name {
  color: var(--text-accent);
}

.course-deadline-alert-modal__renew {
  width: 100%;
  margin: 0;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background-color: var(--knopka);
  color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  cursor: pointer;

  &:hover {
    filter: brightness(1.03);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

@media (max-width: 479px) {
  .course-deadline-alert-modal__content {
    padding: var(--sp-24);
    gap: var(--sp-24);
  }

  .course-deadline-alert-modal__title,
  .course-deadline-alert-modal__message {
    font-size: var(--size-20);
  }

  .course-deadline-alert-modal__renew {
    min-height: 44px;
  }
}
</style>
