import {
  ADMIN_MATERIAL_SECTION_LIST,
  ADMIN_STUDENTS_SCOPE_ALL,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'

export interface AdminStudentRow {
  id: string
  name: string
  email: string
  productsCount: number
  avatarUrl?: string | null
}

const STUDENT_TEMPLATES: Omit<AdminStudentRow, 'id'>[] = [
  { name: 'Даша', email: 'mail-@mail.ru', productsCount: 3, avatarUrl: null },
  { name: 'Иван Петров', email: 'ivan@example.com', productsCount: 2, avatarUrl: null },
  { name: 'Мария Сидорова', email: 'maria.s@mail.ru', productsCount: 4, avatarUrl: null },
  { name: 'Алексей Козлов', email: 'alex.kozlov@test.org', productsCount: 10, avatarUrl: null },
  { name: 'Елена Волкова', email: 'elena.v@mail.ru', productsCount: 1, avatarUrl: null },
  { name: 'Дмитрий Новиков', email: 'd.novikov@example.com', productsCount: 22, avatarUrl: null },
  { name: 'Ольга Морозова', email: 'olga.m@mail.ru', productsCount: 5, avatarUrl: null },
  { name: 'Сергей Лебедев', email: 'sergey.l@mail.ru', productsCount: 2, avatarUrl: null },
]

export function mockStudentsForAdminSection(sectionId: AdminMaterialSectionId): AdminStudentRow[] {
  const offset = sectionId === 'courses' ? 0 : sectionId === 'projects' ? 1 : sectionId === 'other' ? 2 : 3
  return STUDENT_TEMPLATES.map((row, i) => ({
    ...row,
    id: `${sectionId}-${i + 1}`,
    productsCount: ((row.productsCount + i + offset) % 9) + 1,
  }))
}

export function getAllMockAdminStudentRows(): AdminStudentRow[] {
  return ADMIN_MATERIAL_SECTION_LIST.flatMap((s) => mockStudentsForAdminSection(s.id))
}

export function resolveAdminStudentRow(
  scope: AdminStudentsSectionScope,
  studentId: string,
): AdminStudentRow | null {
  if (scope === ADMIN_STUDENTS_SCOPE_ALL) {
    return getAllMockAdminStudentRows().find((r) => r.id === studentId) ?? null
  }
  if (isAdminMaterialSectionId(scope)) {
    return mockStudentsForAdminSection(scope).find((r) => r.id === studentId) ?? null
  }
  return null
}

/** Строка списка продуктов папки на экране «Доступ к урокам» (мок до API). */
export interface AdminFolderLessonProductRow {
  id: string
  title: string
  topicsCount: number
  /** Подпись даты для колонки «Дедлайн (общий)»; `null` — пустая ячейка. */
  deadlineLabel: string | null
  selectedByDefault: boolean
}

const MOCK_FOLDER_LESSONS_COURSES: AdminFolderLessonProductRow[] = [
  {
    id: 'folder-closed-club',
    title: 'Закрытый клуб',
    topicsCount: 4,
    deadlineLabel: null,
    selectedByDefault: true,
  },
  {
    id: 'folder-oak-basic',
    title: 'Базовая диагностика \u201cОАК\u201d',
    topicsCount: 1,
    deadlineLabel: '19.06.2026',
    selectedByDefault: true,
  },
  {
    id: 'folder-immunogram',
    title: 'Иммунограмма',
    topicsCount: 4,
    deadlineLabel: null,
    selectedByDefault: true,
  },
  {
    id: 'folder-bio-1',
    title: 'Биохимический анализ крови - 1 часть',
    topicsCount: 8,
    deadlineLabel: null,
    selectedByDefault: false,
  },
  {
    id: 'folder-bio-2',
    title: 'Биохимический анализ крови - 2 часть',
    topicsCount: 10,
    deadlineLabel: null,
    selectedByDefault: false,
  },
  {
    id: 'folder-marathons',
    title: 'Марафоны',
    topicsCount: 20,
    deadlineLabel: null,
    selectedByDefault: false,
  },
]

const MOCK_FOLDER_LESSONS_BY_SECTION: Record<AdminMaterialSectionId, AdminFolderLessonProductRow[]> = {
  courses: MOCK_FOLDER_LESSONS_COURSES,
  projects: [
    {
      id: 'folder-project-1',
      title: 'Вертоград',
      topicsCount: 6,
      deadlineLabel: '01.09.2026',
      selectedByDefault: true,
    },
    {
      id: 'folder-project-2',
      title: 'Проект «Сад»',
      topicsCount: 3,
      deadlineLabel: null,
      selectedByDefault: false,
    },
  ],
  other: [
    {
      id: 'folder-other-1',
      title: 'Конференция 2023',
      topicsCount: 2,
      deadlineLabel: null,
      selectedByDefault: true,
    },
  ],
  archive: [
    {
      id: 'folder-archive-1',
      title: 'Интегративная карта метаболизма',
      topicsCount: 5,
      deadlineLabel: null,
      selectedByDefault: false,
    },
  ],
}

/**
 * Мок-список продуктов папки для экрана «Доступ к урокам».
 * `sourceProductId` зарезервирован под будущую фильтрацию с API.
 */
export function getMockFolderProductsForLessonsAccess(
  materialSection: AdminMaterialSectionId,
  _sourceProductId: string,
): AdminFolderLessonProductRow[] {
  void _sourceProductId
  return MOCK_FOLDER_LESSONS_BY_SECTION[materialSection]
}

export interface AdminStudentProfileProductRow {
  id: string
  title: string
  deadlineLabel: string
}

export function getMockStudentProfileProducts(
  studentId: string,
  materialSection: AdminMaterialSectionId,
): AdminStudentProfileProductRow[] {
  let h = 0
  for (let i = 0; i < studentId.length; i++) h += studentId.charCodeAt(i)

  const bySection: Record<AdminMaterialSectionId, AdminStudentProfileProductRow[]> = {
    courses: [
      { id: 'c1', title: 'Закрытый клуб', deadlineLabel: '47 дней 9 часов' },
      { id: 'c2', title: 'Курс из 5 тем', deadlineLabel: '12 дней 2 часа' },
    ],
    projects: [{ id: 'p1', title: 'Вертоград', deadlineLabel: 'бессрочно' }],
    other: [{ id: 'o1', title: 'Конференция 2023', deadlineLabel: '30 дней' }],
    archive: [{ id: 'a1', title: 'Интегративная карта метаболизма', deadlineLabel: 'закрыт' }],
  }

  const list = bySection[materialSection]
  switch (materialSection) {
    case 'courses':
      return h % 2 === 0 ? list.slice(0, 1) : list
    case 'projects':
      return h % 3 === 0 ? list : []
    case 'other':
      return h % 5 === 0 ? list : []
    case 'archive':
      return h % 7 === 0 ? list : []
  }
}

export type AdminTopicGradeStatus = 'passed' | 'neutral'

/** Строка темы на экране «Темы продукта» (мок до API). */
export interface AdminProductTopicRow {
  id: string
  title: string
  /** Подпись даты для поля дедлайна; `null` — без начального значения. */
  deadlineLabel: string | null
  gradeStatus: AdminTopicGradeStatus
  topicEnabled: boolean
}

export function getMockProductTopics(
  materialSection: AdminMaterialSectionId,
  productId: string,
): AdminProductTopicRow[] {
  if (materialSection === 'courses' && productId === 'c1') {
    return [
      {
        id: 'c1-t1',
        title: '1 тема: Стресс',
        deadlineLabel: '19.06.2026',
        gradeStatus: 'passed',
        topicEnabled: true,
      },
      {
        id: 'c1-t2',
        title: '2 тема: ДСТ',
        deadlineLabel: '19.08.2026',
        gradeStatus: 'passed',
        topicEnabled: true,
      },
      {
        id: 'c1-t3',
        title: '3 тема: СД',
        deadlineLabel: '19.10.2026',
        gradeStatus: 'neutral',
        topicEnabled: true,
      },
      {
        id: 'c1-t4',
        title: '4 тема: АИТ и ЩЖ',
        deadlineLabel: '19.12.2026',
        gradeStatus: 'neutral',
        topicEnabled: false,
      },
    ]
  }

  return [
    {
      id: `${productId}-t1`,
      title: '1 тема',
      deadlineLabel: null,
      gradeStatus: 'neutral',
      topicEnabled: true,
    },
  ]
}

export function resolveMockProductTitle(
  studentId: string,
  materialSection: AdminMaterialSectionId,
  productId: string,
): string | null {
  const products = getMockStudentProfileProducts(studentId, materialSection)
  return products.find((p) => p.id === productId)?.title ?? null
}
