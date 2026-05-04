/**
 * Payments Store — Doktor Blum
 *
 * Тонкий стор для создания/продления оплат и истории платежей.
 * Создание оплаты возвращает payment_url Robokassa — клиент сам редиректит.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { paymentsService } from '@/services/api/endpoints/payments'
import type { PaymentResponse, PaymentCreateRequest } from '@/services/api/types'

export const usePaymentsStore = defineStore('payments', () => {
  const history = ref<PaymentResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createPayment(payload: PaymentCreateRequest) {
    loading.value = true
    error.value = null
    const result = await paymentsService.create(payload)
    loading.value = false
    if (!result.success || !result.data) {
      error.value = result.error || 'Не удалось создать оплату'
      return { success: false, error: error.value }
    }
    return { success: true, data: result.data }
  }

  async function renew(productId: string) {
    loading.value = true
    error.value = null
    const result = await paymentsService.renew(productId)
    loading.value = false
    if (!result.success || !result.data) {
      error.value = result.error || 'Не удалось создать продление'
      return { success: false, error: error.value }
    }
    return { success: true, data: result.data }
  }

  async function fetchHistory() {
    loading.value = true
    error.value = null
    const result = await paymentsService.history()
    loading.value = false
    if (!result.success || !result.data) {
      error.value = result.error || 'Не удалось загрузить историю платежей'
      return { success: false, error: error.value }
    }
    history.value = result.data.payments
    return { success: true, data: result.data }
  }

  return {
    history,
    loading,
    error,
    createPayment,
    renew,
    fetchHistory,
  }
})
