<script setup lang="ts">
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import type { LearningTopicVideo } from '@/types/learning-course'

defineProps<{
  videos: LearningTopicVideo[]
}>()

const emit = defineEmits<{
  select: [video: LearningTopicVideo]
}>()
</script>

<template>
  <ul class="learning-topic-subsection-videos-list" aria-label="Видео подраздела">
    <li
      v-for="video in videos"
      :key="video.id"
      class="learning-topic-subsection-videos-list__item"
    >
      <button
        type="button"
        class="learning-topic-subsection-videos-list__row"
        @click="emit('select', video)"
      >
        <span class="learning-topic-subsection-videos-list__icon" aria-hidden="true">
          <font-awesome-icon :icon="faPlay" />
        </span>
        <span class="learning-topic-subsection-videos-list__title">{{ video.title }}</span>
      </button>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.learning-topic-subsection-videos-list {
  list-style: none;
  margin: 0;
  padding: var(--sp-8);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: var(--radius-10);
  background: var(--osnovnoy-fon);
  min-height: var(--sp-20);

  &__item {
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: var(--sp-10);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: var(--sp-10) var(--sp-12);
    border: none;
    border-radius: var(--radius-10);
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: inherit;

    &:hover {
      background: var(--fon-bloka);
    }

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: 2px;
    }
  }

  &__icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    color: var(--text-accent);
    font-size: var(--size-13);
  }

  &__title {
    min-width: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    word-break: break-word;
  }
}
</style>
