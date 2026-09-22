<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminTopicEditVideoRow from '@/components/molecules/AdminTopicEditVideoRow.vue'
import AdminTopicSubsectionBlock from '@/components/organisms/AdminTopicSubsectionBlock.vue'
import type {
  AdminTopicEditSubsectionMock,
  AdminTopicEditVideoMock,
} from '@/utils/adminMaterialCatalog'
import {
  ADMIN_TOPIC_VIDEO_ACCEPT,
  validateAdminTopicVideoFiles,
} from '@/utils/adminTopicVideoFile'

const ungroupedVideos = defineModel<AdminTopicEditVideoMock[]>('ungroupedVideos', { required: true })
const subsections = defineModel<AdminTopicEditSubsectionMock[]>('subsections', { required: true })

const props = withDefaults(
  defineProps<{
    uploadProgressById?: Record<string, number | null>
    deletingVideoId?: string | null
    subsectionBusy?: boolean
  }>(),
  {
    uploadProgressById: () => ({}),
    deletingVideoId: null,
    subsectionBusy: false,
  },
)

interface Emits {
  (e: 'video-file-selected', payload: { videoId: string; file: File; subsectionId?: string | null }): void
  (e: 'video-files-selected', payload: { items: { videoId: string; file: File }[]; subsectionId?: string | null }): void
  (e: 'open-timecode-modal', videoId: string): void
  (e: 'video-delete', videoId: string): void
  (e: 'video-title-commit', payload: { videoId: string; title: string }): void
  (e: 'subsection-create'): void
  (e: 'subsection-rename', payload: { subsectionId: string; title: string }): void
  (e: 'subsection-delete', subsectionId: string): void
  (e: 'subsection-move', payload: { subsectionId: string; direction: -1 | 1 }): void
}

const emit = defineEmits<Emits>()

type AddTarget = { type: 'ungrouped' } | { type: 'subsection'; id: string }

const addFilesInputRef = ref<HTMLInputElement | null>(null)
const addFilesError = ref('')
const isValidatingFiles = ref(false)
const addTarget = ref<AddTarget | null>(null)

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function createVideoSlot(
  index: number,
  videoSrc = '',
  subsectionId: string | null = null,
): AdminTopicEditVideoMock {
  return {
    id: crypto.randomUUID(),
    title: `Видео ${index}`,
    timecodeEnabled: false,
    chapters: [],
    videoSrc,
    persisted: false,
    subsectionId,
  }
}

const isDeletingVideo = computed(() => props.deletingVideoId != null)

function videosOf(target: AddTarget): AdminTopicEditVideoMock[] {
  if (target.type === 'ungrouped') return ungroupedVideos.value
  return subsections.value.find((subsection) => subsection.id === target.id)?.videos ?? []
}

function setVideosOf(target: AddTarget, next: AdminTopicEditVideoMock[]) {
  if (target.type === 'ungrouped') {
    ungroupedVideos.value = next
    return
  }
  subsections.value = subsections.value.map((subsection) =>
    subsection.id === target.id ? { ...subsection, videos: next } : subsection,
  )
}

const onDelete = (videoId: string, target: AddTarget) => {
  const list = videosOf(target)
  const item = list.find((v) => v.id === videoId)
  if (isDeletingVideo.value) return
  if (item?.persisted) {
    emit('video-delete', videoId)
    return
  }
  revokeBlobUrl(item?.videoSrc)
  setVideosOf(
    target,
    list.filter((v) => v.id !== videoId),
  )
}

function groupHasEmptySlot(list: AdminTopicEditVideoMock[]): boolean {
  return list.some((v) => !v.videoSrc?.trim())
}

const isAnyUploading = computed(() =>
  Object.values(props.uploadProgressById).some((p) => p != null),
)

const addFilesDisabled = computed(
  () => isAnyUploading.value || isValidatingFiles.value || props.subsectionBusy,
)

function openAddFilesPicker(target: AddTarget) {
  if (addFilesDisabled.value) return
  addFilesError.value = ''
  addTarget.value = target
  const input = addFilesInputRef.value
  if (!input) return
  input.value = ''
  input.click()
}

async function onAddFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  const list = input.files
  const target = addTarget.value
  if (!list?.length || !target) {
    input.value = ''
    addTarget.value = null
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

    const subsectionId = target.type === 'subsection' ? target.id : null
    const nextVideos = videosOf(target).map((v) => ({ ...v }))
    const emptySlots = nextVideos.filter((v) => !v.videoSrc?.trim())
    const items: { videoId: string; file: File }[] = []

    valid.forEach((file, index) => {
      const blobSrc = URL.createObjectURL(file)
      const empty = emptySlots[index]
      if (empty) {
        empty.videoSrc = blobSrc
        empty.subsectionId = subsectionId
        items.push({ videoId: empty.id, file })
        return
      }
      const row = createVideoSlot(nextVideos.length + 1, blobSrc, subsectionId)
      nextVideos.push(row)
      items.push({ videoId: row.id, file })
    })

    setVideosOf(target, nextVideos)
    emit('video-files-selected', { items, subsectionId })
  } finally {
    isValidatingFiles.value = false
    input.value = ''
    addTarget.value = null
  }
}

function progressFor(videoId: string): number | null {
  const value = props.uploadProgressById[videoId]
  return value == null ? null : value
}

const showUngrouped = computed(() => ungroupedVideos.value.length > 0)
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

    <div v-if="showUngrouped" class="admin-topic-edit-videos-section__group">
      <h3
        v-if="subsections.length > 0"
        class="admin-topic-edit-videos-section__group-title"
      >
        Видео без подраздела
      </h3>
      <div class="admin-topic-edit-videos-section__list">
        <AdminTopicEditVideoRow
          v-for="v in ungroupedVideos"
          :key="v.id"
          v-model:title="v.title"
          v-model:timecode-enabled="v.timecodeEnabled"
          v-model:video-src="v.videoSrc"
          :upload-progress="progressFor(v.id)"
          :add-locked="addFilesDisabled"
          @delete-video="onDelete(v.id, { type: 'ungrouped' })"
          @file-selected="(file) => emit('video-file-selected', { videoId: v.id, file, subsectionId: null })"
          @request-add-files="openAddFilesPicker({ type: 'ungrouped' })"
          @open-timecode-modal="emit('open-timecode-modal', v.id)"
          @title-commit="(title) => emit('video-title-commit', { videoId: v.id, title })"
        />
      </div>
      <div
        v-if="!groupHasEmptySlot(ungroupedVideos)"
        class="admin-topic-edit-videos-section__add-wrap"
      >
        <BaseButton
          class="admin-topic-edit-videos-section__add-btn"
          variant="outline"
          size="medium"
          shape="rounded"
          text="Добавить видеофайл"
          :disabled="addFilesDisabled"
          @click="openAddFilesPicker({ type: 'ungrouped' })"
        />
      </div>
    </div>

    <div
      v-for="(subsection, index) in subsections"
      :key="subsection.id"
      class="admin-topic-edit-videos-section__group"
    >
      <AdminTopicSubsectionBlock
        v-model:title="subsection.title"
        :can-move-up="index > 0"
        :can-move-down="index < subsections.length - 1"
        :disabled="subsectionBusy"
        default-open
        @title-commit="(title) => emit('subsection-rename', { subsectionId: subsection.id, title })"
        @move-up="emit('subsection-move', { subsectionId: subsection.id, direction: -1 })"
        @move-down="emit('subsection-move', { subsectionId: subsection.id, direction: 1 })"
        @delete="emit('subsection-delete', subsection.id)"
      >
        <div class="admin-topic-edit-videos-section__list">
          <AdminTopicEditVideoRow
            v-for="v in subsection.videos"
            :key="v.id"
            v-model:title="v.title"
            v-model:timecode-enabled="v.timecodeEnabled"
            v-model:video-src="v.videoSrc"
            :upload-progress="progressFor(v.id)"
            :add-locked="addFilesDisabled"
            @delete-video="onDelete(v.id, { type: 'subsection', id: subsection.id })"
            @file-selected="
              (file) => emit('video-file-selected', { videoId: v.id, file, subsectionId: subsection.id })
            "
            @request-add-files="openAddFilesPicker({ type: 'subsection', id: subsection.id })"
            @open-timecode-modal="emit('open-timecode-modal', v.id)"
            @title-commit="(title) => emit('video-title-commit', { videoId: v.id, title })"
          />
        </div>
        <div
          v-if="!groupHasEmptySlot(subsection.videos)"
          class="admin-topic-edit-videos-section__add-wrap"
        >
          <BaseButton
            class="admin-topic-edit-videos-section__add-btn"
            variant="outline"
            size="medium"
            shape="rounded"
            text="Добавить видеофайл"
            :disabled="addFilesDisabled"
            @click="openAddFilesPicker({ type: 'subsection', id: subsection.id })"
          />
        </div>
      </AdminTopicSubsectionBlock>
    </div>

    <div class="admin-topic-edit-videos-section__add-wrap">
      <BaseButton
        class="admin-topic-edit-videos-section__add-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Добавить подраздел"
        :disabled="subsectionBusy || isAnyUploading"
        @click="emit('subsection-create')"
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
  min-width: 0;
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

.admin-topic-edit-videos-section__group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
  width: 100%;
  min-width: 0;
}

.admin-topic-edit-videos-section__group-title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  color: var(--osnovnoy-tekst);
}

.admin-topic-edit-videos-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-24);
  width: 100%;
  min-width: 0;
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

  .admin-topic-edit-videos-section__error,
  .admin-topic-edit-videos-section__group-title {
    font-size: var(--size-15);
  }

  :deep(.admin-topic-edit-videos-section__add-btn.base-button) {
    font-size: var(--size-15);
  }
}
</style>
