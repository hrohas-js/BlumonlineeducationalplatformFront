<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { productsService } from '@/services/api/endpoints/products'
import { protectedContentService } from '@/services/api/endpoints/protected-content'
import { useNotification } from '@/composables/useNotification'
import type {
  ProductDetailResponse,
  ProductProgressResponse,
  LessonResponse,
  LessonWithProgress,
  ModuleProgressResponse,
} from '@/services/api/types'

const route = useRoute()
const router = useRouter()
const { notify } = useNotification()

const productId = computed<string>(() => String(route.params.productId))
const lessonIdParam = computed<string | null>(() => {
  const v = route.params.lessonId
  if (!v) return null
  return Array.isArray(v) ? v[0] : (v as string)
})

const product = ref<ProductDetailResponse | null>(null)
const progress = ref<ProductProgressResponse | null>(null)
const loading = ref<boolean>(false)
const completing = ref<boolean>(false)
const videoUrl = ref<string>('')
const videoError = ref<string>('')

type FlatLesson = LessonResponse & { moduleTitle: string; isCompleted: boolean }

const moduleProgressMap = computed<Record<string, LessonWithProgress>>(() => {
  const map: Record<string, LessonWithProgress> = {}
  if (!progress.value) return map
  for (const m of progress.value.modules) {
    for (const l of m.lessons) {
      map[l.id] = l
    }
  }
  return map
})

const flatLessons = computed<FlatLesson[]>(() => {
  if (!product.value) return []
  const out: FlatLesson[] = []
  for (const m of product.value.modules) {
    for (const l of m.lessons) {
      out.push({
        ...l,
        moduleTitle: m.title,
        isCompleted: moduleProgressMap.value[l.id]?.is_completed ?? false,
      })
    }
  }
  return out
})

const currentLesson = computed<FlatLesson | null>(() => {
  if (flatLessons.value.length === 0) return null
  if (lessonIdParam.value) {
    return flatLessons.value.find((l) => l.id === lessonIdParam.value) ?? flatLessons.value[0]
  }
  return flatLessons.value[0]
})

const completedCount = computed(() => progress.value?.completed_lessons ?? 0)
const totalCount = computed(() => progress.value?.total_lessons ?? flatLessons.value.length)
const progressPercent = computed(() => progress.value?.progress_percent ?? 0)

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

async function loadVideoForLesson(lesson: FlatLesson | null) {
  videoUrl.value = ''
  videoError.value = ''
  if (!lesson || !lesson.video_url) return

  // Если video_url выглядит как абсолютный URL — пробуем играть напрямую.
  if (/^https?:\/\//i.test(lesson.video_url)) {
    videoUrl.value = lesson.video_url
    return
  }

  // Иначе пытаемся получить подписанный URL через protected-content.
  const result = await protectedContentService.getSignedUrl(
    lesson.video_url,
    productId.value,
    60
  )
  if (result.success && result.data) {
    videoUrl.value = result.data.signed_url
    return
  }
  videoError.value = result.error || 'Не удалось получить ссылку на видео'
}

async function selectLesson(lessonId: string) {
  await router.push({ name: 'course-lesson', params: { productId: productId.value, lessonId } })
}

async function markCompleted() {
  if (!currentLesson.value) return
  completing.value = true
  const result = await productsService.completeLesson(currentLesson.value.id, {})
  completing.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось отметить урок' })
    return
  }
  notify({ type: 'success', message: 'Урок отмечен как пройденный' })
  // Перетягиваем прогресс
  const refreshed = await productsService.getProgress(productId.value)
  if (refreshed.success && refreshed.data) progress.value = refreshed.data
}

function goBack() {
  void router.push({ name: 'home-section', params: { section: 'learning' } })
}

function findLessonModuleProgress(moduleId: string): ModuleProgressResponse | undefined {
  return progress.value?.modules.find((m) => m.module_id === moduleId)
}

onMounted(loadProduct)

watch(currentLesson, (lesson) => {
  void loadVideoForLesson(lesson)
})
</script>

<template>
  <AppLayout>
    <section class="course">
      <div v-if="loading" class="course__loading">Загружаем курс…</div>

      <template v-else-if="product">
        <header class="course__header">
          <button type="button" class="course__back" @click="goBack">
            <span aria-hidden="true">←</span> К моим курсам
          </button>
          <h1 class="course__title">{{ product.title }}</h1>

          <div v-if="totalCount > 0" class="course__progress">
            <div class="course__progress-numbers">
              Пройдено уроков: {{ completedCount }} из {{ totalCount }}
            </div>
            <div class="course__progress-bar">
              <div
                class="course__progress-fill"
                :style="{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }"
              >
                <span class="course__progress-pct">{{ Math.round(progressPercent) }}%</span>
              </div>
            </div>
          </div>
        </header>

        <div class="course__layout">
          <aside class="course__sidebar" aria-label="Содержание курса">
            <div
              v-for="m in product.modules"
              :key="m.id"
              class="course__module"
            >
              <h3 class="course__module-title">{{ m.title }}</h3>
              <ul class="course__lessons">
                <li
                  v-for="l in m.lessons"
                  :key="l.id"
                  class="course__lesson"
                  :class="{
                    'course__lesson_active': l.id === currentLesson?.id,
                    'course__lesson_done': moduleProgressMap[l.id]?.is_completed,
                  }"
                  @click="selectLesson(l.id)"
                >
                  <span class="course__lesson-marker" aria-hidden="true">
                    {{ moduleProgressMap[l.id]?.is_completed ? '✓' : '•' }}
                  </span>
                  <span class="course__lesson-title">{{ l.title }}</span>
                </li>
              </ul>
              <div
                v-if="findLessonModuleProgress(m.id)"
                class="course__module-meta"
              >
                {{ findLessonModuleProgress(m.id)!.lessons.filter((x) => x.is_completed).length }}
                / {{ findLessonModuleProgress(m.id)!.lessons.length }} уроков пройдено
              </div>
            </div>
          </aside>

          <main class="course__main">
            <template v-if="currentLesson">
              <h2 class="course__lesson-heading">{{ currentLesson.title }}</h2>

              <div class="course__player">
                <video
                  v-if="videoUrl"
                  :src="videoUrl"
                  controls
                  controlslist="nodownload"
                  disablepictureinpicture
                  class="course__video"
                />
                <div v-else-if="videoError" class="course__video-error">{{ videoError }}</div>
                <div v-else-if="!currentLesson.video_url" class="course__video-empty">
                  В уроке нет видео.
                </div>
                <div v-else class="course__video-empty">Подгружаем видео…</div>
              </div>

              <p v-if="currentLesson.description" class="course__lesson-desc">
                {{ currentLesson.description }}
              </p>

              <section v-if="currentLesson.files.length" class="course__files">
                <h3 class="course__files-title">Файлы урока</h3>
                <ul class="course__files-list">
                  <li v-for="f in currentLesson.files" :key="f.id">
                    <a :href="f.file_url" target="_blank" rel="noopener noreferrer">
                      {{ f.file_name }}
                    </a>
                  </li>
                </ul>
              </section>

              <div class="course__actions">
                <button
                  type="button"
                  class="course__complete"
                  :disabled="completing || moduleProgressMap[currentLesson.id]?.is_completed"
                  @click="markCompleted"
                >
                  {{
                    moduleProgressMap[currentLesson.id]?.is_completed
                      ? 'Урок пройден'
                      : 'Отметить пройденным'
                  }}
                </button>
              </div>
            </template>

            <div v-else class="course__empty">
              В курсе пока нет уроков.
            </div>
          </main>
        </div>
      </template>

      <div v-else class="course__empty">Курс не найден.</div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.course {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-32);

  &__loading,
  &__empty {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-40) var(--sp-60);
    text-align: center;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    color: var(--osnovnoy-tekst);
  }

  &__header {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
  }

  &__back {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-20);
    }
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: var(--size-10);
  }

  &__progress-numbers {
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-13);
    color: var(--text-accent);
  }

  &__progress-bar {
    width: 100%;
    height: var(--size-20);
    background: var(--fon-bloka);
    border: var(--border-1) solid var(--divider);
    border-radius: var(--radius-check);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: var(--knopka);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 var(--sp-10);
    transition: width 0.3s ease;
  }

  &__progress-pct {
    font-family: var(--third-family);
    font-weight: var(--font-bold);
    font-size: var(--size-10);
    color: var(--white);
  }

  &__layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: var(--sp-32);
    align-items: start;

    @media (max-width: 1023px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-24);
    display: flex;
    flex-direction: column;
    gap: var(--sp-24);
    position: sticky;
    top: var(--sp-20);

    @media (max-width: 1023px) {
      position: static;
    }
  }

  &__module {
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__module-title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }

  &__module-meta {
    font-family: var(--second-family);
    font-weight: var(--font-regular);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    opacity: 0.6;
  }

  &__lessons {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  &__lesson {
    display: flex;
    align-items: flex-start;
    gap: var(--size-10);
    padding: var(--size-8) var(--size-10);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    transition: background-color 0.15s ease;

    &:hover {
      background: var(--input-bg);
    }

    &_active {
      background: rgba(23, 142, 240, 0.12);
      color: var(--text-accent);
    }

    &_done {
      .course__lesson-marker {
        color: var(--success);
      }
    }
  }

  &__lesson-marker {
    flex-shrink: 0;
    width: var(--size-18);
    text-align: center;
    color: var(--text-accent);
  }

  &__lesson-title {
    flex: 1;
    line-height: 1.3;
  }

  &__main {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);

    @media (max-width: 1023px) {
      padding: var(--sp-32) var(--sp-24);
    }
  }

  &__lesson-heading {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: var(--osnovnoy-tekst);
  }

  &__player {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: var(--osnovnoy-tekst);
    border-radius: var(--radius-10);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__video {
    width: 100%;
    height: 100%;
    display: block;
    background: var(--osnovnoy-tekst);
  }

  &__video-empty,
  &__video-error {
    color: var(--white);
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    padding: var(--sp-20);
    text-align: center;
  }

  &__video-error {
    color: var(--danger);
  }

  &__lesson-desc {
    margin: 0;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  &__files {
    display: flex;
    flex-direction: column;
    gap: var(--size-10);
  }

  &__files-title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }

  &__files-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-8);

    a {
      font-family: var(--second-family);
      font-weight: var(--font-medium);
      font-size: var(--size-15);
      color: var(--text-accent);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__complete {
    background: var(--knopka);
    color: var(--cvet-v-knopke);
    border: none;
    border-radius: var(--radius-10);
    padding: var(--sp-10) var(--sp-32);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--knopka) 92%, black);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
