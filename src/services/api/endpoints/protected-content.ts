/**
 * Protected Content Service — Doktor Blum
 *
 * Подписанные URL и токены для защищённого видео-контента.
 * Используется когда добавим видео-плеер уроков.
 */

import { useApi } from '@/composables/useApi'
import type {
  VideoTokenResponse,
  SignedUrlResponse,
  HLSEncryptionKeyResponse,
  ContentAccessLogResponse,
  ApiServiceResponse,
} from '../types'
import { PROTECTED_CONTENT_ENDPOINTS } from './auth.contract'

export const protectedContentService = {
  /** POST /api/v1/protected-content/video/token?video_id=...&product_id=... */
  async getVideoToken(
    videoId: string,
    productId: string
  ): ApiServiceResponse<VideoTokenResponse> {
    const api = useApi()
    return api.post<VideoTokenResponse>(PROTECTED_CONTENT_ENDPOINTS.videoToken, undefined, {
      params: { video_id: videoId, product_id: productId },
    })
  },

  /** GET /api/v1/protected-content/signed-url?resource_path=...&product_id=...&expiration_minutes=60 */
  async getSignedUrl(
    resourcePath: string,
    productId: string,
    expirationMinutes = 60
  ): ApiServiceResponse<SignedUrlResponse> {
    const api = useApi()
    return api.get<SignedUrlResponse>(PROTECTED_CONTENT_ENDPOINTS.signedUrl, {
      params: {
        resource_path: resourcePath,
        product_id: productId,
        expiration_minutes: expirationMinutes,
      },
    })
  },

  /** GET /api/v1/protected-content/video/hls-key/{video_id}?product_id=... */
  async getHlsKey(
    videoId: string,
    productId: string
  ): ApiServiceResponse<HLSEncryptionKeyResponse> {
    const api = useApi()
    return api.get<HLSEncryptionKeyResponse>(PROTECTED_CONTENT_ENDPOINTS.hlsKey(videoId), {
      params: { product_id: productId },
    })
  },

  /** POST /api/v1/protected-content/log-access */
  async logAccess(
    resourceId: string,
    resourceType: string,
    action: string
  ): ApiServiceResponse<ContentAccessLogResponse> {
    const api = useApi()
    return api.post<ContentAccessLogResponse>(
      PROTECTED_CONTENT_ENDPOINTS.logAccess,
      undefined,
      {
        params: {
          resource_id: resourceId,
          resource_type: resourceType,
          action,
        },
      }
    )
  },
}
