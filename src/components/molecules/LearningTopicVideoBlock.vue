<script setup lang="ts">
import LessonVideoPlayer from '@/components/organisms/LessonVideoPlayer.vue'
import LearningCollapsibleChip from '@/components/molecules/LearningCollapsibleChip.vue'
import LearningTopicFilesList from '@/components/molecules/LearningTopicFilesList.vue'
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

    <section
      v-if="video.src || loading || error || video.files.length === 0"
      class="learning-topic-video-block__player"
    >
      <LessonVideoPlayer v-if="video.src && !loading && !error" :src="video.src" :poster="video.poster" />
      <p v-else-if="loading" class="learning-topic-video-block__placeholder">Подгружаем видео…</p>
      <p
        v-else-if="error"
        class="learning-topic-video-block__placeholder learning-topic-video-block__placeholder_error"
      >
        {{ error }}
      </p>
      <p v-else class="learning-topic-video-block__placeholder">Видео недоступно</p>
    </section>

    <LearningCollapsibleChip
      v-if="video.files.length > 0"
      label="Учебный материал"
      variant="filled"
    >
      <LearningTopicFilesList :files="video.files" />
    </LearningCollapsibleChip>

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
