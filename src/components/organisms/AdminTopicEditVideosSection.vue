<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminTopicEditVideoRow from '@/components/molecules/AdminTopicEditVideoRow.vue'
import type { AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'

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
  (e: 'open-timecode-modal', videoId: string): void
  (e: 'video-delete', videoId: string): void
  (e: 'video-title-commit', payload: { videoId: string; title: string }): void
}

const emit = defineEmits<Emits>()

type VideoRowExpose = { openFilePicker: () => void }

const rowRefs = ref<Record<string, VideoRowExpose | null>>({})

function setRowRef(id: string, el: unknown) {
  if (el && typeof el === 'object' && 'openFilePicker' in el) {
    rowRefs.value[id] = el as VideoRowExpose
  } else {
    delete rowRefs.value[id]
  }
}

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
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
  delete rowRefs.value[videoId]
}

const hasEmptyVideoSlot = computed(() =>
  videos.value.some((v) => !v.videoSrc?.trim()),
)

const isAnyUploading = computed(() =>
  Object.values(props.uploadProgressById).some((p) => p != null),
)

async function openPickerForVideo(videoId: string) {
  await nextTick()
  rowRefs.value[videoId]?.openFilePicker()
}

const onAddVideoClick = async () => {
  if (isAnyUploading.value) return
  const empty = videos.value.find((v) => !v.videoSrc?.trim())
  if (empty) {
    await openPickerForVideo(empty.id)
    return
  }
  const id = crypto.randomUUID()
  videos.value = [
    ...videos.value,
    {
      id,
      title: `Видео ${videos.value.length + 1}`,
      timecodeEnabled: false,
      videoSrc: '',
      persisted: false,
    },
  ]
  await openPickerForVideo(id)
}

function progressFor(videoId: string): number | null {
  const value = props.uploadProgressById[videoId]
  return value == null ? null : value
}
</script>

<template>
  <section class="admin-topic-edit-videos-section">
    <h2 class="admin-topic-edit-videos-section__heading">Видеофайлы</h2>
    <div class="admin-topic-edit-videos-section__list">
      <AdminTopicEditVideoRow
        v-for="v in videos"
        :key="v.id"
        :ref="(el) => setRowRef(v.id, el)"
        v-model:title="v.title"
        v-model:timecode-enabled="v.timecodeEnabled"
        v-model:video-src="v.videoSrc"
        :upload-progress="progressFor(v.id)"
        @delete-video="onDelete(v.id)"
        @file-selected="(file) => emit('video-file-selected', { videoId: v.id, file })"
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
        :disabled="isAnyUploading"
        @click="onAddVideoClick"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-edit-videos-section {
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
}

:deep(.admin-topic-edit-videos-section__add-btn.base-button) {
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

  :deep(.admin-topic-edit-videos-section__add-btn.base-button) {
    font-size: var(--size-15);
  }
}
</style>
