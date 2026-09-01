<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import StudentProfileLayout from '@/components/layouts/StudentProfileLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import LearningProductBadge from '@/components/molecules/LearningProductBadge.vue'
import LearningCourseLessonHeader from '@/components/organisms/LearningCourseLessonHeader.vue'
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
const activeTopicId = ref<string | null>(null)

const learningDetail = computed<LearningCourseDetail | null>(() => {
  if (!product.value) return null
  return mapProductToLearningDetail(product.value, progress.value)
})

const selectedTopicId = computed<string | null>(() => {
  if (!lessonIdParam.value || !learningDetail.value) return null
  const topic = findTopicByLessonId(learningDetail.value, lessonIdParam.value, product.value)
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
  void router.push({
    name: 'course-lesson',
    params: { productId: productId.value, lessonId: firstVideo?.id ?? topicId },
  })
}

function onSelectTopic(topicId: string) {
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
  const lessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index)
  for (const lesson of lessons) {
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
})

watch(
  () => productId.value,
  () => {
    activeTopicId.value = null
    void loadProduct()
  },
)
</script>

<template>
  <AppLayout>
    <StudentProfileLayout active-section="learning">
      <div v-if="loading" class="home-profile__loading">Загружаем курс…</div>

      <article
        v-else-if="learningDetail"
        class="home-profile__panel home-profile__panel_learning"
        :class="{ 'home-profile__panel_learning_lesson': selectedTopicId }"
      >
        <button type="button" class="home-learning__back" @click="goBack">
          <span aria-hidden="true">←</span>
          {{ lessonIdParam ? 'К темам курса' : 'К моим курсам' }}
        </button>

        <LearningCourseLessonHeader
          v-if="selectedTopicId"
          :student-name="authStore.studentNameBadgeLabel"
          :course-title="learningDetail.title"
          :course-category="learningDetail.category"
          :completed-topics="learningDetail.completedTopics"
          :total-topics="learningDetail.totalTopics"
          :access-until="learningDetail.accessUntil"
          :progress-percent-override="learningDetail.progressPercentOverride"
        />

        <header v-else-if="isOverview" class="home-learning__header">
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
          :completing="completing"
          lesson-layout
          @next-topic="onNextTopic"
          @complete-topic="onCompleteTopic"
        />
      </article>

      <p v-else class="home-profile__empty">Курс не найден.</p>
    </StudentProfileLayout>
  </AppLayout>
</template>
