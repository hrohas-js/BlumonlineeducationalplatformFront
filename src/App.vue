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
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useAuthStore } from '@/stores/auth'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

const { notifications, dismiss } = useNotification()
const authStore = useAuthStore()
const showBootLoader = computed(() => !authStore.sessionInitialized)
</script>

<template>
  <div id="app-root">
    <div v-if="showBootLoader" class="app-boot-loader" aria-live="polite" aria-busy="true">
      Загрузка…
    </div>
    <template v-else>
      <RouterView v-slot="{ Component, route }">
        <Transition name="app-route" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
      <NotificationContainer :notifications="notifications" @dismiss="dismiss" />
    </template>
  </div>
</template>

<style>
#app-root,
#app {
  min-height: 100vh;
}

.app-boot-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  font-size: 1rem;
  color: #4a5568;
}

.app-route-enter-active,
.app-route-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.app-route-enter-from,
.app-route-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .app-route-enter-active,
  .app-route-leave-active {
    transition-duration: 0.01ms;
  }

  .app-route-enter-from,
  .app-route-leave-to {
    transform: none;
  }
}
</style>
