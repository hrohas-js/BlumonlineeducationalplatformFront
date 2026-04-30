<script setup lang="ts">
import { computed } from 'vue'
import LearningCourseCardDescription from '@/components/organisms/LearningCourseCardDescription.vue'
import LearningCourseCardFooter from '@/components/organisms/LearningCourseCardFooter.vue'
import LearningCourseCardHeader from '@/components/organisms/LearningCourseCardHeader.vue'
import LearningCourseCardProgress from '@/components/organisms/LearningCourseCardProgress.vue'

type CourseCategory = 'courses' | 'projects' | 'other'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    category: CourseCategory
    completedTopics: number
    totalTopics: number
    accessUntil?: string | null
    showProgress?: boolean
  }>(),
  {
    accessUntil: null,
    showProgress: true,
  },
)

const categoryLabelMap: Record<CourseCategory, string> = {
  courses: 'Курсы',
  projects: 'Проекты',
  other: 'Иное',
}

const categoryLabel = computed(() => categoryLabelMap[props.category])

const progressPercent = computed(() => {
  if (props.totalTopics <= 0) {
    return 0
  }

  const rawPercent = Math.round((props.completedTopics / props.totalTopics) * 100)
  return Math.min(100, Math.max(0, rawPercent))
})

const accessLabel = computed(() => {
  if (!props.accessUntil) {
    return 'бессрочно'
  }

  return props.accessUntil
})
</script>

<template>
  <article class="learning-course-card">
    <slot name="header" :title="title" :category="category" :categoryLabel="categoryLabel">
      <LearningCourseCardHeader :title="title" :category="category" :category-label="categoryLabel" />
    </slot>

    <slot name="description" :description="description">
      <LearningCourseCardDescription :description="description" />
    </slot>

    <template v-if="showProgress">
      <slot
        name="progress"
        :completedTopics="completedTopics"
        :totalTopics="totalTopics"
        :progressPercent="progressPercent"
      >
        <LearningCourseCardProgress
          :completed-topics="completedTopics"
          :total-topics="totalTopics"
          :progress-percent="progressPercent"
        />
      </slot>
    </template>

    <slot name="footer" :accessLabel="accessLabel">
      <LearningCourseCardFooter :access-label="accessLabel" />
    </slot>
  </article>
</template>

<style lang="scss" scoped>
.learning-course-card {
  background: var(--osnovnoy-fon);
  border-radius: var(--radius-10);
  padding: var(--sp-20);
}

@media (max-width: 1023px) {
  .learning-course-card {
    padding: var(--sp-10);
  }
}
</style>
