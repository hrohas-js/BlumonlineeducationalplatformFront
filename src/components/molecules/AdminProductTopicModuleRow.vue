<script setup lang="ts">
interface Props {
  title: string
  accessUntilLabel: string
}

defineProps<Props>()

interface Emits {
  (e: 'menu-click'): void
  (e: 'edit-click'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="admin-product-topic-module-row">
    <p class="admin-product-topic-module-row__title">{{ title }}</p>
    <div class="admin-product-topic-module-row__actions">
      <span class="admin-product-topic-module-row__access">{{ accessUntilLabel }}</span>
      <button
        type="button"
        class="admin-product-topic-module-row__icon-btn"
        aria-label="Дополнительное меню"
        @click="emit('menu-click')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        class="admin-product-topic-module-row__icon-btn"
        aria-label="Редактировать тему"
        @click="emit('edit-click')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-product-topic-module-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  width: 100%;
  max-width: 876px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: 64px;
  padding: var(--sp-20);
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
}

.admin-product-topic-module-row__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
}

.admin-product-topic-module-row__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
}

.admin-product-topic-module-row__access {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
  text-align: right;
  white-space: nowrap;
}

.admin-product-topic-module-row__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--black);
  cursor: pointer;
  border-radius: var(--radius-input);

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

@media (max-width: 1023px) {
  .admin-product-topic-module-row__title {
    font-size: var(--size-15);
  }

  .admin-product-topic-module-row__access {
    font-size: var(--size-15);
  }
}
</style>
