import {
  ADMIN_MATERIAL_SECTION_BORDER_COLORS,
  ADMIN_MATERIAL_SECTION_LIST,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import type {
  AdminMaterialCardItem,
  AdminCategorySectionConfig,
  AdminMaterialCatalogCard,
} from '@/utils/adminMaterialCatalog'
import type { ProductResponse, ProductDetailResponse } from '@/services/api/types'
import { accessDurationToRuLabel } from '@/utils/adminDateInput'
import { formatDaysWord } from '@/utils/pluralizeRu'

export function productDeadlineSuffix(product: ProductResponse): string {
  if (product.is_archived) return 'закрыт'
  const dateLabel =
    accessDurationToRuLabel(product.deadline) || accessDurationToRuLabel(product.access_duration)
  if (dateLabel) return dateLabel
  if (product.access_duration_days != null) {
    return `${product.access_duration_days} ${formatDaysWord(product.access_duration_days)}`
  }
  return 'бессрочно'
}

export function productToCardItem(
  product: ProductResponse,
  detail?: ProductDetailResponse | null,
): AdminMaterialCardItem {
  const topicsCount = product.modules_count ?? detail?.modules?.length ?? 0
  return {
    id: product.id,
    title: product.title,
    topicsCount,
    usersCount: product.students_count ?? 0,
    deadlineSuffix: productDeadlineSuffix(product),
  }
}

export function buildSectionConfig(
  sectionId: AdminMaterialSectionId,
  products: ProductResponse[],
  sectionStudentsCount: number,
  detailsById: Record<string, ProductDetailResponse>
): AdminCategorySectionConfig {
  const sectionMeta = ADMIN_MATERIAL_SECTION_LIST.find((s) => s.id === sectionId)!
  const accentMap: Record<AdminMaterialSectionId, AdminCategorySectionConfig['accentKey']> = {
    courses: 'courses',
    projects: 'projects',
    other: 'other',
    archive: 'archive',
  }
  const cards: AdminMaterialCatalogCard[] = products.map((p) => ({
    ...productToCardItem(p, detailsById[p.id]),
    edit: {
      description: p.description ?? '',
      topics: [],
      activeExtensions: [],
    },
  }))
  return {
    sectionId,
    title: sectionMeta.title,
    usersCount: sectionStudentsCount,
    foldersCount: products.length,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS[sectionId],
    accentKey: accentMap[sectionId],
    cards,
  }
}
