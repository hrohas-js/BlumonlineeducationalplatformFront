/**
 * Products Service — Doktor Blum
 *
 * Курсы / продукты, прогресс ученика, отметка прохождения уроков.
 */

import { useApi } from '@/composables/useApi'
import type {
  ProductResponse,
  ProductListResponse,
  ProductDetailResponse,
  ProductProgressResponse,
  ProductsQuery,
  LessonProgressCreate,
  LessonProgressResponse,
  ApiServiceResponse,
} from '../types'
import { PRODUCT_ENDPOINTS } from './auth.contract'

export const productsService = {
  /** GET /api/v1/products */
  async list(query?: ProductsQuery): ApiServiceResponse<ProductListResponse> {
    const api = useApi()
    return api.get<ProductListResponse>(PRODUCT_ENDPOINTS.list, { params: query })
  },

  /** GET /api/v1/products/{product_id} */
  async getById(productId: string): ApiServiceResponse<ProductDetailResponse> {
    const api = useApi()
    return api.get<ProductDetailResponse>(PRODUCT_ENDPOINTS.byId(productId))
  },

  /** GET /api/v1/products/{product_id}/progress */
  async getProgress(productId: string): ApiServiceResponse<ProductProgressResponse> {
    const api = useApi()
    return api.get<ProductProgressResponse>(PRODUCT_ENDPOINTS.progress(productId))
  },

  /** GET /api/v1/products/my-courses — продукты, к которым у пользователя есть доступ */
  async myCourses(): ApiServiceResponse<ProductResponse[]> {
    const api = useApi()
    return api.get<ProductResponse[]>(PRODUCT_ENDPOINTS.myCourses)
  },

  /** POST /api/v1/products/lessons/{lesson_id}/complete */
  async completeLesson(
    lessonId: string,
    payload: LessonProgressCreate = {}
  ): ApiServiceResponse<LessonProgressResponse> {
    const api = useApi()
    return api.post<LessonProgressResponse>(PRODUCT_ENDPOINTS.completeLesson(lessonId), payload)
  },
}
