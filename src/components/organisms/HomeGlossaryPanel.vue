<script setup lang="ts">
import { glossaryAbbreviations } from '@/data/glossaryAbbreviations'
</script>

<template>
  <div class="home-glossary">
    <h2 class="home-glossary__title">
      Глоссарий (список сокращений, который используется в обучении):
    </h2>
    <ul class="home-glossary__list">
      <li
        v-for="(row, index) in glossaryAbbreviations"
        :key="`${row.abbreviation}-${index}`"
        class="home-glossary__item"
      >
        <span class="home-glossary__abbr">{{ row.abbreviation }}</span>
        <span aria-hidden="true"> — </span>
        <span class="home-glossary__def">{{ row.definition }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.home-glossary {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__item {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }
}
</style>
