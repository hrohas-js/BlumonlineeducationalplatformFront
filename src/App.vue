<script setup lang="ts">
/**
 * App.vue — корневой компонент
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §3):
 * В mirror-frontend app.vue содержал <NuxtLayout><NuxtPage/></NuxtLayout>
 * и глобальные компоненты (NotificationContainer, RouteLoader).
 *
 * В plain Vue 3:
 * - <RouterView /> заменяет <NuxtPage />
 * - Layout применяется на уровне страницы через <AppLayout>
 * - initializeAuth() выполняется в bootstrap/auth.ts из main.ts
 */
import { useNotification } from '@/composables/useNotification'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

const { notifications, dismiss } = useNotification()
</script>

<template>
  <div id="app">
    <RouterView />
    <NotificationContainer :notifications="notifications" @dismiss="dismiss" />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
