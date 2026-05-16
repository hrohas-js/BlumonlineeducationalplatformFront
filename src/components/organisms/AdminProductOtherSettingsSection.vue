<script setup lang="ts">
import { ref } from 'vue'

import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminProductActionConfirmModal from '@/components/organisms/AdminProductActionConfirmModal.vue'

interface Emits {
  (e: 'move-archive'): void
  (e: 'delete-product'): void
}

const emit = defineEmits<Emits>()

const isArchiveConfirmOpen = ref(false)
const isDeleteConfirmOpen = ref(false)

const openArchiveConfirm = () => {
  isArchiveConfirmOpen.value = true
}

const openDeleteConfirm = () => {
  isDeleteConfirmOpen.value = true
}

const closeArchiveConfirm = () => {
  isArchiveConfirmOpen.value = false
}

const closeDeleteConfirm = () => {
  isDeleteConfirmOpen.value = false
}

const onArchiveConfirm = () => {
  emit('move-archive')
  closeArchiveConfirm()
}

const onDeleteConfirm = () => {
  emit('delete-product')
  closeDeleteConfirm()
}
</script>

<template>
  <section class="admin-product-other-settings-section">
    <hr class="admin-product-other-settings-section__rule" />
    <h2 class="admin-product-other-settings-section__title">Иные настройки</h2>
    <div class="admin-product-other-settings-section__buttons">
      <BaseButton
        class="admin-product-other-settings-section__btn"
        variant="outline"
        size="medium"
        block
        @click="openArchiveConfirm"
      >
        Переместить продукт в папку «Архив»
      </BaseButton>
      <BaseButton
        class="admin-product-other-settings-section__btn"
        variant="outline"
        size="medium"
        block
        @click="openDeleteConfirm"
      >
        Удалить выбранный продукт
      </BaseButton>
    </div>
    <AdminProductActionConfirmModal
      :is-open="isArchiveConfirmOpen"
      variant="move-archive"
      @close="closeArchiveConfirm"
      @confirm="onArchiveConfirm"
    />
    <AdminProductActionConfirmModal
      :is-open="isDeleteConfirmOpen"
      variant="delete-product"
      @close="closeDeleteConfirm"
      @confirm="onDeleteConfirm"
    />
  </section>
</template>

<style lang="scss" scoped>
.admin-product-other-settings-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
  padding-bottom: var(--sp-40);
}

.admin-product-other-settings-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-other-settings-section__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--black);
}

.admin-product-other-settings-section__buttons {
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
  width: 100%;
  max-width: 424px;
}

:deep(.admin-product-other-settings-section__btn.base-button) {
  border-radius: var(--radius-10);
  border-color: #010307;
  white-space: normal;
  height: auto;
  min-height: var(--size-60);
  padding: var(--sp-12) var(--sp-20);
}

:deep(.admin-product-other-settings-section__btn.base-button_outline:hover:not(.base-button_disabled)) {
  background-color: var(--text-accent);
  border-color: var(--text-accent);
  color: var(--white);
}

:deep(.admin-product-other-settings-section__btn.base-button_outline:active:not(.base-button_disabled)) {
  background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  color: var(--white);
}
</style>
