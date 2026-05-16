<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'

export interface AdminProductEditBreadcrumbTopicsMenu {
  sectionId: string
  productId: string
  topics: AdminMaterialProductTopicRow[]
  activeTopicId?: string
}

interface Props {
  menu: AdminProductEditBreadcrumbTopicsMenu
  isOpen: boolean
}

const props = defineProps<Props>()

const route = useRoute()

const topicRouteName = computed(() => {
  const name = route.name
  if (name === 'admin-material-product-topic-notifications') {
    return 'admin-material-product-topic-notifications' as const
  }
  return 'admin-material-product-topic-edit' as const
})

const productEditTo = computed(() => ({
  name: 'admin-material-product-edit' as const,
  params: {
    sectionId: props.menu.sectionId,
    productId: props.menu.productId,
  },
}))

const topicTo = (topicId: string) => ({
  name: topicRouteName.value,
  params: {
    sectionId: props.menu.sectionId,
    productId: props.menu.productId,
    topicId,
  },
})
</script>

<template>
  <div
    v-show="props.isOpen"
    class="admin-product-edit-breadcrumbs-topics-menu"
    role="menu"
    aria-label="Выбор темы"
  >
    <RouterLink
      :to="productEditTo"
      class="admin-product-edit-breadcrumbs-topics-menu__item"
      role="menuitem"
    >
      <span class="admin-product-edit-breadcrumbs-topics-menu__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(3.75 6.25)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.2197 0.21967C10.5126 -0.0732233 10.9874 -0.0732233 11.2803 0.21967L16.2803 5.21967C16.5732 5.51256 16.5732 5.98744 16.2803 6.28033L11.2803 11.2803C10.9874 11.5732 10.5126 11.5732 10.2197 11.2803C9.92678 10.9874 9.92678 10.5126 10.2197 10.2197L13.9393 6.5L5.75 6.5C5.03668 6.5 3.95002 6.72016 3.06323 7.35865C2.21468 7.9696 1.5 8.99444 1.5 10.75C1.5 11.1642 1.16421 11.5 0.75 11.5C0.335786 11.5 0 11.1642 0 10.75C0 8.50556 0.951983 7.0304 2.18677 6.14135C3.38332 5.27984 4.79665 5 5.75 5L13.9393 5L10.2197 1.28033C9.92678 0.987437 9.92678 0.512563 10.2197 0.21967Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </span>
      <span class="admin-product-edit-breadcrumbs-topics-menu__label">Все темы</span>
    </RouterLink>

    <RouterLink
      v-for="topic in menu.topics"
      :key="topic.id"
      :to="topicTo(topic.id)"
      class="admin-product-edit-breadcrumbs-topics-menu__item"
      :class="{ 'admin-product-edit-breadcrumbs-topics-menu__item_active': topic.id === menu.activeTopicId }"
      role="menuitem"
    >
      <span class="admin-product-edit-breadcrumbs-topics-menu__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(3.75 6.25)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.2197 0.21967C10.5126 -0.0732233 10.9874 -0.0732233 11.2803 0.21967L16.2803 5.21967C16.5732 5.51256 16.5732 5.98744 16.2803 6.28033L11.2803 11.2803C10.9874 11.5732 10.5126 11.5732 10.2197 11.2803C9.92678 10.9874 9.92678 10.5126 10.2197 10.2197L13.9393 6.5L5.75 6.5C5.03668 6.5 3.95002 6.72016 3.06323 7.35865C2.21468 7.9696 1.5 8.99444 1.5 10.75C1.5 11.1642 1.16421 11.5 0.75 11.5C0.335786 11.5 0 11.1642 0 10.75C0 8.50556 0.951983 7.0304 2.18677 6.14135C3.38332 5.27984 4.79665 5 5.75 5L13.9393 5L10.2197 1.28033C9.92678 0.987437 9.92678 0.512563 10.2197 0.21967Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </span>
      <span class="admin-product-edit-breadcrumbs-topics-menu__label">{{ topic.title }}</span>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
/* Figma 493:2447 */
.admin-product-edit-breadcrumbs-topics-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: calc(var(--z-header) + 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  box-sizing: border-box;
  min-width: max(100%, 280px);
  width: max-content;
  max-width: min(420px, calc(100vw - 32px));
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-20);
  background-color: var(--white);
  box-shadow: 0 8px 24px rgba(1, 3, 7, 0.08);
}

.admin-product-edit-breadcrumbs-topics-menu__item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-decoration: none;
  color: #010307;
  cursor: pointer;
  border-radius: var(--radius-sm);

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    color: var(--text-accent);

    .admin-product-edit-breadcrumbs-topics-menu__icon {
      color: var(--text-accent);
    }
  }
}

.admin-product-edit-breadcrumbs-topics-menu__item_active {
  color: var(--text-accent);

  .admin-product-edit-breadcrumbs-topics-menu__icon {
    color: var(--text-accent);
  }
}

.admin-product-edit-breadcrumbs-topics-menu__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: inherit;
  transition: color 0.15s ease;
}

.admin-product-edit-breadcrumbs-topics-menu__label {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  white-space: nowrap;
  transition: color 0.15s ease;
}
</style>
