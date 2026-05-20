import type { AdminMaterialSectionId } from '@/constants/adminMaterials'

/** Маппинг секций админки → product_type API. */
const SECTION_TO_PRODUCT_TYPE: Record<AdminMaterialSectionId, string> = {
  courses: 'course',
  projects: 'project',
  other: 'webinar',
  archive: 'course',
}

export function sectionIdToProductType(sectionId: AdminMaterialSectionId): string {
  return SECTION_TO_PRODUCT_TYPE[sectionId]
}

export function productTypeToSectionId(productType: string): AdminMaterialSectionId | null {
  const t = productType.toLowerCase()
  if (t === 'course') return 'courses'
  if (t === 'project') return 'projects'
  if (t === 'webinar') return 'other'
  return null
}
