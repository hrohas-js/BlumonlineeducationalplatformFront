<script setup lang="ts">
import { computed } from 'vue'

export type AdminProductActionConfirmVariant = 'move-archive' | 'delete-product' | 'delete-topic'

interface Props {
  isOpen: boolean
  variant: AdminProductActionConfirmVariant
}

const props = defineProps<Props>()

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const emit = defineEmits<Emits>()

const titleId = computed(() => `admin-product-action-confirm-title-${props.variant}`)

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onYes = () => {
  emit('confirm')
}

const onNo = () => {
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.isOpen"
      class="admin-product-action-confirm-modal"
      @click="onOverlayClick"
    >
      <div
        class="admin-product-action-confirm-modal__content"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.stop
      >
        <div class="admin-product-action-confirm-modal__body">
          <template v-if="props.variant === 'move-archive'">
            <h2 :id="titleId" class="admin-product-action-confirm-modal__title">
              Вы действительно хотите переместить продукт целиком в папку «Архив»?
            </h2>
            <p class="admin-product-action-confirm-modal__note">
              <span>Все дедлайны учеников и иные настройки </span>
              <span class="admin-product-action-confirm-modal__accent admin-product-action-confirm-modal__accent_positive">
                сохраняются!
              </span>
            </p>
          </template>
          <template v-else-if="props.variant === 'delete-product'">
            <h2 :id="titleId" class="admin-product-action-confirm-modal__title">
              Вы действительно хотите полностью удалить выбранный продукт?
            </h2>
            <p class="admin-product-action-confirm-modal__note">
              <span>Все дедлайны учеников и иные настройки </span>
              <span class="admin-product-action-confirm-modal__accent admin-product-action-confirm-modal__accent_danger">
                будут утеряны безвозвратно!
              </span>
            </p>
          </template>
          <template v-else>
            <h2 :id="titleId" class="admin-product-action-confirm-modal__title">
              Вы действительно хотите удалить выбранную тему?
            </h2>
            <p class="admin-product-action-confirm-modal__note">
              <span>Все дедлайны учеников и иные настройки </span>
              <span class="admin-product-action-confirm-modal__accent admin-product-action-confirm-modal__accent_danger">
                будут утеряны безвозвратно!
              </span>
            </p>
          </template>
        </div>
        <div class="admin-product-action-confirm-modal__actions">
          <button type="button" class="admin-product-action-confirm-modal__btn" @click="onYes">
            Да
          </button>
          <button type="button" class="admin-product-action-confirm-modal__btn" @click="onNo">
            Нет
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-product-action-confirm-modal {
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

.admin-product-action-confirm-modal__content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 431px;
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
}

.admin-product-action-confirm-modal__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 391px;
}

.admin-product-action-confirm-modal__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-product-action-confirm-modal__note {
  margin: 0;
  margin-top: var(--sp-12);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-product-action-confirm-modal__accent_positive {
  color: var(--text-accent);
}

.admin-product-action-confirm-modal__accent_danger {
  color: var(--danger);
}

.admin-product-action-confirm-modal__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 47px;
}

.admin-product-action-confirm-modal__btn {
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

  &:hover {
    filter: brightness(0.98);
  }
}

@media (max-width: 479px) {
  .admin-product-action-confirm-modal__content {
    gap: var(--sp-24);
    padding: var(--sp-24);
  }

  .admin-product-action-confirm-modal__title,
  .admin-product-action-confirm-modal__note {
    font-size: var(--size-20);
  }

  .admin-product-action-confirm-modal__actions {
    flex-direction: column;
    width: 100%;
    gap: var(--sp-16);
  }

  .admin-product-action-confirm-modal__btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>
