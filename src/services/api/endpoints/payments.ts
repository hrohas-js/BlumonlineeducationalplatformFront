/**
 * Payments Service — Doktor Blum
 *
 * Создание оплаты Robokassa, продление доступа, история, проверка статуса.
 */

import { useApi } from '@/composables/useApi'
import type {
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentRenewRequest,
  PaymentHistoryResponse,
  PaymentStatusResponse,
  ApiServiceResponse,
} from '../types'
import { PAYMENT_ENDPOINTS } from './auth.contract'

export const paymentsService = {
  /** POST /api/v1/payments/create */
  async create(payload: PaymentCreateRequest): ApiServiceResponse<PaymentCreateResponse> {
    const api = useApi()
    return api.post<PaymentCreateResponse>(PAYMENT_ENDPOINTS.create, payload)
  },

  /** POST /api/v1/payments/renew */
  async renew(productId: string): ApiServiceResponse<PaymentCreateResponse> {
    const api = useApi()
    const body: PaymentRenewRequest = { product_id: productId }
    return api.post<PaymentCreateResponse>(PAYMENT_ENDPOINTS.renew, body)
  },

  /** GET /api/v1/payments/history */
  async history(): ApiServiceResponse<PaymentHistoryResponse> {
    const api = useApi()
    return api.get<PaymentHistoryResponse>(PAYMENT_ENDPOINTS.history)
  },

  /** GET /api/v1/payments/success?InvId=... */
  async success(invId: number): ApiServiceResponse<PaymentStatusResponse> {
    const api = useApi()
    return api.get<PaymentStatusResponse>(PAYMENT_ENDPOINTS.success, { params: { InvId: invId } })
  },

  /** GET /api/v1/payments/fail?InvId=... */
  async fail(invId: number): ApiServiceResponse<PaymentStatusResponse> {
    const api = useApi()
    return api.get<PaymentStatusResponse>(PAYMENT_ENDPOINTS.fail, { params: { InvId: invId } })
  },
}
