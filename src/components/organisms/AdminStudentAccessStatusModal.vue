<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ModalCloseButton from '@/components/atoms/ModalCloseButton.vue'

export type StudentAccessStatusValue = 'active' | 'paused' | 'blocked' | 'deleted'

interface Props {
  isOpen: boolean
  studentName: string
  avatarUrl?: string | null
  initialAccessStatus?: StudentAccessStatusValue
}

interface Emits {
  (e: 'close'): void
  (e: 'save', payload: { status: StudentAccessStatusValue; notifyByEmail: boolean }): void
}

const props = withDefaults(defineProps<Props>(), {
  initialAccessStatus: 'active',
})
const emit = defineEmits<Emits>()

const selectedStatus = ref<StudentAccessStatusValue>('active')
const notifyByEmail = ref(true)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedStatus.value = props.initialAccessStatus
      notifyByEmail.value = true
    }
  },
)

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onSave = () => {
  emit('save', {
    status: selectedStatus.value,
    notifyByEmail: notifyByEmail.value,
  })
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="admin-student-access-status-modal" @click="onOverlayClick">
      <div
        class="admin-student-access-status-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-student-access-status-modal-title"
        @click.stop
      >
        <ModalCloseButton
          class="admin-student-access-status-modal__close"
          @click="closeModal"
        />

        <h2 id="admin-student-access-status-modal-title" class="admin-student-access-status-modal__title">
          Статус ученика
        </h2>

        <div class="admin-student-access-status-modal__user">
          <div class="admin-student-access-status-modal__avatar">
            <img
              v-if="props.avatarUrl"
              class="admin-student-access-status-modal__avatar-img"
              :src="props.avatarUrl"
              alt=""
            />
            <svg
              v-else
              class="admin-student-access-status-modal__avatar-placeholder"
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
          <span class="admin-student-access-status-modal__user-name">{{ props.studentName }}</span>
        </div>

        <fieldset class="admin-student-access-status-modal__fieldset">
          <legend class="admin-student-access-status-modal__legend">Статус доступа к продукту</legend>

          <div class="admin-student-access-status-modal__options">
            <label class="admin-student-access-status-modal__option">
              <input
                v-model="selectedStatus"
                class="admin-student-access-status-modal__radio-input"
                type="radio"
                name="admin-student-access-status"
                value="active"
              />
              <span class="admin-student-access-status-modal__radio-visual" aria-hidden="true">
                <svg v-if="selectedStatus === 'active'" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__status-icon admin-student-access-status-modal__status-icon_active" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" fill="#00a600" />
                  <path d="M18 14v20l14-10-14-10Z" fill="white" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__option-text">
                <span class="admin-student-access-status-modal__option-title">Активно:</span>
                <span class="admin-student-access-status-modal__option-desc">может приступать к изучению</span>
              </span>
            </label>

            <label class="admin-student-access-status-modal__option">
              <input
                v-model="selectedStatus"
                class="admin-student-access-status-modal__radio-input"
                type="radio"
                name="admin-student-access-status"
                value="paused"
              />
              <span class="admin-student-access-status-modal__radio-visual" aria-hidden="true">
                <svg v-if="selectedStatus === 'paused'" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__status-icon admin-student-access-status-modal__status-icon_paused" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="21" fill="#ff8c11" stroke="#ff8c11" stroke-width="3" />
                  <path d="M19 16v16M29 16v16" stroke="white" stroke-width="3" stroke-linecap="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__option-text">
                <span class="admin-student-access-status-modal__option-title">На паузе:</span>
                <span class="admin-student-access-status-modal__option-desc">
                  видит продукт, но зайти в него не может, установленный дедлайн сохраняется
                </span>
              </span>
            </label>

            <label class="admin-student-access-status-modal__option">
              <input
                v-model="selectedStatus"
                class="admin-student-access-status-modal__radio-input"
                type="radio"
                name="admin-student-access-status"
                value="blocked"
              />
              <span class="admin-student-access-status-modal__radio-visual" aria-hidden="true">
                <svg v-if="selectedStatus === 'blocked'" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__status-icon admin-student-access-status-modal__status-icon_blocked" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1.5" y="1.5" width="45" height="45" rx="22.5" stroke="#FF1111" stroke-width="3" />
                  <path d="M31.7782 16.2217L16.2218 31.778" stroke="#FF1111" stroke-width="4" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__option-text">
                <span class="admin-student-access-status-modal__option-title">Заблокировано:</span>
                <span class="admin-student-access-status-modal__option-desc">
                  видит продукт, но зайти в него не может, наступил дедлайн
                </span>
              </span>
            </label>

            <label class="admin-student-access-status-modal__option">
              <input
                v-model="selectedStatus"
                class="admin-student-access-status-modal__radio-input"
                type="radio"
                name="admin-student-access-status"
                value="deleted"
              />
              <span class="admin-student-access-status-modal__radio-visual" aria-hidden="true">
                <svg v-if="selectedStatus === 'deleted'" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__status-icon admin-student-access-status-modal__status-icon_deleted" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="21" fill="white" stroke="#f11" stroke-width="3" />
                  <path d="M18 18l12 12M30 18L18 30" stroke="#f11" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__option-text">
                <span class="admin-student-access-status-modal__option-title">Удален(а):</span>
                <span class="admin-student-access-status-modal__option-desc">
                  не видит продукт. Прогресс изучения будет удален безвозвратно
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="admin-student-access-status-modal__footer">
          <div class="admin-student-access-status-modal__notify">
            <span class="admin-student-access-status-modal__notify-label">Уведомить ученика:</span>
            <label class="admin-student-access-status-modal__notify-check">
              <input v-model="notifyByEmail" class="admin-student-access-status-modal__checkbox-input" type="checkbox" />
              <span class="admin-student-access-status-modal__checkbox-visual" aria-hidden="true">
                <svg
                  v-show="notifyByEmail"
                  width="11"
                  height="9"
                  viewBox="0 0 11 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="admin-student-access-status-modal__notify-email">E-mail</span>
            </label>
          </div>
          <BaseButton
            class="admin-student-access-status-modal__save"
            variant="primary"
            shape="rounded"
            text="Сохранить"
            @click="onSave"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-student-access-status-modal {
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

.admin-student-access-status-modal__content {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 680px;
  border: var(--border-1) solid var(--black);
  border-radius: var(--radius-20);
  background-color: var(--white);
  padding: var(--sp-24) var(--sp-32);
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
}

.admin-student-access-status-modal__close {
  position: absolute;
  top: var(--sp-16);
  right: var(--sp-16);
}

.admin-student-access-status-modal__title {
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  text-align: center;
  color: var(--black);
}

.admin-student-access-status-modal__user {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.admin-student-access-status-modal__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: var(--black);
}

.admin-student-access-status-modal__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-student-access-status-modal__avatar svg {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-access-status-modal__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-access-status-modal__user-name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-student-access-status-modal__fieldset {
  margin: 0;
  padding: 0;
  border: none;
  min-width: 0;
}

.admin-student-access-status-modal__legend {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-student-access-status-modal__options {
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
}

.admin-student-access-status-modal__option {
  display: flex;
  align-items: center;
  gap: 25px;
  cursor: pointer;
  margin: 0;
  min-width: 0;

  &:focus-within .admin-student-access-status-modal__radio-visual {
    box-shadow: var(--focus-ring-main);
  }
}

.admin-student-access-status-modal__radio-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.admin-student-access-status-modal__radio-visual {
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  border-radius: var(--radius-round);
  border: var(--border-1) solid var(--black);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.admin-student-access-status-modal__radio-input:checked + .admin-student-access-status-modal__radio-visual {
  background-color: #178ef0;
  border-color: #178ef0;
}

.admin-student-access-status-modal__status-icon {
  flex-shrink: 0;
  display: flex;
  width: 48px;
  height: 48px;
}

.admin-student-access-status-modal__status-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-access-status-modal__option-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  line-height: 1.25;
}

.admin-student-access-status-modal__option-title {
  font-weight: var(--font-bold);
}

.admin-student-access-status-modal__option-desc {
  font-weight: var(--font-semi-bold);
}

.admin-student-access-status-modal__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-16);
  flex-wrap: wrap;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding-top: var(--sp-4);
}

.admin-student-access-status-modal__notify {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--sp-10);
}

.admin-student-access-status-modal__notify-label {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  padding: var(--sp-4) 0;
}

.admin-student-access-status-modal__notify-check {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
  cursor: pointer;
  padding: var(--sp-4) 0;
}

.admin-student-access-status-modal__checkbox-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.admin-student-access-status-modal__checkbox-visual {
  flex-shrink: 0;
  width: 25px;
  height: 23px;
  border-radius: 3px;
  background-color: var(--white);
  border: var(--border-1) solid var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.admin-student-access-status-modal__checkbox-input:checked + .admin-student-access-status-modal__checkbox-visual {
  background-color: #178ef0;
  border-color: #178ef0;
}

.admin-student-access-status-modal__notify-email {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #178ef0;
}

:deep(.admin-student-access-status-modal__save.base-button_primary) {
  background-color: var(--knopka);
  border-color: var(--knopka);

  &:hover:not(.base-button_disabled) {
    background-color: color-mix(in srgb, var(--knopka) 92%, black);
    border-color: color-mix(in srgb, var(--knopka) 92%, black);
  }
}

@media (max-width: 1023px) {
  .admin-student-access-status-modal__title {
    font-size: var(--size-15);
  }

  .admin-student-access-status-modal__user-name {
    font-size: var(--size-15);
  }

  .admin-student-access-status-modal__option-text {
    font-size: var(--size-15);
  }

  .admin-student-access-status-modal__notify-label {
    font-size: var(--size-15);
  }

  .admin-student-access-status-modal__notify-email {
    font-size: var(--size-15);
  }
}

@media (max-width: 639px) {
  .admin-student-access-status-modal {
    align-items: stretch;
    padding: var(--sp-12);
    padding-bottom: calc(var(--sp-12) + env(safe-area-inset-bottom, 0px));
  }

  .admin-student-access-status-modal__content {
    align-self: center;
    width: 100%;
    max-width: none;
    max-height: min(92dvh, calc(100vh - var(--sp-24)));
    margin: auto 0;
    padding: var(--sp-20) var(--sp-16) var(--sp-16);
    gap: var(--sp-16);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .admin-student-access-status-modal__close {
    top: var(--sp-12);
    right: var(--sp-12);
  }

  .admin-student-access-status-modal__title {
    padding: 0 var(--sp-32) 0 var(--sp-4);
    font-size: var(--size-15);
    line-height: 1.3;
  }

  .admin-student-access-status-modal__user {
    gap: var(--sp-10);
  }

  .admin-student-access-status-modal__avatar {
    width: 44px;
    height: 44px;
  }

  .admin-student-access-status-modal__user-name {
    font-size: var(--size-15);
  }

  .admin-student-access-status-modal__options {
    gap: var(--sp-12);
  }

  .admin-student-access-status-modal__option {
    display: grid;
    grid-template-columns: 25px 40px minmax(0, 1fr);
    grid-template-rows: auto auto;
    column-gap: var(--sp-12);
    row-gap: var(--sp-8);
    align-items: start;
  }

  .admin-student-access-status-modal__radio-visual {
    grid-column: 1;
    grid-row: 1;
  }

  .admin-student-access-status-modal__status-icon {
    grid-column: 2;
    grid-row: 1;
    width: 40px;
    height: 40px;
  }

  .admin-student-access-status-modal__option-text {
    grid-column: 1 / -1;
    grid-row: 2;
    font-size: var(--size-15);
    line-height: 1.35;
  }

  .admin-student-access-status-modal__footer {
    flex-direction: column;
    align-items: stretch;
    gap: var(--sp-12);
    max-width: none;
    padding-top: var(--sp-8);
  }

  .admin-student-access-status-modal__notify {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-8);
  }

  .admin-student-access-status-modal__notify-label {
    font-size: var(--size-15);
    padding: 0;
  }

  .admin-student-access-status-modal__notify-check {
    width: 100%;
    justify-content: flex-start;
    padding: 0;
  }

  .admin-student-access-status-modal__notify-email {
    font-size: var(--size-15);
  }

  :deep(.admin-student-access-status-modal__save) {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 380px) {
  .admin-student-access-status-modal {
    padding: var(--sp-8);
  }

  .admin-student-access-status-modal__content {
    padding: var(--sp-16) var(--sp-12) var(--sp-12);
    gap: var(--sp-12);
    border-radius: var(--radius-lg);
  }

  .admin-student-access-status-modal__option {
    grid-template-columns: 22px 36px minmax(0, 1fr);
    column-gap: var(--sp-10);
  }

  .admin-student-access-status-modal__radio-visual {
    width: 22px;
    height: 22px;
  }

  .admin-student-access-status-modal__status-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
