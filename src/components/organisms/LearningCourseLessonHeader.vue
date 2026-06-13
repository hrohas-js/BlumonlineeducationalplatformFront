<script setup lang="ts">
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import LearningCourseAccessProgress from '@/components/molecules/LearningCourseAccessProgress.vue'
import LearningProductBadge from '@/components/molecules/LearningProductBadge.vue'
import type { LearningCourseCategory } from '@/types/learning-course'

defineProps<{
  studentName: string
  courseTitle: string
  courseCategory: LearningCourseCategory
  completedTopics: number
  totalTopics: number
  accessUntil: string | null
  progressPercentOverride?: number
}>()
</script>

<template>
  <div class="home-learning__card home-learning__card_header">
    <header class="home-learning__header home-learning__header_lesson">
      <HomeProfileInfoTableItem
        :label="studentName"
        tone="#178ef0"
        is-student-name
      />
      <LearningProductBadge :title="courseTitle" :category="courseCategory" />
    </header>

    <div class="home-learning__header-progress">
      <LearningCourseAccessProgress
        :completed-topics="completedTopics"
        :total-topics="totalTopics"
        :access-until="accessUntil"
        :progress-percent-override="progressPercentOverride"
        full-width
      />
    </div>
  </div>
</template>
