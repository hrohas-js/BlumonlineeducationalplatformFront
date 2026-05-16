import type { LearningCourseDetail } from '@/types/learning-course'

const CLOSED_CLUB_DESCRIPTION_LINES = [
  'Вся информация по курсам Вы можете найти 👉 Главная - DoktorBlum',
  'По возможности приобретения других вебинаров, курсов, сотрудничества - https://t.me/Dmitriy_Berezkin или +7 999 972-25-00 (Ват сап) Никита',
  '',
  'С уважением, команда @Dr_Blum 🚀',
]

const closedClubDetail: LearningCourseDetail = {
  id: 'course-closed-club',
  title: 'Закрытый клуб',
  category: 'courses',
  descriptionLines: CLOSED_CLUB_DESCRIPTION_LINES,
  completedTopics: 1,
  totalTopics: 5,
  progressPercentOverride: 5,
  accessUntil: '01.01.2027',
  topics: [
    {
      id: 'cc-t1',
      title: '1 тема: Стресс',
      accessUntil: '01.01.2026',
      isCompleted: true,
      materialsHtml:
        '<p>Материалы по теме «Стресс»: конспект лекции и дополнительные ссылки на исследования.</p>',
      videos: [
        {
          id: 'cc-t1-v1',
          title: 'Название видеофайла',
          progressPercent: 36,
          currentTimeLabel: '20:23',
          durationLabel: '56:23',
          hasTimecode: true,
        },
        {
          id: 'cc-t1-v2',
          title: 'Название видеофайла',
          progressPercent: 13,
          currentTimeLabel: '15:00',
          durationLabel: '01:52:23',
          hasTimecode: true,
        },
        {
          id: 'cc-t1-v3',
          title: 'Название видеофайла',
          progressPercent: 95,
          currentTimeLabel: '01:25:45',
          durationLabel: '01:30:30',
          hasTimecode: true,
        },
        {
          id: 'cc-t1-v4',
          title: 'Название видеофайла',
          progressPercent: 0,
          currentTimeLabel: '00:00',
          durationLabel: '56:23',
          hasTimecode: true,
        },
        {
          id: 'cc-t1-v5',
          title: 'Название видеофайла',
          progressPercent: 22,
          currentTimeLabel: '10:00',
          durationLabel: '45:00',
          hasTimecode: true,
        },
      ],
    },
    {
      id: 'cc-t2',
      title: '2 тема: ДСТ',
      accessUntil: '01.04.2026',
      isCompleted: false,
      videos: [
        {
          id: 'cc-t2-v1',
          title: 'Название видеофайла',
          progressPercent: 0,
          currentTimeLabel: '00:00',
          durationLabel: '45:00',
        },
      ],
    },
    {
      id: 'cc-t3',
      title: '3 тема: СД',
      accessUntil: '01.08.2026',
      isCompleted: false,
      videos: [
        {
          id: 'cc-t3-v1',
          title: 'Название видеофайла',
          progressPercent: 0,
          currentTimeLabel: '00:00',
          durationLabel: '40:00',
        },
      ],
    },
    {
      id: 'cc-t4',
      title: '4 тема: АИТ и ЩЖ',
      accessUntil: '01.12.2026',
      isCompleted: false,
      videos: [
        {
          id: 'cc-t4-v1',
          title: 'Название видеофайла',
          progressPercent: 0,
          currentTimeLabel: '00:00',
          durationLabel: '50:00',
        },
      ],
    },
  ],
}

const conferenceDetail: LearningCourseDetail = {
  id: 'other-conf-2023',
  title: 'Конференция 2023',
  category: 'other',
  descriptionLines: CLOSED_CLUB_DESCRIPTION_LINES,
  completedTopics: 1,
  totalTopics: 1,
  accessUntil: null,
  topics: [
    {
      id: 'conf-t1',
      title: 'Запись конференции',
      accessUntil: null,
      isCompleted: true,
      materialsHtml: '<p>Материалы конференции 2023: презентации спикеров.</p>',
      videos: [
        {
          id: 'conf-t1-v1',
          title: 'Название видеофайла',
          progressPercent: 24,
          currentTimeLabel: '50:01',
          durationLabel: '03:25:00',
          hasTimecode: true,
        },
      ],
    },
  ],
}

const conferenceTopicStudyDetail: LearningCourseDetail = {
  ...conferenceDetail,
  topics: [
    {
      id: 'conf-t1',
      title: 'Тема конференции: Как считать человека по лицу и внешним признакам',
      accessUntil: null,
      isCompleted: true,
      materialsHtml: '<p>Материалы конференции 2023: презентации спикеров.</p>',
      videos: conferenceDetail.topics[0]!.videos,
    },
  ],
}

const mockDetailsById: Record<string, LearningCourseDetail> = {
  'course-closed-club': closedClubDetail,
  'other-conf-2023': conferenceDetail,
}

export const MOCK_LEARNING_COURSE_IDS = ['course-closed-club', 'other-conf-2023'] as const

export function getMockLearningCourseDetail(courseId: string): LearningCourseDetail | null {
  return mockDetailsById[courseId] ?? null
}

export function getMockLearningCourseDetailForTopic(
  courseId: string,
  topicId: string,
): LearningCourseDetail | null {
  const base = getMockLearningCourseDetail(courseId)
  if (!base) return null

  if (courseId === 'other-conf-2023' && topicId === 'conf-t1') {
    return {
      ...conferenceTopicStudyDetail,
      completedTopics: base.completedTopics,
      totalTopics: base.totalTopics,
      accessUntil: base.accessUntil,
    }
  }

  if (courseId === 'course-closed-club') {
    return {
      ...base,
      progressPercentOverride: 20,
    }
  }

  return base
}

export function getMockLearningPanelCourses() {
  return [
    {
      id: closedClubDetail.id,
      title: closedClubDetail.title,
      description: '"Карманный справочник" по препаратам и их взаимодействиям',
      category: 'courses' as const,
      completedTopics: closedClubDetail.completedTopics,
      totalTopics: closedClubDetail.totalTopics,
      accessUntil: closedClubDetail.accessUntil,
    },
    {
      id: conferenceDetail.id,
      title: conferenceDetail.title,
      description: 'Запись конференции 2023 — полный доступ к материалам',
      category: 'other' as const,
      completedTopics: conferenceDetail.completedTopics,
      totalTopics: conferenceDetail.totalTopics,
      accessUntil: conferenceDetail.accessUntil,
    },
  ]
}
