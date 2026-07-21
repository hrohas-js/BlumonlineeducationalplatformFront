import type { AdminMaterialSectionId } from '@/constants/adminMaterials'

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
