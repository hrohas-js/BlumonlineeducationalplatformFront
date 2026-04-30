<script setup lang="ts">
defineProps<{
  completedTopics: number
  totalTopics: number
  progressPercent: number
}>()
</script>

<template>
  <div class="learning-course-card-progress">
    <p class="learning-course-card-progress__text">Пройдено тем: {{ completedTopics }} из {{ totalTopics }}</p>
    <div
      class="learning-course-card-progress__track"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="progressPercent"
    >
      <div class="learning-course-card-progress__fill" :style="{ width: `${progressPercent}%` }">
        <span class="learning-course-card-progress__value">{{ progressPercent }}%</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.learning-course-card-progress {
  margin-top: var(--sp-20);

  &__text {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-10);
    color: var(--dopolnitelnyy-tekst);
  }

  &__track {
    margin-top: var(--size-5);
    width: 100%;
    height: var(--size-20);
    border-radius: var(--radius-check);
    background: var(--fon-bloka);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    min-width: fit-content;
    border-radius: var(--radius-check);
    background: var(--dopolnitelnyy-tekst);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-4) var(--sp-10);
  }

  &__value {
    font-family: var(--third-family);
    font-weight: var(--font-bold);
    font-size: var(--size-10);
    color: var(--fon-bloka);
  }
}

@media (max-width: 1023px) {
  .learning-course-card-progress {
    &__value {
      font-size: var(--size-8);
    }
  }
}
</style>
