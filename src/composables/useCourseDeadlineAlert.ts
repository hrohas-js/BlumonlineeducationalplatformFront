import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import {
  getCoursesNeedingDeadlineAlert,
  type DeadlineAlertItem,
} from '@/utils/deadlineAlert'

export function useCourseDeadlineAlert() {
  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  const route = useRoute()
  const router = useRouter()

  const alertQueue = ref<DeadlineAlertItem[]>([])
  const isModalOpen = ref(false)
  const hasCheckedThisSession = ref(false)

  const currentAlert = computed(() => alertQueue.value[0] ?? null)

  async function checkAndShowAlerts() {
    if (hasCheckedThisSession.value) {
      return
    }
    if (!authStore.sessionInitialized || !authStore.isSessionValid()) {
      return
    }
    if (route.meta.requiresAdmin === true) {
      return
    }

    hasCheckedThisSession.value = true

    const coursesResult = await productsStore.fetchMyCourses()
    if (!coursesResult.success || productsStore.myCourses.length === 0) {
      return
    }

    await productsStore.fetchAllProgress()

    const alerts = getCoursesNeedingDeadlineAlert(
      productsStore.myCourses,
      productsStore.progressByProductId,
    )

    if (alerts.length === 0) {
      return
    }

    alertQueue.value = alerts
    isModalOpen.value = true
  }

  function showNextOrClose() {
    alertQueue.value = alertQueue.value.slice(1)
    isModalOpen.value = alertQueue.value.length > 0
  }

  function onClose() {
    showNextOrClose()
  }

  function onRenew() {
    const productId = currentAlert.value?.productId
    isModalOpen.value = false
    alertQueue.value = []

    void router.push({
      name: 'home-section',
      params: { section: 'renewal' },
      ...(productId ? { query: { highlight: productId } } : {}),
    })
  }

  watch(
    () => [authStore.sessionInitialized, authStore.isSessionValid()] as const,
    ([initialized, valid]) => {
      if (!initialized || !valid) {
        return
      }
      void checkAndShowAlerts()
    },
    { immediate: true },
  )

  return {
    isModalOpen,
    currentAlert,
    onClose,
    onRenew,
  }
}
