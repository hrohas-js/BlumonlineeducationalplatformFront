<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import HomeProfileMenu from '@/components/home/HomeProfileMenu.vue'
import HomeProfileAvatarPanel from '@/components/organisms/HomeProfileAvatarPanel.vue'
import LearningCourseCard from '@/components/organisms/LearningCourseCard.vue'
import LearningCourseCardDescription from '@/components/organisms/LearningCourseCardDescription.vue'
import LearningCourseCardFooter from '@/components/organisms/LearningCourseCardFooter.vue'
import LearningCourseCardHeader from '@/components/organisms/LearningCourseCardHeader.vue'
import LearningCourseCardProgress from '@/components/organisms/LearningCourseCardProgress.vue'
import ProfileDetailsForm from '@/components/organisms/ProfileDetailsForm.vue'
import HomeGlossaryPanel from '@/components/organisms/HomeGlossaryPanel.vue'
import type { ProfileSection } from '@/components/home/profile-menu.types'
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
const mockLearningCourses: LearningPanelCourse[] = [
  {
    id: 'course-1',
    title: 'Курс из 5 тем',
    description: '"Карманный справочник" по препаратам и их взаимодействиям',
    category: 'courses',
    completedTopics: 10,
    totalTopics: 100,
    accessUntil: '01.01.2027',
  },
  {
    id: 'project-1',
    title: 'Практический проект: разбор клинического случая',
    description: 'Серия заданий по сбору анамнеза и постановке предварительного диагноза',
    category: 'projects',
    completedTopics: 7,
    totalTopics: 20,
    accessUntil: null,
  },
  {
    id: 'other-1',
    title: 'Материалы для самоподготовки',
    description: 'Дополнительные лекции и чек-листы вне основной программы курса',
    category: 'other',
    completedTopics: 5,
    totalTopics: 8,
    accessUntil: '15.06.2026',
  },
]

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

/** Если real пуст — показываем мок (по запросу UX'а до прод-данных). */
const learningCourses = computed<LearningPanelCourse[]>(() =>
  realLearningCourses.value.length > 0 ? realLearningCourses.value : mockLearningCourses
)

const isMockData = computed(() => realLearningCourses.value.length === 0)

const materialsFilter = ref<LearningMaterialsFilter>('all')

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

async function performLogout() {
  await authStore.logout()
  productsStore.reset()
  await router.push({ name: 'login' })
}

const onLearningCourseClick = (courseId: string) => {
  // Mock-курс — нет реального продукта в API
  if (isMockData.value) {
    notify({
      type: 'info',
      message: 'Демо-данные: карточка станет интерактивной после подключения реальных курсов',
    })
    return
  }
  void router.push({ name: 'course', params: { productId: courseId } })
}

onMounted(loadCourses)

watch(
  () => route.params.section,
  (section) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (section === 'logout') {
      void performLogout()
    }
  },
)
</script>

<template>
  <AppLayout>
    <div class="home-profile">
      <section class="home-profile__content">
        <Transition name="home-profile-panel" mode="out-in">
          <article
            v-if="activeSection === 'profile'"
            key="profile"
            class="home-profile__panel home-profile__panel_profile"
          >
            <HomeProfileInfoTableItem :label="authStore.studentNameBadgeLabel" tone="#178ef0" is-student-name />
            <HomeProfileAvatarPanel />
            <ProfileDetailsForm />
          </article>

          <article
            v-else-if="activeSection === 'learning'"
            key="learning"
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
              <div class="home-profile__learning-filters" role="navigation" aria-label="Фильтр материалов">
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
                  class="home-learning__course-card"
                  @click="onLearningCourseClick(course.id)"
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
                    <LearningCourseCardFooter :access-label="accessLabel" />
                  </template>
                </LearningCourseCard>
              </div>
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

            <div class="home-profile__review-grid">
              <p class="home-profile__review-label">Рабочая почта</p>
              <a class="home-profile__review-mail-link" href="mailto:info@doktorblum.ru">info@doktorblum.ru</a>

              <p class="home-profile__review-label">Телеграм</p>
              <a class="home-profile__review-link home-profile__review-link_primary" href="#">Ссылка</a>

              <p class="home-profile__review-label">Нельзаграм*</p>
              <a class="home-profile__review-link home-profile__review-link_secondary" href="#">Ссылка</a>
            </div>

            <p class="home-profile__review-meta-note">(Meta* запрещена на территории РФ)</p>
          </article>

          <article v-else key="logout" class="home-profile__panel">
            <h1 class="home-profile__panel-title">Выходим из аккаунта…</h1>
            <p class="home-profile__panel-text">Завершаем сессию.</p>
          </article>
        </Transition>

        <button
          v-if="activeSection === 'profile'"
          type="button"
          class="home-profile__learning-cta"
          @click="goToLearningSection"
        >
          Приступить к изучению
        </button>
      </section>

      <div class="home-profile__menu">
        <HomeProfileMenu :active-section="activeSection" @select-section="setSection" />
      </div>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.home-profile {
  margin-top: var(--sp-40);
  display: flex;
  align-items: stretch;
  gap: var(--sp-32);

  @media (min-width: 1024px) {
    align-items: flex-start;
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    @media (max-width: 1024px) {
      flex-direction: column;
    }
  }

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--white);
    padding: var(--sp-40) var(--sp-60) var(--sp-38);

    @media (max-width: 1023px) {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    &_profile {
      display: flex;
      flex-direction: column;
      gap: var(--sp-20);
      width: 100%;
    }

    &_learning {
      display: flex;
      flex-direction: column;
      width: 100%;

      @media (min-width: 1024px) {
        max-width: var(--size-552);
      }
    }

    &_glossary {
      display: flex;
      flex-direction: column;
      gap: var(--sp-20);
      width: 100%;

      @media (min-width: 1024px) {
        max-width: var(--size-552);
      }
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
    gap: var(--sp-10);
    margin-top: var(--sp-40);

    @media (max-width: 1023px) {
      justify-content: center;
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

  &__review-grid {
    margin-top: var(--sp-40);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--sp-20);
    row-gap: var(--sp-20);
    align-items: center;
  }

  &__review-label {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &__review-mail-link {
    justify-self: end;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-decoration: none;

    @media (max-width: 1023px) {
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &__review-link {
    width: var(--size-180);
    height: var(--size-38);
    box-sizing: border-box;
    justify-self: end;
    border-radius: var(--radius-10);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--sp-10) var(--sp-60);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    text-align: center;
    text-decoration: none;

    @media (max-width: 1023px) {
      width: var(--size-132);
      height: var(--size-30);
      padding: var(--size-7) var(--size-40);
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }

    &_primary {
      background: var(--dopolnitelnyy-tekst);
      border: none;
      color: var(--fon-bloka);
    }

    &_secondary {
      border: var(--border-2) solid var(--dopolnitelnyy-tekst);
      background: var(--fon-bloka);
      color: var(--osnovnoy-tekst);
    }
  }

  &__review-meta-note {
    margin: var(--sp-40) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-regular);
    font-size: var(--size-15);
    text-align: center;
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      margin-top: var(--sp-20);
      font-size: clamp(
        var(--size-10),
        calc(
          var(--size-10) + (var(--size-15) - var(--size-10)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &__menu {
    @media (max-width: 1023px) {
      display: none;
    }
  }

  &__learning-cta {
    display: none;
    width: 100%;
    max-width: var(--size-294);
    margin: var(--sp-40) auto 0;

    border: none;
    border-radius: var(--radius-10);
    background: var(--dopolnitelnyy-tekst);
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
    text-align: center;
    color: var(--fon-bloka);
    cursor: pointer;

    @media (max-width: 1023px) {
      display: block;
    }
  }
}

.home-profile-panel-enter-active,
.home-profile-panel-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
  transform-origin: center top;
  will-change: transform, opacity;
}

.home-profile-panel-enter-from,
.home-profile-panel-leave-to {
  transform: scale(0.94) translateY(var(--sp-16));
  opacity: 0;
}

.home-profile-panel-enter-to,
.home-profile-panel-leave-from {
  transform: scale(1) translateY(0);
  opacity: var(--opacity-full);
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
  cursor: pointer;
}

@media (min-width: 1024px) {
  .home-profile {
    &__panel {
      &_profile {
        width: var(--size-460);
      }
    }
  }
}
</style>
