<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  completedTopics: number
  totalTopics: number
  accessUntil: string | null
  progressPercentOverride?: number
}>()

const progressPercent = computed(() => {
  if (props.progressPercentOverride !== undefined) {
    return Math.min(100, Math.max(0, props.progressPercentOverride))
  }
  if (props.totalTopics <= 0) return 0
  const raw = Math.round((props.completedTopics / props.totalTopics) * 100)
  return Math.min(100, Math.max(0, raw))
})

const accessLabel = computed(() => props.accessUntil ?? 'бессрочно')
</script>

<template>
  <div class="learning-course-access-progress">
    <p class="learning-course-access-progress__topics">
      Пройдено тем: {{ completedTopics }} из {{ totalTopics }}
    </p>
    <p class="learning-course-access-progress__access">
      Общий срок доступа: {{ accessLabel }}
    </p>
    <div
      class="learning-course-access-progress__track"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="progressPercent"
    >
      <div
        class="learning-course-access-progress__fill"
        :style="{ width: `${progressPercent}%` }"
      >
        <span class="learning-course-access-progress__value">{{ progressPercent }}%</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.learning-course-access-progress {
  display: flex;
  flex-direction: column;
  gap: var(--sp-10);

  &__topics {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-13);
    color: var(--dopolnitelnyy-tekst);
  }

  &__access {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
  }

  &__track {
    width: 100%;
    max-width: var(--size-320);
    height: var(--size-20);
    border: var(--border-1) solid var(--osnovnoy-tekst);
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
  .learning-course-access-progress {
    &__topics,
    &__access {
      font-size: var(--size-10);
    }

    &__value {
      font-size: var(--size-8);
    }
  }
}
</style>
