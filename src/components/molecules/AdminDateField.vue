<script setup lang="ts">
interface Props {
  modelValue: string
  /** Подпись над полем; если не задана — только поле ввода. */
  label?: string
  /** Минимальная дата `YYYY-MM-DD` для `input type="date"`. */
  min?: string
  invalid?: boolean
  disabled?: boolean
  inputId?: string
  /** На всю ширину контейнера (модалка и др.). */
  fluid?: boolean
  /** Подсказка формата, когда дата не выбрана (оверлей по позиции маски). */
  placeholder?: string
  /** Выравнивание текста даты по центру. */
  center?: boolean
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  min: undefined,
  invalid: false,
  disabled: false,
  inputId: undefined,
  fluid: false,
  placeholder: undefined,
  center: false,
})

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const emit = defineEmits<Emits>()

const onInput = (event: Event) => {
  const el = event.target as HTMLInputElement
  emit('update:modelValue', el.value)
}
</script>

<template>
  <div class="admin-date-field" :class="{ 'admin-date-field_fluid': fluid }">
    <p v-if="label" class="admin-date-field__label">{{ label }}</p>
    <div
      class="admin-date-field__field"
      :class="{
        'admin-date-field__field_invalid': invalid,
        'admin-date-field__field_with-placeholder': Boolean(placeholder),
      }"
      @click.stop
    >
      <input
        :id="inputId"
        class="admin-date-field__input"
        :class="{
          'admin-date-field__input_empty': !modelValue,
          'admin-date-field__input_center': center,
        }"
        type="date"
        :min="min"
        :value="modelValue"
        :disabled="disabled"
        :aria-invalid="invalid"
        @input="onInput"
      />
      <span
        v-if="placeholder && !modelValue"
        class="admin-date-field__format-hint"
        aria-hidden="true"
      >
        {{ placeholder }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-date-field {
  --admin-date-pad-y: 4px;
  --admin-date-pad-x: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  width: 166px;
  max-width: 100%;
  box-sizing: border-box;
}

.admin-date-field__label {
  width: 100%;
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-date-field__field {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: #fff;
  overflow: hidden;
}

.admin-date-field__field_with-placeholder:not(:focus-within) {
  .admin-date-field__input_empty {
    color: transparent;

    &::-webkit-datetime-edit,
    &::-webkit-datetime-edit-fields-wrapper,
    &::-webkit-datetime-edit-text,
    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-year-field {
      color: transparent;
    }
  }
}

.admin-date-field__field:focus-within .admin-date-field__format-hint {
  opacity: 0;
}

.admin-date-field__format-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding: var(--admin-date-pad-y) var(--admin-date-pad-x);
  pointer-events: none;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: rgba(1, 3, 7, 0.35);
  white-space: nowrap;
}

.admin-date-field__field_invalid {
  border-color: #f11;
}

.admin-date-field_fluid {
  width: 100%;
  max-width: none;
  align-items: stretch;
}

.admin-date-field_fluid .admin-date-field__label {
  text-align: left;
}

.admin-date-field__input {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 30px;
  margin: 0;
  padding: var(--admin-date-pad-y) var(--admin-date-pad-x);
  border: none;
  border-radius: 5px;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  text-align: left;
  color: #010307;

  &_center {
    text-align: left;
  }

  &::-webkit-datetime-edit,
  &::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
    margin: 0;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    margin: 0;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

@media (max-width: 1023px) {
  .admin-date-field__format-hint {
    font-size: var(--size-15);
  }
}
</style>
