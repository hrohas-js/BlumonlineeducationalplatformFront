<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { glossaryAbbreviations } from '@/data/glossaryAbbreviations'
import { useNotification } from '@/composables/useNotification'

const { notify } = useNotification()

const onEdit = () => {
  notify({ type: 'info', message: 'Редактирование глоссария будет доступно позже' })
}
</script>

<template>
  <div class="admin-glossary-panel">
    <h1 class="admin-glossary-panel__title">Глоссарий</h1>

    <ul class="admin-glossary-panel__list">
      <li
        v-for="(row, index) in glossaryAbbreviations"
        :key="`${row.abbreviation}-${index}`"
        class="admin-glossary-panel__item"
      >
        <span class="admin-glossary-panel__abbr">{{ row.abbreviation }}</span>
        <span aria-hidden="true"> — </span>
        <span class="admin-glossary-panel__def">{{ row.definition }}</span>
      </li>
    </ul>

    <BaseButton
      class="admin-glossary-panel__edit"
      variant="outline"
      size="medium"
      shape="rounded"
      text="Редактировать"
      @click="onEdit"
    />
  </div>
</template>

<style lang="scss" scoped>
.admin-glossary-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-32);

  &__title {
    margin: var(--sp-24) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    line-height: normal;
    text-align: center;
    color: var(--osnovnoy-tekst);
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    width: 100%;
    max-width: 578px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__item {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    line-height: normal;
    color: var(--osnovnoy-tekst);
  }

  &__edit {
    margin: var(--sp-20) 0 var(--sp-40);
  }

  :deep(.admin-glossary-panel__edit.base-button) {
    height: auto;
    padding: var(--sp-10);
    border-color: var(--knopka);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-25);
    line-height: normal;
    color: var(--osnovnoy-tekst);
  }

  :deep(.admin-glossary-panel__edit.base-button_outline:hover:not(.base-button_disabled)) {
    background-color: rgba(23, 142, 240, 0.08);
  }

  @media (max-width: 1023px) {
    &__title {
      font-size: var(--size-15);
    }

    &__item {
      font-size: var(--size-15);
    }

    &__edit {
      width: 100%;
      max-width: 320px;
    }

    :deep(.admin-glossary-panel__edit.base-button) {
      width: 100%;
      font-size: var(--size-15);
    }
  }
}
</style>
