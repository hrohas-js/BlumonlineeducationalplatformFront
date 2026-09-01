<script setup lang="ts">
import { computed, ref } from 'vue'
import LessonVideoPlayer from '@/components/organisms/LessonVideoPlayer.vue'
import LearningCollapsibleChip from '@/components/molecules/LearningCollapsibleChip.vue'
import LearningTopicFilesList from '@/components/molecules/LearningTopicFilesList.vue'
import { useAuthStore } from '@/stores/auth'
import type { LearningTopicVideo } from '@/types/learning-course'
import { formatTimeSeconds } from '@/utils/adminTopicChapters'

const authStore = useAuthStore()

const watermarkText = computed(() => {
  const id = authStore.user?.id?.trim()
  return id ? `ID: ${id}` : undefined
})

const props = withDefaults(
  defineProps<{
    video: LearningTopicVideo
    loading?: boolean
    error?: string
    lessonLayout?: boolean
  }>(),
  {
    lessonLayout: false,
  },
)

type PlayerExpose = { seekTo: (seconds: number) => void }

const playerRef = ref<PlayerExpose | null>(null)

const chapters = computed(() => props.video.chapters ?? [])

function onChapterClick(timeSeconds: number) {
  playerRef.value?.seekTo(timeSeconds)
}
</script>

<template>
  <article class="learning-topic-video-block">
    <h4 class="learning-topic-video-block__title">{{ video.title }}</h4>

    <section
      v-if="video.src || loading || error"
      class="learning-topic-video-block__player"
    >
      <LessonVideoPlayer
        v-if="video.src && !loading && !error"
        ref="playerRef"
        :src="video.src"
        :poster="video.poster"
        :watermark-text="watermarkText"
      />
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
      v-if="video.files.length > 0 && !lessonLayout"
      label="Учебный материал"
      variant="filled"
    >
      <LearningTopicFilesList :files="video.files" />
    </LearningCollapsibleChip>

    <LearningCollapsibleChip
      v-if="chapters.length > 0"
      label="Тайм-код"
      variant="outline"
    >
      <ul class="learning-topic-video-block__chapters">
        <li v-for="(chapter, index) in chapters" :key="`${chapter.time_seconds}-${index}`">
          <button
            type="button"
            class="learning-topic-video-block__chapter-btn"
            @click="onChapterClick(chapter.time_seconds)"
          >
            <span class="learning-topic-video-block__chapter-time">
              {{ formatTimeSeconds(chapter.time_seconds) }}
            </span>
            <span class="learning-topic-video-block__chapter-title">{{ chapter.title }}</span>
          </button>
        </li>
      </ul>
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
    position: relative;
    width: 100%;
    aspect-ratio: 488 / 306;
    max-height: 306px;
    border-radius: var(--radius-10);
    overflow: hidden;
    background: var(--osnovnoy-tekst);
    display: flex;
    flex-direction: column;

    :deep(.lesson-video-player) {
      height: 100%;
      aspect-ratio: unset;
    }
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

  &__chapters {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-8);
  }

  &__chapter-btn {
    display: flex;
    align-items: baseline;
    gap: var(--sp-12);
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);

    &:hover .learning-topic-video-block__chapter-title {
      color: var(--text-accent);
    }

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: 2px;
    }
  }

  &__chapter-time {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    color: var(--text-accent);
  }

  &__chapter-title {
    min-width: 0;
  }
}

@media (max-width: 1023px) {
  .learning-topic-video-block {
    &__title {
      font-size: var(--size-13);
    }

    &__player {
      aspect-ratio: 16 / 9;
      max-height: none;
    }
  }
}
</style>
