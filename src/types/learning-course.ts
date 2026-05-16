export type LearningCourseCategory = 'courses' | 'projects' | 'other'

export interface LearningTopicVideo {
  id: string
  title: string
  src?: string
  poster?: string
  progressPercent?: number
  currentTimeLabel?: string
  durationLabel?: string
  hasTimecode?: boolean
}

export interface LearningCourseTopic {
  id: string
  title: string
  accessUntil: string | null
  isCompleted: boolean
  videos: LearningTopicVideo[]
  materialsHtml?: string
}

export interface LearningCourseDetail {
  id: string
  title: string
  category: LearningCourseCategory
  descriptionLines: string[]
  completedTopics: number
  totalTopics: number
  /** Если задан — подпись «Пройдено тем» берётся из счётчиков, а полоска — из этого значения. */
  progressPercentOverride?: number
  accessUntil: string | null
  topics: LearningCourseTopic[]
}

export type LearningViewMode = 'list' | 'course' | 'topic'
