<script setup lang="ts">
import BaseInput from '@/components/atoms/BaseInput.vue'
import AgreementCheck from '@/components/molecules/AgreementCheck.vue'

withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder: string
    as?: 'input' | 'textarea'
    withCheckbox?: boolean
  }>(),
  {
    as: 'input',
    withCheckbox: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const checkboxModel = true
</script>

<template>
  <div class="modal-profile-field-row">
    <p class="modal-profile-field-row__label">{{ label }}</p>

    <div class="modal-profile-field-row__control">
      <div
        class="modal-profile-field-row__input-wrap"
        :class="{ 'modal-profile-field-row__input-wrap_with-checkbox': withCheckbox }"
      >
        <AgreementCheck
          v-if="withCheckbox"
          class="modal-profile-field-row__checkbox"
          :model-value="checkboxModel"
          size-variant="compact"
          spacing-variant="compact"
          :disabled="true"
          :hide-label="true"
        />

        <BaseInput
          :model-value="modelValue"
          :placeholder="placeholder"
          :as="as"
          variant="modal"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-profile-field-row {
  display: grid;
  grid-template-columns: 140px var(--size-286);
  align-items: center;
  gap: var(--sp-20);

  &__label {
    margin: 0;
    line-height: var(--size-40);
    text-align: right;
    white-space: nowrap;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--black);
  }

  &__control {
    width: var(--size-286);
  }

  &__input-wrap {
    position: relative;
    display: inline-block;

    &_with-checkbox {
      :deep(.base-input__field_modal:not(.base-input__field_textarea)) {
        padding-left: calc(var(--sp-20) + var(--size-20) + var(--size-5));
      }
    }
  }

  &__checkbox {
    position: absolute;
    top: 50%;
    left: var(--sp-20);
    transform: translateY(-50%);
    z-index: 1;

    :deep(.agreement-check) {
      gap: 0;
    }

    :deep(.agreement-check__label_hidden) {
      display: none;
    }
  }
}
</style>
