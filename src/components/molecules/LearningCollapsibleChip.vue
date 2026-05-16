<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    variant?: 'filled' | 'outline'
    defaultOpen?: boolean
  }>(),
  {
    variant: 'filled',
    defaultOpen: false,
  },
)

const open = ref(props.defaultOpen)

const toggle = () => {
  open.value = !open.value
}
</script>

<template>
  <div class="learning-collapsible-chip" :class="`learning-collapsible-chip_${variant}`">
    <button type="button" class="learning-collapsible-chip__trigger" @click="toggle">
      <span class="learning-collapsible-chip__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" stroke="#178EF0" stroke-width="1.5" />
          <path
            v-if="!open"
            d="M10 6V14M6 10H14"
            stroke="#178EF0"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path v-else d="M6 10H14" stroke="#178EF0" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
      <span class="learning-collapsible-chip__label">{{ label }}</span>
    </button>
    <div v-if="open" class="learning-collapsible-chip__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.learning-collapsible-chip {
  display: flex;
  flex-direction: column;
  gap: var(--sp-10);

  &_filled .learning-collapsible-chip__trigger {
    background: var(--osnovnoy-fon);
    border: none;
    border-radius: var(--radius-10);
    padding: var(--sp-10) var(--sp-20);
    justify-content: flex-end;
  }

  &_outline .learning-collapsible-chip__trigger {
    background: transparent;
    border: var(--border-1) solid var(--osnovnoy-tekst);
    border-radius: var(--radius-check);
    padding: var(--size-5) var(--sp-20);
    justify-content: flex-end;
  }

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-10);
    cursor: pointer;
    width: fit-content;
    margin-left: auto;
  }

  &__label {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    white-space: nowrap;
  }

  &__content {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    line-height: 1.5;
  }
}

@media (max-width: 1023px) {
  .learning-collapsible-chip {
    &__label {
      font-size: var(--size-13);
    }
  }
}
</style>
