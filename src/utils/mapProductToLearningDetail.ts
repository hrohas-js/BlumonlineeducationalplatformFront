import type {
  LearningCourseCategory,
  LearningCourseDetail,
  LearningCourseTopic,
  LearningTopicSubsection,
  LearningTopicVideo,
} from '@/types/learning-course'
import type {
  LessonResponse,
  LessonSubsectionResponse,
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
    chapters: video.chapters ?? [],
    hasTimecode: (video.chapters?.length ?? 0) > 0,
    files: attachFiles ? lesson.files.map(mapFileResponseToLearningTopicFile) : [],
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

function sourceVideosForSubsection(
  lesson: LessonResponse,
  subsection: LessonSubsectionResponse,
): LessonVideoResponse[] {
  const nested = subsection.videos
  const source =
    nested != null
      ? nested
      : (lesson.videos ?? []).filter((video) => video.subsection_id === subsection.id)
  return uniqueVideosById(source).sort((a, b) => a.order_index - b.order_index)
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
        chapters: [],
        hasTimecode: false,
        files: lesson.files.map(mapFileResponseToLearningTopicFile),
      },
    ]
  }
  return sorted.map((video, index) =>
    lessonVideoToLearningVideo(video, lesson, isCompleted, index === 0, videoSrcByVideoId),
  )
}

function lessonToSubsections(
  lesson: LessonResponse,
  isCompleted: boolean,
  videoSrcByVideoId: Record<string, string>,
): LearningTopicSubsection[] {
  const subsections = [...(lesson.subsections ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  )
  return subsections.map((subsection) => ({
    id: subsection.id,
    title: subsection.title.trim() || 'Название подраздела',
    videos: sourceVideosForSubsection(lesson, subsection)
      .map((video) =>
        lessonVideoToLearningVideo(video, lesson, isCompleted, false, videoSrcByVideoId),
      )
      .filter((video) => Boolean(video.src?.trim())),
  }))
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

export function isProgressModuleCompleted(module: {
  passed?: boolean
  lessons?: { is_completed: boolean }[]
}): boolean {
  if (module.passed != null) return module.passed
  const lessons = module.lessons ?? []
  return lessons.length > 0 && lessons.every((lesson) => lesson.is_completed)
}

/** «Пройдено тем» — число модулей, а не completed_lessons. */
export function countProgressTopics(progress: ProductProgressResponse | null | undefined): {
  completedTopics: number
  totalTopics: number
} {
  const modules = progress?.modules ?? []
  if (modules.length > 0) {
    return {
      completedTopics: modules.filter((module) => isProgressModuleCompleted(module)).length,
      totalTopics: modules.length,
    }
  }
  return {
    completedTopics: progress?.completed_lessons ?? 0,
    totalTopics: progress?.total_lessons ?? 0,
  }
}

function moduleToTopic(
  module: ModuleResponse,
  progress: ProductProgressResponse | null,
  videoSrcByVideoId: Record<string, string>,
): LearningCourseTopic {
  const moduleProgress = progress?.modules.find((m) => m.module_id === module.id)
  const lessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index)

  return {
    id: module.id,
    title: formatTopicTitle(module.order_index, module.title),
    accessUntil: formatAccessUntil(progress?.deadline ?? null),
    isCompleted: moduleProgress
      ? isProgressModuleCompleted({
          passed: moduleProgress.passed,
          lessons:
            lessons.length > 0
              ? lessons.map((lesson) => ({
                  is_completed:
                    moduleProgress.lessons.find((item) => item.id === lesson.id)?.is_completed ?? false,
                }))
              : moduleProgress.lessons,
        })
      : false,
    ...splitModuleDescription(module.description),
    videos: lessons.flatMap((lesson) => {
      const lp = moduleProgress?.lessons.find((l) => l.id === lesson.id)
      return lessonToVideos(lesson, lp?.is_completed ?? false, videoSrcByVideoId)
    }),
    subsections: lessons.flatMap((lesson) => {
      const lp = moduleProgress?.lessons.find((l) => l.id === lesson.id)
      return lessonToSubsections(lesson, lp?.is_completed ?? false, videoSrcByVideoId)
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
    completedTopics: topics.filter((topic) => topic.isCompleted).length,
    totalTopics: topics.length > 0 ? topics.length : (progress?.total_lessons ?? 0),
    ...(progress != null ? { progressPercentOverride: progress.progress_percent } : {}),
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
