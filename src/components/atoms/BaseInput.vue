<script setup lang="ts">
/**
 * BaseInput — atoms/BaseInput.vue
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §3):
 * Базовый input-компонент. Поддерживает v-model через defineModel()
 * (Vue 3.4+) или классический паттерн modelValue + update:modelValue.
 */
import { computed, ref, useAttrs } from 'vue'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  as?: 'input' | 'textarea'
  variant?: 'default' | 'profile' | 'modal'
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search'
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  as: 'input',
  variant: 'default',
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<Emits>()

const attrs = useAttrs()

const inputId = computed(() => props.id || props.name || `input-${Math.random().toString(36).slice(2, 7)}`)
const isTextarea = computed(() => props.as === 'textarea')

const inputClasses = computed(() => [
  'base-input__field',
  {
    'base-input__field_error': !!props.error,
    'base-input__field_disabled': props.disabled,
    'base-input__field_profile': props.variant === 'profile',
    'base-input__field_modal': props.variant === 'modal',
    'base-input__field_textarea': isTextarea.value,
  },
])

const labelClasses = computed(() => [
  'base-input__label',
  {
    'base-input__label_profile': props.variant === 'profile',
    'base-input__label_modal': props.variant === 'modal',
  },
])

const showPassword = ref(false)

const effectiveFieldType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})

const inputClassesWithToggle = computed(() => [...inputClasses.value, 'base-input__field_with-toggle'])

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="base-input" v-bind="{ ...$attrs, class: undefined }">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
    </label>

    <div v-if="type === 'password' && !isTextarea" class="base-input__field-wrap">
      <input
        :id="inputId"
        :class="inputClassesWithToggle"
        :type="effectiveFieldType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :name="name"
        v-bind="attrs"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      <button
        type="button"
        class="base-input__toggle-password"
        :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
        :aria-pressed="showPassword"
        @click.stop="showPassword = !showPassword"
      >
        <font-awesome-icon :icon="showPassword ? faEye : faEyeSlash" />
      </button>
    </div>

    <textarea
      v-else-if="isTextarea"
      :id="inputId"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      v-bind="attrs"
      @input="handleInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />

    <input
      v-else
      :id="inputId"
      :class="inputClasses"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      v-bind="attrs"
      @input="handleInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />

    <p v-if="error" class="base-input__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<style lang="scss" scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);

  &__label {
    @include inter-medium;
    font-size: var(--fs-sm);
    color: var(--black);

    &_profile {
      font-family: var(--font-family);
      font-weight: var(--font-semi-bold);
      font-size: var(--size-15);
      color: var(--black);
    }

    &_modal {
      font-family: var(--font-family);
      font-weight: var(--font-semi-bold);
      font-size: var(--size-15);
      color: var(--black);
    }
  }

  &__field-wrap {
    position: relative;
    width: 100%;
  }

  &__toggle-password {
    position: absolute;
    right: var(--sp-12);
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-4);
    border: none;
    background: transparent;
    color: var(--black);
    cursor: pointer;
    line-height: 1;
    font-size: var(--size-18);

    &:focus-visible {
      outline: var(--border-2) solid var(--text-accent);
      outline-offset: var(--border-2);
      border-radius: var(--radius-sm);
    }
  }

  &__field {
    @include inter-regular;
    font-size: var(--fs-base);
    color: var(--black);
    background-color: var(--white);
    border: var(--border-1-5) solid var(--divider);
    border-radius: var(--radius-lg);
    padding: var(--sp-12) var(--sp-16);
    width: 100%;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    outline: none;

    &::placeholder {
      color: var(--gray);
    }

    &_profile {
      border: var(--border-1) solid transparent;
      border-radius: var(--radius-input);
      padding: 0 var(--sp-20);
      background-color: var(--input-bg);
      height: var(--size-40);
      width: var(--size-212);
      min-width: var(--size-212);
      max-width: var(--size-212);
      font-family: var(--font-family);
      font-weight: var(--font-medium);
      font-size: var(--size-15);
      color: var(--black);

      &::placeholder {
        font-family: var(--font-family);
        font-weight: var(--font-extra-light);
        font-size: var(--size-15);
        color: var(--black);
      }

      &:focus {
        border-color: var(--accent-soft-blue);
        box-shadow: var(--focus-ring-soft-blue);
      }
    }

    &_modal {
      border: none;
      border-radius: var(--radius-input);
      padding: 0 var(--sp-20);
      background-color: var(--input-bg);
      height: var(--size-40);
      width: var(--size-286);
      min-width: var(--size-286);
      max-width: var(--size-286);
      font-family: var(--font-family);
      font-weight: var(--font-medium);
      font-size: var(--size-15);
      color: var(--black);

      &::placeholder {
        font-family: var(--font-family);
        font-weight: var(--font-extra-light);
        font-size: var(--size-15);
        color: var(--black-300);
      }

      &:focus {
        border: var(--border-1) solid var(--accent-soft-blue);
        box-shadow: var(--focus-ring-soft-blue);
      }
    }

    &_textarea {
      &::placeholder {
        text-align: center;
        line-height: 1.2;
      }

      &.base-input__field_profile {
        padding: var(--sp-10);
        width: var(--size-212);
        min-width: var(--size-212);
        max-width: var(--size-212);
        height: var(--size-152);
        min-height: var(--size-152);
        max-height: var(--size-152);
        resize: none;
        overflow-y: auto;
        overflow-x: hidden;

        &:placeholder-shown {
          padding-top: calc((var(--size-152) - var(--size-24)) / 2);
          padding-bottom: calc((var(--size-152) - var(--size-24)) / 2);
        }
      }

      &.base-input__field_modal {
        width: var(--size-286);
        min-width: var(--size-286);
        max-width: var(--size-286);
        height: var(--size-152);
        min-height: var(--size-152);
        max-height: var(--size-152);
        padding: var(--sp-10);
        resize: none;
      }
    }

    &:focus:not(.base-input__field_profile) {
      border-color: var(--accent-soft-blue);
      box-shadow: var(--focus-ring-main-soft);
    }

    &_error {
      border-color: var(--error);

      &:focus {
        border-color: var(--error);
        box-shadow: var(--focus-ring-error-soft);
      }
    }

    &_disabled {
      background-color: var(--bg);
      color: var(--gray);
      cursor: not-allowed;
    }

    &_with-toggle {
      padding-right: var(--size-44);
    }
  }

  &__error {
    @include inter-regular;
    font-size: var(--fs-xs);
    color: var(--error);
    margin: 0;
  }

  &__hint {
    @include inter-regular;
    font-size: var(--fs-xs);
    color: var(--gray);
    margin: 0;
  }
}
</style>
