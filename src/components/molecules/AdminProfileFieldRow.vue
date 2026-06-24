<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  highlighted?: boolean
}>()
</script>

<template>
  <div class="admin-profile-field-row">
    <span class="admin-profile-field-row__label">{{ label }}</span>
    <div
      class="admin-profile-field-row__value"
      :class="{ 'admin-profile-field-row__value_highlighted': highlighted }"
    >
      {{ modelValue || '—' }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-profile-field-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;

  &__label {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: var(--osnovnoy-tekst);
    text-align: right;
    flex-shrink: 0;
  }

  &__value {
    width: 200px;
    max-width: 100%;
    min-height: 44px;
    padding: var(--sp-10);
    border-radius: var(--radius-input);
    background-color: #f3f4f6;
    border: var(--border-1) solid transparent;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    display: flex;
    align-items: center;
    word-break: break-word;
  }

  &__value_highlighted {
    border-color: #178ef0;
    border-width: var(--border-2);
  }

  @media (max-width: 1023px) {
    display: grid;
    grid-template-columns: minmax(72px, 38%) minmax(0, 1fr);
    gap: var(--sp-12);
    justify-content: stretch;

    &__label {
      text-align: left;
      font-size: var(--size-15);
    }

    &__value {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
  }
}
</style>
