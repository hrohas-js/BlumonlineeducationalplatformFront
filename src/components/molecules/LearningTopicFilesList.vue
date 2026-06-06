<script setup lang="ts">
import type { LearningTopicFile } from '@/types/learning-course'
import { formatLearningFileSize, isLearningTopicImageFile } from '@/utils/learningTopicFile'

defineProps<{
  files: LearningTopicFile[]
}>()
</script>

<template>
  <ul class="learning-topic-files-list" aria-label="Файлы учебного материала">
    <li v-for="file in files" :key="file.id" class="learning-topic-files-list__item">
      <a
        class="learning-topic-files-list__link"
        :href="file.fileUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="learning-topic-files-list__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 3h6l4 4v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
            <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="learning-topic-files-list__meta">
          <span class="learning-topic-files-list__name">{{ file.fileName }}</span>
          <span v-if="formatLearningFileSize(file.fileSize)" class="learning-topic-files-list__size">
            {{ formatLearningFileSize(file.fileSize) }}
          </span>
        </span>
        <span class="learning-topic-files-list__action">Открыть</span>
      </a>
      <img
        v-if="isLearningTopicImageFile(file.fileType)"
        class="learning-topic-files-list__preview"
        :src="file.fileUrl"
        :alt="file.fileName"
        loading="lazy"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.learning-topic-files-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-10);

  &__item {
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__link {
    display: flex;
    align-items: center;
    gap: var(--sp-10);
    padding: var(--sp-10);
    border-radius: var(--radius-10);
    background: var(--osnovnoy-fon);
    text-decoration: none;
    color: inherit;
    transition: background-color 0.15s ease;

    &:hover {
      background: var(--fon-bloka);
    }
  }

  &__icon {
    flex-shrink: 0;
    display: inline-flex;
    color: var(--dopolnitelnyy-tekst);
  }

  &__meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  &__name {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    word-break: break-word;
  }

  &__size {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-10);
    color: var(--dopolnitelnyy-tekst);
  }

  &__action {
    flex-shrink: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--dopolnitelnyy-tekst);
  }

  &__preview {
    width: 100%;
    max-width: 320px;
    border-radius: var(--radius-10);
    object-fit: contain;
  }
}
</style>
