<script setup lang="ts">
defineProps<{
  lines: string[]
}>()
</script>

<template>
  <div class="learning-course-info-box">
    <p v-for="(line, index) in lines" :key="index" class="learning-course-info-box__line">
      {{ line }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.learning-course-info-box {
  margin-top: var(--sp-20);
  background: var(--osnovnoy-fon);
  border-radius: var(--radius-20);
  padding: var(--sp-20);

  &__line {
    margin: 0 0 var(--sp-10);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    line-height: 1.4;
    color: var(--osnovnoy-tekst);
    white-space: pre-wrap;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 1023px) {
  .learning-course-info-box {
    padding: var(--sp-10);

    &__line {
      font-size: var(--size-10);
    }
  }
}
</style>
