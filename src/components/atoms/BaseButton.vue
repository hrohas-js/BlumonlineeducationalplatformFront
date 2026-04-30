<script setup lang="ts">
/**
 * BaseButton — atoms/BaseButton.vue
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §3):
 * Зеркало components/ui/BaseButton.vue из mirror-frontend.
 * - Props/Emits через interface + defineProps<Props>() (TypeScript-first)
 * - withDefaults() для значений по умолчанию
 * - Computed array для динамических классов (BEM-adjacent)
 * - Scoped SCSS с переменными из auto-injected variables.scss
 * - <slot> для кастомного содержимого + text prop для простых случаев
 */
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'outline' | 'secondary' | 'light' | 'white' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  text?: string
  block?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outline',
  size: 'medium',
  disabled: false,
  text: '',
  block: false,
  loading: false,
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'base-button',
  `base-button_${props.variant}`,
  `base-button_${props.size}`,
  props.size === 'small' && 'text-sm leading-snug',
  props.size === 'medium' && 'text-lg leading-normal',
  props.size === 'large' && 'text-xl leading-relaxed',
  {
    'base-button_disabled': props.disabled || props.loading,
    'base-button_block': props.block,
    'base-button_loading': props.loading,
  },
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    type="button"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot>{{ text }}</slot>
  </button>
</template>

<style lang="scss" scoped>
// Токены доступны глобально через variables.scss
// благодаря vite.config.ts → additionalData (см. ARCHITECTURE_ANALYSIS.md §2)

.base-button {
  @include inter-medium;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-8);
  border-radius: var(--radius-pill);
  border: var(--border-2) solid transparent;
  box-sizing: border-box;
  max-width: 100%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  height: var(--size-60);
  position: relative;

  &:focus {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &_small {
    padding: var(--sp-8) var(--sp-20);
    height: auto;

    @media (min-width: 120em) {
      padding: var(--sp-10) var(--sp-24);
    }
  }

  &_medium {
    padding: var(--sp-12) var(--sp-32);

    @media (min-width: 120em) {
      padding: var(--size-15) var(--sp-32);
    }
  }

  &_large {
    padding: var(--sp-16) var(--size-40);

    @media (min-width: 120em) {
      padding: var(--size-18) var(--size-40);
    }
  }

  &_primary {
    background-color: var(--main);
    border-color: var(--main);
    color: var(--white);

    &:hover:not(.base-button_disabled) {
      background-color: var(--main-hover);
      border-color: var(--main-hover);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--main-active);
      border-color: var(--main-active);
      transform: var(--motion-shift-none);
    }
  }

  &_outline {
    background-color: var(--white);
    border-color: var(--black);
    color: var(--black);

    &:hover:not(.base-button_disabled) {
      background-color: var(--outline-hover);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--outline-active);
      transform: var(--motion-shift-none);
    }
  }

  &_secondary {
    background-color: var(--white);
    border-color: var(--gray);
    color: var(--gray);

    &:hover:not(.base-button_disabled) {
      background-color: var(--secondary-hover-bg);
      border-color: var(--secondary-hover-color);
      color: var(--secondary-hover-color);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--secondary-active-bg);
      transform: var(--motion-shift-none);
    }
  }

  &_light {
    background-color: var(--main-bg);
    border-color: transparent;
    color: var(--main);

    &:hover:not(.base-button_disabled) {
      background-color: var(--main-bg-hover);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--main-bg-active);
      transform: var(--motion-shift-none);
    }
  }

  &_white {
    background-color: var(--white);
    border-color: var(--white);
    color: var(--main);

    &:hover:not(.base-button_disabled) {
      background-color: var(--white-hover);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--main-bg);
      transform: var(--motion-shift-none);
    }
  }

  &_danger {
    background-color: var(--danger);
    border-color: var(--danger);
    color: var(--white);

    &:hover:not(.base-button_disabled) {
      background-color: var(--danger-hover);
      border-color: var(--danger-hover);
      transform: var(--motion-shift-up-sm);
    }

    &:active:not(.base-button_disabled) {
      background-color: var(--danger-active);
      border-color: var(--danger-active);
      transform: var(--motion-shift-none);
    }

    &:focus {
      box-shadow: var(--focus-ring-danger);
    }
  }

  &_disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: var(--disabled-bg);
    border-color: var(--disabled-border);
    color: var(--gray);
    transform: none !important;
  }

  &_block {
    width: 100%;
  }

  &__spinner {
    display: inline-block;
    width: var(--size-16);
    height: var(--size-16);
    border: var(--border-2) solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
