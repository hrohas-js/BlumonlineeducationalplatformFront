import type {
  LearningCourseCategory,
  LearningCourseDetail,
  LearningCourseTopic,
  LearningTopicVideo,
} from '@/types/learning-course'
import type {
  LessonResponse,
  ModuleResponse,
  ProductDetailResponse,
  ProductProgressResponse,
} from '@/services/api/types'
import { mapFileResponseToLearningTopicFile } from '@/utils/learningTopicFile'

function mapProductTypeToCategory(productType: string): LearningCourseCategory {
  const t = productType.toLowerCase()
  if (t.includes('project') || t.includes('проект')) return 'projects'
  if (t.includes('course') || t.includes('курс')) return 'courses'
  return 'other'
}

function formatAccessUntil(iso: string | null | undefined): string | null {
  if (!iso) return 'бессрочно'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('ru-RU')
}

function formatWatchLabel(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function lessonToVideo(
  lesson: LessonResponse,
  isCompleted: boolean,
  videoSrcByLessonId: Record<string, string>,
): LearningTopicVideo {
  const watchTime = 0
  const src = videoSrcByLessonId[lesson.id] ?? lesson.video_url ?? undefined
  return {
    id: lesson.id,
    title: lesson.title,
    src: src?.trim() || undefined,
    progressPercent: isCompleted ? 100 : watchTime > 0 ? 10 : 0,
    currentTimeLabel: isCompleted ? formatWatchLabel(100) : '00:00',
    durationLabel: '—',
    hasTimecode: Boolean(lesson.description),
    files: lesson.files.map(mapFileResponseToLearningTopicFile),
  }
}

function splitModuleDescription(
  desc: string | null,
): Pick<LearningCourseTopic, 'materialsHtml' | 'materialsText'> {
  if (!desc?.trim()) return {}
  const trimmed = desc.trim()
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return { materialsHtml: trimmed }
  }
  return { materialsText: trimmed }
}

function formatTopicTitle(orderIndex: number, title: string): string {
  const trimmed = title.trim()
  if (/^\d+\s*тема\s*:/i.test(trimmed)) {
    return trimmed
  }
  return `${orderIndex} тема: ${trimmed}`
}

function moduleToTopic(
  module: ModuleResponse,
  progress: ProductProgressResponse | null,
  videoSrcByLessonId: Record<string, string>,
): LearningCourseTopic {
  const moduleProgress = progress?.modules.find((m) => m.module_id === module.id)
  const lessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index)
  const completedCount = moduleProgress
    ? moduleProgress.lessons.filter((l) => l.is_completed).length
    : 0

  return {
    id: module.id,
    title: formatTopicTitle(module.order_index, module.title),
    accessUntil: formatAccessUntil(progress?.deadline ?? null),
    isCompleted: lessons.length > 0 && completedCount >= lessons.length,
    ...splitModuleDescription(module.description),
    videos: lessons.map((lesson) => {
      const lp = moduleProgress?.lessons.find((l) => l.id === lesson.id)
      return lessonToVideo(lesson, lp?.is_completed ?? false, videoSrcByLessonId)
    }),
  }
}

export function mapProductToLearningDetail(
  product: ProductDetailResponse,
  progress: ProductProgressResponse | null,
  videoSrcByLessonId: Record<string, string> = {},
): LearningCourseDetail {
  const topics = [...product.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => moduleToTopic(m, progress, videoSrcByLessonId))
  const description = product.description?.trim()
  const descriptionLines = description
    ? description.split('\n').filter((line) => line.length > 0)
    : []

  return {
    id: product.id,
    title: product.title,
    category: mapProductTypeToCategory(product.product_type),
    descriptionLines,
    completedTopics: progress?.completed_lessons ?? 0,
    totalTopics: progress?.total_lessons ?? topics.length,
    accessUntil: formatAccessUntil(progress?.deadline ?? null),
    topics,
  }
}

export function findTopicByLessonId(
  detail: LearningCourseDetail,
  lessonId: string,
): LearningCourseTopic | null {
  for (const topic of detail.topics) {
    if (topic.videos.some((v) => v.id === lessonId)) {
      return topic
    }
  }
  return null
}

export function getNextTopicId(detail: LearningCourseDetail, currentTopicId: string): string | null {
  const index = detail.topics.findIndex((t) => t.id === currentTopicId)
  if (index < 0 || index >= detail.topics.length - 1) return null
  return detail.topics[index + 1]!.id
}
