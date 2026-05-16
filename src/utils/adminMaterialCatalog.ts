import type { AdminMaterialCourseAccent } from '@/components/organisms/AdminMaterialCourseCard.vue'
import {
  ADMIN_MATERIAL_SECTION_BORDER_COLORS,
  ADMIN_MATERIAL_SECTION_TITLES,
  type AdminMaterialSectionId,
  isAdminMaterialSectionId,
} from '@/constants/adminMaterials'

/** Карточка продукта в списке секции (админка). */
export interface AdminMaterialCardItem {
  id: string
  title: string
  topicsCount: number
  usersCount: number
  deadlineSuffix: string
}

export interface AdminMaterialProductTopicRow {
  id: string
  title: string
  accessUntil: string
}

export interface AdminMaterialActiveExtensionMock {
  id: string
  topicLabel: string
  productBadge: string
  extensionText: string
}

export interface AdminMaterialProductEditMock {
  description: string
  topics: AdminMaterialProductTopicRow[]
  activeExtensions: AdminMaterialActiveExtensionMock[]
}

export interface AdminMaterialCatalogCard extends AdminMaterialCardItem {
  edit: AdminMaterialProductEditMock
}

export interface AdminCategorySectionConfig {
  sectionId: AdminMaterialSectionId
  title: string
  usersCount: number
  foldersCount: number
  borderColor: string
  accentKey: AdminMaterialCourseAccent
  cards: AdminMaterialCatalogCard[]
}

const CLOSED_CLUB_DESCRIPTION = [
  'Вся информация по курсам Вы можете найти 👉 Главная - DoktorBlum',
  'По возможности приобретения других вебинаров, курсов, сотрудничества - https://t.me/Dmitriy_Berezkin или +7 999 972-25-00 (Ват сап) Никита',
  '',
  'С уважением, команда @Dr_Blum 🚀',
].join('\n')

function defaultEditMock(card: AdminMaterialCardItem): AdminMaterialProductEditMock {
  const n = card.topicsCount
  const topics: AdminMaterialProductTopicRow[] = Array.from({ length: Math.min(n, 4) }, (_, i) => ({
    id: `${card.id}-topic-${i + 1}`,
    title: `${i + 1} тема: Модуль ${i + 1}`,
    accessUntil: '01.01.2027',
  }))
  return {
    description: `Описание продукта «${card.title}».`,
    topics,
    activeExtensions: [
      {
        id: `${card.id}-ext-1`,
        topicLabel: topics[0]?.title ?? '1 тема',
        productBadge: card.title,
        extensionText: 'Продление на 1 месяц (с момента оплаты)',
      },
      ...(topics[1]
        ? [
            {
              id: `${card.id}-ext-2`,
              topicLabel: topics[1].title,
              productBadge: card.title,
              extensionText: 'Продление на 2 месяца (с момента оплаты)',
            },
          ]
        : []),
    ],
  }
}

const closedClubCard: AdminMaterialCatalogCard = {
  id: 'course-closed-club',
  title: 'Закрытый клуб',
  topicsCount: 4,
  usersCount: 670,
  deadlineSuffix: '01.01.2027',
  edit: {
    description: CLOSED_CLUB_DESCRIPTION,
    topics: [
      { id: 'cc-t1', title: '1 тема: Стресс', accessUntil: '01.01.2026' },
      { id: 'cc-t2', title: '2 тема: ДСТ', accessUntil: '01.04.2026' },
      { id: 'cc-t3', title: '3 тема: СД', accessUntil: '01.08.2026' },
      { id: 'cc-t4', title: '4 тема: АИТ и ЩЖ', accessUntil: '01.12.2026' },
    ],
    activeExtensions: [
      {
        id: 'cc-ae-1',
        topicLabel: '1 тема: стресс',
        productBadge: 'Закрытый клуб',
        extensionText: 'Продление на 1 месяц (с момента оплаты)',
      },
      {
        id: 'cc-ae-2',
        topicLabel: '2 тема: ДСТ',
        productBadge: 'Закрытый клуб',
        extensionText: 'Продление на 2 месяца (с момента оплаты)',
      },
    ],
  },
}

const pocketGuideCard: AdminMaterialCatalogCard = {
  id: 'course-pocket-guide',
  title: 'Курс из 5 тем',
  topicsCount: 12,
  usersCount: 320,
  deadlineSuffix: '15.06.2026',
  edit: defaultEditMock({
    id: 'course-pocket-guide',
    title: 'Курс из 5 тем',
    topicsCount: 12,
    usersCount: 320,
    deadlineSuffix: '15.06.2026',
  }),
}

const vertegradCard: AdminMaterialCatalogCard = {
  id: 'project-vertegrad',
  title: 'Вертоград',
  topicsCount: 100,
  usersCount: 1000,
  deadlineSuffix: 'бессрочно',
  edit: defaultEditMock({
    id: 'project-vertegrad',
    title: 'Вертоград',
    topicsCount: 4,
    usersCount: 1000,
    deadlineSuffix: 'бессрочно',
  }),
}

const confCard: AdminMaterialCatalogCard = {
  id: 'other-conf-2023',
  title: 'Конференция 2023',
  topicsCount: 1,
  usersCount: 145,
  deadlineSuffix: 'бессрочно',
  edit: defaultEditMock({
    id: 'other-conf-2023',
    title: 'Конференция 2023',
    topicsCount: 1,
    usersCount: 145,
    deadlineSuffix: 'бессрочно',
  }),
}

const metabolismCard: AdminMaterialCatalogCard = {
  id: 'archive-metabolism-map',
  title: 'Интегративная карта метаболизма',
  topicsCount: 3,
  usersCount: 145,
  deadlineSuffix: 'закрыт',
  edit: defaultEditMock({
    id: 'archive-metabolism-map',
    title: 'Интегративная карта метаболизма',
    topicsCount: 3,
    usersCount: 145,
    deadlineSuffix: 'закрыт',
  }),
}

export const MOCK_ADMIN_CATEGORY_SECTIONS: AdminCategorySectionConfig[] = [
  {
    sectionId: 'courses',
    title: ADMIN_MATERIAL_SECTION_TITLES.courses,
    usersCount: 670,
    foldersCount: 6,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS.courses,
    accentKey: 'courses',
    cards: [closedClubCard, pocketGuideCard],
  },
  {
    sectionId: 'projects',
    title: ADMIN_MATERIAL_SECTION_TITLES.projects,
    usersCount: 1200,
    foldersCount: 2,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS.projects,
    accentKey: 'projects',
    cards: [vertegradCard],
  },
  {
    sectionId: 'other',
    title: ADMIN_MATERIAL_SECTION_TITLES.other,
    usersCount: 250,
    foldersCount: 2,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS.other,
    accentKey: 'other',
    cards: [confCard],
  },
  {
    sectionId: 'archive',
    title: ADMIN_MATERIAL_SECTION_TITLES.archive,
    usersCount: 450,
    foldersCount: 6,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS.archive,
    accentKey: 'archive',
    cards: [metabolismCard],
  },
]

export interface ResolvedAdminMaterialProduct {
  section: AdminCategorySectionConfig
  card: AdminMaterialCatalogCard
}

/** Файл учебного материала темы (мок до API). */
export interface AdminTopicEditMaterialFileMock {
  id: string
  fileName: string
}

/** Разрешённые расширения для учебных материалов темы (pdf, docx, png, jpeg). */
export const ADMIN_TOPIC_MATERIAL_ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
] as const

export function isAllowedTopicMaterialFileName(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase()
  return ADMIN_TOPIC_MATERIAL_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/** Видео в теме (мок до API; `videoSrc` — blob/object URL до загрузки на сервер). */
export interface AdminTopicEditVideoMock {
  id: string
  title: string
  timecodeEnabled: boolean
  videoSrc?: string
  fileName?: string
}

export interface AdminTopicEditContentMock {
  materialFiles: AdminTopicEditMaterialFileMock[]
  videos: AdminTopicEditVideoMock[]
}

const MOCK_TOPIC_EDIT_MATERIAL_FILES: AdminTopicEditMaterialFileMock[] = [
  { id: 'mf-seed-1', fileName: 'Презентация по теме курса.pdf' },
  { id: 'mf-seed-2', fileName: 'Метаболическая карта.jpeg' },
  { id: 'mf-seed-3', fileName: 'Тесты к теме.docx' },
  { id: 'mf-seed-4', fileName: 'Пример воздействия стресса на организм.png' },
  { id: 'mf-seed-5', fileName: 'Восстановительные упражения для надпочечников.docx' },
  { id: 'mf-seed-6', fileName: 'Слайды лекции — раздаточные материалы.pdf' },
  { id: 'mf-seed-7', fileName: 'Лечение синдрома надпочечников (для медиков).docx' },
]

/** Общий шаблон контента темы для UI (как в Figma 467:2189). */
export function getMockTopicEditContent(topicTitle: string): AdminTopicEditContentMock {
  const materialFiles = MOCK_TOPIC_EDIT_MATERIAL_FILES.map((f) => ({ ...f }))
  if (topicTitle.trim() && materialFiles[0]) {
    materialFiles[0] = {
      ...materialFiles[0],
      fileName: `Презентация — ${topicTitle.trim()}.pdf`,
    }
  }
  return {
    materialFiles,
    videos: [
      { id: 'v1', title: '', timecodeEnabled: false },
      { id: 'v2', title: '', timecodeEnabled: false },
    ],
  }
}

/** In-memory контент тем (до API). */
const topicEditContentByKey = new Map<string, AdminTopicEditContentMock>()

/** In-memory список тем продукта после копирования/удаления на странице редактирования. */
const sessionProductTopicsByProductId = new Map<string, AdminMaterialProductTopicRow[]>()

function topicContentKey(productId: string, topicId: string): string {
  return `${productId}:${topicId}`
}

function cloneTopicEditContentValue(content: AdminTopicEditContentMock): AdminTopicEditContentMock {
  return {
    materialFiles: content.materialFiles.map((f) => ({ ...f })),
    videos: content.videos.map((v) => ({ ...v })),
  }
}

function cloneTopicEditContentWithNewIds(content: AdminTopicEditContentMock): AdminTopicEditContentMock {
  const ts = Date.now()
  return {
    materialFiles: content.materialFiles.map((f, i) => ({
      ...f,
      id: `mf-${ts}-${i}`,
    })),
    videos: content.videos.map((v, i) => ({
      ...v,
      id: `v-${ts}-${i}`,
    })),
  }
}

/** Figma 483:3110 — «Копия 1 тема: Стресс». */
export function buildCopiedTopicTitle(sourceTitle: string): string {
  return `Копия ${sourceTitle.trim()}`
}

export function createTopicId(productId: string): string {
  return `${productId}-topic-${Date.now()}`
}

export function setSessionProductTopics(productId: string, topics: AdminMaterialProductTopicRow[]): void {
  sessionProductTopicsByProductId.set(
    productId,
    topics.map((t) => ({ ...t })),
  )
}

function getSessionProductTopics(productId: string): AdminMaterialProductTopicRow[] | undefined {
  return sessionProductTopicsByProductId.get(productId)
}

export function getProductTopicsList(
  productId: string,
  catalogTopics: AdminMaterialProductTopicRow[],
): AdminMaterialProductTopicRow[] {
  return getSessionProductTopics(productId) ?? catalogTopics
}

export function getTopicEditContent(
  productId: string,
  topicId: string,
  topicTitle: string,
): AdminTopicEditContentMock {
  const stored = topicEditContentByKey.get(topicContentKey(productId, topicId))
  if (stored) {
    return cloneTopicEditContentValue(stored)
  }
  return getMockTopicEditContent(topicTitle)
}

export function setTopicEditContent(
  productId: string,
  topicId: string,
  content: AdminTopicEditContentMock,
): void {
  topicEditContentByKey.set(topicContentKey(productId, topicId), cloneTopicEditContentValue(content))
}

export function cloneTopicEditContent(
  productId: string,
  sourceTopicId: string,
  sourceTitle: string,
  targetTopicId: string,
): void {
  const source = getTopicEditContent(productId, sourceTopicId, sourceTitle)
  setTopicEditContent(productId, targetTopicId, cloneTopicEditContentWithNewIds(source))
}

export function removeTopicEditContent(productId: string, topicId: string): void {
  topicEditContentByKey.delete(topicContentKey(productId, topicId))
}

export interface ResolvedAdminMaterialProductTopic {
  section: AdminCategorySectionConfig
  card: AdminMaterialCatalogCard
  topic: AdminMaterialProductTopicRow
}

export function resolveAdminMaterialProduct(
  sectionId: string,
  productId: string,
): ResolvedAdminMaterialProduct | null {
  if (!isAdminMaterialSectionId(sectionId)) return null
  const section = MOCK_ADMIN_CATEGORY_SECTIONS.find((s) => s.sectionId === sectionId)
  if (!section) return null
  const card = section.cards.find((c) => c.id === productId)
  if (!card) return null
  return { section, card }
}

export function resolveAdminMaterialProductTopic(
  sectionId: string,
  productId: string,
  topicId: string,
): ResolvedAdminMaterialProductTopic | null {
  const base = resolveAdminMaterialProduct(sectionId, productId)
  if (!base) return null
  const topicsList = getProductTopicsList(productId, base.card.edit.topics)
  const topic = topicsList.find((t) => t.id === topicId)
  if (!topic) return null
  return { section: base.section, card: base.card, topic }
}
