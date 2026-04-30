<script setup lang="ts">
type CourseCategory = 'courses' | 'projects' | 'other'

defineProps<{
  title: string
  category: CourseCategory
  categoryLabel: string
}>()
</script>

<template>
  <header class="learning-course-card-header">
    <h3 class="learning-course-card-header__title">{{ title }}</h3>
    <span class="learning-course-card-header__category" :class="`learning-course-card-header__category_${category}`">
      {{ categoryLabel }}
    </span>
  </header>
</template>

<style lang="scss" scoped>
.learning-course-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-10);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }

  &__category {
    border-radius: var(--radius-10);
    padding: var(--size-5) var(--sp-10);
    min-width: var(--size-100);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    text-align: center;
    color: var(--fon-bloka);

    &_courses {
      background: var(--dopolnitelnyy-tekst);
    }

    &_projects {
      background: var(--obramlenie-proekty);
    }

    &_other {
      background: var(--obramlenie-inoe);
    }
  }
}

@media (max-width: 1023px) {
  .learning-course-card-header {
    &__title,
    &__category {
      font-size: var(--size-13);
    }
  }
}
</style>
