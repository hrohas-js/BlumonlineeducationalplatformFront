<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminLabeledControlRow from '@/components/molecules/AdminLabeledControlRow.vue'
import AdminTopicChaptersModal from '@/components/organisms/AdminTopicChaptersModal.vue'
import AdminTopicEditMaterialsSection from '@/components/organisms/AdminTopicEditMaterialsSection.vue'
import AdminTopicEditVideosSection from '@/components/organisms/AdminTopicEditVideosSection.vue'
import type {
  AdminTopicEditMaterialFileMock,
  AdminTopicEditSubsectionMock,
  AdminTopicEditVideoMock,
} from '@/utils/adminMaterialCatalog'
import type { LessonChapter, LessonVideoResponse } from '@/services/api/types'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/api/endpoints/admin'
import {
  getAdminMaterialSectionTitle,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const { notify } = useNotification()

const sectionId = computed(() => route.params.sectionId as string)
const productId = computed(() => route.params.productId as string)
const topicId = computed(() => route.params.topicId as string)

const lessonTitle = ref('')
const materialFiles = ref<AdminTopicEditMaterialFileMock[]>([])
const ungroupedVideos = ref<AdminTopicEditVideoMock[]>([])
const subsections = ref<AdminTopicEditSubsectionMock[]>([])
const loading = ref(true)
const saving = ref(false)
const chaptersSaving = ref(false)
const chaptersModalOpen = ref(false)
const editingVideoId = ref<string | null>(null)
const primaryLessonId = ref<string | null>(null)
/** Прогресс загрузки видео по id строки (null = не загружается). */
const videoUploadProgressById = ref<Record<string, number | null>>({})
const deletingFileId = ref<string | null>(null)
const deletingVideoId = ref<string | null>(null)
const uploadingMaterials = ref(false)
const subsectionBusy = ref(false)

const productDetail = computed(() => adminStore.productDetails[productId.value] ?? null)

const moduleData = computed(() =>
  productDetail.value?.modules.find((m) => m.id === topicId.value) ?? null,
)

function emptyVideoSlot(subsectionId: string | null = null): AdminTopicEditVideoMock {
  return {
    id: crypto.randomUUID(),
    title: 'Видео 1',
    timecodeEnabled: false,
    chapters: [],
    videoSrc: '',
    persisted: false,
    subsectionId,
  }
}

function uniqueVideosById(videos: LessonVideoResponse[]): LessonVideoResponse[] {
  const seen = new Set<string>()
  const unique: LessonVideoResponse[] = []
  for (const video of videos) {
    if (seen.has(video.id)) continue
    seen.add(video.id)
    unique.push(video)
  }
  return unique
}

function mapLessonVideo(
  video: LessonVideoResponse,
  subsectionId: string | null = video.subsection_id ?? null,
): AdminTopicEditVideoMock {
  const chapters = video.chapters ?? []
  return {
    id: video.id,
    title: video.title?.trim() || `Видео ${video.order_index}`,
    orderIndex: video.order_index,
    chapters,
    timecodeEnabled: chapters.length > 0,
    videoSrc: video.video_url ?? '',
    fileName: video.video_url ? 'video' : undefined,
    persisted: true,
    subsectionId,
  }
}

function allVideoRows(): AdminTopicEditVideoMock[] {
  return [...ungroupedVideos.value, ...subsections.value.flatMap((subsection) => subsection.videos)]
}

function findVideoRow(videoId: string): AdminTopicEditVideoMock | undefined {
  return allVideoRows().find((video) => video.id === videoId)
}

function mapFilesFromLesson() {
  const mod = moduleData.value
  if (!mod) {
    materialFiles.value = []
    ungroupedVideos.value = [emptyVideoSlot()]
    subsections.value = []
    primaryLessonId.value = null
    return
  }
  lessonTitle.value = mod.title
  if (mod.lessons.length === 0) {
    materialFiles.value = []
    ungroupedVideos.value = [emptyVideoSlot()]
    subsections.value = []
    primaryLessonId.value = null
    return
  }
  const lesson = [...mod.lessons].sort((a, b) => a.order_index - b.order_index)[0]
  primaryLessonId.value = lesson.id
  materialFiles.value = lesson.files.map((f) => ({
    id: f.id,
    fileName: f.file_name,
  }))

  const groupedIds = new Set<string>()
  subsections.value = [...(lesson.subsections ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((subsection) => {
      const nested = subsection.videos
      const source =
        nested != null
          ? nested
          : (lesson.videos ?? []).filter((video) => video.subsection_id === subsection.id)
      const unique = uniqueVideosById(source).sort((a, b) => a.order_index - b.order_index)
      unique.forEach((video) => groupedIds.add(video.id))
      return {
        id: subsection.id,
        title: subsection.title,
        orderIndex: subsection.order_index,
        videos: unique.map((video) => mapLessonVideo(video, subsection.id)),
      }
    })

  const ungrouped = uniqueVideosById(lesson.videos ?? [])
    .filter((video) => !video.subsection_id && !groupedIds.has(video.id))
    .sort((a, b) => a.order_index - b.order_index)
    .map((video) => mapLessonVideo(video, null))

  ungroupedVideos.value =
    ungrouped.length === 0 && subsections.value.length === 0 ? [emptyVideoSlot()] : ungrouped
}

async function load(options?: { silent?: boolean }) {
  if (!isAdminMaterialSectionId(sectionId.value)) {
    void router.replace({ name: 'admin-materials' })
    return
  }
  if (!options?.silent) {
    loading.value = true
  }
  const result = await adminStore.fetchProductDetail(productId.value)
  if (!options?.silent) {
    loading.value = false
  }
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить курс' })
    void router.replace({ name: 'admin-materials' })
    return
  }
  if (!moduleData.value) {
    void router.replace({
      name: 'admin-material-product-edit',
      params: { sectionId: sectionId.value, productId: productId.value },
    })
    return
  }
  mapFilesFromLesson()
}

onMounted(() => {
  void load()
})

watch([productId, topicId], () => {
  void load()
})

const sectionTitle = computed(() =>
  isAdminMaterialSectionId(sectionId.value)
    ? getAdminMaterialSectionTitle(sectionId.value as AdminMaterialSectionId)
    : '',
)

const breadcrumbItems = computed(() => {
  const p = productDetail.value
  if (!p || !moduleData.value) return []
  const topics = [...(p.modules ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({ id: m.id, title: m.title, accessUntil: '—' }))
  return [
    { label: `Папка «${sectionTitle.value}»`, to: { name: 'admin-materials' as const } },
    {
      label: `Редактирование тем «${p.title}»`,
      to: {
        name: 'admin-material-product-edit' as const,
        params: { sectionId: sectionId.value, productId: productId.value },
      },
      topicsMenu: {
        sectionId: sectionId.value,
        productId: productId.value,
        topics,
        activeTopicId: topicId.value,
      },
    },
    { label: moduleData.value.title },
  ]
})

const goBackToProduct = () => {
  void router.push({
    name: 'admin-material-product-edit',
    params: { sectionId: sectionId.value, productId: productId.value },
  })
}

const ensureLesson = async (): Promise<string | null> => {
  if (primaryLessonId.value) return primaryLessonId.value
  const result = await adminService.createLesson(topicId.value, {
    title: lessonTitle.value.trim() || 'Урок 1',
    description: '',
  })
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось создать урок' })
    return null
  }
  primaryLessonId.value = result.data.id
  await adminStore.fetchProductDetail(productId.value)
  return result.data.id
}

const onVideoFileSelected = async ({
  videoId,
  file,
  subsectionId,
}: {
  videoId: string
  file: File
  subsectionId?: string | null
}) => {
  const lessonId = await ensureLesson()
  if (!lessonId) return

  const row = findVideoRow(videoId)
  const replaceVideoId = row?.persisted ? videoId : null
  const title = row?.title?.trim() || file.name.replace(/\.[^.]+$/, '')
  const resolvedSubsectionId = row?.subsectionId ?? subsectionId ?? null

  videoUploadProgressById.value = {
    ...videoUploadProgressById.value,
    [videoId]: 0,
  }

  const result = await adminService.uploadLessonVideo(lessonId, file, {
    title,
    subsectionId: resolvedSubsectionId,
    onProgress: (percent) => {
      videoUploadProgressById.value = {
        ...videoUploadProgressById.value,
        [videoId]: percent,
      }
    },
  })

  videoUploadProgressById.value = {
    ...videoUploadProgressById.value,
    [videoId]: null,
  }

  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить видео' })
    return
  }

  if (replaceVideoId) {
    const del = await adminService.deleteLessonVideo(lessonId, replaceVideoId)
    if (!del.success) {
      notify({
        type: 'error',
        message: del.error || 'Видео загружено, но старое не удалось удалить',
      })
      await load({ silent: true })
      return
    }
  }

  notify({ type: 'success', message: replaceVideoId ? 'Видео заменено' : 'Видео загружено' })
  await load({ silent: true })
}

function snapshotFailedVideoRows(
  items: { videoId: string; file: File }[],
  failedIds: Set<string>,
): Map<string, AdminTopicEditVideoMock> {
  const snapshots = new Map<string, AdminTopicEditVideoMock>()
  for (const { videoId } of items) {
    if (!failedIds.has(videoId)) continue
    const row = findVideoRow(videoId)
    if (!row) continue
    snapshots.set(videoId, {
      ...row,
      chapters: row.chapters ? [...row.chapters] : [],
    })
  }
  return snapshots
}

function restoreFailedVideoRows(
  items: { videoId: string; file: File }[],
  failedIds: Set<string>,
  snapshots: Map<string, AdminTopicEditVideoMock>,
) {
  if (!failedIds.size) return

  const extras: AdminTopicEditVideoMock[] = []
  for (const { videoId, file } of items) {
    if (!failedIds.has(videoId)) continue
    const row = snapshots.get(videoId)
    extras.push({
      id: videoId,
      title: row?.title?.trim() || file.name.replace(/\.[^.]+$/, '') || `Видео ${extras.length + 1}`,
      timecodeEnabled: row?.timecodeEnabled ?? false,
      chapters: row?.chapters ? [...row.chapters] : [],
      videoSrc: URL.createObjectURL(file),
      fileName: file.name,
      persisted: false,
      subsectionId: row?.subsectionId ?? null,
    })
  }

  if (!extras.length) return

  const hasPreview = (row: AdminTopicEditVideoMock) => Boolean(row.videoSrc?.trim())
  const extrasBySubsection = new Map<string | null, AdminTopicEditVideoMock[]>()
  for (const extra of extras) {
    const key = extra.subsectionId ?? null
    const list = extrasBySubsection.get(key) ?? []
    list.push(extra)
    extrasBySubsection.set(key, list)
  }

  for (const [subsectionId, groupExtras] of extrasBySubsection) {
    if (!subsectionId) {
      ungroupedVideos.value = [
        ...ungroupedVideos.value.filter((row) => row.persisted || hasPreview(row)),
        ...groupExtras,
      ]
      continue
    }
    const subsection = subsections.value.find((item) => item.id === subsectionId)
    if (!subsection) {
      ungroupedVideos.value = [...ungroupedVideos.value, ...groupExtras]
      continue
    }
    subsection.videos = [
      ...subsection.videos.filter((row) => row.persisted || hasPreview(row)),
      ...groupExtras,
    ]
  }
}

const onVideoFilesSelected = async ({
  items,
  subsectionId,
}: {
  items: { videoId: string; file: File }[]
  subsectionId?: string | null
}) => {
  if (!items.length) return

  const lessonId = await ensureLesson()
  if (!lessonId) return

  const queuedProgress: Record<string, number | null> = { ...videoUploadProgressById.value }
  for (const { videoId } of items) {
    queuedProgress[videoId] = 0
  }
  videoUploadProgressById.value = queuedProgress

  let successCount = 0
  const errorMessages: string[] = []
  const failedIds = new Set<string>()

  for (const { videoId, file } of items) {
    const row = findVideoRow(videoId)
    const title = row?.title?.trim() || file.name.replace(/\.[^.]+$/, '')
    const resolvedSubsectionId = row?.subsectionId ?? subsectionId ?? null

    const result = await adminService.uploadLessonVideo(lessonId, file, {
      title,
      subsectionId: resolvedSubsectionId,
      onProgress: (percent) => {
        videoUploadProgressById.value = {
          ...videoUploadProgressById.value,
          [videoId]: percent,
        }
      },
    })

    videoUploadProgressById.value = {
      ...videoUploadProgressById.value,
      [videoId]: null,
    }

    if (!result.success || !result.data) {
      failedIds.add(videoId)
      errorMessages.push(
        `«${file.name}»: ${result.error || 'Не удалось загрузить видео'}`,
      )
      continue
    }

    successCount += 1
  }

  if (successCount === items.length) {
    notify({
      type: 'success',
      message: successCount === 1 ? 'Видео загружено' : `Загружено видео: ${successCount}`,
    })
  } else if (successCount > 0) {
    notify({
      type: 'success',
      message: `Загружено ${successCount} из ${items.length}`,
    })
    notify({
      type: 'error',
      message: errorMessages.join(' · '),
    })
  } else {
    notify({
      type: 'error',
      message: errorMessages.join(' · ') || 'Не удалось загрузить видео',
    })
  }

  if (successCount > 0) {
    const failedSnapshots = snapshotFailedVideoRows(items, failedIds)
    await load({ silent: true })
    restoreFailedVideoRows(items, failedIds, failedSnapshots)
  }
}

const onVideoDelete = async (videoId: string) => {
  if (deletingVideoId.value) return
  const lessonId = primaryLessonId.value
  if (!lessonId) {
    ungroupedVideos.value = ungroupedVideos.value.filter((v) => v.id !== videoId)
    subsections.value = subsections.value.map((subsection) => ({
      ...subsection,
      videos: subsection.videos.filter((v) => v.id !== videoId),
    }))
    return
  }
  deletingVideoId.value = videoId
  const result = await adminService.deleteLessonVideo(lessonId, videoId)
  deletingVideoId.value = null
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить видео' })
    return
  }
  notify({ type: 'success', message: 'Видео удалено' })
  await load({ silent: true })
}

const onVideoTitleCommit = async ({ videoId, title }: { videoId: string; title: string }) => {
  const row = findVideoRow(videoId)
  if (!row?.persisted) return
  const lessonId = primaryLessonId.value
  if (!lessonId) return
  const result = await adminService.updateLessonVideo(lessonId, videoId, { title: title || null })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить название' })
    return
  }
  if (result.data) {
    row.title = result.data.title?.trim() || title
    row.orderIndex = result.data.order_index
  }
}

const onMaterialUpload = async (uploadFiles: File[]) => {
  if (!uploadFiles.length || uploadingMaterials.value) return
  uploadingMaterials.value = true
  try {
    const lessonId = await ensureLesson()
    if (!lessonId) return

    const failed: string[] = []
    let uploadedCount = 0
    for (const file of uploadFiles) {
      const result = await adminService.uploadLessonFile(lessonId, file)
      if (!result.success) {
        failed.push(file.name)
        continue
      }
      uploadedCount += 1
    }

    if (uploadedCount > 0) {
      notify({
        type: 'success',
        message: uploadedCount === 1 ? 'Файл загружен' : `Загружено файлов: ${uploadedCount}`,
      })
    }
    if (failed.length) {
      notify({
        type: 'error',
        message:
          failed.length === 1
            ? `Не удалось загрузить файл: ${failed[0]}`
            : `Не удалось загрузить: ${failed.join(', ')}`,
      })
    }

    await load({ silent: true })
  } finally {
    uploadingMaterials.value = false
  }
}

const onMaterialDelete = async (fileId: string) => {
  if (deletingFileId.value) return
  deletingFileId.value = fileId
  const result = await adminService.deleteFile(fileId)
  deletingFileId.value = null
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить файл' })
    return
  }
  notify({ type: 'success', message: 'Файл удалён' })
  await load({ silent: true })
}

const editingVideoChapters = computed((): LessonChapter[] => {
  if (!editingVideoId.value) return []
  const row = findVideoRow(editingVideoId.value)
  return row?.chapters ?? []
})

const onOpenTimecodeModal = (videoId: string) => {
  const row = findVideoRow(videoId)
  if (!row?.persisted) {
    notify({ type: 'error', message: 'Сначала загрузите видео' })
    return
  }
  editingVideoId.value = videoId
  chaptersModalOpen.value = true
}

const onCloseChaptersModal = () => {
  chaptersModalOpen.value = false
  editingVideoId.value = null
}

const onSaveChapters = async (chapters: LessonChapter[]) => {
  const lessonId = primaryLessonId.value
  const videoId = editingVideoId.value
  if (!lessonId || !videoId) return
  chaptersSaving.value = true
  const result = await adminService.updateLessonVideo(lessonId, videoId, { chapters })
  chaptersSaving.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить тайм-коды' })
    return
  }
  const row = findVideoRow(videoId)
  if (row) {
    row.chapters = chapters
    row.timecodeEnabled = chapters.length > 0
  }
  chaptersModalOpen.value = false
  editingVideoId.value = null
  notify({ type: 'success', message: 'Тайм-коды сохранены' })
  await load({ silent: true })
}

const onSubsectionCreate = async () => {
  if (subsectionBusy.value) return
  subsectionBusy.value = true
  try {
    const lessonId = await ensureLesson()
    if (!lessonId) return
    const result = await adminService.createLessonSubsection(lessonId, {
      title: 'Название подраздела',
    })
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось создать подраздел' })
      return
    }
    notify({ type: 'success', message: 'Подраздел добавлен' })
    await load({ silent: true })
  } finally {
    subsectionBusy.value = false
  }
}

const onSubsectionRename = async ({
  subsectionId,
  title,
}: {
  subsectionId: string
  title: string
}) => {
  const lessonId = primaryLessonId.value
  if (!lessonId) return
  const result = await adminService.updateLessonSubsection(lessonId, subsectionId, { title })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить название подраздела' })
    await load({ silent: true })
    return
  }
  const subsection = subsections.value.find((item) => item.id === subsectionId)
  if (subsection) {
    subsection.title = result.data?.title?.trim() || title
    if (result.data?.order_index != null) {
      subsection.orderIndex = result.data.order_index
    }
  }
}

const onSubsectionDelete = async (subsectionId: string) => {
  const lessonId = primaryLessonId.value
  if (!lessonId || subsectionBusy.value) return
  subsectionBusy.value = true
  try {
    const result = await adminService.deleteLessonSubsection(lessonId, subsectionId)
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось удалить подраздел' })
      return
    }
    notify({ type: 'success', message: 'Подраздел удалён' })
    await load({ silent: true })
  } finally {
    subsectionBusy.value = false
  }
}

const onSubsectionMove = async ({
  subsectionId,
  direction,
}: {
  subsectionId: string
  direction: -1 | 1
}) => {
  const lessonId = primaryLessonId.value
  if (!lessonId || subsectionBusy.value) return
  const currentIndex = subsections.value.findIndex((item) => item.id === subsectionId)
  const targetIndex = currentIndex + direction
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= subsections.value.length) return

  const next = [...subsections.value]
  const [moved] = next.splice(currentIndex, 1)
  if (!moved) return
  next.splice(targetIndex, 0, moved)

  subsectionBusy.value = true
  try {
    const result = await adminService.reorderLessonSubsections(lessonId, {
      subsections: next.map((item, index) => ({
        subsection_id: item.id,
        order_index: index,
      })),
    })
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось изменить порядок подразделов' })
      return
    }
    await load({ silent: true })
  } finally {
    subsectionBusy.value = false
  }
}

const onSave = async () => {
  const lessonId = await ensureLesson()
  if (!lessonId) return
  saving.value = true
  await adminService.updateModule(topicId.value, {
    title: lessonTitle.value.trim() || moduleData.value?.title,
  })
  const result = await adminService.updateLesson(lessonId, {
    title: lessonTitle.value.trim() || 'Урок',
    description: '',
  })
  saving.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить' })
    return
  }
  notify({ type: 'success', message: 'Сохранено' })
  await load({ silent: true })
}
</script>

<template>
  <AppLayout>
    <section v-if="!loading && moduleData" class="admin-material-product-topic-edit-page">
      <div class="admin-material-product-topic-edit-page__panel">
        <HomeProfileInfoTableItem
          class="admin-material-product-topic-edit-page__badge"
          label="Имя админа"
          tone="#178ef0"
          is-student-name
        />

        <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

        <hr class="admin-material-product-topic-edit-page__rule" />

        <AdminLabeledControlRow label="Название темы:">
          <input
            v-model="lessonTitle"
            class="admin-labeled-control-row__input"
            type="text"
            autocomplete="off"
          />
        </AdminLabeledControlRow>

        <AdminTopicEditVideosSection
          v-model:ungrouped-videos="ungroupedVideos"
          v-model:subsections="subsections"
          :upload-progress-by-id="videoUploadProgressById"
          :deleting-video-id="deletingVideoId"
          :subsection-busy="subsectionBusy"
          @video-file-selected="onVideoFileSelected"
          @video-files-selected="onVideoFilesSelected"
          @open-timecode-modal="onOpenTimecodeModal"
          @video-delete="onVideoDelete"
          @video-title-commit="onVideoTitleCommit"
          @subsection-create="onSubsectionCreate"
          @subsection-rename="onSubsectionRename"
          @subsection-delete="onSubsectionDelete"
          @subsection-move="onSubsectionMove"
        />

        <AdminTopicEditMaterialsSection
          v-model:files="materialFiles"
          :deleting-file-id="deletingFileId"
          :is-uploading="uploadingMaterials"
          @material-upload="onMaterialUpload"
          @material-delete="onMaterialDelete"
        />

        <div class="admin-material-product-topic-edit-page__actions">
          <BaseButton
            class="admin-material-product-topic-edit-page__back"
            variant="ghost"
            size="small"
            text="Назад"
            @click="goBackToProduct"
          />
          <BaseButton
            class="admin-material-product-topic-edit-page__save"
            variant="outline"
            size="small"
            shape="rounded"
            :text="saving ? 'Сохраняем…' : 'Сохранить'"
            :disabled="saving"
            @click="onSave"
          />
        </div>
      </div>
    </section>
    <p v-else-if="loading" class="admin-material-product-topic-edit-page__loading">Загружаем…</p>

    <AdminTopicChaptersModal
      :is-open="chaptersModalOpen"
      :chapters="editingVideoChapters"
      :saving="chaptersSaving"
      @close="onCloseChaptersModal"
      @save="onSaveChapters"
    />
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-topic-edit-page {
  margin-top: var(--sp-40);

  &__loading {
    margin: var(--sp-40);
    text-align: center;
  }

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    gap: var(--sp-24);
  }

  &__rule {
    margin: 0;
    border: none;
    border-top: var(--border-2) solid var(--black);
  }

  &__actions {
    display: flex;
    gap: var(--sp-20);
    justify-content: flex-end;
  }

  :deep(.admin-material-product-topic-edit-page__back.base-button_ghost) {
    font-family: var(--font-family);
    font-size: var(--size-15);
    color: var(--text-accent);

    &:hover:not(.base-button_disabled) {
      color: var(--text-accent);
    }
  }

  :deep(.admin-material-product-topic-edit-page__save.base-button) {
    height: auto;
    font-family: var(--font-family);
    font-size: var(--size-15);
    border-color: var(--knopka);
    color: var(--text-accent);
  }
}
</style>
