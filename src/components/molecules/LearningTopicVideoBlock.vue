<script setup lang="ts">
import LessonVideoPlayer from '@/components/organisms/LessonVideoPlayer.vue'
import LearningCollapsibleChip from '@/components/molecules/LearningCollapsibleChip.vue'
import type { LearningTopicVideo } from '@/types/learning-course'

defineProps<{
  video: LearningTopicVideo
  loading?: boolean
  error?: string
}>()
</script>

<template>
  <article class="learning-topic-video-block">
    <h4 class="learning-topic-video-block__title">{{ video.title }}</h4>

    <section class="learning-topic-video-block__player">
      <LessonVideoPlayer v-if="video.src && !loading && !error" :src="video.src" :poster="video.poster" />
      <p v-else-if="loading" class="learning-topic-video-block__placeholder">Подгружаем видео…</p>
      <p
        v-else-if="error"
        class="learning-topic-video-block__placeholder learning-topic-video-block__placeholder_error"
      >
        {{ error }}
      </p>
      <section
        v-else
        class="learning-topic-video-block__mock-player"
        aria-hidden="true"
      >
        <span
          class="learning-topic-video-block__mock-progress"
          :style="{ width: `${video.progressPercent ?? 0}%` }"
        />
        <footer class="learning-topic-video-block__mock-controls">
          <span>▶</span>
          <span v-if="video.currentTimeLabel && video.durationLabel">
            {{ video.currentTimeLabel }} / {{ video.durationLabel }}
          </span>
          <span>1х</span>
        </footer>
      </section>
    </section>

    <LearningCollapsibleChip
      v-if="video.hasTimecode"
      label="Тайм-код"
      variant="outline"
    >
      <p class="learning-topic-video-block__timecode-hint">Тайм-коды будут доступны при воспроизведении.</p>
    </LearningCollapsibleChip>
  </article>
</template>

<style lang="scss" scoped>
.learning-topic-video-block {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }

  &__player {
    width: 100%;
    aspect-ratio: 488 / 306;
    max-height: 306px;
    border-radius: var(--radius-10);
    overflow: hidden;
    background: var(--osnovnoy-tekst);
    display: flex;
    flex-direction: column;
  }

  &__placeholder {
    margin: auto;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--fon-bloka);
    text-align: center;
    padding: var(--sp-20);

    &_error {
      color: var(--danger);
    }
  }

  &__mock-player {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  }

  &__mock-progress {
    display: block;
    height: var(--size-5);
    background: var(--dopolnitelnyy-tekst);
    transition: width 0.2s ease;
  }

  &__mock-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--sp-10) var(--sp-16);
    background: var(--osnovnoy-tekst);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-13);
    color: var(--fon-bloka);
  }

  &__timecode-hint {
    margin: 0;
    font-size: var(--size-13);
  }
}

@media (max-width: 1023px) {
  .learning-topic-video-block {
    &__title {
      font-size: var(--size-13);
    }
  }
}
</style>
