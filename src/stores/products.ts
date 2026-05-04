/**
 * Products Store — Doktor Blum
 *
 * Курсы пользователя (my-courses) + прогресс по каждому продукту.
 * Прогресс кешируется отдельной мапой product_id → ProductProgressResponse.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsService } from '@/services/api/endpoints/products'
import type {
  ProductResponse,
  ProductProgressResponse,
  ProductDetailResponse,
} from '@/services/api/types'

export const useProductsStore = defineStore('products', () => {
  // ===== STATE =====
  const myCourses = ref<ProductResponse[]>([])
  const progressByProductId = ref<Record<string, ProductProgressResponse>>({})
  const productDetails = ref<Record<string, ProductDetailResponse>>({})
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ===== GETTERS =====
  const hasCourses = computed(() => myCourses.value.length > 0)

  // ===== ACTIONS =====

  async function fetchMyCourses() {
    loading.value = true
    error.value = null

    const result = await productsService.myCourses()

    if (result.success && result.data) {
      myCourses.value = result.data
      loading.value = false
      return { success: true, data: result.data }
    }

    error.value = result.error || 'Не удалось загрузить курсы'
    loading.value = false
    return { success: false, error: error.value }
  }

  async function fetchProgress(productId: string) {
    const result = await productsService.getProgress(productId)
    if (result.success && result.data) {
      progressByProductId.value = {
        ...progressByProductId.value,
        [productId]: result.data,
      }
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error || 'Не удалось загрузить прогресс' }
  }

  /** Параллельно подтянуть прогресс по всем my-courses (для рендера карточек). */
  async function fetchAllProgress() {
    if (myCourses.value.length === 0) return
    await Promise.all(myCourses.value.map((c) => fetchProgress(c.id)))
  }

  async function fetchProductDetail(productId: string) {
    const result = await productsService.getById(productId)
    if (result.success && result.data) {
      productDetails.value = {
        ...productDetails.value,
        [productId]: result.data,
      }
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error || 'Не удалось загрузить курс' }
  }

  async function completeLesson(lessonId: string, watchTime?: number) {
    const result = await productsService.completeLesson(lessonId, { watch_time: watchTime })
    return result
  }

  function reset() {
    myCourses.value = []
    progressByProductId.value = {}
    productDetails.value = {}
    error.value = null
  }

  return {
    myCourses,
    progressByProductId,
    productDetails,
    loading,
    error,
    hasCourses,
    fetchMyCourses,
    fetchProgress,
    fetchAllProgress,
    fetchProductDetail,
    completeLesson,
    reset,
  }
})
