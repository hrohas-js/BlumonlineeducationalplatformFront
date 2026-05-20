<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import LearningProductBadge from '@/components/molecules/LearningProductBadge.vue'
import LearningCourseOverviewPanel from '@/components/organisms/LearningCourseOverviewPanel.vue'
import LearningTopicStudyPanel from '@/components/organisms/LearningTopicStudyPanel.vue'
import { productsService } from '@/services/api/endpoints/products'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import { findTopicByLessonId, mapProductToLearningDetail } from '@/utils/mapProductToLearningDetail'
import type { LearningCourseDetail } from '@/types/learning-course'
import type { ProductDetailResponse, ProductProgressResponse } from '@/services/api/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notify } = useNotification()

const productId = computed<string>(() => String(route.params.productId))
const lessonIdParam = computed<string | null>(() => {
  const v = route.params.lessonId
  if (!v) return null
  return Array.isArray(v) ? v[0] : (v as string)
})

const product = ref<ProductDetailResponse | null>(null)
const progress = ref<ProductProgressResponse | null>(null)
const loading = ref(false)
const completing = ref(false)
const videoSrcByLessonId = ref<Record<string, string>>({})
const videoLoadingByLessonId = ref<Record<string, boolean>>({})
const videoErrorByLessonId = ref<Record<string, string>>({})
const activeTopicId = ref<string | null>(null)

const learningDetail = computed<LearningCourseDetail | null>(() => {
  if (!product.value) return null
  return mapProductToLearningDetail(product.value, progress.value, videoSrcByLessonId.value)
})

const selectedTopicId = computed<string | null>(() => {
  if (!lessonIdParam.value || !learningDetail.value) return null
  const topic = findTopicByLessonId(learningDetail.value, lessonIdParam.value)
  return topic?.id ?? null
})

const isOverview = computed(() => !lessonIdParam.value)

async function loadProduct() {
  loading.value = true
  const [detailResult, progressResult] = await Promise.all([
    productsService.getById(productId.value),
    productsService.getProgress(productId.value),
  ])

  if (detailResult.success && detailResult.data) {
    product.value = detailResult.data
  } else {
    notify({ type: 'error', message: detailResult.error || 'Не удалось загрузить курс' })
  }

  if (progressResult.success && progressResult.data) {
    progress.value = progressResult.data
  }

  loading.value = false
}

async function loadVideoForLesson(lessonId: string, videoUrl: string | null | undefined) {
  if (!videoUrl?.trim()) return
  if (videoSrcByLessonId.value[lessonId]) return

  videoLoadingByLessonId.value = { ...videoLoadingByLessonId.value, [lessonId]: true }
  videoErrorByLessonId.value = { ...videoErrorByLessonId.value, [lessonId]: '' }
  videoSrcByLessonId.value = { ...videoSrcByLessonId.value, [lessonId]: videoUrl.trim() }
  videoLoadingByLessonId.value = { ...videoLoadingByLessonId.value, [lessonId]: false }
}

async function loadVideosForTopic(topicId: string | null) {
  if (!topicId || !product.value) return
  const module = product.value.modules.find((m) => m.id === topicId)
  if (!module) return
  await Promise.all(module.lessons.map((lesson) => loadVideoForLesson(lesson.id, lesson.video_url)))
}

function goBack() {
  if (lessonIdParam.value) {
    void router.push({ name: 'course', params: { productId: productId.value } })
    return
  }
  activeTopicId.value = null
  void router.push({ name: 'home-section', params: { section: 'learning' } })
}

function openTopicLesson(topicId: string) {
  activeTopicId.value = topicId
  const topic = learningDetail.value?.topics.find((t) => t.id === topicId)
  const firstVideo = topic?.videos[0]
  if (!firstVideo) return
  void router.push({
    name: 'course-lesson',
    params: { productId: productId.value, lessonId: firstVideo.id },
  })
}

function onSelectTopic(topicId: string) {
  if (isOverview.value && activeTopicId.value !== topicId) {
    activeTopicId.value = topicId
    return
  }
  openTopicLesson(topicId)
}

function onNextTopic(topicId: string) {
  openTopicLesson(topicId)
}

async function onCompleteTopic(topicId: string, completed: boolean) {
  if (!product.value || !completed) return
  const module = product.value.modules.find((m) => m.id === topicId)
  if (!module) return

  completing.value = true
  for (const lesson of module.lessons) {
    const lp = progress.value?.modules
      .find((m) => m.module_id === topicId)
      ?.lessons.find((l) => l.id === lesson.id)
    if (lp?.is_completed) continue

    const result = await productsService.completeLesson(lesson.id, {})
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось отметить урок' })
      completing.value = false
      return
    }
  }

  const refreshed = await productsService.getProgress(productId.value)
  if (refreshed.success && refreshed.data) {
    progress.value = refreshed.data
  }
  notify({ type: 'success', message: 'Тема отмечена как изученная' })
  completing.value = false
}

onMounted(loadProduct)

watch(selectedTopicId, (topicId) => {
  if (topicId) {
    activeTopicId.value = topicId
  }
  void loadVideosForTopic(topicId)
})

watch(
  () => productId.value,
  () => {
    activeTopicId.value = null
    videoSrcByLessonId.value = {}
    videoLoadingByLessonId.value = {}
    videoErrorByLessonId.value = {}
    void loadProduct()
  },
)
</script>

<template>
  <AppLayout>
    <section class="course-page">
      <div v-if="loading" class="course-page__loading">Загружаем курс…</div>

      <template v-else-if="learningDetail">
        <button type="button" class="course-page__back" @click="goBack">
          <span aria-hidden="true">←</span>
          {{ lessonIdParam ? 'К темам курса' : 'К моим курсам' }}
        </button>

        <header class="course-page__header">
          <HomeProfileInfoTableItem
            :label="authStore.studentNameBadgeLabel"
            tone="#178ef0"
            is-student-name
          />
          <LearningProductBadge
            :title="learningDetail.title"
            :category="learningDetail.category"
          />
        </header>

        <LearningCourseOverviewPanel
          v-if="isOverview"
          :course="learningDetail"
          :active-topic-id="activeTopicId"
          @select-topic="onSelectTopic"
        />

        <LearningTopicStudyPanel
          v-else-if="selectedTopicId"
          :course="learningDetail"
          :selected-topic-id="selectedTopicId"
          :video-loading-by-id="videoLoadingByLessonId"
          :video-error-by-id="videoErrorByLessonId"
          :completing="completing"
          @next-topic="onNextTopic"
          @complete-topic="onCompleteTopic"
        />
      </template>

      <p v-else class="course-page__empty">Курс не найден.</p>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.course-page {
  margin-top: var(--sp-40);
  max-width: var(--size-604);
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__loading,
  &__empty {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-40);
    text-align: center;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    color: var(--osnovnoy-tekst);
  }

  &__back {
    align-self: flex-start;
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--dopolnitelnyy-tekst);

    &:hover {
      text-decoration: underline;
    }
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-20);
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);

    @media (max-width: 1023px) {
      padding: var(--sp-20);
    }
  }
}
</style>
