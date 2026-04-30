<script setup lang="ts">
/**
 * AppLayout — layouts/AppLayout.vue
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §3):
 * В mirror-frontend layouts лежат в корневой папке layouts/ и подключаются
 * через Nuxt <NuxtLayout>. В plain Vue 3 layout — обычный компонент,
 * оборачивающий <RouterView /> или используемый через <component :is="...">
 * в App.vue.
 *
 * Структура: Header + main (с slot) + Footer.
 */
import { ref, watch } from 'vue'
import AppHeader from '@/components/organisms/AppHeader.vue'
import AppFooter from '@/components/organisms/AppFooter.vue'
import HeaderMobileMenu from '@/components/organisms/HeaderMobileMenu.vue'
import { BREAKPOINTS, useMediaQuery } from '@/composables/useMediaQuery'

const props = withDefaults(defineProps<{ contentMode?: 'default' | 'boxed' }>(), {
  contentMode: 'default',
})

const isHeaderMenuOpen = ref(false)
const isMobileLg = useMediaQuery(BREAKPOINTS.lg)

const toggleHeaderMenu = () => {
  if (!isMobileLg.value) return
  isHeaderMenuOpen.value = !isHeaderMenuOpen.value
}

const closeHeaderMenu = () => {
  isHeaderMenuOpen.value = false
}

watch(isMobileLg, (isMobile) => {
  if (!isMobile) closeHeaderMenu()
})
</script>

<template>
  <div class="app-layout">
    <AppHeader :is-header-menu-open="isHeaderMenuOpen" @toggle-header-menu="toggleHeaderMenu" />

    <main class="app-layout__main" role="main">
      <div class="app-layout__main-stage">
        <section
          class="app-layout__main-content"
          :class="{
            'app-layout__main-content_hidden': isHeaderMenuOpen && isMobileLg,
            'app-layout__main-content_boxed': props.contentMode === 'boxed',
          }"
        >
          <slot />
        </section>

        <section
          class="app-layout__main-menu"
          :class="{ 'app-layout__main-menu_visible': isHeaderMenuOpen && isMobileLg }"
        >
          <HeaderMobileMenu @close="closeHeaderMenu" />
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);

  &__main {
    flex: 1;
    width: var(--size-content-width);
    max-width: var(--size-1148);
    margin: 0 auto;
    padding-bottom: var(--sp-40);
  }

  &__main-stage {
    position: relative;
  }

  &__main-content,
  &__main-menu {
    transition: transform 0.35s ease, opacity 0.35s ease;
    transform-origin: center top;
    will-change: transform, opacity;
  }

  &__main-content {
    background: transparent;
    border-radius: 0;
    padding: 0;

    &_boxed {
      margin-top: var(--sp-40);
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-40);
    }
  }

  &__main-menu {
    display: none;
  }

  @media (max-width: 1024px) {
    &__main-stage {
      min-height: var(--size-360);
    }

    &__main-content {
      transform: scale(1) translateY(0);
      opacity: var(--opacity-full);

      &_hidden {
        display: none;
        transform: scale(0.94) translateY(var(--sp-16));
        opacity: 0;
        pointer-events: none;
      }
    }

    &__main-menu {
      display: none;
      position: static;
      margin-top: 0;
      transform: scale(0.94) translateY(var(--sp-16));
      opacity: 0;
      pointer-events: none;

      &_visible {
        display: block;
        margin-top: var(--sp-40);
        transform: scale(1) translateY(0);
        opacity: var(--opacity-full);
        pointer-events: auto;
      }
    }
  }
}
</style>
