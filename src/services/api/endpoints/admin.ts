/**
 * Admin Service — CRUD продуктов, модулей, уроков, доступов, платежей.
 */

import { useApi } from '@/composables/useApi'
import type {
  ProductResponse,
  ProductDetailResponse,
  AdminProductsQuery,
  AdminProductCreateRequest,
  AdminProductUpdateRequest,
  AdminProductListResponse,
  AdminModuleCreateRequest,
  AdminModuleUpdateRequest,
  ModuleResponse,
  LessonResponse,
  AdminLessonCreateRequest,
  AdminLessonUpdateRequest,
  AdminModuleReorderRequest,
  AdminLessonReorderRequest,
  AdminModuleCopyRequest,
  AdminLessonCopyRequest,
  AdminFileUploadResponse,
  AdminGrantAccessRequest,
  AdminDeadlineUpdateRequest,
  AdminStudentsListResponse,
  AdminPaymentsQuery,
  AdminPaymentsListResponse,
  MessageResponse,
  ApiServiceResponse,
} from '../types'
import { ADMIN_ENDPOINTS } from './admin.contract'

export const adminService = {
  // --- Products ---
  async listProducts(query?: AdminProductsQuery): ApiServiceResponse<AdminProductListResponse> {
    const api = useApi()
    return api.get<AdminProductListResponse>(ADMIN_ENDPOINTS.products, { params: query })
  },

  async getProduct(id: string): ApiServiceResponse<ProductDetailResponse> {
    const api = useApi()
    return api.get<ProductDetailResponse>(ADMIN_ENDPOINTS.productById(id))
  },

  async createProduct(body: AdminProductCreateRequest): ApiServiceResponse<ProductResponse> {
    const api = useApi()
    return api.post<ProductResponse>(ADMIN_ENDPOINTS.products, body)
  },

  async updateProduct(
    id: string,
    body: AdminProductUpdateRequest
  ): ApiServiceResponse<ProductResponse> {
    const api = useApi()
    return api.put<ProductResponse>(ADMIN_ENDPOINTS.productById(id), body)
  },

  async deleteProduct(id: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.delete<MessageResponse>(ADMIN_ENDPOINTS.productById(id))
  },

  async uploadProductImage(
    id: string,
    file: File
  ): ApiServiceResponse<AdminFileUploadResponse> {
    const api = useApi()
    return api.uploadFile<AdminFileUploadResponse>(ADMIN_ENDPOINTS.productImage(id), file)
  },

  // --- Modules ---
  async createModule(
    courseId: string,
    body: AdminModuleCreateRequest
  ): ApiServiceResponse<ModuleResponse> {
    const api = useApi()
    return api.post<ModuleResponse>(ADMIN_ENDPOINTS.productModules(courseId), body)
  },

  async updateModule(id: string, body: AdminModuleUpdateRequest): ApiServiceResponse<ModuleResponse> {
    const api = useApi()
    return api.put<ModuleResponse>(ADMIN_ENDPOINTS.moduleById(id), body)
  },

  async deleteModule(id: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.delete<MessageResponse>(ADMIN_ENDPOINTS.moduleById(id))
  },

  async reorderModules(
    courseId: string,
    body: AdminModuleReorderRequest
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.put<MessageResponse>(ADMIN_ENDPOINTS.productModulesReorder(courseId), body)
  },

  async copyModule(id: string, body: AdminModuleCopyRequest): ApiServiceResponse<ModuleResponse> {
    const api = useApi()
    return api.post<ModuleResponse>(ADMIN_ENDPOINTS.moduleCopy(id), body)
  },

  // --- Lessons ---
  async createLesson(
    moduleId: string,
    body: AdminLessonCreateRequest
  ): ApiServiceResponse<LessonResponse> {
    const api = useApi()
    return api.post<LessonResponse>(ADMIN_ENDPOINTS.moduleLessons(moduleId), body)
  },

  async updateLesson(id: string, body: AdminLessonUpdateRequest): ApiServiceResponse<LessonResponse> {
    const api = useApi()
    return api.put<LessonResponse>(ADMIN_ENDPOINTS.lessonById(id), body)
  },

  async deleteLesson(id: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.delete<MessageResponse>(ADMIN_ENDPOINTS.lessonById(id))
  },

  async reorderLessons(
    moduleId: string,
    body: AdminLessonReorderRequest
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.put<MessageResponse>(ADMIN_ENDPOINTS.moduleLessonsReorder(moduleId), body)
  },

  async copyLesson(id: string, body: AdminLessonCopyRequest): ApiServiceResponse<LessonResponse> {
    const api = useApi()
    return api.post<LessonResponse>(ADMIN_ENDPOINTS.lessonCopy(id), body)
  },

  async uploadLessonVideo(id: string, file: File): ApiServiceResponse<AdminFileUploadResponse> {
    const api = useApi()
    return api.uploadFile<AdminFileUploadResponse>(ADMIN_ENDPOINTS.lessonVideo(id), file)
  },

  async uploadLessonFile(id: string, file: File): ApiServiceResponse<AdminFileUploadResponse> {
    const api = useApi()
    return api.uploadFile<AdminFileUploadResponse>(ADMIN_ENDPOINTS.lessonFiles(id), file)
  },

  async deleteFile(id: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.delete<MessageResponse>(ADMIN_ENDPOINTS.fileById(id))
  },

  // --- Access ---
  async grantAccess(
    userId: string,
    body: AdminGrantAccessRequest
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.post<MessageResponse>(ADMIN_ENDPOINTS.userAccess(userId), body)
  },

  async grantManualAccess(
    userId: string,
    productId: string
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.post<MessageResponse>(ADMIN_ENDPOINTS.userProductGrant(userId, productId))
  },

  async updateDeadline(
    userId: string,
    productId: string,
    body: AdminDeadlineUpdateRequest
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.put<MessageResponse>(ADMIN_ENDPOINTS.userProductDeadline(userId, productId), body)
  },

  async revokeAccess(userId: string, productId: string): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.delete<MessageResponse>(ADMIN_ENDPOINTS.userProductAccess(userId, productId))
  },

  // --- Students ---
  async listStudents(
    productId: string,
    skip = 0,
    limit = 100
  ): ApiServiceResponse<AdminStudentsListResponse> {
    const api = useApi()
    return api.get<AdminStudentsListResponse>(ADMIN_ENDPOINTS.productStudents(productId), {
      params: { skip, limit },
    })
  },

  async exportStudentsCsv(productId: string): ApiServiceResponse<Blob> {
    const api = useApi()
    return apiCallBlob(
      () => api.raw.get(ADMIN_ENDPOINTS.productStudentsExport(productId), { responseType: 'blob' }),
      'Export students failed'
    )
  },

  // --- Payments ---
  async listPayments(query?: AdminPaymentsQuery): ApiServiceResponse<AdminPaymentsListResponse> {
    const api = useApi()
    return api.get<AdminPaymentsListResponse>(ADMIN_ENDPOINTS.payments, { params: query })
  },

  async listSuccessfulPayments(
    query?: AdminPaymentsQuery
  ): ApiServiceResponse<AdminPaymentsListResponse> {
    const api = useApi()
    return api.get<AdminPaymentsListResponse>(ADMIN_ENDPOINTS.paymentsSuccessful, { params: query })
  },

  async listPendingPayments(
    query?: AdminPaymentsQuery
  ): ApiServiceResponse<AdminPaymentsListResponse> {
    const api = useApi()
    return api.get<AdminPaymentsListResponse>(ADMIN_ENDPOINTS.paymentsPending, { params: query })
  },

  async paymentsByUserEmail(email: string): ApiServiceResponse<AdminPaymentsListResponse> {
    const api = useApi()
    return api.get<AdminPaymentsListResponse>(ADMIN_ENDPOINTS.paymentsByUserEmail(email))
  },
}

async function apiCallBlob(
  request: () => Promise<{ data: Blob }>,
  errorMessage: string
): Promise<import('../types').ApiResult<Blob>> {
  try {
    const response = await request()
    return { data: response.data, error: null, errorCode: null, success: true }
  } catch (error: unknown) {
    console.error(errorMessage, error)
    const message = error instanceof Error ? error.message : errorMessage
    return { data: null, error: message, errorCode: null, success: false }
  }
}
