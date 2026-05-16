/** Секции «Рабочие материалы» админки: id в URL и отображаемые названия. */
export const ADMIN_MATERIAL_SECTION_TITLES = {
  courses: 'Курсы',
  projects: 'Проекты',
  other: 'Иное',
  archive: 'Архив',
} as const

export type AdminMaterialSectionId = keyof typeof ADMIN_MATERIAL_SECTION_TITLES

/** Цвет рамки секции (админка, профиль ученика) — согласовано с макетом Figma. */
export const ADMIN_MATERIAL_SECTION_BORDER_COLORS: Record<AdminMaterialSectionId, string> = {
  courses: '#178EF0',
  projects: '#0098A3',
  other: '#B842EF',
  archive: '#010307',
}

/** Порядок секций для меню и списков админки (courses → projects → other → archive). */
export interface AdminMaterialSectionListItem {
  id: AdminMaterialSectionId
  title: string
}

export const ADMIN_MATERIAL_SECTION_LIST: AdminMaterialSectionListItem[] = (
  ['courses', 'projects', 'other', 'archive'] as const satisfies readonly AdminMaterialSectionId[]
).map((id) => ({
  id,
  title: ADMIN_MATERIAL_SECTION_TITLES[id],
}))

export function getAdminMaterialSectionTitle(sectionId: string): string | undefined {
  return ADMIN_MATERIAL_SECTION_TITLES[sectionId as AdminMaterialSectionId]
}

export function isAdminMaterialSectionId(sectionId: string): sectionId is AdminMaterialSectionId {
  return sectionId in ADMIN_MATERIAL_SECTION_TITLES
}

/** Режим «Все материалы» на экране учеников (URL :sectionId). */
export const ADMIN_STUDENTS_SCOPE_ALL = 'all' as const

export type AdminStudentsSectionScope = AdminMaterialSectionId | typeof ADMIN_STUDENTS_SCOPE_ALL

export function isAdminStudentsSectionParam(sectionId: string): sectionId is AdminStudentsSectionScope {
  return sectionId === ADMIN_STUDENTS_SCOPE_ALL || isAdminMaterialSectionId(sectionId)
}

export function getAdminStudentsScopeTitle(sectionId: string): string | undefined {
  if (sectionId === ADMIN_STUDENTS_SCOPE_ALL) {
    return 'Все материалы'
  }
  return getAdminMaterialSectionTitle(sectionId)
}
