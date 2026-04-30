<script setup lang="ts">
/**
 * AgreementCheck — molecules/AgreementCheck.vue
 *
 * Чекбокс согласия с произвольным содержимым метки (включая ссылки).
 * input и label соединены через for/id, чтобы клики по ссылкам
 * внутри слота не переключали чекбокс.
 *
 * BEM: agreement-check
 */
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  sizeVariant?: 'default' | 'compact'
  spacingVariant?: 'default' | 'compact'
  disabled?: boolean
  hideLabel?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  sizeVariant: 'default',
  spacingVariant: 'default',
  disabled: false,
  hideLabel: false,
})
const emit = defineEmits<Emits>()

const checkId = `agreement-check-${Math.random().toString(36).slice(2, 9)}`

const model = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="agreement-check">
    <input
      :id="checkId"
      v-model="model"
      class="agreement-check__input"
      :class="{
        'agreement-check__input_compact': props.sizeVariant === 'compact',
      }"
      type="checkbox"
      :disabled="props.disabled"
    />
    <label
      :for="checkId"
      class="agreement-check__label"
      :class="{
        'agreement-check__label_hidden': props.hideLabel,
        'agreement-check__label_compact': props.spacingVariant === 'compact',
      }"
    >
      <slot />
    </label>
  </div>
</template>

<style lang="scss" scoped>
.agreement-check {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-20);

  &__label_compact {
    margin-left: var(--size-5);
  }

  &__input {
    appearance: none;
    -webkit-appearance: none;
    flex-shrink: 0;
    width: var(--size-25);
    height: var(--size-25);
    border: var(--border-1) solid var(--black-300);
    border-radius: var(--radius-check);
    background-color: var(--input-bg, var(--bg));
    cursor: pointer;
    position: relative;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    margin: 0;

    &_compact {
      width: var(--size-20);
      height: var(--size-20);
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: var(--size-7);
      height: var(--size-12);
      border: var(--border-2) solid var(--white);
      border-top: none;
      border-left: none;
      transform: translate(-50%, -60%) rotate(45deg);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:checked {
      background-color: var(--text-accent);
      border-color: var(--text-accent);

      &::after {
        opacity: 1;
      }
    }
  }

  &__label {
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-15);
    color: var(--black);
    line-height: 1.5;
    cursor: pointer;

    /* Слот приходит из родителя — у <a> другой data-v; без :deep() scoped-правило не матчится */
    :deep(a) {
      color: var(--black);
      text-decoration: underline;
      text-decoration-skip-ink: none;
    }

    &_hidden {
      display: none;
    }
  }
}
</style>
