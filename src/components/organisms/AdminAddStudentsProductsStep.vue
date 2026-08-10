<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { AdminMaterialSectionId } from '@/constants/adminMaterials'

export interface AdminAddStudentsProductItem {
  id: string
  title: string
}

export interface AdminAddStudentsProductSection {
  id: AdminMaterialSectionId
  title: string
  products: AdminAddStudentsProductItem[]
}

interface Props {
  sections: AdminAddStudentsProductSection[]
  selectedById: Record<string, boolean>
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
})

interface Emits {
  (e: 'update:selectedById', value: Record<string, boolean>): void
  (e: 'back'): void
  (e: 'confirm'): void
}

const emit = defineEmits<Emits>()

const allProductIds = computed(() =>
  props.sections.flatMap((section) => section.products.map((p) => p.id)),
)

const toggleProduct = (id: string, checked: boolean) => {
  emit('update:selectedById', { ...props.selectedById, [id]: checked })
}

const selectAll = () => {
  const next = { ...props.selectedById }
  for (const id of allProductIds.value) {
    next[id] = true
  }
  emit('update:selectedById', next)
}
</script>

<template>
  <div class="admin-add-students-products-step">
    <p
      v-if="sections.length === 0"
      class="admin-add-students-products-step__empty"
    >
      Нет доступных материалов
    </p>

    <template v-else>
      <button
        type="button"
        class="admin-add-students-products-step__select-all"
        :disabled="submitting"
        @click="selectAll"
      >
        Выбрать все
      </button>

      <div class="admin-add-students-products-step__sections" role="group" aria-label="Материалы">
        <section
          v-for="section in sections"
          :key="section.id"
          class="admin-add-students-products-step__section"
        >
          <h2 class="admin-add-students-products-step__section-title">{{ section.title }}</h2>

          <ul class="admin-add-students-products-step__list">
            <li
              v-for="product in section.products"
              :key="product.id"
              class="admin-add-students-products-step__row"
            >
              <label
                class="admin-add-students-products-step__checkbox-label"
                :for="`add-students-product-${product.id}`"
              >
                <span class="admin-add-students-products-step__checkbox-wrap">
                  <input
                    :id="`add-students-product-${product.id}`"
                    class="admin-add-students-products-step__checkbox-input"
                    type="checkbox"
                    :checked="selectedById[product.id] === true"
                    :disabled="submitting"
                    @change="
                      toggleProduct(product.id, ($event.target as HTMLInputElement).checked)
                    "
                  />
                  <span
                    class="admin-add-students-products-step__checkbox-ui"
                    :class="{
                      'admin-add-students-products-step__checkbox-ui_checked':
                        selectedById[product.id] === true,
                    }"
                    aria-hidden="true"
                  >
                    <svg
                      v-if="selectedById[product.id] === true"
                      class="admin-add-students-products-step__checkbox-check"
                      width="10"
                      height="9"
                      viewBox="0 0 10 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4.5L3.8 7.5L9 1.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </span>
                <span class="admin-add-students-products-step__product-title">{{
                  product.title
                }}</span>
              </label>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <div class="admin-add-students-products-step__footer">
      <BaseButton
        class="admin-add-students-products-step__back-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Назад"
        :disabled="submitting"
        @click="emit('back')"
      />
      <BaseButton
        class="admin-add-students-products-step__confirm-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        :text="submitting ? 'Добавляем…' : 'Добавить учеников'"
        :disabled="submitting"
        @click="emit('confirm')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-add-students-products-step {
  display: flex;
  flex-direction: column;
  gap: var(--sp-24);
  width: 100%;
}

.admin-add-students-products-step__empty {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--size-20);
  color: var(--black-300);
}

.admin-add-students-products-step__select-all {
  align-self: flex-start;
  margin: 0;
  padding: var(--sp-10);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-add-students-products-step__sections {
  display: flex;
  flex-direction: column;
  gap: var(--sp-24);
  width: 100%;
}

.admin-add-students-products-step__section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-12);
  width: 100%;
}

.admin-add-students-products-step__section-title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}

.admin-add-students-products-step__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-12);
  width: 100%;
}

.admin-add-students-products-step__row {
  margin: 0;
}

.admin-add-students-products-step__checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-12);
  max-width: 100%;
  cursor: pointer;
}

.admin-add-students-products-step__checkbox-wrap {
  position: relative;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
}

.admin-add-students-products-step__checkbox-input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;

  &:disabled {
    cursor: not-allowed;
  }
}

.admin-add-students-products-step__checkbox-ui {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid #010307;
  background-color: #fff;
  box-sizing: border-box;
  color: #fff;
  pointer-events: none;
}

.admin-add-students-products-step__checkbox-ui_checked {
  border: none;
  background-color: var(--knopka);
}

.admin-add-students-products-step__checkbox-check {
  display: block;
  flex-shrink: 0;
}

.admin-add-students-products-step__product-title {
  min-width: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  word-break: break-word;
}

.admin-add-students-products-step__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  flex-wrap: wrap;
  margin-top: var(--sp-16);
}

.admin-add-students-products-step__back-btn {
  margin: 0;
}

.admin-add-students-products-step__confirm-btn {
  margin: 0;
  margin-left: auto;
}

:deep(.admin-add-students-products-step__back-btn.base-button),
:deep(.admin-add-students-products-step__confirm-btn.base-button) {
  height: auto;
  padding: 10px;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
}

:deep(.admin-add-students-products-step__back-btn.base-button) {
  border-color: #010307;
  color: #010307;
}

:deep(.admin-add-students-products-step__confirm-btn.base-button) {
  border-color: var(--knopka);
  color: #010307;
}

:deep(
  .admin-add-students-products-step__confirm-btn.base-button_outline:hover:not(.base-button_disabled)
) {
  background-color: rgba(23, 142, 240, 0.06);
}

@media (max-width: 1023px) {
  .admin-add-students-products-step__section-title,
  .admin-add-students-products-step__product-title,
  .admin-add-students-products-step__select-all,
  .admin-add-students-products-step__empty {
    font-size: var(--size-15);
  }

  :deep(.admin-add-students-products-step__back-btn.base-button),
  :deep(.admin-add-students-products-step__confirm-btn.base-button) {
    font-size: var(--size-15);
  }
}

@media (max-width: 479px) {
  .admin-add-students-products-step__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-add-students-products-step__back-btn,
  .admin-add-students-products-step__confirm-btn {
    width: 100%;
  }

  .admin-add-students-products-step__confirm-btn {
    margin-left: 0;
  }
}
</style>
