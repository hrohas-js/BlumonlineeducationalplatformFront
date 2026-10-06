import {
  ADMIN_STUDENTS_SCOPE_ALL,
  type AdminMaterialSectionId,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import type { AdminStudentsExportQuery } from '@/services/api/types'

/** Маппинг активных секций админки → product_type API. Архив — не тип продукта. */
const SECTION_TO_PRODUCT_TYPE: Partial<Record<AdminMaterialSectionId, string>> = {
  courses: 'course',
  projects: 'project',
  other: 'webinar',
}

export function sectionIdToProductType(sectionId: AdminMaterialSectionId): string | undefined {
  return SECTION_TO_PRODUCT_TYPE[sectionId]
}

export function productTypeToSectionId(productType: string): AdminMaterialSectionId | null {
  const t = productType.toLowerCase()
  if (t === 'course') return 'courses'
  if (t === 'project') return 'projects'
  if (t === 'webinar') return 'other'
  return null
}

/** Фильтры GET /api/v1/admin/students/export для экрана «Ученики». Для «Все» параметров нет. */
export function studentsScopeToExportQuery(
  scope: AdminStudentsSectionScope,
): AdminStudentsExportQuery | undefined {
  if (scope === ADMIN_STUDENTS_SCOPE_ALL) return undefined
  if (scope === 'archive') return { is_archived: true }
  const productType = sectionIdToProductType(scope)
  return {
    ...(productType ? { product_type: productType } : {}),
    is_archived: false,
  }
}
