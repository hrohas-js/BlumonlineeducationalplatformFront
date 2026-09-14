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
  ProductPricingOption,
  ProductsQuery,
} from '@/services/api/types'

export const useProductsStore = defineStore('products', () => {
  // ===== STATE =====
  const myCourses = ref<ProductResponse[]>([])
  const progressByProductId = ref<Record<string, ProductProgressResponse>>({})
  const productDetails = ref<Record<string, ProductDetailResponse>>({})
  const pricingByProductId = ref<Record<string, ProductPricingOption[]>>({})
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ===== GETTERS =====
  const hasCourses = computed(() => myCourses.value.length > 0)

  // ===== ACTIONS =====

  async function fetchProductsList(query?: ProductsQuery) {
    const result = await productsService.list(query)
    if (result.success && result.data) {
      return { success: true as const, data: result.data }
    }
    return { success: false as const, error: result.error || 'Не удалось загрузить список продуктов' }
  }

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

  async function fetchPricing(productId: string) {
    const result = await productsService.getPricing(productId)
    const options = result.success && Array.isArray(result.data) ? result.data : []
    pricingByProductId.value = {
      ...pricingByProductId.value,
      [productId]: options,
    }
    if (!result.success) {
      return { success: false as const, error: result.error || 'Не удалось загрузить варианты продления' }
    }
    return { success: true as const, data: options }
  }

  /** Параллельно подтянуть pricing по всем my-courses (для карточек /renewal). */
  async function fetchAllPricing() {
    if (myCourses.value.length === 0) return
    await Promise.all(myCourses.value.map((c) => fetchPricing(c.id)))
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
    pricingByProductId.value = {}
    error.value = null
  }

  return {
    myCourses,
    progressByProductId,
    productDetails,
    pricingByProductId,
    loading,
    error,
    hasCourses,
    fetchProductsList,
    fetchMyCourses,
    fetchProgress,
    fetchAllProgress,
    fetchPricing,
    fetchAllPricing,
    fetchProductDetail,
    completeLesson,
    reset,
  }
})
