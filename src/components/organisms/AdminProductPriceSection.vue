<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  submitting?: boolean
}

withDefaults(defineProps<Props>(), {
  submitting: false,
})

const price = defineModel<string>('price', { required: true })

interface Emits {
  (e: 'save'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <section class="admin-product-price-section">
    <hr class="admin-product-price-section__rule" />
    <h2 class="admin-product-price-section__title">Ценообразование</h2>

    <div class="admin-product-price-section__field-row">
      <span class="admin-product-price-section__label">Цена</span>
      <div class="admin-product-price-section__field">
        <input
          v-model="price"
          class="admin-product-price-section__input"
          type="text"
          inputmode="decimal"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="admin-product-price-section__save-wrap">
      <BaseButton
        class="admin-product-price-section__save"
        variant="outline"
        size="small"
        text="Сохранить"
        :disabled="submitting"
        :loading="submitting"
        @click="emit('save')"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-product-price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-price-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-price-section__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--black);
}

.admin-product-price-section__field-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-price-section__label {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
  white-space: nowrap;
}

.admin-product-price-section__field {
  flex: 1 1 280px;
  max-width: 399px;
  min-height: 44px;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 0 var(--sp-10);
  display: flex;
  align-items: center;
}

.admin-product-price-section__input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
  outline: none;
  padding: var(--sp-10) 0;
}

.admin-product-price-section__save-wrap {
  width: 100%;
}

:deep(.admin-product-price-section__save.base-button) {
  border-radius: var(--radius-10);
  border: 2px solid #178ef0;
  min-width: 106px;
}

:deep(.admin-product-price-section__save.base-button_outline:hover:not(.base-button_disabled)) {
  background-color: #178ef0;
  border-color: #178ef0;
  color: var(--white);
}

@media (max-width: 1023px) {
  .admin-product-price-section__title {
    font-size: var(--size-15);
  }

  .admin-product-price-section__label,
  .admin-product-price-section__input {
    font-size: var(--size-15);
  }
}
</style>
