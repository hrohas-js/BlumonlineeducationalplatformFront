<script setup lang="ts">
import type { HeaderNavSubmenuIconType, HeaderNavSubmenuItem } from '@/constants/headerNavSubmenu'

withDefaults(
  defineProps<{
    items: HeaderNavSubmenuItem[]
    iconType?: HeaderNavSubmenuIconType
    variant?: 'desktop' | 'mobile'
  }>(),
  {
    iconType: 'arrow',
    variant: 'desktop',
  },
)

const emit = defineEmits<{
  (event: 'navigate'): void
}>()

const onLinkClick = () => {
  emit('navigate')
}
</script>

<template>
  <div
    class="header-nav-submenu"
    :class="{ 'header-nav-submenu_mobile': variant === 'mobile' }"
    role="menu"
  >
    <a
      v-for="item in items"
      :key="item.href"
      :href="item.href"
      target="_blank"
      class="header-nav-submenu__link"
      role="menuitem"
      @click="onLinkClick"
    >
      <span
        class="header-nav-submenu__link-icon"
        :class="{
          'header-nav-submenu__link-icon_arrow': iconType === 'arrow',
          'header-nav-submenu__link-icon_lock': iconType === 'lock',
        }"
        aria-hidden="true"
      />
      <span class="header-nav-submenu__link-label">{{ item.label }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.header-nav-submenu {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--sp-16);
  padding: var(--sp-40);
  border: 1px solid #010307;
  border-radius: var(--radius-20);
  background-color: var(--white);

  &_mobile {
    padding: var(--sp-20);
    margin-top: var(--sp-12);
    border-radius: var(--radius-16, 16px);
  }

  &__link {
    display: flex;
    align-items: flex-start;
    gap: var(--sp-12);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    line-height: 1.2;
    color: var(--osnovnoy-tekst);
    text-decoration: none;
    transition: color 0.25s ease;

    &:hover,
    &:focus-visible {
      color: var(--text-accent);

      .header-nav-submenu__link-icon {
        background-color: var(--text-accent);
      }
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
      border-radius: 4px;
    }
  }

  &__link-icon {
    flex-shrink: 0;
    background-color: var(--osnovnoy-tekst);
    transition: background-color 0.25s ease;

    &_arrow {
      width: 17px;
      height: 12px;
      margin-top: 4px;
      mask: url('@/assets/icons/header-nav-link-arrow.svg') no-repeat center / contain;
    }

    &_lock {
      width: 22px;
      height: 22px;
      margin-top: 0;
      mask: url('@/assets/icons/header-nav-lock.svg') no-repeat center / contain;
    }
  }

  &__link-label {
    flex: 1;
    min-width: 0;
  }

  &_mobile &__link {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: clamp(16px, calc(16px + 4 * ((100vw - 430px) / 594)), 20px);
  }
}
</style>
