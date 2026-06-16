import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'

const isLogoutModalOpen = ref(false)
const logoutLoading = ref(false)

export function useLogout() {
  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  const router = useRouter()

  function openLogoutModal() {
    isLogoutModalOpen.value = true
  }

  function closeLogoutModal() {
    if (logoutLoading.value) return
    isLogoutModalOpen.value = false
  }

  async function confirmLogout() {
    if (logoutLoading.value) return
    logoutLoading.value = true
    try {
      await authStore.logout()
      productsStore.reset()
      isLogoutModalOpen.value = false
      await router.push({ name: 'login' })
    } finally {
      logoutLoading.value = false
    }
  }

  return {
    isLogoutModalOpen,
    logoutLoading,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
    performLogout: confirmLogout,
  }
}
