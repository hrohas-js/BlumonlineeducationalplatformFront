<script setup lang="ts">
interface Props {
  modelValue: boolean
  inputId?: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label class="admin-topic-notification-checkbox" :for="props.inputId">
    <input
      :id="props.inputId"
      class="admin-topic-notification-checkbox__input"
      type="checkbox"
      :checked="props.modelValue"
      @change="onChange"
    />
    <span
      class="admin-topic-notification-checkbox__ui"
      :class="{ 'admin-topic-notification-checkbox__ui_checked': props.modelValue }"
      aria-hidden="true"
    >
      <svg
        v-if="props.modelValue"
        class="admin-topic-notification-checkbox__check"
        width="10"
        height="9"
        viewBox="0 0 10 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 4.5L3.8 7.3L9 1"
          stroke="currentColor"
          stroke-width="1.35"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </label>
</template>

<style lang="scss" scoped>
/* Figma 489:1347 — «подтверждения» 26×26 */
.admin-topic-notification-checkbox {
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
}

.admin-topic-notification-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-topic-notification-checkbox__ui {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  color: var(--white);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.admin-topic-notification-checkbox__ui_checked {
  border-color: #178ef0;
  background-color: #178ef0;
}

.admin-topic-notification-checkbox__check {
  display: block;
}
</style>
