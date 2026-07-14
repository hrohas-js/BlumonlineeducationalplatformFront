<script setup lang="ts">
interface Props {
  label: string
  /** Увеличенная высота для многострочного поля */
  multiline?: boolean
  /** Узкая колонка контрола (название / дедлайн) */
  narrowControl?: boolean
}

withDefaults(defineProps<Props>(), {
  multiline: false,
  narrowControl: false,
})
</script>

<template>
  <div
    class="admin-labeled-control-row"
    :class="{
      'admin-labeled-control-row_multiline': multiline,
      'admin-labeled-control-row_narrow': narrowControl,
    }"
  >
    <span class="admin-labeled-control-row__label">{{ label }}</span>
    <div class="admin-labeled-control-row__control">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Пиксель-перф по Figma (2057:2496 / 466:1365): column-gap 20px, padding поля 10px, узкое поле 200px, описание max 875×140.
.admin-labeled-control-row {
  display: grid;
  column-gap: 20px;
  align-items: center;
  justify-items: start;

  &_narrow {
    grid-template-columns: auto 200px;

    .admin-labeled-control-row__control {
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 200px;
      min-width: 200px;
      max-width: 200px;
    }
  }

  &_multiline {
    grid-template-columns: auto minmax(0, 875px);

    .admin-labeled-control-row__control {
      box-sizing: border-box;
      min-height: 140px;
      max-width: 875px;
      width: 100%;
    }
  }

  &__label {
    justify-self: start;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 20px;
    line-height: normal;
    color: #010307;
    text-align: right;
    white-space: nowrap;
  }

  &__control {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    background-color: #f3f4f6;
    border-radius: 5px;
    padding: 10px;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 20px;
    line-height: normal;
    color: #010307;
  }

  :deep(.admin-labeled-control-row__input) {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    color: inherit;
    text-align: left;
    white-space: nowrap;
    outline: none;
    box-sizing: border-box;
  }

  :deep(.admin-labeled-control-row__textarea) {
    width: 100%;
    min-height: 120px;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    color: inherit;
    line-height: normal;
    text-align: left;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    white-space: pre-wrap;
  }
}
</style>
