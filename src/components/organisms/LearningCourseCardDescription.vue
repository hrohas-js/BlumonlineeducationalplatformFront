<script setup lang="ts">
defineProps<{
  description: string
}>()
</script>

<template>
  <p class="learning-course-card-description">
    {{ description }}
  </p>
</template>

<style lang="scss" scoped>
.learning-course-card-description {
  margin: var(--sp-20) 0 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  color: var(--osnovnoy-tekst);
}

@media (max-width: 1023px) {
  .learning-course-card-description {
    font-size: var(--size-13);
  }
}
</style>
