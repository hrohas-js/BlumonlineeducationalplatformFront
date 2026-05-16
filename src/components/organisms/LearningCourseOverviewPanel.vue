<script setup lang="ts">
import LearningCourseAccessProgress from '@/components/molecules/LearningCourseAccessProgress.vue'
import LearningCourseInfoBox from '@/components/molecules/LearningCourseInfoBox.vue'
import LearningTopicRow from '@/components/molecules/LearningTopicRow.vue'
import type { LearningCourseDetail } from '@/types/learning-course'

const props = defineProps<{
  course: LearningCourseDetail
  activeTopicId?: string | null
}>()

const emit = defineEmits<{
  'select-topic': [topicId: string]
}>()
</script>

<template>
  <section class="learning-course-overview-panel">
    <LearningCourseAccessProgress
      :completed-topics="course.completedTopics"
      :total-topics="course.totalTopics"
      :access-until="course.accessUntil"
      :progress-percent-override="course.progressPercentOverride"
    />

    <LearningCourseInfoBox
      v-if="course.descriptionLines.length > 0"
      :lines="course.descriptionLines"
    />

    <ul class="learning-course-overview-panel__topics" aria-label="Темы курса">
      <li v-for="topic in course.topics" :key="topic.id">
        <LearningTopicRow
          :title="topic.title"
          :access-until="topic.accessUntil"
          :is-completed="topic.isCompleted"
          :is-active="topic.id === props.activeTopicId"
          @click="emit('select-topic', topic.id)"
        />
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.learning-course-overview-panel {
  display: flex;
  flex-direction: column;
  margin-top: var(--sp-20);

  &__topics {
    list-style: none;
    margin: var(--sp-20) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }
}
</style>
