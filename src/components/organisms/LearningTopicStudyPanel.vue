<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LearningCourseAccessProgress from '@/components/molecules/LearningCourseAccessProgress.vue'
import LearningCollapsibleChip from '@/components/molecules/LearningCollapsibleChip.vue'
import LearningTopicCompleteToggle from '@/components/molecules/LearningTopicCompleteToggle.vue'
import LearningTopicVideoBlock from '@/components/molecules/LearningTopicVideoBlock.vue'
import { getNextTopicId } from '@/utils/mapProductToLearningDetail'
import type { LearningCourseDetail } from '@/types/learning-course'

const props = defineProps<{
  course: LearningCourseDetail
  selectedTopicId: string
  videoLoadingById?: Record<string, boolean>
  videoErrorById?: Record<string, string>
  completing?: boolean
}>()

const emit = defineEmits<{
  'next-topic': [topicId: string]
  'complete-topic': [topicId: string, completed: boolean]
}>()

const topic = computed(() => props.course.topics.find((t) => t.id === props.selectedTopicId) ?? null)

const nextTopicId = computed(() => getNextTopicId(props.course, props.selectedTopicId))

const topicCompleted = ref(false)

watch(
  () => topic.value?.isCompleted,
  (value) => {
    topicCompleted.value = value ?? false
  },
  { immediate: true },
)

const accessLabel = computed(() => topic.value?.accessUntil ?? 'бессрочно')

const onCompleteChange = (value: boolean) => {
  topicCompleted.value = value
  emit('complete-topic', props.selectedTopicId, value)
}

const goNextTopic = () => {
  if (nextTopicId.value) {
    emit('next-topic', nextTopicId.value)
  }
}
</script>

<template>
  <section v-if="topic" class="learning-topic-study-panel">
    <LearningCourseAccessProgress
      :completed-topics="course.completedTopics"
      :total-topics="course.totalTopics"
      :access-until="course.accessUntil"
      :progress-percent-override="course.progressPercentOverride"
    />

    <header class="learning-topic-study-panel__header">
      <div class="learning-topic-study-panel__title-block">
        <h3 class="learning-topic-study-panel__title">{{ topic.title }}</h3>
        <p class="learning-topic-study-panel__access">Срок доступа: {{ accessLabel }}</p>
      </div>
      <button
        v-if="nextTopicId"
        type="button"
        class="learning-topic-study-panel__next"
        @click="goNextTopic"
      >
        Следующая тема
      </button>
    </header>

    <LearningCollapsibleChip
      v-if="topic.materialsHtml"
      label="Учебный материал"
      variant="filled"
    >
      <div class="learning-topic-study-panel__materials" v-html="topic.materialsHtml" />
    </LearningCollapsibleChip>

    <LearningCollapsibleChip
      v-else-if="topic.materialsText"
      label="Учебный материал"
      variant="filled"
    >
      <p class="learning-topic-study-panel__materials">{{ topic.materialsText }}</p>
    </LearningCollapsibleChip>

    <LearningTopicVideoBlock
      v-for="video in topic.videos"
      :key="video.id"
      :video="video"
      :loading="videoLoadingById?.[video.id]"
      :error="videoErrorById?.[video.id]"
    />

    <footer class="learning-topic-study-panel__footer">
      <LearningTopicCompleteToggle
        :model-value="topicCompleted"
        :disabled="completing"
        @update:model-value="onCompleteChange"
      />
    </footer>
  </section>
</template>

<style lang="scss" scoped>
.learning-topic-study-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  margin-top: var(--sp-20);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sp-20);
  }

  &__title-block {
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    line-height: 1.3;
  }

  &__access {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
  }

  &__next {
    flex-shrink: 0;
    border: var(--border-2) solid var(--dopolnitelnyy-tekst);
    border-radius: var(--radius-10);
    padding: var(--sp-10);
    background: transparent;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--dopolnitelnyy-tekst);
    cursor: pointer;
    white-space: nowrap;
  }

  &__materials {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--sp-20);
  }
}

@media (max-width: 1023px) {
  .learning-topic-study-panel {
    &__header {
      flex-direction: column;
    }

    &__title {
      font-size: var(--size-13);
    }

    &__access {
      font-size: var(--size-10);
    }

    &__next {
      align-self: flex-start;
      font-size: var(--size-13);
    }
  }
}
</style>
