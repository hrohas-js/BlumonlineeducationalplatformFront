<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminLabeledControlRow from '@/components/molecules/AdminLabeledControlRow.vue'
import AdminTopicEditMaterialsSection from '@/components/organisms/AdminTopicEditMaterialsSection.vue'
import AdminTopicEditVideosSection from '@/components/organisms/AdminTopicEditVideosSection.vue'
import type { AdminTopicEditMaterialFileMock, AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'
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
const loading = ref(true)
const saving = ref(false)
const primaryLessonId = ref<string | null>(null)

const productDetail = computed(() => adminStore.productDetails[productId.value] ?? null)

const moduleData = computed(() =>
  productDetail.value?.modules.find((m) => m.id === topicId.value) ?? null,
)

function mapFilesFromLesson() {
  const mod = moduleData.value
  if (!mod || mod.lessons.length === 0) {
    materialFiles.value = []
    videos.value = [{ id: 'v1', title: 'Видео 1', timecodeEnabled: false, videoSrc: '' }]
    primaryLessonId.value = null
    return
  }
  const lesson = [...mod.lessons].sort((a, b) => a.order_index - b.order_index)[0]
  primaryLessonId.value = lesson.id
  lessonTitle.value = mod.title
  materialFiles.value = lesson.files.map((f) => ({
    id: f.id,
    fileName: f.file_name,
  }))
  videos.value = [
    {
      id: lesson.id,
      title: lesson.title,
      timecodeEnabled: false,
      videoSrc: lesson.video_url ?? '',
      fileName: lesson.video_url ? 'video' : undefined,
    },
  ]
}

async function load() {
  if (!isAdminMaterialSectionId(sectionId.value)) {
    void router.replace({ name: 'admin' })
    return
  }
  loading.value = true
  const result = await adminStore.fetchProductDetail(productId.value)
  loading.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить курс' })
    void router.replace({ name: 'admin' })
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
    { label: `Папка «${sectionTitle.value}»`, to: { name: 'admin' as const } },
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

const onVideoFileSelected = async ({ file }: { videoId: string; file: File }) => {
  const lessonId = await ensureLesson()
  if (!lessonId) return
  const result = await adminService.uploadLessonVideo(lessonId, file)
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить видео' })
    return
  }
  notify({ type: 'success', message: 'Видео загружено' })
  await load()
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

const onAddVideo = () => {
  videos.value = [
    ...videos.value,
    {
      id: crypto.randomUUID(),
      title: `Видео ${videos.value.length + 1}`,
      timecodeEnabled: false,
      videoSrc: '',
    },
  ]
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

        <AdminLabeledControlRow v-model="lessonTitle" label="Название темы:" control-type="input" />

        <AdminTopicEditVideosSection
          v-model:videos="videos"
          @add-video="onAddVideo"
          @video-file-selected="onVideoFileSelected"
        />

        <AdminTopicEditMaterialsSection v-model:files="materialFiles" @material-upload="onMaterialUpload" />

        <div class="admin-material-product-topic-edit-page__actions">
          <button type="button" class="admin-material-product-topic-edit-page__back" @click="goBackToProduct">
            Назад
          </button>
          <button
            type="button"
            class="admin-material-product-topic-edit-page__save"
            :disabled="saving"
            @click="onSave"
          >
            {{ saving ? 'Сохраняем…' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </section>
    <p v-else-if="loading" class="admin-material-product-topic-edit-page__loading">Загружаем…</p>
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

  &__back,
  &__save {
    font-family: var(--font-family);
    font-size: var(--size-15);
    cursor: pointer;
    border: none;
    background: none;
    color: var(--text-accent);
  }

  &__save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
