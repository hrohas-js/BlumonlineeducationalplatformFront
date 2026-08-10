/**
 * Glossary Service — публичное чтение текста глоссария.
 */

import { useApi } from '@/composables/useApi'
import type { ApiServiceResponse, GlossaryResponse } from '../types'
import { GLOSSARY_ENDPOINTS } from './auth.contract'

export const glossaryService = {
  /** GET /api/v1/glossary */
  async getGlossary(): ApiServiceResponse<GlossaryResponse> {
    const api = useApi()
    return api.get<GlossaryResponse>(GLOSSARY_ENDPOINTS.glossary)
  },
}
