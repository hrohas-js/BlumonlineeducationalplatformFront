/**
 * Vite Configuration — Doktor Blum
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §2):
 * - Алиас @ → src/ повторяет путь ~/  из Nuxt-проекта mirror-frontend
 * - additionalData инжектирует variables.scss и placeholder-файлы в каждый
 *   SCSS-файл компонента автоматически — точно как в nuxt.config.ts исходного проекта.
 *   Это позволяет использовать $main, @include inter-medium, @extend %u-mt-16
 *   в <style lang="scss" scoped> без ручных @import.
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Зеркало nuxt.config.ts → vite.css.preprocessorOptions.scss.additionalData
        additionalData: [
          '@import "@/assets/scss/variables.scss";',
          '@import "@/assets/scss/spacing.placeholders.scss";',
          '@import "@/assets/scss/padding.placeholders.scss";',
        ].join('\n'),
      },
    },
  },

  server: {
    port: 3000,
    open: true,
    // Локальный dev: браузер бьёт в тот же origin (см. VITE_API_BASE_URL=http://localhost:3000),
    // Vite проксирует на API без CORS в браузере.
    proxy: {
      '/api': {
        target: 'https://api.blumteam.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
