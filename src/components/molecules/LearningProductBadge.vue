<script setup lang="ts">
import type { LearningCourseCategory } from '@/types/learning-course'

defineProps<{
  title: string
  category: LearningCourseCategory
}>()
</script>

<template>
  <span
    class="learning-product-badge"
    :class="`learning-product-badge_${category}`"
  >
    {{ title }}
  </span>
</template>

<style lang="scss" scoped>
.learning-product-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-10);
  padding: var(--sp-10);
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  text-align: center;
  color: var(--fon-bloka);
  white-space: nowrap;

  &_courses {
    background: var(--dopolnitelnyy-tekst);
    border: var(--border-3) solid var(--dopolnitelnyy-tekst);
  }

  &_projects {
    background: var(--obramlenie-proekty);
    border: var(--border-3) solid var(--obramlenie-proekty);
  }

  &_other {
    background: var(--obramlenie-inoe);
    border: var(--border-3) solid var(--obramlenie-inoe);
  }
}

@media (max-width: 1023px) {
  .learning-product-badge {
    font-size: var(--size-15);
    padding: var(--size-8) var(--sp-10);
  }
}
</style>
