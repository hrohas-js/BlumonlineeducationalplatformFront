<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import LessonVideoPlayer from '@/components/organisms/LessonVideoPlayer.vue'
import { ADMIN_TOPIC_VIDEO_ACCEPT, validateAdminTopicVideoFile } from '@/utils/adminTopicVideoFile'

const title = defineModel<string>('title', { required: true })
const timecodeEnabled = defineModel<boolean>('timecodeEnabled', { required: true })
const videoSrc = defineModel<string | undefined>('videoSrc')

const props = withDefaults(
  defineProps<{
    /** 0–100 во время загрузки; null — загрузка не идёт */
    uploadProgress?: number | null
    /** Блокирует кнопку добавления (идёт загрузка/проверка других файлов). */
    addLocked?: boolean
  }>(),
  {
    uploadProgress: null,
    addLocked: false,
  },
)

interface Emits {
  (e: 'delete-video'): void
  (e: 'file-selected', file: File): void
  (e: 'request-add-files'): void
  (e: 'open-timecode-modal'): void
  (e: 'title-commit', title: string): void
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const addFileError = ref('')
const isValidatingFile = ref(false)
const titleAtFocus = ref(title.value)

const hasVideo = computed(() => Boolean(videoSrc.value?.trim()))
const isUploading = computed(() => props.uploadProgress != null)
const uploadPercent = computed(() =>
  props.uploadProgress == null ? 0 : Math.min(100, Math.max(0, Math.round(props.uploadProgress))),
)
const fileActionsDisabled = computed(() => isValidatingFile.value || isUploading.value)

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function openReplaceFilePicker() {
  if (isUploading.value || !hasVideo.value) return
  addFileError.value = ''
  fileInputRef.value?.click()
}

function onTitleFocus() {
  titleAtFocus.value = title.value
}

function onTitleBlur() {
  const next = title.value.trim()
  if (next === titleAtFocus.value.trim()) return
  emit('title-commit', next)
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
    emit('file-selected', file)
    if (!title.value.trim()) {
      title.value = file.name.replace(/\.[^.]+$/, '')
    }
  } finally {
    isValidatingFile.value = false
    input.value = ''
  }
}

watch(videoSrc, (next, prev) => {
  if (prev && prev !== next) {
    revokeBlobUrl(prev)
  }
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
      v-if="hasVideo"
      ref="fileInputRef"
      class="admin-topic-edit-video-row__file-input"
      type="file"
      :accept="ADMIN_TOPIC_VIDEO_ACCEPT"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileInputChange"
    />

    <div v-if="hasVideo" class="admin-topic-edit-video-row__title-field">
      <input
        v-model="title"
        class="admin-topic-edit-video-row__title-input"
        type="text"
        autocomplete="off"
        placeholder="Здесь можно писать название видео"
        @focus="onTitleFocus"
        @blur="onTitleBlur"
      />
    </div>

    <p v-if="addFileError" class="admin-topic-edit-video-row__error" role="alert">
      {{ addFileError }}
    </p>

    <div class="admin-topic-edit-video-row__body">
      <div v-if="hasVideo || isUploading" class="admin-topic-edit-video-row__media">
        <div
          v-if="hasVideo && videoSrc"
          class="admin-topic-edit-video-row__player"
          role="region"
          aria-label="Предпросмотр видео"
        >
          <LessonVideoPlayer :src="videoSrc" />
        </div>

        <div
          v-if="isUploading"
          class="admin-topic-edit-video-row__upload"
          aria-live="polite"
        >
          <p class="admin-topic-edit-video-row__upload-label">
            Загрузка… {{ uploadPercent }}%
          </p>
          <div
            class="admin-topic-edit-video-row__upload-track"
            role="progressbar"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="uploadPercent"
            :aria-label="`Загрузка видео ${uploadPercent}%`"
          >
            <div
              class="admin-topic-edit-video-row__upload-fill"
              :style="{ width: `${uploadPercent}%` }"
            />
          </div>
        </div>
      </div>

      <div v-if="!hasVideo" class="admin-topic-edit-video-row__add-only">
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn"
          :disabled="fileActionsDisabled || addLocked"
          @click="emit('request-add-files')"
        >
          <span class="admin-topic-edit-video-row__side-btn-text">
            {{
              isUploading
                ? `Загрузка… ${uploadPercent}%`
                : 'Добавить видеофайл'
            }}
          </span>
        </button>
      </div>

      <div v-else class="admin-topic-edit-video-row__side-actions">
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn-timecode"
          :aria-pressed="timecodeEnabled"
          aria-label="Добавить тайм-код"
          :disabled="isUploading"
          @click="emit('open-timecode-modal')"
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
          :disabled="fileActionsDisabled"
          @click="openReplaceFilePicker"
        >
          <span class="admin-topic-edit-video-row__side-btn-text">
            {{
              isUploading
                ? `Загрузка… ${uploadPercent}%`
                : isValidatingFile
                  ? 'Проверка файла…'
                  : 'Заменить видеофайл'
            }}
          </span>
        </button>
        <button
          type="button"
          class="admin-topic-edit-video-row__side-btn"
          :disabled="isUploading"
          @click="emit('delete-video')"
        >
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

.admin-topic-edit-video-row__media {
  display: flex;
  flex-direction: column;
  gap: var(--sp-12);
  width: 100%;
  max-width: 489px;
  flex-shrink: 0;
}

.admin-topic-edit-video-row__player {
  position: relative;
  width: 100%;
  aspect-ratio: 489 / 306;
  border-radius: var(--radius-10);
  overflow: hidden;
  background: #1a1a1a;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  :deep(.lesson-video-player) {
    width: 100%;
    height: 100%;
    aspect-ratio: unset;
    border-radius: 0;
  }
}

.admin-topic-edit-video-row__upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}

.admin-topic-edit-video-row__upload-label {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: #010307;
}

.admin-topic-edit-video-row__upload-track {
  width: 100%;
  height: var(--size-20);
  border-radius: var(--radius-check);
  background: color-mix(in srgb, var(--knopka) 12%, #f5f5f5);
  overflow: hidden;
}

.admin-topic-edit-video-row__upload-fill {
  height: 100%;
  min-width: 0;
  border-radius: var(--radius-check);
  background: var(--knopka);
  transition: width 0.15s ease-out;
}

.admin-topic-edit-video-row__add-only {
  width: 100%;
  max-width: 233px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;

  .admin-topic-edit-video-row__side-btn {
    justify-content: flex-start;
    text-align: left;
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

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
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

@media (max-width: 1023px) {
  .admin-topic-edit-video-row__error {
    font-size: var(--size-15);
  }
}

@media (max-width: 900px) {
  .admin-topic-edit-video-row__body {
    flex-direction: column;
  }

  .admin-topic-edit-video-row__side-actions {
    max-width: 100%;
  }

  .admin-topic-edit-video-row__media {
    max-width: 100%;
  }
}
</style>
