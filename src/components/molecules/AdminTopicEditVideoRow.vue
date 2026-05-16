<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { validateAdminTopicVideoFile } from '@/utils/adminTopicVideoFile'

const title = defineModel<string>('title', { required: true })
const timecodeEnabled = defineModel<boolean>('timecodeEnabled', { required: true })
const videoSrc = defineModel<string | undefined>('videoSrc')

interface Emits {
  (e: 'delete-video'): void
}

const emit = defineEmits<Emits>()

const videoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const addFileError = ref('')
const isValidatingFile = ref(false)

const hasVideo = computed(() => Boolean(videoSrc.value?.trim()))

const ACCEPT_INPUT = 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'

const timeLabel = computed(
  () => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`,
)

const progressPct = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
})

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function syncFromVideo() {
  const v = videoRef.value
  if (!v) return
  currentTime.value = v.currentTime
  duration.value = Number.isFinite(v.duration) ? v.duration : 0
}

function resetPlaybackState() {
  currentTime.value = 0
  duration.value = 0
}

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function openFilePicker() {
  addFileError.value = ''
  fileInputRef.value?.click()
}

async function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const list = input.files
  if (!list?.length) {
    input.value = ''
    return
  }
  const file = list[0]
  addFileError.value = ''
  isValidatingFile.value = true
  try {
    const result = await validateAdminTopicVideoFile(file)
    if (!result.ok) {
      addFileError.value = result.error
      return
    }
    videoSrc.value = URL.createObjectURL(file)
    if (!title.value.trim()) {
      title.value = file.name.replace(/\.[^.]+$/, '')
    }
  } finally {
    isValidatingFile.value = false
    input.value = ''
  }
}

function togglePlay() {
  const v = videoRef.value
  if (!v) return
  if (v.paused) {
    void v.play().catch(() => {
      /* decode / autoplay */
    })
  } else {
    v.pause()
  }
}

const toggleTimecode = () => {
  timecodeEnabled.value = !timecodeEnabled.value
}

watch(videoSrc, (next, prev) => {
  if (prev && prev !== next) {
    revokeBlobUrl(prev)
  }
  resetPlaybackState()
  if (!next?.trim()) {
    timecodeEnabled.value = false
  }
})

onBeforeUnmount(() => {
  revokeBlobUrl(videoSrc.value)
})
</script>

<template>
  <div class="admin-topic-edit-video-row">
    <input
      ref="fileInputRef"
      class="admin-topic-edit-video-row__file-input"
      type="file"
      :accept="ACCEPT_INPUT"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileInputChange"
    />

    <div class="admin-topic-edit-video-row__title-field">
      <input
        v-model="title"
        class="admin-topic-edit-video-row__title-input"
        type="text"
        autocomplete="off"
        placeholder="Здесь можно писать название видео"
      />
    </div>

    <p v-if="addFileError" class="admin-topic-edit-video-row__error" role="alert">
      {{ addFileError }}
    </p>

    <div class="admin-topic-edit-video-row__body">
      <div
        v-if="hasVideo"
        class="admin-topic-edit-video-row__player"
        role="region"
        aria-label="Предпросмотр видео"
      >
        <video
          ref="videoRef"
          class="admin-topic-edit-video-row__video"
          :src="videoSrc"
          playsinline
          preload="metadata"
          @loadedmetadata="syncFromVideo"
          @timeupdate="syncFromVideo"
          @durationchange="syncFromVideo"
        />
        <div class="admin-topic-edit-video-row__progress-track" aria-hidden="true">
          <div
            class="admin-topic-edit-video-row__progress-fill"
            :style="{ width: `${progressPct}%` }"
          />
        </div>
        <div class="admin-topic-edit-video-row__player-chrome">
          <div class="admin-topic-edit-video-row__chrome-left">
            <button
              type="button"
              class="admin-topic-edit-video-row__icon-btn"
              aria-label="Воспроизведение / пауза"
              @click="togglePlay"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M9 6.5v11l9-5.5L9 6.5z"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linejoin="round"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span class="admin-topic-edit-video-row__icon-btn" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11 5L6 9H3v6h3l5 4V5zM16 9a4 4 0 010 6"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
          <span class="admin-topic-edit-video-row__time" aria-live="polite">{{ timeLabel }}</span>
          <div class="admin-topic-edit-video-row__chrome-right">
            <span class="admin-topic-edit-video-row__speed">1х</span>
            <span class="admin-topic-edit-video-row__icon-btn" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.2" />
                <path
                  d="M19 12a7 7 0 00-.11-1.23l2-1.15-2-3.46-2 .12a7.2 7.2 0 00-1-.58l-.31-2.07h-4l-.31 2.07c-.35.17-.68.36-1 .58l-2-.12-2 3.46 2 1.15A7 7 0 005 12a7 7 0 00.11 1.23l-2 1.15 2 3.46 2-.12c.32.22.65.41 1 .58l.31 2.07h4l.31-2.07c.35-.17.68-.36 1-.58l2 .12 2-3.46-2-1.15c.07-.4.11-.81.11-1.23z"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="admin-topic-edit-video-row__icon-btn" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div v-if="!hasVideo" class="admin-topic-edit-video-row__add-only">
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn"
          :disabled="isValidatingFile"
          @click="openFilePicker"
        >
          <span class="admin-topic-edit-video-row__side-btn-text">
            {{ isValidatingFile ? 'Проверка файла…' : 'Добавить видеофайл' }}
          </span>
        </button>
      </div>

      <div v-else class="admin-topic-edit-video-row__side-actions">
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn-timecode"
          :aria-pressed="timecodeEnabled"
          aria-label="Добавить тайм-код"
          @click="toggleTimecode"
        >
          <span class="admin-topic-edit-video-row__timecode-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill="#178ef0" />
              <path
                d="M10 6v8M6 10h8"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="admin-topic-edit-video-row__side-btn-timecode-text">Добавить тайм-код</span>
        </button>
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn"
          :disabled="isValidatingFile"
          @click="openFilePicker"
        >
          <span class="admin-topic-edit-video-row__side-btn-text">
            {{ isValidatingFile ? 'Проверка файла…' : 'Заменить видеофайл' }}
          </span>
        </button>
        <button type="button" class="admin-topic-edit-video-row__side-btn" @click="emit('delete-video')">
          <span class="admin-topic-edit-video-row__side-btn-text">Удалить видео</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-topic-edit-video-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
}

.admin-topic-edit-video-row__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-topic-edit-video-row__title-field {
  width: 100%;
  max-width: 489px;
}

.admin-topic-edit-video-row__title-input {
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  color: var(--black);
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: var(--black);
    opacity: 0.85;
  }
}

.admin-topic-edit-video-row__error {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-16);
  line-height: normal;
  color: var(--danger);
}

.admin-topic-edit-video-row__body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-20) 40px;
  align-items: flex-start;
  width: 100%;
}

.admin-topic-edit-video-row__player {
  position: relative;
  width: 100%;
  max-width: 489px;
  aspect-ratio: 489 / 306;
  border-radius: var(--radius-10);
  overflow: hidden;
  background: #1a1a1a;
  flex-shrink: 0;
}

.admin-topic-edit-video-row__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admin-topic-edit-video-row__progress-track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 44px;
  height: 5px;
  background: var(--white);
  z-index: 1;
}

.admin-topic-edit-video-row__progress-fill {
  height: 5px;
  background: #178ef0;
  transition: width 0.1s linear;
}

.admin-topic-edit-video-row__player-chrome {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-15);
  padding: 10px 15px;
  background: #010307;
  box-sizing: border-box;
  z-index: 1;
}

.admin-topic-edit-video-row__chrome-left,
.admin-topic-edit-video-row__chrome-right {
  display: flex;
  align-items: center;
  gap: var(--sp-15);
}

.admin-topic-edit-video-row__chrome-right {
  justify-content: flex-end;
  min-width: 0;
}

.admin-topic-edit-video-row__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--white);
  flex-shrink: 0;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-edit-video-row__time,
.admin-topic-edit-video-row__speed {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 13px;
  line-height: normal;
  color: var(--white);
  white-space: nowrap;
}

.admin-topic-edit-video-row__add-only {
  width: 100%;
  max-width: 233px;
  flex-shrink: 0;

  .admin-topic-edit-video-row__side-btn {
    justify-content: center;
    text-align: center;
  }
}

.admin-topic-edit-video-row__side-actions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 233px;
  flex-shrink: 0;
}

.admin-topic-edit-video-row__side-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-20);
  width: 100%;
  margin: 0;
  padding: 10px var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background: #f5f5f5;
  cursor: pointer;
  font: inherit;
  text-align: right;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover:not(:disabled) {
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.admin-topic-edit-video-row__side-btn-text {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  color: #010307;
  white-space: nowrap;
}

/* Figma 471:2739 — «Слайдер_добавить тайм-код» */
.admin-topic-edit-video-row__side-btn-timecode {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-20);
  width: 100%;
  margin: 0;
  padding: 10px var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background: #f5f5f5;
  cursor: pointer;
  font: inherit;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    filter: brightness(0.98);
  }

  &[aria-pressed='true'] {
    background: color-mix(in srgb, #178ef0 8%, #f5f5f5);
  }
}

.admin-topic-edit-video-row__timecode-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  line-height: 0;
}

.admin-topic-edit-video-row__side-btn-timecode-text {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  color: #010307;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .admin-topic-edit-video-row__body {
    flex-direction: column;
  }

  .admin-topic-edit-video-row__side-actions {
    max-width: 100%;
  }

  .admin-topic-edit-video-row__player {
    max-width: 100%;
  }
}
</style>