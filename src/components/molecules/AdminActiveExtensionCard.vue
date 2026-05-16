<script setup lang="ts">
interface Props {
  topicLabel: string
  productBadge: string
  extensionText: string
}

defineProps<Props>()

interface Emits {
  (e: 'pay-click'): void
  (e: 'delete-click'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="admin-active-extension-card-wrap">
    <!-- Figma 452:1268 / 477:2275 — «Продление ЗК 1 тема» -->
    <article class="admin-active-extension-card">
      <div class="admin-active-extension-card__top">
        <p class="admin-active-extension-card__topic">{{ topicLabel }}</p>
        <div class="admin-active-extension-card__badge">
          {{ productBadge }}
        </div>
      </div>
      <p class="admin-active-extension-card__text">{{ extensionText }}</p>
      <button
        type="button"
        class="admin-active-extension-card__pay"
        @click="emit('pay-click')"
      >
        <span class="admin-active-extension-card__pay-label">Перейти к оплате</span>
        <span class="admin-active-extension-card__pay-arrow" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5H9M9 5L5.5 1.5M9 5L5.5 8.5"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
    </article>

    <!-- Figma 477:2284 / 477:2286 — button_удалить -->
    <button
      type="button"
      class="admin-active-extension-card__delete"
      @click="emit('delete-click')"
    >
      Удалить
    </button>
  </div>
</template>

<style lang="scss" scoped>
.admin-active-extension-card-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
  max-width: 387px;
}

.admin-active-extension-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
  min-height: 164px;
  padding: var(--sp-20);
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.admin-active-extension-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-10);
  width: 100%;
  min-height: 38px;
}

.admin-active-extension-card__topic {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: #010307;
}

.admin-active-extension-card__badge {
  flex-shrink: 0;
  box-sizing: border-box;
  padding: var(--sp-10);
  border-radius: var(--radius-10);
  border: 3px solid #178ef0;
  background-color: #178ef0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: var(--white);
  text-align: center;
}

.admin-active-extension-card__text {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: #010307;
}

/* Figma 145:1054 — button */
.admin-active-extension-card__pay {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--size-5);
  margin: 0;
  padding: var(--size-5);
  border: 1px solid #178ef0;
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    background-color: var(--text-accent);
    border-color: var(--text-accent);
    color: var(--white);
  }

  &:active {
    background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    color: var(--white);
  }
}

.admin-active-extension-card__pay-label {
  text-align: center;
}

.admin-active-extension-card__pay-arrow {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.admin-active-extension-card__delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: var(--size-5) var(--sp-10);
  min-height: 34px;
  border: 2px solid #178ef0;
  border-radius: var(--radius-10);
  background-color: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    background-color: var(--text-accent);
    border-color: var(--text-accent);
    color: var(--white);
  }

  &:active {
    background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    color: var(--white);
  }
}
</style>
