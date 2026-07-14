<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import {
  deadlineRuLabelToIso,
  isoDateToRuLabel,
  isRuDeadlineFormat,
  parseIsoDateToTime,
} from '@/utils/adminDateInput'

interface Props {
  isOpen: boolean
  studentName: string
  avatarUrl?: string | null
  /** Текущий дедлайн как в профиле (текст или ДД.ММ.ГГГГ). */
  currentDeadlineDisplay: string
}

interface Emits {
  (e: 'close'): void
  (e: 'save', payload: { newDeadlineDisplay: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newDeadlineIso = ref('')
const showInputError = ref(false)

const minIsoForNewDeadline = computed(() => {
  const cur = props.currentDeadlineDisplay.trim()
  if (!isRuDeadlineFormat(cur)) return undefined
  const iso = deadlineRuLabelToIso(cur)
  return iso || undefined
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      newDeadlineIso.value = deadlineRuLabelToIso(props.currentDeadlineDisplay) || ''
      showInputError.value = false
    }
  },
)

watch(newDeadlineIso, () => {
  if (showInputError.value) {
    showInputError.value = false
  }
})

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onApply = () => {
  const iso = newDeadlineIso.value.trim()
  if (!iso) {
    showInputError.value = true
    return
  }
  const tNew = parseIsoDateToTime(iso)
  if (Number.isNaN(tNew)) {
    showInputError.value = true
    return
  }
  const ru = isoDateToRuLabel(iso)
  if (!ru) {
    showInputError.value = true
    return
  }
  const cur = props.currentDeadlineDisplay.trim()
  if (isRuDeadlineFormat(cur)) {
    const curIso = deadlineRuLabelToIso(cur)
    const tCur = curIso ? parseIsoDateToTime(curIso) : Number.NaN
    if (!Number.isNaN(tCur) && tNew < tCur) {
      showInputError.value = true
      return
    }
  }
  emit('save', { newDeadlineDisplay: ru })
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="admin-student-deadline-modal" @click="onOverlayClick">
      <div
        class="admin-student-deadline-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-student-deadline-modal-title"
        @click.stop
      >
        <h2 id="admin-student-deadline-modal-title" class="admin-student-deadline-modal__title">
          Изменение общего дедлайна
        </h2>

        <div class="admin-student-deadline-modal__user">
          <div class="admin-student-deadline-modal__avatar">
            <img
              v-if="props.avatarUrl"
              class="admin-student-deadline-modal__avatar-img"
              :src="props.avatarUrl"
              alt=""
            />
            <svg
              v-else
              class="admin-student-deadline-modal__avatar-placeholder"
              width="52"
              height="52"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="26" cy="26" r="25" stroke="currentColor" stroke-width="2" />
              <circle cx="26" cy="20" r="8" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M14 42c0-6.627 5.373-12 12-12s12 5.373 12 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span class="admin-student-deadline-modal__user-name">{{ props.studentName }}</span>
        </div>

        <div class="admin-student-deadline-modal__row">
          <span class="admin-student-deadline-modal__label">Дата дедлайна сейчас:</span>
          <div class="admin-student-deadline-modal__current-value" aria-readonly="true">
            {{ props.currentDeadlineDisplay }}
          </div>
        </div>

        <div class="admin-student-deadline-modal__row">
          <label class="admin-student-deadline-modal__label" for="admin-student-deadline-modal-input">
            Новая дата дедлайна:
          </label>
          <div class="admin-student-deadline-modal__date-wrap">
            <AdminDateField
              v-model="newDeadlineIso"
              fluid
              :min="minIsoForNewDeadline"
              :invalid="showInputError"
              input-id="admin-student-deadline-modal-input"
            />
          </div>
        </div>

        <div class="admin-student-deadline-modal__actions">
          <BaseButton
            class="admin-student-deadline-modal__btn"
            variant="primary"
            shape="rounded"
            text="Применить"
            @click="onApply"
          />
          <BaseButton
            class="admin-student-deadline-modal__btn"
            variant="outline"
            shape="rounded"
            text="Отмена"
            @click="closeModal"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-student-deadline-modal {
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

.admin-student-deadline-modal__content {
  box-sizing: border-box;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-20);
  padding: 40px;
  border: 1px solid #010307;
  border-radius: 20px;
  background-color: var(--white);
}

.admin-student-deadline-modal__title {
  margin: 0;
  width: 100%;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-student-deadline-modal__user {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.admin-student-deadline-modal__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: var(--black);
}

.admin-student-deadline-modal__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-student-deadline-modal__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-deadline-modal__user-name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  color: #010307;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(320px, 70vw);
}

.admin-student-deadline-modal__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.admin-student-deadline-modal__label {
  flex-shrink: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  color: #010307;
  white-space: nowrap;
}

.admin-student-deadline-modal__current-value {
  box-sizing: border-box;
  width: 165px;
  max-width: 100%;
  flex-shrink: 0;
  padding: 4px 30px;
  border: 1px solid rgba(1, 3, 7, 0.4);
  border-radius: 5px;
  background-color: rgba(23, 142, 240, 0.3);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  text-align: right;
  color: #010307;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-student-deadline-modal__date-wrap {
  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
}

.admin-student-deadline-modal__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-top: var(--sp-4);
}

:deep(.admin-student-deadline-modal__btn.base-button_primary) {
  background-color: var(--knopka);
  border-color: var(--knopka);

  &:hover:not(.base-button_disabled) {
    background-color: color-mix(in srgb, var(--knopka) 92%, black);
    border-color: color-mix(in srgb, var(--knopka) 92%, black);
  }
}

@media (max-width: 479px) {
  .admin-student-deadline-modal__content {
    padding: var(--sp-24);
  }

  .admin-student-deadline-modal__row {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-student-deadline-modal__current-value {
    width: 100%;
    text-align: left;
  }

  .admin-student-deadline-modal__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--sp-16);
  }

  :deep(.admin-student-deadline-modal__btn) {
    width: 100%;
  }
}
</style>
