<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AdminProductEditBreadcrumbsTopicsMenu, {
  type AdminProductEditBreadcrumbTopicsMenu,
} from '@/components/molecules/AdminProductEditBreadcrumbsTopicsMenu.vue'

export type { AdminProductEditBreadcrumbTopicsMenu }

export interface AdminProductEditBreadcrumbItem {
  label: string
  to?: RouteLocationRaw
  topicsMenu?: AdminProductEditBreadcrumbTopicsMenu
}

interface Props {
  /** Явный список крошек (предпочтительно). */
  items?: AdminProductEditBreadcrumbItem[]
  /** Устаревший API: два сегмента без ссылок. */
  folderLabel?: string
  editingLabel?: string
}

const props = defineProps<Props>()

const crumbs = computed<AdminProductEditBreadcrumbItem[]>(() => {
  if (props.items?.length) return props.items
  if (props.folderLabel && props.editingLabel) {
    return [
      { label: props.folderLabel },
      { label: props.editingLabel },
    ]
  }
  return []
})

const menuOpenByIndex = ref<Record<number, boolean>>({})
const closeTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const CLOSE_DELAY_MS = 180

const cancelCloseMenu = () => {
  if (closeTimer.value != null) {
    clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
}

const openMenu = (index: number) => {
  cancelCloseMenu()
  menuOpenByIndex.value = { [index]: true }
}

const scheduleCloseMenu = (index: number) => {
  cancelCloseMenu()
  closeTimer.value = setTimeout(() => {
    if (menuOpenByIndex.value[index]) {
      const next = { ...menuOpenByIndex.value }
      delete next[index]
      menuOpenByIndex.value = next
    }
    closeTimer.value = null
  }, CLOSE_DELAY_MS)
}

const isMenuOpen = (index: number) => menuOpenByIndex.value[index] === true

const onMenuWrapFocusOut = (index: number, event: FocusEvent) => {
  const wrap = event.currentTarget as HTMLElement | null
  const next = event.relatedTarget as Node | null
  if (wrap?.contains(next)) return
  scheduleCloseMenu(index)
}

onUnmounted(() => {
  cancelCloseMenu()
})
</script>

<template>
  <nav class="admin-product-edit-breadcrumbs" aria-label="Навигация по разделу">
    <ol class="admin-product-edit-breadcrumbs__list">
      <li
        v-for="(item, index) in crumbs"
        :key="`${item.label}-${index}`"
        class="admin-product-edit-breadcrumbs__item"
      >
        <div
          v-if="item.to && item.topicsMenu"
          class="admin-product-edit-breadcrumbs__dropdown-wrap"
          @mouseenter="openMenu(index)"
          @mouseleave="scheduleCloseMenu(index)"
          @focusin="openMenu(index)"
          @focusout="onMenuWrapFocusOut(index, $event)"
        >
          <RouterLink
            :to="item.to"
            class="admin-product-edit-breadcrumbs__link admin-product-edit-breadcrumbs__link_with-menu"
            :aria-expanded="isMenuOpen(index)"
            aria-haspopup="menu"
          >
            {{ item.label }}
          </RouterLink>
          <AdminProductEditBreadcrumbsTopicsMenu
            :menu="item.topicsMenu"
            :is-open="isMenuOpen(index)"
          />
        </div>
        <RouterLink
          v-else-if="item.to"
          :to="item.to"
          class="admin-product-edit-breadcrumbs__link"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="admin-product-edit-breadcrumbs__text"
          aria-current="page"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < crumbs.length - 1"
          class="admin-product-edit-breadcrumbs__sep"
          aria-hidden="true"
        >
          <svg
            class="admin-product-edit-breadcrumbs__sep-icon"
            width="32"
            height="15"
            viewBox="0 0 32 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 6.36395H0V8.36395H1V7.36395V6.36395ZM31.7071 8.07106C32.0976 7.68054 32.0976 7.04737 31.7071 6.65685L25.3431 0.292885C24.9526 -0.0976396 24.3195 -0.0976396 23.9289 0.292885C23.5384 0.683409 23.5384 1.31657 23.9289 1.7071L29.5858 7.36395L23.9289 13.0208C23.5384 13.4113 23.5384 14.0445 23.9289 14.435C24.3195 14.8255 24.9526 14.8255 25.3431 14.435L31.7071 8.07106ZM1 7.36395V8.36395H31V7.36395V6.36395H1V7.36395Z"
              fill="#010307"
            />
          </svg>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.admin-product-edit-breadcrumbs {
  &__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: var(--sp-15);
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-15);
    min-width: 0;
  }

  &__dropdown-wrap {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__link,
  &__text {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    line-height: normal;
    color: var(--black);
    white-space: nowrap;
  }

  &__link {
    display: inline-block;
    box-sizing: border-box;
    padding: var(--sp-6) 0;
    border: none;
    border-bottom: var(--border-2) solid transparent;
    background: transparent;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.25s ease;

    &:hover {
      border-bottom-color: var(--podcherkivanie-pri-navedenii);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
      border-radius: var(--radius-sm);
    }
  }

  &__link_with-menu {
    &[aria-expanded='true'] {
      border-bottom-color: var(--podcherkivanie-pri-navedenii);
    }
  }

  &__text {
    text-align: center;
  }

  &__sep {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__sep-icon {
    display: block;
    width: 32px;
    height: 15px;
  }

  @media (max-width: 1023px) {
    &__link,
    &__text {
      font-size: var(--size-15);
    }
  }
}
</style>
