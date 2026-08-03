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
import type { AdminTopicEditMaterialFileMock, AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'
import type { LessonChapter } from '@/services/api/types'
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
const videos = ref<AdminTopicEditVideoMock[]>([])
const lessonChapters = ref<LessonChapter[]>([])
const loading = ref(true)
const saving = ref(false)
const chaptersSaving = ref(false)
const chaptersModalOpen = ref(false)
const primaryLessonId = ref<string | null>(null)
/** Прогресс загрузки видео по id строки (null = не загружается). */
const videoUploadProgressById = ref<Record<string, number | null>>({})
const deletingFileId = ref<string | null>(null)
const deletingVideoId = ref<string | null>(null)

const productDetail = computed(() => adminStore.productDetails[productId.value] ?? null)

const moduleData = computed(() =>
  productDetail.value?.modules.find((m) => m.id === topicId.value) ?? null,
)

function emptyVideoSlot(): AdminTopicEditVideoMock {
  return { id: crypto.randomUUID(), title: 'Видео 1', timecodeEnabled: false, videoSrc: '', persisted: false }
}

function mapFilesFromLesson() {
  const mod = moduleData.value
  if (!mod) {
    materialFiles.value = []
    videos.value = [emptyVideoSlot()]
    primaryLessonId.value = null
    lessonChapters.value = []
    return
  }
  lessonTitle.value = mod.title
  if (mod.lessons.length === 0) {
    materialFiles.value = []
    videos.value = [emptyVideoSlot()]
    primaryLessonId.value = null
    lessonChapters.value = []
    return
  }
  const lesson = [...mod.lessons].sort((a, b) => a.order_index - b.order_index)[0]
  primaryLessonId.value = lesson.id
  lessonChapters.value = lesson.chapters ?? []
  materialFiles.value = lesson.files.map((f) => ({
    id: f.id,
    fileName: f.file_name,
  }))
  const lessonVideos = [...(lesson.videos ?? [])].sort((a, b) => a.order_index - b.order_index)
  const hasChapters = lessonChapters.value.length > 0
  if (lessonVideos.length === 0) {
    videos.value = [
      {
        id: crypto.randomUUID(),
        title: 'Видео 1',
        timecodeEnabled: hasChapters,
        videoSrc: '',
        persisted: false,
      },
    ]
    return
  }
  videos.value = lessonVideos.map((v) => ({
    id: v.id,
    title: v.title?.trim() || `Видео ${v.order_index}`,
    orderIndex: v.order_index,
    timecodeEnabled: hasChapters,
    videoSrc: v.video_url ?? '',
    fileName: v.video_url ? 'video' : undefined,
    persisted: true,
  }))
}

async function load() {
  if (!isAdminMaterialSectionId(sectionId.value)) {
    void router.replace({ name: 'admin-materials' })
    return
  }
  loading.value = true
  const result = await adminStore.fetchProductDetail(productId.value)
  loading.value = false
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

const onVideoFileSelected = async ({ videoId, file }: { videoId: string; file: File }) => {
  const lessonId = await ensureLesson()
  if (!lessonId) return

  const row = videos.value.find((v) => v.id === videoId)
  const replaceVideoId = row?.persisted ? videoId : null
  const title = row?.title?.trim() || file.name.replace(/\.[^.]+$/, '')

  videoUploadProgressById.value = {
    ...videoUploadProgressById.value,
    [videoId]: 0,
  }

  const result = await adminService.uploadLessonVideo(lessonId, file, {
    title,
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
      await load()
      return
    }
  }

  notify({ type: 'success', message: replaceVideoId ? 'Видео заменено' : 'Видео загружено' })
  await load()
}

const onVideoDelete = async (videoId: string) => {
  if (deletingVideoId.value) return
  const lessonId = primaryLessonId.value
  if (!lessonId) {
    videos.value = videos.value.filter((v) => v.id !== videoId)
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
  await load()
}

const onVideoTitleCommit = async ({ videoId, title }: { videoId: string; title: string }) => {
  const row = videos.value.find((v) => v.id === videoId)
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

const onMaterialUpload = async (file: File) => {
  const lessonId = await ensureLesson()
  if (!lessonId) return
  const result = await adminService.uploadLessonFile(lessonId, file)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить файл' })
    return
  }
  notify({ type: 'success', message: 'Файл загружен' })
  await load()
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
  await load()
}

const onOpenTimecodeModal = () => {
  chaptersModalOpen.value = true
}

const onCloseChaptersModal = () => {
  chaptersModalOpen.value = false
}

const onSaveChapters = async (chapters: LessonChapter[]) => {
  const lessonId = await ensureLesson()
  if (!lessonId) return
  chaptersSaving.value = true
  const result = await adminService.updateLesson(lessonId, { chapters })
  chaptersSaving.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить тайм-коды' })
    return
  }
  lessonChapters.value = chapters
  chaptersModalOpen.value = false
  notify({ type: 'success', message: 'Тайм-коды сохранены' })
  await load()
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
  await load()
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
          v-model:videos="videos"
          :upload-progress-by-id="videoUploadProgressById"
          :deleting-video-id="deletingVideoId"
          @video-file-selected="onVideoFileSelected"
          @open-timecode-modal="onOpenTimecodeModal"
          @video-delete="onVideoDelete"
          @video-title-commit="onVideoTitleCommit"
        />

        <AdminTopicEditMaterialsSection
          v-model:files="materialFiles"
          :deleting-file-id="deletingFileId"
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
      :chapters="lessonChapters"
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
