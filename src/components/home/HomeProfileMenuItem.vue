<script setup lang="ts">
const emit = defineEmits<{
  (event: 'select'): void
}>()

const props = defineProps<{
  label: string
  isActive: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="home-profile-menu__item"
    :class="{ 'home-profile-menu__item_active': props.isActive }"
    @click="emit('select')"
  >
    <slot name="icon" />
    <span>{{ props.label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.home-profile-menu__item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-20);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  color: var(--black);
  line-height: 1.2;

  :slotted(svg) {
    display: block;
    flex-shrink: 0;
    width: var(--size-25);
    height: var(--size-25);
    min-width: var(--size-25);
  }

  span {
    border-bottom: var(--border-2) solid transparent;
    transition: border-color 0.2s ease;
    padding-bottom: var(--sp-9);
  }

  &:hover span {
    border-bottom-color: var(--text-accent);
  }

  &_active {
    span {
      border-bottom-color: var(--text-accent);
    }
  }
}
</style>
