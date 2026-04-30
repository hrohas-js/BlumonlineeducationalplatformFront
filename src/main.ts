/**
 * main.ts — точка входа приложения Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §4):
 * Порядок подключения плагинов важен:
 * 1. createPinia() — должен быть создан до первого использования store
 * 2. axiosPlugin — должен быть до первого useApi() (через provide)
 * 3. router — после pinia (guard может использовать store)
 *
 * Глобальные стили подключаются один раз здесь через import.
 * В mirror-frontend они подключались через nuxt.config.ts → css[].
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import { router } from './router'
import axiosPlugin from './plugins/axios'
import { bootstrapAuthSession } from './bootstrap/auth'

library.add(faEye, faEyeSlash)

// Локальные шрифты (Figma design system)
// @fontsource bundlе woff2-файлы, Vite автоматически копирует их в dist/
import '@fontsource/inter/400.css'             // Inter Regular
import '@fontsource/inter/500.css'             // Inter Medium
import '@fontsource/inter/600.css'             // Inter SemiBold
import '@fontsource/montserrat/300.css'        // Montserrat Light
import '@fontsource/montserrat/400.css'        // Montserrat Regular
import '@fontsource/montserrat/500.css'        // Montserrat Medium
import '@fontsource/montserrat/600.css'        // Montserrat SemiBold
import '@fontsource/montserrat/600-italic.css' // Montserrat SemiBold Italic
import '@fontsource/montserrat/700.css'        // Montserrat Bold
import '@fontsource/montserrat/800.css'        // Montserrat ExtraBold
import '@fontsource/roboto/300.css'         // Roboto Light
import '@fontsource/roboto/400.css'         // Roboto Regular
import '@fontsource/roboto/500.css'         // Roboto Medium
import '@fontsource/roboto/600.css'         // Roboto SemiBold
import '@fontsource/roboto/800.css'         // Roboto ExtraBold

// Глобальные стили (reset + typography + spacing utilities)
// Зеркало порядка css[] из nuxt.config.ts (см. ARCHITECTURE_ANALYSIS.md §2)
import './assets/scss/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(pinia)
app.use(axiosPlugin)
app.use(router)
bootstrapAuthSession(pinia)
  .catch((error) => {
    console.error('[bootstrapAuthSession] Failed to initialize auth session:', error)
  })
  .finally(() => {
    app.mount('#app')
  })
