<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import StudentProfileLayout from '@/components/layouts/StudentProfileLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import HomeProfileAvatarPanel from '@/components/organisms/HomeProfileAvatarPanel.vue'
import LearningCourseCard from '@/components/organisms/LearningCourseCard.vue'
import LearningCourseCardDescription from '@/components/organisms/LearningCourseCardDescription.vue'
import LearningCourseCardFooter from '@/components/organisms/LearningCourseCardFooter.vue'
import LearningCourseCardHeader from '@/components/organisms/LearningCourseCardHeader.vue'
import LearningCourseCardProgress from '@/components/organisms/LearningCourseCardProgress.vue'
import LearningCourseOverviewPanel from '@/components/organisms/LearningCourseOverviewPanel.vue'
import LearningTopicStudyPanel from '@/components/organisms/LearningTopicStudyPanel.vue'
import LearningProductBadge from '@/components/molecules/LearningProductBadge.vue'
import ProfileDetailsForm from '@/components/organisms/ProfileDetailsForm.vue'
import HomeGlossaryPanel from '@/components/organisms/HomeGlossaryPanel.vue'
import SupportContactsGrid from '@/components/molecules/SupportContactsGrid.vue'
import type { ProfileSection } from '@/components/home/profile-menu.types'
import type { LearningCourseDetail, LearningViewMode } from '@/types/learning-course'
import {
  getMockLearningCourseDetail,
  getMockLearningCourseDetailForTopic,
  getMockLearningPanelCourses,
} from '@/utils/learningCourseMock'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { usePaymentsStore } from '@/stores/payments'
import { useNotification } from '@/composables/useNotification'
import type { ProductResponse } from '@/services/api/types'

const route = useRoute()
const router = useRouter()

type LearningMaterialsFilter = 'all' | 'courses' | 'projects' | 'other'

type LearningPanelCourse = {
  id: string
  title: string
  description: string
  category: 'courses' | 'projects' | 'other'
  completedTopics: number
  totalTopics: number
  accessUntil?: string | null
}

const learningFilterTabs: { key: LearningMaterialsFilter; label: string; tone: '#178ef0' | '#0098a3' | '#b842ef' }[] = [
  { key: 'all', label: 'Все материалы', tone: '#178ef0' },
  { key: 'courses', label: 'Курсы', tone: '#178ef0' },
  { key: 'projects', label: 'Проекты', tone: '#0098a3' },
  { key: 'other', label: 'Иное', tone: '#b842ef' },
]

const authStore = useAuthStore()
const productsStore = useProductsStore()
const paymentsStore = usePaymentsStore()
const { notify } = useNotification()
const activeSection = computed(() => route.params.section as ProfileSection)

/** Фолбэк-данные, если my-courses пуст или API недоступен. */
const mockLearningCourses: LearningPanelCourse[] = getMockLearningPanelCourses()

function mapProductTypeToCategory(productType: string): 'courses' | 'projects' | 'other' {
  const t = productType.toLowerCase()
  if (t.includes('project') || t.includes('проект')) return 'projects'
  if (t.includes('course') || t.includes('курс')) return 'courses'
  return 'other'
}

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('ru-RU')
}

function toLearningPanelCourse(p: ProductResponse): LearningPanelCourse {
  const progress = productsStore.progressByProductId[p.id]
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? '',
    category: mapProductTypeToCategory(p.product_type),
    completedTopics: progress?.completed_lessons ?? 0,
    totalTopics: progress?.total_lessons ?? 0,
    accessUntil: formatDeadline(progress?.deadline ?? null),
  }
}

const realLearningCourses = computed<LearningPanelCourse[]>(() =>
  productsStore.myCourses.map(toLearningPanelCourse)
)

/** В dev при пустом API — демо-курсы; в production только реальные данные. */
const learningCourses = computed<LearningPanelCourse[]>(() => {
  if (realLearningCourses.value.length > 0) return realLearningCourses.value
  if (import.meta.env.DEV) return mockLearningCourses
  return []
})

const isMockData = computed(
  () => import.meta.env.DEV && realLearningCourses.value.length === 0 && mockLearningCourses.length > 0,
)

const materialsFilter = ref<LearningMaterialsFilter>('all')

const learningView = ref<LearningViewMode>('list')
const selectedCourseId = ref<string | null>(null)
const selectedTopicId = ref<string | null>(null)
const activeTopicId = ref<string | null>(null)
const selectedCourseDetail = ref<LearningCourseDetail | null>(null)

const showLearningCourseHeader = computed(
  () => learningView.value === 'course' || learningView.value === 'topic',
)

const filteredLearningCourses = computed(() => {
  if (materialsFilter.value === 'all') {
    return learningCourses.value
  }
  return learningCourses.value.filter((c) => c.category === materialsFilter.value)
})

const hasLearningCourses = computed(() => learningCourses.value.length > 0)

const setSection = (section: ProfileSection) => {
  void router.push({ name: 'home-section', params: { section } })
}

const goToLearningSection = () => {
  setSection('learning')
}

const onRenewalPaymentClick = async (courseId: string) => {
  // Mock-курс — нет реального product_id под Robokassa, отлуп
  if (isMockData.value) {
    notify({
      type: 'info',
      message: 'Демо-данные: оплата будет доступна когда подключим реальные курсы',
    })
    return
  }
  const result = await paymentsStore.renew(courseId)
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось создать платёж' })
    return
  }
  window.location.assign(result.data.payment_url)
}

async function loadCourses() {
  const result = await productsStore.fetchMyCourses()
  if (!result.success) {
    // Не шумим уведомлением — просто оставим mock
    console.warn('[home] fetchMyCourses failed, falling back to mock:', result.error)
    return
  }
  void productsStore.fetchAllProgress()
}

watch(
  () => route.query.admin_denied,
  (denied) => {
    if (denied !== '1') return
    notify({
      type: 'warning',
      message:
        'Нет доступа к админке: нужна учётная запись с role=admin. В npm run dev доступ включён автоматически — перезапустите dev-сервер.',
    })
    const { admin_denied: _removed, ...restQuery } = route.query
    void router.replace({ query: restQuery })
  },
  { immediate: true },
)


function resetLearningDrillDown() {
  learningView.value = 'list'
  selectedCourseId.value = null
  selectedTopicId.value = null
  activeTopicId.value = null
  selectedCourseDetail.value = null
}

const onStudyClick = (courseId: string) => {
  if (isMockData.value) {
    const detail = getMockLearningCourseDetail(courseId)
    if (!detail) {
      notify({ type: 'info', message: 'Демо-курс не найден' })
      return
    }
    selectedCourseId.value = courseId
    selectedTopicId.value = null
    activeTopicId.value = null
    selectedCourseDetail.value = detail
    learningView.value = 'course'
    return
  }
  void router.push({ name: 'course', params: { productId: courseId } })
}

function openTopicStudy(topicId: string) {
  if (!selectedCourseId.value) return
  activeTopicId.value = topicId
  const detail = getMockLearningCourseDetailForTopic(selectedCourseId.value, topicId)
  if (!detail) return
  selectedTopicId.value = topicId
  selectedCourseDetail.value = detail
  learningView.value = 'topic'
}

const onLearningTopicSelect = (topicId: string) => {
  if (!selectedCourseId.value) return
  openTopicStudy(topicId)
}

const onLearningNextTopic = (topicId: string) => {
  openTopicStudy(topicId)
}

const onLearningBack = () => {
  if (learningView.value === 'topic' && selectedCourseId.value) {
    const detail = getMockLearningCourseDetail(selectedCourseId.value)
    if (detail) {
      selectedCourseDetail.value = detail
      selectedTopicId.value = null
      learningView.value = 'course'
      return
    }
  }
  resetLearningDrillDown()
}

const onLearningTopicComplete = (topicId: string, completed: boolean) => {
  if (!selectedCourseDetail.value) return
  const topic = selectedCourseDetail.value.topics.find((t) => t.id === topicId)
  if (topic) {
    topic.isCompleted = completed
  }
}

onMounted(() => {
  void loadCourses()
})

watch(
  () => route.params.section,
  (section) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (section !== 'learning') {
      resetLearningDrillDown()
    }
    if (section === 'learning') {
      void loadCourses()
    }
  },
)
</script>

<template>
  <AppLayout>
    <StudentProfileLayout :active-section="activeSection">
        <Transition name="home-profile-panel" mode="out-in">
          <article
            v-if="activeSection === 'profile'"
            key="profile"
            class="home-profile__panel home-profile__panel_profile"
          >
            <HomeProfileInfoTableItem :label="authStore.studentNameBadgeLabel" tone="#178ef0" is-student-name />
            <RouterLink
              v-if="authStore.hasAdminRole"
              :to="{ name: 'admin' }"
              class="home-profile__admin-link"
            >
              Админка →
            </RouterLink>
            <HomeProfileAvatarPanel :avatar-url="authStore.user?.avatar_url ?? null" />
            <ProfileDetailsForm />
          </article>

          <article
            v-else-if="activeSection === 'learning'"
            key="learning"
            class="home-profile__panel home-profile__panel_learning"
          >
            <HomeProfileInfoTableItem
              v-if="learningView === 'list'"
              :label="authStore.studentNameBadgeLabel"
              tone="#178ef0"
              is-student-name
            />

            <template v-if="!hasLearningCourses">
              <div class="home-profile__learning-empty">
                <p class="home-profile__learning-empty-text">
                  Здесь пока пусто, впрочем есть
                  <span class="home-profile__learning-empty-accent">одна мысль</span>
                </p>
              </div>
            </template>

            <template v-else>
              <button
                v-if="learningView !== 'list'"
                type="button"
                class="home-learning__back"
                @click="onLearningBack"
              >
                ← Назад
              </button>

              <header
                v-if="showLearningCourseHeader && selectedCourseDetail"
                class="home-learning__header"
              >
                <HomeProfileInfoTableItem
                  :label="authStore.studentNameBadgeLabel"
                  tone="#178ef0"
                  is-student-name
                />
                <LearningProductBadge
                  :title="selectedCourseDetail.title"
                  :category="selectedCourseDetail.category"
                />
              </header>

              <div
                v-if="learningView === 'list'"
                class="home-profile__learning-filters"
                role="navigation"
                aria-label="Фильтр материалов"
              >
                <HomeProfileInfoTableItem
                  v-for="tab in learningFilterTabs"
                  :key="tab.key"
                  :label="tab.label"
                  :tone="tab.tone"
                  :is-active="materialsFilter === tab.key"
                  @click="materialsFilter = tab.key"
                />
              </div>

              <div v-if="learningView === 'list'" class="home-learning__courses">
                <LearningCourseCard
                  v-for="course in filteredLearningCourses"
                  :key="course.id"
                  :title="course.title"
                  :description="course.description"
                  :category="course.category"
                  :completed-topics="course.completedTopics"
                  :total-topics="course.totalTopics"
                  :access-until="course.accessUntil"
                  class="home-learning__course-card"
                >
                  <template #header="{ title, category, categoryLabel }">
                    <LearningCourseCardHeader :title="title" :category="category" :category-label="categoryLabel" />
                  </template>

                  <template #description="{ description }">
                    <LearningCourseCardDescription :description="description" />
                  </template>

                  <template #progress="{ completedTopics, totalTopics, progressPercent }">
                    <LearningCourseCardProgress
                      :completed-topics="completedTopics"
                      :total-topics="totalTopics"
                      :progress-percent="progressPercent"
                    />
                  </template>

                  <template #footer="{ accessLabel }">
                    <LearningCourseCardFooter
                      :access-label="accessLabel"
                      @button-click="onStudyClick(course.id)"
                    />
                  </template>
                </LearningCourseCard>
              </div>

              <LearningCourseOverviewPanel
                v-else-if="learningView === 'course' && selectedCourseDetail"
                :course="selectedCourseDetail"
                :active-topic-id="activeTopicId"
                @select-topic="onLearningTopicSelect"
              />

              <LearningTopicStudyPanel
                v-else-if="learningView === 'topic' && selectedCourseDetail && selectedTopicId"
                :course="selectedCourseDetail"
                :selected-topic-id="selectedTopicId"
                @next-topic="onLearningNextTopic"
                @complete-topic="onLearningTopicComplete"
              />
            </template>
          </article>

          <article
            v-else-if="activeSection === 'glossary'"
            key="glossary"
            class="home-profile__panel home-profile__panel_glossary"
          >
            <HomeProfileInfoTableItem :label="authStore.studentNameBadgeLabel" tone="#178ef0" is-student-name />
            <HomeGlossaryPanel />
          </article>

          <article
            v-else-if="activeSection === 'renewal'"
            key="renewal"
            class="home-profile__panel home-profile__panel_learning"
          >
            <HomeProfileInfoTableItem :label="authStore.studentNameBadgeLabel" tone="#178ef0" is-student-name />

            <template v-if="!hasLearningCourses">
              <div class="home-profile__learning-empty">
                <p class="home-profile__learning-empty-text">
                  Здесь пока пусто, впрочем есть
                  <span class="home-profile__learning-empty-accent">одна мысль</span>
                </p>
              </div>
            </template>

            <template v-else>
              <div class="home-profile__learning-filters" role="navigation" aria-label="Фильтр курсов для продления">
                <HomeProfileInfoTableItem
                  v-for="tab in learningFilterTabs"
                  :key="tab.key"
                  :label="tab.label"
                  :tone="tab.tone"
                  :is-active="materialsFilter === tab.key"
                  @click="materialsFilter = tab.key"
                />
              </div>

              <div class="home-learning__courses">
                <LearningCourseCard
                  v-for="course in filteredLearningCourses"
                  :key="course.id"
                  :title="course.title"
                  :description="course.description"
                  :category="course.category"
                  :completed-topics="course.completedTopics"
                  :total-topics="course.totalTopics"
                  :access-until="course.accessUntil"
                  :show-progress="false"
                >
                  <template #header="{ title, category, categoryLabel }">
                    <LearningCourseCardHeader :title="title" :category="category" :category-label="categoryLabel" />
                  </template>

                  <template #description="{ description }">
                    <LearningCourseCardDescription :description="description" />
                  </template>

                  <template #footer>
                    <LearningCourseCardFooter
                      class="learning-course-card-footer_renewal"
                      :show-access="false"
                      button-label="Перейти к оплате"
                      @button-click="onRenewalPaymentClick(course.id)"
                    />
                  </template>
                </LearningCourseCard>
              </div>
            </template>
          </article>

          <article v-else-if="activeSection === 'review'" key="review" class="home-profile__panel">
            <HomeProfileInfoTableItem :label="authStore.studentNameBadgeLabel" tone="#178ef0" is-student-name />

            <h2 class="home-profile__review-title">Нам важно Ваше мнение:</h2>

            <SupportContactsGrid />
          </article>
        </Transition>

        <BaseButton
          v-if="activeSection === 'profile'"
          class="home-profile__learning-cta"
          variant="primary"
          size="medium"
          shape="rounded"
          text="Приступить к изучению"
          @click="goToLearningSection"
        />
    </StudentProfileLayout>
  </AppLayout>
</template>

<style lang="scss" scoped>
.home-profile {
  &__admin-link {
    align-self: flex-start;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__learning-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;

    &-text {
      margin: 0;
      font-family: var(--font-family);
      font-weight: var(--font-light);
      font-size: clamp(
        var(--fs-15),
        calc(
          var(--fs-15) + (var(--size-20) - var(--fs-15)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-20)
      );
      text-align: center;
      color: var(--osnovnoy-tekst);
    }

    &-accent {
      font-weight: var(--font-semi-bold);
    }
  }

  &__learning-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-20);
    margin-top: var(--sp-40);

    @media (max-width: 1023px) {
      justify-content: center;
      :deep(.home-profile-info-table-item) {
        display: flex;
        margin-left: unset;
        margin-right: unset;
        &:nth-child(odd) {
          justify-content: flex-end;
        }
        &:nth-child(even) {
          justify-content: flex-start;
        }
      }
    }

    button {
      border-radius: var(--radius-xl);
    }
  }

  &__panel-title {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-35);
    color: var(--black);
    margin: 0;
  }

  &__panel-text {
    margin: var(--sp-20) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    color: var(--black);
  }

  &__review-title {
    margin: var(--sp-40) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-20);
    text-align: center;
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-weight: var(--font-semi-bold);
      font-size: clamp(
        var(--size-15),
        calc(
          var(--size-15) + (var(--size-20) - var(--size-15)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-20)
      );
    }
  }

  &__learning-cta {
    display: none;
    width: 100%;
    max-width: var(--size-294);
    margin: var(--sp-40) auto 0;

    @media (max-width: 1023px) {
      display: inline-flex;
    }
  }

  :deep(.home-profile__learning-cta.base-button_primary) {
    height: auto;
    padding: var(--sp-12) var(--sp-20);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: clamp(
      var(--fs-15),
      calc(
        var(--fs-15) + (var(--fs-18) - var(--fs-15)) *
          ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
      ),
      var(--fs-18)
    );
    color: var(--fon-bloka);
  }
}

.home-learning__courses {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-40);

  @media (max-width: 1023px) {
    margin-top: var(--sp-20);
  }
}

.home-learning__course-card {
  cursor: default;
}
</style>
