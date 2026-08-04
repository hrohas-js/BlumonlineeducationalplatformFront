/**
 * Admin Store — продукты, студенты (агрегация), кеш деталей.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/api/endpoints/admin'
import { sectionIdToProductType, productTypeToSectionId } from '@/utils/adminProductType'
import {
  ADMIN_MATERIAL_SECTION_LIST,
  ADMIN_STUDENTS_SCOPE_ALL,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import type {
  ProductResponse,
  ProductDetailResponse,
  AdminStudentItem,
  AdminProductCreateRequest,
  AdminProductUpdateRequest,
  AdminModuleCreateRequest,
  AdminModuleUpdateRequest,
  AdminLessonCreateRequest,
  AdminGrantAccessRequest,
  AdminStudentAccessStatus,
  AdminStudentAccessUpdateRequest,
  AdminStudentProductItem,
  AdminStudentProductsResponse,
} from '@/services/api/types'
import type { AdminStudentProfileProductRow } from '@/utils/adminMockStudents'

export interface AggregatedAdminStudentRow {
  user_id: string
  email: string
  first_name: string
  last_name: string
  name: string
  productIds: string[]
}

export const useAdminStore = defineStore('admin', () => {
  const productsBySection = ref<Record<string, ProductResponse[]>>({})
  const productDetails = ref<Record<string, ProductDetailResponse>>({})
  const studentsByProduct = ref<Record<string, AdminStudentItem[]>>({})
  const aggregatedStudents = ref<Record<string, AggregatedAdminStudentRow[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProductsForSection(sectionId: AdminMaterialSectionId) {
    loading.value = true
    error.value = null
    const isArchive = sectionId === 'archive'
    const productType = sectionIdToProductType(sectionId)
    const result = await adminService.listProducts({
      ...(productType ? { product_type: productType } : {}),
      is_archived: isArchive,
      skip: 0,
      limit: 100,
    })
    loading.value = false
    if (!result.success || !result.data) {
      error.value = result.error || 'Не удалось загрузить продукты'
      return { success: false as const, error: error.value }
    }
    productsBySection.value = {
      ...productsBySection.value,
      [sectionId]: result.data.items,
    }
    return { success: true as const, data: result.data.items }
  }

  async function fetchProductDetail(productId: string) {
    const result = await adminService.getProduct(productId)
    if (result.success && result.data) {
      productDetails.value = { ...productDetails.value, [productId]: result.data }
      return { success: true as const, data: result.data }
    }
    return { success: false as const, error: result.error || 'Не удалось загрузить продукт' }
  }

  async function createProduct(body: AdminProductCreateRequest) {
    const result = await adminService.createProduct(body)
    if (!result.success) {
      return { success: false as const, error: result.error }
    }
    return { success: true as const, data: result.data }
  }

  async function updateProduct(productId: string, body: AdminProductUpdateRequest) {
    const result = await adminService.updateProduct(productId, body)
    if (result.success && result.data) {
      productDetails.value = {
        ...productDetails.value,
        [productId]: {
          ...(productDetails.value[productId] ?? result.data),
          ...result.data,
          modules: productDetails.value[productId]?.modules ?? [],
        },
      }
    }
    return result
  }

  async function deleteProduct(productId: string) {
    return adminService.deleteProduct(productId)
  }

  async function archiveProduct(productId: string) {
    return adminService.archiveProduct(productId)
  }

  async function unarchiveProduct(productId: string) {
    return adminService.unarchiveProduct(productId)
  }

  async function fetchStudentsForProduct(productId: string) {
    const result = await adminService.listStudents(productId)
    if (result.success && result.data) {
      studentsByProduct.value = {
        ...studentsByProduct.value,
        [productId]: result.data.items,
      }
      return { success: true as const, data: result.data.items }
    }
    return { success: false as const, error: result.error }
  }

  async function aggregateStudentsForSection(sectionId: AdminMaterialSectionId) {
    const productsResult = await fetchProductsForSection(sectionId)
    if (!productsResult.success) {
      return { success: false as const, error: productsResult.error }
    }
    const products = productsResult.data
    const studentResults = await Promise.all(
      products.map((p) => adminService.listStudents(p.id))
    )
    const map = new Map<string, AggregatedAdminStudentRow>()
    for (let i = 0; i < products.length; i++) {
      const productId = products[i].id
      const res = studentResults[i]
      if (!res.success || !res.data) continue
      studentsByProduct.value = {
        ...studentsByProduct.value,
        [productId]: res.data.items,
      }
      for (const s of res.data.items) {
        const name = [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || s.email
        const existing = map.get(s.user_id)
        if (existing) {
          if (!existing.productIds.includes(productId)) {
            existing.productIds.push(productId)
          }
        } else {
          map.set(s.user_id, {
            user_id: s.user_id,
            email: s.email,
            first_name: s.first_name,
            last_name: s.last_name,
            name,
            productIds: [productId],
          })
        }
      }
    }
    const rows = Array.from(map.values())
    aggregatedStudents.value = { ...aggregatedStudents.value, [sectionId]: rows }
    return { success: true as const, data: rows }
  }

  async function grantAccess(userId: string, body: AdminGrantAccessRequest) {
    return adminService.grantAccess(userId, body)
  }

  async function grantManualAccess(userId: string, productId: string) {
    return adminService.grantManualAccess(userId, productId)
  }

  async function updateDeadline(userId: string, productId: string, deadline: string) {
    return adminService.updateDeadline(userId, productId, { deadline })
  }

  async function revokeAccess(userId: string, productId: string) {
    return adminService.revokeAccess(userId, productId)
  }

  async function updateStudentAccess(
    userId: string,
    productId: string,
    body: AdminStudentAccessUpdateRequest
  ) {
    return adminService.updateStudentAccess(userId, productId, body)
  }

  async function createModule(courseId: string, body: AdminModuleCreateRequest) {
    const result = await adminService.createModule(courseId, body)
    if (result.success) await fetchProductDetail(courseId)
    return result
  }

  async function updateModule(
    moduleId: string,
    productId: string,
    body: AdminModuleUpdateRequest
  ) {
    const result = await adminService.updateModule(moduleId, body)
    if (result.success) await fetchProductDetail(productId)
    return result
  }

  async function createLesson(moduleId: string, courseId: string, body: AdminLessonCreateRequest) {
    const result = await adminService.createLesson(moduleId, body)
    if (result.success) await fetchProductDetail(courseId)
    return result
  }

  function invalidateProduct(productId: string) {
    delete productDetails.value[productId]
  }

  function findAggregatedStudent(
    scope: AdminStudentsSectionScope,
    userId: string
  ): AggregatedAdminStudentRow | null {
    if (scope === ADMIN_STUDENTS_SCOPE_ALL) {
      for (const section of ADMIN_MATERIAL_SECTION_LIST) {
        const row = aggregatedStudents.value[section.id]?.find((s) => s.user_id === userId)
        if (row) return row
      }
      return null
    }
    if (isAdminMaterialSectionId(scope)) {
      return aggregatedStudents.value[scope]?.find((s) => s.user_id === userId) ?? null
    }
    return null
  }

  function normalizeAccessStatus(status: string | undefined | null): AdminStudentAccessStatus {
    if (status === 'active' || status === 'paused' || status === 'blocked' || status === 'deleted') {
      return status
    }
    return 'active'
  }

  function mapStudentProductToRow(item: AdminStudentProductItem): AdminStudentProfileProductRow {
    return {
      id: item.product_id,
      title: item.title,
      deadlineLabel: item.deadline
        ? new Date(item.deadline).toLocaleDateString('ru-RU')
        : 'без дедлайна',
      status: normalizeAccessStatus(item.status),
      productType: item.product_type,
      progressPercent: item.progress_percent,
      totalLessons: item.total_lessons,
      completedLessons: item.completed_lessons,
    }
  }

  function sectionForStudentProduct(item: AdminStudentProductItem): AdminMaterialSectionId {
    if (item.is_archived) return 'archive'
    return productTypeToSectionId(item.product_type) ?? 'other'
  }

  async function fetchStudentProfileProducts(userId: string): Promise<
    | {
        success: true
        data: {
          user: AdminStudentProductsResponse['user']
          bySection: Record<AdminMaterialSectionId, AdminStudentProfileProductRow[]>
        }
      }
    | { success: false; error: string }
  > {
    const pageLimit = 50
    let skip = 0
    let total = Infinity
    const allItems: AdminStudentProductItem[] = []
    let user: AdminStudentProductsResponse['user'] | null = null

    while (allItems.length < total) {
      const result = await adminService.listStudentProducts(userId, skip, pageLimit)
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Не удалось загрузить продукты ученика',
        }
      }
      const page = result.data
      user = page.user
      allItems.push(...page.items)
      total = page.total
      skip += pageLimit
      if (page.items.length === 0) break
    }

    if (!user) {
      return { success: false, error: 'Не удалось загрузить данные ученика' }
    }

    const bySection = Object.fromEntries(
      ADMIN_MATERIAL_SECTION_LIST.map((s) => [s.id, [] as AdminStudentProfileProductRow[]]),
    ) as Record<AdminMaterialSectionId, AdminStudentProfileProductRow[]>

    for (const item of allItems) {
      bySection[sectionForStudentProduct(item)].push(mapStudentProductToRow(item))
    }

    return {
      success: true,
      data: {
        user,
        bySection,
      },
    }
  }

  async function aggregateAllSections() {
    for (const section of ADMIN_MATERIAL_SECTION_LIST) {
      await aggregateStudentsForSection(section.id)
    }
    const map = new Map<string, AggregatedAdminStudentRow>()
    for (const section of ADMIN_MATERIAL_SECTION_LIST) {
      for (const row of aggregatedStudents.value[section.id] ?? []) {
        const existing = map.get(row.user_id)
        if (existing) {
          for (const pid of row.productIds) {
            if (!existing.productIds.includes(pid)) existing.productIds.push(pid)
          }
        } else {
          map.set(row.user_id, { ...row, productIds: [...row.productIds] })
        }
      }
    }
    aggregatedStudents.value = {
      ...aggregatedStudents.value,
      [ADMIN_STUDENTS_SCOPE_ALL]: Array.from(map.values()),
    }
    return { success: true as const, data: Array.from(map.values()) }
  }

  async function fetchProductsForStudentsScope(scope: AdminStudentsSectionScope) {
    if (scope === ADMIN_STUDENTS_SCOPE_ALL) {
      const result: ProductResponse[] = []
      for (const section of ADMIN_MATERIAL_SECTION_LIST) {
        const res = await fetchProductsForSection(section.id)
        if (res.success) result.push(...res.data)
      }
      return result
    }
    if (isAdminMaterialSectionId(scope)) {
      const res = await fetchProductsForSection(scope)
      return res.success ? res.data : []
    }
    return []
  }

  function reset() {
    productsBySection.value = {}
    productDetails.value = {}
    studentsByProduct.value = {}
    aggregatedStudents.value = {}
    error.value = null
  }

  return {
    productsBySection,
    productDetails,
    studentsByProduct,
    aggregatedStudents,
    loading,
    error,
    fetchProductsForSection,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    unarchiveProduct,
    fetchStudentsForProduct,
    aggregateStudentsForSection,
    grantAccess,
    grantManualAccess,
    updateDeadline,
    revokeAccess,
    updateStudentAccess,
    createModule,
    updateModule,
    createLesson,
    invalidateProduct,
    findAggregatedStudent,
    fetchStudentProfileProducts,
    aggregateAllSections,
    fetchProductsForStudentsScope,
    reset,
  }
})
