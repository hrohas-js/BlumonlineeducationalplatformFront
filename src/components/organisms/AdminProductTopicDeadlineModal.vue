<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import { isoDateToRuLabel } from '@/utils/adminDateInput'

interface Props {
  isOpen: boolean
  /** Текущий срок доступа темы (`ДД.ММ.ГГГГ`). */
  accessUntil: string
  topicTitle?: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'close'): void
  (e: 'save', payload: { accessUntil: string }): void
}

const emit = defineEmits<Emits>()

const deadlineIso = ref('')

const titleId = 'admin-product-topic-deadline-modal-title'

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      deadlineIso.value = ''
    }
  },
)

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const canApply = computed(() => Boolean(isoDateToRuLabel(deadlineIso.value.trim())))

const onDeadlineChange = (iso: string) => {
  deadlineIso.value = iso
}

const onApply = () => {
  const ru = isoDateToRuLabel(deadlineIso.value.trim())
  if (!ru) return
  emit('save', { accessUntil: ru })
  closeModal()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

const ariaLabel = computed(() =>
  props.topicTitle
    ? `Задать дедлайн для темы «${props.topicTitle}»`
    : 'Задать дедлайн к выбранной теме',
)

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
      class="admin-product-topic-deadline-modal"
      @click="onOverlayClick"
    >
      <div
        class="admin-product-topic-deadline-modal__content"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-label="ariaLabel"
        @click.stop
      >
        <div class="admin-product-topic-deadline-modal__row">
          <p :id="titleId" class="admin-product-topic-deadline-modal__heading">
            Задать дедлайн к выбранной теме
          </p>
          <div class="admin-product-topic-deadline-modal__date">
            <AdminDateField
              :model-value="deadlineIso"
              placeholder="мм.дд.гггг"
              center
              input-id="admin-product-topic-deadline-input"
              @update:model-value="onDeadlineChange"
            />
          </div>
        </div>
        <p class="admin-product-topic-deadline-modal__warning">
          <span>Внимание! При данной настройке </span>
          <span class="admin-product-topic-deadline-modal__warning-accent">общий дедлайн</span>
          <span>, который был задан при создании темы будет аннулирован для всех участников!</span>
        </p>
        <div class="admin-product-topic-deadline-modal__actions">
          <BaseButton
            class="admin-product-topic-deadline-modal__submit"
            variant="primary"
            size="medium"
            text="Задать"
            :disabled="!canApply"
            @click="onApply"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
/* Figma 484:3445 */
.admin-product-topic-deadline-modal {
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

.admin-product-topic-deadline-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 38px;
  box-sizing: border-box;
  width: 100%;
  max-width: 496px;
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
}

.admin-product-topic-deadline-modal__row {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-topic-deadline-modal__heading {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  white-space: nowrap;
}

.admin-product-topic-deadline-modal__date {
  flex-shrink: 0;
  width: 200px;
  box-sizing: border-box;
  padding: var(--sp-10);
  border-radius: 5px;
  background-color: #f3f4f6;

  :deep(.admin-date-field) {
    width: 100%;
    max-width: none;
    align-items: stretch;
  }

  :deep(.admin-date-field__field) {
    border: none;
    background-color: transparent;
  }

  :deep(.admin-date-field__input) {
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    text-align: center;
    min-height: auto;
    padding: 0;
  }

  :deep(.admin-date-field__format-hint) {
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: rgba(1, 3, 7, 0.35);
  }
}

.admin-product-topic-deadline-modal__warning {
  margin: 0;
  width: 100%;
  max-width: 456px;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}

.admin-product-topic-deadline-modal__warning-accent {
  color: #178ef0;
}

.admin-product-topic-deadline-modal__actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.admin-product-topic-deadline-modal__submit.base-button) {
  min-width: 120px;
  border-radius: var(--radius-10);
}
</style>
