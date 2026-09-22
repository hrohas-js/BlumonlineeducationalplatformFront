<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import ModalCloseButton from '@/components/atoms/ModalCloseButton.vue'
import LearningCollapsibleChip from '@/components/molecules/LearningCollapsibleChip.vue'
import LessonVideoPlayer from '@/components/organisms/LessonVideoPlayer.vue'
import { useAuthStore } from '@/stores/auth'
import type { LearningTopicVideo } from '@/types/learning-course'
import { formatTimeSeconds } from '@/utils/adminTopicChapters'

const props = defineProps<{
  isOpen: boolean
  video: LearningTopicVideo | null
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

type PlayerExpose = {
  seekTo: (seconds: number) => void
  pause: () => void
}

const playerRef = ref<PlayerExpose | null>(null)

const watermarkText = computed(() => {
  const id = authStore.user?.id?.trim()
  return id ? `ID: ${id}` : undefined
})

const chapters = computed(() => props.video?.chapters ?? [])

function pausePlayer() {
  playerRef.value?.pause()
}

const closeModal = () => {
  pausePlayer()
  emit('close')
}

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

function onChapterClick(timeSeconds: number) {
  playerRef.value?.seekTo(timeSeconds)
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onEscapeKey)
    } else {
      pausePlayer()
      document.removeEventListener('keydown', onEscapeKey)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onEscapeKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen && video" class="lesson-video-playback-modal" @click="onOverlayClick">
      <div
        class="lesson-video-playback-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-video-playback-modal-title"
        @click.stop
      >
        <div class="lesson-video-playback-modal__close-wrap">
          <ModalCloseButton class="lesson-video-playback-modal__close" @click="closeModal" />
        </div>

        <h2 id="lesson-video-playback-modal-title" class="lesson-video-playback-modal__title">
          {{ video.title }}
        </h2>

        <section class="lesson-video-playback-modal__player">
          <LessonVideoPlayer
            v-if="video.src && !loading && !error"
            ref="playerRef"
            :src="video.src"
            :poster="video.poster"
            :watermark-text="watermarkText"
          />
          <p v-else-if="loading" class="lesson-video-playback-modal__placeholder">
            Подгружаем видео…
          </p>
          <p
            v-else-if="error"
            class="lesson-video-playback-modal__placeholder lesson-video-playback-modal__placeholder_error"
          >
            {{ error }}
          </p>
          <p v-else class="lesson-video-playback-modal__placeholder">Видео недоступно</p>
        </section>

        <LearningCollapsibleChip
          v-if="chapters.length > 0"
          label="Тайм-код"
          variant="outline"
        >
          <ul class="lesson-video-playback-modal__chapters">
            <li v-for="(chapter, index) in chapters" :key="`${chapter.time_seconds}-${index}`">
              <button
                type="button"
                class="lesson-video-playback-modal__chapter-btn"
                @click="onChapterClick(chapter.time_seconds)"
              >
                <span class="lesson-video-playback-modal__chapter-time">
                  {{ formatTimeSeconds(chapter.time_seconds) }}
                </span>
                <span class="lesson-video-playback-modal__chapter-title">{{ chapter.title }}</span>
              </button>
            </li>
          </ul>
        </LearningCollapsibleChip>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.lesson-video-playback-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-notification);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-20);
  box-sizing: border-box;
  background-color: rgba(1, 3, 7, 0.4);
}

.lesson-video-playback-modal__content {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - var(--sp-40));
  overflow: auto;
  padding: 40px;
  border: 1px solid #010307;
  border-radius: 20px;
  background-color: var(--white);
}

.lesson-video-playback-modal__close-wrap {
  position: absolute;
  top: var(--sp-16);
  right: var(--sp-16);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  box-sizing: border-box;
}

.lesson-video-playback-modal__close {
  width: 23px;
  height: 23px;
}

.lesson-video-playback-modal__title {
  margin: 0;
  padding-right: var(--sp-40);
  font-family: var(--font-family);
  font-weight: var(--font-bold);
  font-size: var(--size-20);
  line-height: 1.3;
  color: var(--osnovnoy-tekst);
  word-break: break-word;
}

.lesson-video-playback-modal__player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
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

.lesson-video-playback-modal__placeholder {
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

.lesson-video-playback-modal__chapters {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}

.lesson-video-playback-modal__chapter-btn {
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

  &:hover .lesson-video-playback-modal__chapter-title {
    color: var(--text-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--text-accent);
    outline-offset: 2px;
  }
}

.lesson-video-playback-modal__chapter-time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: var(--text-accent);
}

.lesson-video-playback-modal__chapter-title {
  min-width: 0;
}

@media (max-width: 1023px) {
  .lesson-video-playback-modal__content {
    padding: var(--sp-24);
  }

  .lesson-video-playback-modal__title {
    font-size: var(--size-15);
  }
}

@media (max-width: 479px) {
  .lesson-video-playback-modal {
    padding: var(--sp-12);
    align-items: flex-end;
  }

  .lesson-video-playback-modal__content {
    max-height: calc(100vh - var(--sp-24));
    padding: var(--sp-20) var(--sp-16);
    border-radius: 16px;
  }
}
</style>
