<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
  /** Краткая подпись для `aria-label`. */
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="admin-toggle-switch"
    :class="{ 'admin-toggle-switch_on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="admin-toggle-switch__track" aria-hidden="true">
      <span class="admin-toggle-switch__thumb" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.admin-toggle-switch {
  box-sizing: border-box;
  width: 60px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: 15px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.admin-toggle-switch__track {
  display: block;
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background-color: #d9d9d9;
  transition: background-color 0.2s ease;
}

.admin-toggle-switch_on .admin-toggle-switch__track {
  background-color: #178ef0;
}

.admin-toggle-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(1, 3, 7, 0.2);
  transition: transform 0.2s ease;
}

.admin-toggle-switch_on .admin-toggle-switch__thumb {
  transform: translateX(30px);
}
</style>
