<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminTopicEditVideoRow from '@/components/molecules/AdminTopicEditVideoRow.vue'
import type { AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'
import {
  ADMIN_TOPIC_VIDEO_ACCEPT,
  validateAdminTopicVideoFiles,
} from '@/utils/adminTopicVideoFile'

const videos = defineModel<AdminTopicEditVideoMock[]>('videos', { required: true })

const props = withDefaults(
  defineProps<{
    uploadProgressById?: Record<string, number | null>
    deletingVideoId?: string | null
  }>(),
  {
    uploadProgressById: () => ({}),
    deletingVideoId: null,
  },
)

interface Emits {
  (e: 'video-file-selected', payload: { videoId: string; file: File }): void
  (e: 'video-files-selected', payload: { items: { videoId: string; file: File }[] }): void
  (e: 'open-timecode-modal', videoId: string): void
  (e: 'video-delete', videoId: string): void
  (e: 'video-title-commit', payload: { videoId: string; title: string }): void
}

const emit = defineEmits<Emits>()

const addFilesInputRef = ref<HTMLInputElement | null>(null)
const addFilesError = ref('')
const isValidatingFiles = ref(false)

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function createVideoSlot(index: number, videoSrc = ''): AdminTopicEditVideoMock {
  return {
    id: crypto.randomUUID(),
    title: `Видео ${index}`,
    timecodeEnabled: false,
    chapters: [],
    videoSrc,
    persisted: false,
  }
}

const isDeletingVideo = computed(() => props.deletingVideoId != null)

const onDelete = (videoId: string) => {
  const item = videos.value.find((v) => v.id === videoId)
  if (isDeletingVideo.value) return
  if (item?.persisted) {
    emit('video-delete', videoId)
    return
  }
  revokeBlobUrl(item?.videoSrc)
  videos.value = videos.value.filter((v) => v.id !== videoId)
}

const hasEmptyVideoSlot = computed(() =>
  videos.value.some((v) => !v.videoSrc?.trim()),
)

const isAnyUploading = computed(() =>
  Object.values(props.uploadProgressById).some((p) => p != null),
)

const addFilesDisabled = computed(() => isAnyUploading.value || isValidatingFiles.value)

function openAddFilesPicker() {
  if (addFilesDisabled.value) return
  addFilesError.value = ''
  const input = addFilesInputRef.value
  if (!input) return
  input.value = ''
  input.click()
}

async function onAddFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  const list = input.files
  if (!list?.length) {
    input.value = ''
    return
  }

  isValidatingFiles.value = true
  addFilesError.value = ''
  try {
    const { valid, errors } = await validateAdminTopicVideoFiles(Array.from(list))
    if (errors.length) {
      addFilesError.value = errors.join('\n')
    }
    if (!valid.length) return

    const nextVideos = videos.value.map((v) => ({ ...v }))
    const emptySlots = nextVideos.filter((v) => !v.videoSrc?.trim())
    const items: { videoId: string; file: File }[] = []

    valid.forEach((file, index) => {
      const blobSrc = URL.createObjectURL(file)
      const empty = emptySlots[index]
      if (empty) {
        empty.videoSrc = blobSrc
        items.push({ videoId: empty.id, file })
        return
      }
      const row = createVideoSlot(nextVideos.length + 1, blobSrc)
      nextVideos.push(row)
      items.push({ videoId: row.id, file })
    })

    videos.value = nextVideos
    emit('video-files-selected', { items })
  } finally {
    isValidatingFiles.value = false
    input.value = ''
  }
}

function progressFor(videoId: string): number | null {
  const value = props.uploadProgressById[videoId]
  return value == null ? null : value
}
</script>

<template>
  <section class="admin-topic-edit-videos-section">
    <h2 class="admin-topic-edit-videos-section__heading">Видеофайлы</h2>
    <input
      ref="addFilesInputRef"
      class="admin-topic-edit-videos-section__file-input"
      type="file"
      multiple
      :accept="ADMIN_TOPIC_VIDEO_ACCEPT"
      tabindex="-1"
      aria-hidden="true"
      @change="onAddFilesChange"
    />
    <p
      v-if="addFilesError"
      class="admin-topic-edit-videos-section__error"
      role="alert"
    >
      {{ addFilesError }}
    </p>
    <div class="admin-topic-edit-videos-section__list">
      <AdminTopicEditVideoRow
        v-for="v in videos"
        :key="v.id"
        v-model:title="v.title"
        v-model:timecode-enabled="v.timecodeEnabled"
        v-model:video-src="v.videoSrc"
        :upload-progress="progressFor(v.id)"
        :add-locked="addFilesDisabled"
        @delete-video="onDelete(v.id)"
        @file-selected="(file) => emit('video-file-selected', { videoId: v.id, file })"
        @request-add-files="openAddFilesPicker"
        @open-timecode-modal="emit('open-timecode-modal', v.id)"
        @title-commit="(title) => emit('video-title-commit', { videoId: v.id, title })"
      />
    </div>
    <div
      v-if="!hasEmptyVideoSlot"
      class="admin-topic-edit-videos-section__add-wrap"
    >
      <BaseButton
        class="admin-topic-edit-videos-section__add-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Добавить видеофайл"
        :disabled="addFilesDisabled"
        @click="openAddFilesPicker"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-edit-videos-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 1084px;
  align-items: flex-start;
}

.admin-topic-edit-videos-section__heading {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
}

.admin-topic-edit-videos-section__file-input {
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

.admin-topic-edit-videos-section__error {
  margin: 0;
  white-space: pre-line;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-16);
  line-height: normal;
  color: var(--danger);
}

.admin-topic-edit-videos-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-24);
  width: 100%;
}

.admin-topic-edit-videos-section__add-wrap {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

:deep(.admin-topic-edit-videos-section__add-btn.base-button) {
  width: auto;
  margin: 0;
  height: auto;
  min-height: 44px;
  font-family: var(--font-family);
  font-size: var(--size-15);
  border-color: var(--knopka);
  color: var(--text-accent);
}

@media (max-width: 1023px) {
  .admin-topic-edit-videos-section__heading {
    font-size: var(--size-15);
  }

  .admin-topic-edit-videos-section__error {
    font-size: var(--size-15);
  }

  :deep(.admin-topic-edit-videos-section__add-btn.base-button) {
    font-size: var(--size-15);
  }
}
</style>
