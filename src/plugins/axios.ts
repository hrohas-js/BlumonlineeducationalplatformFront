/**
 * Axios Vue Plugin — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * В Nuxt проекте axios предоставлялся через defineNuxtPlugin → provide({ api }).
 * В plain Vue 3 используем стандартный механизм: app.provide() + Symbol-ключ.
 *
 * DI-цепочка:
 *   main.ts → app.use(axiosPlugin)
 *     → app.provide(AxiosInstanceKey, apiClient)
 *       → useApi() composable (inject(AxiosInstanceKey))
 *         → authService / любой другой сервис
 *
 * Использование в composable:
 *   import { inject } from 'vue'
 *   import { AxiosInstanceKey } from '@/plugins/axios'
 *   const $api = inject(AxiosInstanceKey)!
 */
import type { App } from 'vue'
import type { AxiosInstance } from 'axios'
import { apiClient } from '@/services/axios'

/** Symbol-ключ для provide/inject axios instance */
export const AxiosInstanceKey = Symbol('axiosInstance')

export default {
  install(app: App) {
    app.provide(AxiosInstanceKey, apiClient)
  },
}

// Вспомогательный тип для удобного использования с inject()
export type { AxiosInstance }
