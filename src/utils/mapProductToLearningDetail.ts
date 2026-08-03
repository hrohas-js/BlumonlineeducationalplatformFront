import type {
  LearningCourseCategory,
  LearningCourseDetail,
  LearningCourseTopic,
  LearningTopicVideo,
} from '@/types/learning-course'
import type {
  LessonResponse,
  LessonVideoResponse,
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

function lessonVideoToLearningVideo(
  video: LessonVideoResponse,
  lesson: LessonResponse,
  isCompleted: boolean,
  attachFiles: boolean,
  videoSrcByVideoId: Record<string, string>,
): LearningTopicVideo {
  const watchTime = 0
  const src = videoSrcByVideoId[video.id] ?? video.video_url ?? undefined
  return {
    id: video.id,
    title: video.title?.trim() || lesson.title,
    src: src?.trim() || undefined,
    progressPercent: isCompleted ? 100 : watchTime > 0 ? 10 : 0,
    currentTimeLabel: isCompleted ? formatWatchLabel(100) : '00:00',
    durationLabel: '—',
    hasTimecode: (lesson.chapters?.length ?? 0) > 0,
    files: attachFiles ? lesson.files.map(mapFileResponseToLearningTopicFile) : [],
  }
}

function lessonToVideos(
  lesson: LessonResponse,
  isCompleted: boolean,
  videoSrcByVideoId: Record<string, string>,
): LearningTopicVideo[] {
  const sorted = [...(lesson.videos ?? [])].sort((a, b) => a.order_index - b.order_index)
  if (sorted.length === 0) {
    return [
      {
        id: lesson.id,
        title: lesson.title,
        src: undefined,
        progressPercent: isCompleted ? 100 : 0,
        currentTimeLabel: isCompleted ? formatWatchLabel(100) : '00:00',
        durationLabel: '—',
        hasTimecode: (lesson.chapters?.length ?? 0) > 0,
        files: lesson.files.map(mapFileResponseToLearningTopicFile),
      },
    ]
  }
  return sorted.map((video, index) =>
    lessonVideoToLearningVideo(video, lesson, isCompleted, index === 0, videoSrcByVideoId),
  )
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
  videoSrcByVideoId: Record<string, string>,
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
    videos: lessons.flatMap((lesson) => {
      const lp = moduleProgress?.lessons.find((l) => l.id === lesson.id)
      return lessonToVideos(lesson, lp?.is_completed ?? false, videoSrcByVideoId)
    }),
  }
}

export function mapProductToLearningDetail(
  product: ProductDetailResponse,
  progress: ProductProgressResponse | null,
  videoSrcByVideoId: Record<string, string> = {},
): LearningCourseDetail {
  const topics = [...product.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => moduleToTopic(m, progress, videoSrcByVideoId))
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

/**
 * Route param historically named lessonId; in admin topics it is the module/topic id.
 * Also accepts a lesson id (finds the module that contains that lesson).
 */
export function findTopicByLessonId(
  detail: LearningCourseDetail,
  lessonOrTopicId: string,
  product?: ProductDetailResponse | null,
): LearningCourseTopic | null {
  const byTopicId = detail.topics.find((t) => t.id === lessonOrTopicId)
  if (byTopicId) return byTopicId

  if (product) {
    for (const mod of product.modules) {
      if (mod.lessons.some((l) => l.id === lessonOrTopicId)) {
        return detail.topics.find((t) => t.id === mod.id) ?? null
      }
    }
  }

  for (const topic of detail.topics) {
    if (topic.videos.some((v) => v.id === lessonOrTopicId)) {
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
