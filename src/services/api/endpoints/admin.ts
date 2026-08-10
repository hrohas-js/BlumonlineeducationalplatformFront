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
  AdminLessonVideoUploadUrlRequest,
  AdminLessonVideoUploadUrlResponse,
  LessonVideoConfirmRequest,
  LessonVideoResponse,
  LessonVideoUpdate,
  LessonVideoReorderRequest,
  AdminGrantAccessRequest,
  AdminDeadlineUpdateRequest,
  AdminStudentAccessUpdateRequest,
  AdminStudentAccessUpdateResponse,
  AdminStudentProductsResponse,
  AdminStudentsListResponse,
  AdminBulkStudentsRequest,
  AdminBulkStudentsResponse,
  AdminPaymentsQuery,
  AdminPaymentsListResponse,
  AdminBroadcastTemplate,
  AdminBroadcastTemplateCreateRequest,
  AdminBroadcastTemplateUpdateRequest,
  AdminBroadcastItem,
  AdminBroadcastsListQuery,
  AdminBroadcastsListResponse,
  AdminBroadcastCreateRequest,
  AdminGlossaryUpdateRequest,
  GlossaryResponse,
  MessageResponse,
  ApiServiceResponse,
  ApiResult,
} from '../types'
import { ADMIN_ENDPOINTS } from './admin.contract'
import { resolveVideoContentType } from '@/utils/adminTopicVideoFile'
import axios from 'axios'

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

  async archiveProduct(id: string): ApiServiceResponse<ProductResponse> {
    const api = useApi()
    return api.post<ProductResponse>(ADMIN_ENDPOINTS.productArchive(id))
  },

  async unarchiveProduct(id: string): ApiServiceResponse<ProductResponse> {
    const api = useApi()
    return api.post<ProductResponse>(ADMIN_ENDPOINTS.productUnarchive(id))
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

  async getLessonVideoUploadUrl(
    id: string,
    body: AdminLessonVideoUploadUrlRequest
  ): ApiServiceResponse<AdminLessonVideoUploadUrlResponse> {
    const api = useApi()
    return api.post<AdminLessonVideoUploadUrlResponse>(
      ADMIN_ENDPOINTS.lessonVideosUploadUrl(id),
      body
    )
  },

  async confirmLessonVideo(
    id: string,
    body: LessonVideoConfirmRequest
  ): ApiServiceResponse<LessonVideoResponse> {
    const api = useApi()
    return api.post<LessonVideoResponse>(ADMIN_ENDPOINTS.lessonVideosConfirm(id), body)
  },

  /**
   * Прямой PUT файла в S3 по presigned URL (без Authorization / без apiClient timeout).
   */
  async uploadLessonVideoToS3(
    uploadUrl: string,
    file: File,
    contentType: string,
    onProgress?: (percent: number) => void
  ): Promise<ApiResult<null>> {
    try {
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': contentType },
        timeout: 0,
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) return
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
          onProgress(percent)
        },
      })
      return { data: null, error: null, errorCode: null, success: true }
    } catch (error: unknown) {
      console.error('S3 video upload failed', error)
      const message = error instanceof Error ? error.message : 'S3 upload failed'
      return { data: null, error: message, errorCode: null, success: false }
    }
  },

  /**
   * Presigned-флоу: upload-url → PUT S3 → confirm.
   * onProgress — общий прогресс 0–100 (получение URL ~5%, S3 5–95%, confirm 95–100%).
   */
  async uploadLessonVideo(
    id: string,
    file: File,
    options?: { title?: string | null; onProgress?: (percent: number) => void }
  ): ApiServiceResponse<LessonVideoResponse> {
    const onProgress = options?.onProgress
    const contentType = resolveVideoContentType(file)
    onProgress?.(2)

    const urlResult = await this.getLessonVideoUploadUrl(id, {
      filename: file.name,
      content_type: contentType,
    })
    if (!urlResult.success || !urlResult.data) {
      return {
        data: null,
        error: urlResult.error || 'Не удалось получить ссылку для загрузки',
        errorCode: urlResult.errorCode,
        success: false,
      }
    }

    onProgress?.(5)
    const { upload_url, file_key } = urlResult.data

    const s3Result = await this.uploadLessonVideoToS3(
      upload_url,
      file,
      contentType,
      (s3Percent) => {
        // Map S3 0–100 → overall 5–95
        onProgress?.(5 + Math.round(s3Percent * 0.9))
      }
    )
    if (!s3Result.success) {
      return {
        data: null,
        error: s3Result.error || 'Не удалось загрузить видео в хранилище',
        errorCode: s3Result.errorCode,
        success: false,
      }
    }

    onProgress?.(95)
    const confirmResult = await this.confirmLessonVideo(id, {
      file_key,
      title: options?.title?.trim() || null,
    })
    if (!confirmResult.success || !confirmResult.data) {
      return {
        data: null,
        error: confirmResult.error || 'Не удалось подтвердить загрузку видео',
        errorCode: confirmResult.errorCode,
        success: false,
      }
    }

    onProgress?.(100)
    return confirmResult
  },

  async deleteLessonVideo(lessonId: string, videoId: string): ApiServiceResponse<null> {
    const api = useApi()
    return api.delete<null>(ADMIN_ENDPOINTS.lessonVideoById(lessonId, videoId))
  },

  async updateLessonVideo(
    lessonId: string,
    videoId: string,
    body: LessonVideoUpdate
  ): ApiServiceResponse<LessonVideoResponse> {
    const api = useApi()
    return api.patch<LessonVideoResponse>(
      ADMIN_ENDPOINTS.lessonVideoById(lessonId, videoId),
      body
    )
  },

  async reorderLessonVideos(
    lessonId: string,
    body: LessonVideoReorderRequest
  ): ApiServiceResponse<MessageResponse> {
    const api = useApi()
    return api.put<MessageResponse>(ADMIN_ENDPOINTS.lessonVideosReorder(lessonId), body)
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

  async updateStudentAccess(
    userId: string,
    productId: string,
    body: AdminStudentAccessUpdateRequest
  ): ApiServiceResponse<AdminStudentAccessUpdateResponse> {
    const api = useApi()
    return api.patch<AdminStudentAccessUpdateResponse>(
      ADMIN_ENDPOINTS.userProductAccessUpdate(userId, productId),
      body
    )
  },

  // --- Students ---
  async listStudentProducts(
    userId: string,
    skip = 0,
    limit = 50
  ): ApiServiceResponse<AdminStudentProductsResponse> {
    const api = useApi()
    return api.get<AdminStudentProductsResponse>(ADMIN_ENDPOINTS.studentProducts(userId), {
      params: { skip, limit },
    })
  },

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

  async bulkAddStudents(body: AdminBulkStudentsRequest): ApiServiceResponse<AdminBulkStudentsResponse> {
    const api = useApi()
    return api.post<AdminBulkStudentsResponse>(ADMIN_ENDPOINTS.studentsBulk, body)
  },

  async bulkAddStudentsExcel(
    file: File,
    productIds?: string[]
  ): ApiServiceResponse<AdminBulkStudentsResponse> {
    const api = useApi()
    const form = new FormData()
    form.append('file', file)
    const ids = productIds?.filter((id) => id !== '') ?? []
    const config =
      ids.length > 0
        ? {
            params: { product_ids: ids },
            // FastAPI list query: product_ids=a&product_ids=b (not product_ids[]=...)
            paramsSerializer: { indexes: null },
          }
        : undefined
    return api.post<AdminBulkStudentsResponse>(ADMIN_ENDPOINTS.studentsBulkExcel, form, config)
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

  // --- Broadcast templates ---
  async listBroadcastTemplates(): ApiServiceResponse<AdminBroadcastTemplate[]> {
    const api = useApi()
    return api.get<AdminBroadcastTemplate[]>(ADMIN_ENDPOINTS.broadcastTemplates)
  },

  async createBroadcastTemplate(
    body: AdminBroadcastTemplateCreateRequest
  ): ApiServiceResponse<AdminBroadcastTemplate> {
    const api = useApi()
    return api.post<AdminBroadcastTemplate>(ADMIN_ENDPOINTS.broadcastTemplates, body)
  },

  async updateBroadcastTemplate(
    id: string,
    body: AdminBroadcastTemplateUpdateRequest
  ): ApiServiceResponse<AdminBroadcastTemplate> {
    const api = useApi()
    return api.put<AdminBroadcastTemplate>(ADMIN_ENDPOINTS.broadcastTemplateById(id), body)
  },

  async deleteBroadcastTemplate(id: string): ApiServiceResponse<null> {
    const api = useApi()
    return api.delete<null>(ADMIN_ENDPOINTS.broadcastTemplateById(id))
  },

  // --- Broadcasts ---
  async listBroadcasts(
    query?: AdminBroadcastsListQuery
  ): ApiServiceResponse<AdminBroadcastsListResponse> {
    const api = useApi()
    return api.get<AdminBroadcastsListResponse>(ADMIN_ENDPOINTS.broadcasts, { params: query })
  },

  async createBroadcast(body: AdminBroadcastCreateRequest): ApiServiceResponse<AdminBroadcastItem> {
    const api = useApi()
    return api.post<AdminBroadcastItem>(ADMIN_ENDPOINTS.broadcasts, body)
  },

  async getBroadcast(id: string): ApiServiceResponse<AdminBroadcastItem> {
    const api = useApi()
    return api.get<AdminBroadcastItem>(ADMIN_ENDPOINTS.broadcastById(id))
  },

  async deleteBroadcast(id: string): ApiServiceResponse<null> {
    const api = useApi()
    return api.delete<null>(ADMIN_ENDPOINTS.broadcastById(id))
  },

  async startBroadcast(id: string): ApiServiceResponse<AdminBroadcastItem> {
    const api = useApi()
    return api.post<AdminBroadcastItem>(ADMIN_ENDPOINTS.broadcastStart(id))
  },

  async stopBroadcast(id: string): ApiServiceResponse<AdminBroadcastItem> {
    const api = useApi()
    return api.post<AdminBroadcastItem>(ADMIN_ENDPOINTS.broadcastStop(id))
  },

  /** PUT /api/v1/admin/glossary */
  async updateGlossary(body: AdminGlossaryUpdateRequest): ApiServiceResponse<GlossaryResponse> {
    const api = useApi()
    return api.put<GlossaryResponse>(ADMIN_ENDPOINTS.glossary, body)
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
