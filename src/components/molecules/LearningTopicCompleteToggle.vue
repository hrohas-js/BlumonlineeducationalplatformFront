<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label class="learning-topic-complete-toggle" :class="{ 'learning-topic-complete-toggle_disabled': disabled }">
    <input
      type="checkbox"
      class="learning-topic-complete-toggle__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="toggle"
    />
    <span
      class="learning-topic-complete-toggle__box"
      :class="{ 'learning-topic-complete-toggle__box_checked': modelValue }"
      aria-hidden="true"
    >
      <svg
        v-if="modelValue"
        width="14"
        height="11"
        viewBox="0 0 14 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 5.5L4.5 9L13 1"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="learning-topic-complete-toggle__label">Я изучил(а)</span>
  </label>
</template>

<style lang="scss" scoped>
.learning-topic-complete-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-20);
  cursor: pointer;

  &_disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__box {
    width: var(--size-24);
    height: var(--size-24);
    border: var(--border-2) solid var(--dopolnitelnyy-tekst);
    border-radius: var(--radius-check);
    background: var(--fon-bloka);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      width: var(--size-14);
      height: var(--size-14);
    }

    &_checked {
      background: var(--dopolnitelnyy-tekst);
      border-color: var(--dopolnitelnyy-tekst);
    }
  }

  &__label {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }
}
</style>
