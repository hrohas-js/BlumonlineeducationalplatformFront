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
import type { AggregatedAdminStudentRow } from '@/stores/admin'

export function productToCardItem(
  product: ProductResponse,
  detail?: ProductDetailResponse | null,
  studentsCount = 0
): AdminMaterialCardItem {
  const topicsCount = detail?.modules?.length ?? 0
  return {
    id: product.id,
    title: product.title,
    topicsCount,
    usersCount: studentsCount,
    deadlineSuffix: '—',
  }
}

export function buildSectionConfig(
  sectionId: AdminMaterialSectionId,
  products: ProductResponse[],
  studentRows: AggregatedAdminStudentRow[] | undefined,
  detailsById: Record<string, ProductDetailResponse>
): AdminCategorySectionConfig {
  const sectionMeta = ADMIN_MATERIAL_SECTION_LIST.find((s) => s.id === sectionId)!
  const accentMap: Record<AdminMaterialSectionId, AdminCategorySectionConfig['accentKey']> = {
    courses: 'courses',
    projects: 'projects',
    other: 'other',
    archive: 'archive',
  }
  const studentCountByProduct = new Map<string, number>()
  if (studentRows) {
    for (const row of studentRows) {
      for (const pid of row.productIds) {
        studentCountByProduct.set(pid, (studentCountByProduct.get(pid) ?? 0) + 1)
      }
    }
  }
  const cards: AdminMaterialCatalogCard[] = products.map((p) => ({
    ...productToCardItem(p, detailsById[p.id], studentCountByProduct.get(p.id) ?? 0),
    edit: {
      description: p.description ?? '',
      topics: [],
      activeExtensions: [],
    },
  }))
  const uniqueStudents = studentRows?.length ?? 0
  return {
    sectionId,
    title: sectionMeta.title,
    usersCount: uniqueStudents,
    foldersCount: products.length,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS[sectionId],
    accentKey: accentMap[sectionId],
    cards,
  }
}
