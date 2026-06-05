import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'

export function useLogout() {
  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  const router = useRouter()
  const logoutLoading = ref(false)

  async function performLogout() {
    if (logoutLoading.value) return
    logoutLoading.value = true
    try {
      await authStore.logout()
      productsStore.reset()
      await router.push({ name: 'login' })
    } finally {
      logoutLoading.value = false
    }
  }

  return { performLogout, logoutLoading }
}
