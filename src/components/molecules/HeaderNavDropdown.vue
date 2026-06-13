<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import headerNavChevron from '@/assets/icons/header-nav-chevron.svg'
import type { HeaderNavSubmenuIconType, HeaderNavSubmenuItem } from '@/constants/headerNavSubmenu'
import HeaderNavSubmenuPanel from '@/components/molecules/HeaderNavSubmenuPanel.vue'

const props = withDefaults(
  defineProps<{
    label: string
    items: HeaderNavSubmenuItem[]
    iconType?: HeaderNavSubmenuIconType
    isOpen?: boolean
  }>(),
  {
    iconType: 'arrow',
  },
)

const emit = defineEmits<{
  (event: 'toggle'): void
  (event: 'close'): void
}>()

const internalOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const isControlled = computed(() => props.isOpen !== undefined)
const isOpenState = computed(() => (isControlled.value ? props.isOpen : internalOpen.value))
const isWidePanel = computed(() => props.items.length > 3)

const toggle = (event: MouseEvent) => {
  event.stopPropagation()
  if (isControlled.value) {
    emit('toggle')
    return
  }

  internalOpen.value = !internalOpen.value
}

const close = () => {
  if (isControlled.value) {
    emit('close')
    return
  }

  internalOpen.value = false
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isOpenState.value) return
  const target = event.target as Node | null
  if (dropdownRef.value && target && !dropdownRef.value.contains(target)) {
    close()
  }
}

const onEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpenState.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onEscapeKey)
})
</script>

<template>
  <div ref="dropdownRef" class="header-nav-dropdown">
    <button
      type="button"
      class="header-nav-dropdown__trigger"
      :class="{ 'header-nav-dropdown__trigger_open': isOpenState }"
      :aria-expanded="isOpenState"
      aria-haspopup="true"
      @click="toggle"
    >
      <span class="header-nav-dropdown__label">{{ label }}</span>
      <span
        class="header-nav-dropdown__chevron"
        :class="{ 'header-nav-dropdown__chevron_open': isOpenState }"
        aria-hidden="true"
      >
        <img :src="headerNavChevron" width="13" height="9" alt="" />
      </span>
    </button>

    <HeaderNavSubmenuPanel
      v-if="isOpenState"
      class="header-nav-dropdown__panel"
      :class="{ 'header-nav-dropdown__panel_wide': isWidePanel }"
      :items="items"
      :icon-type="iconType"
      @navigate="close"
    />
  </div>
</template>

<style lang="scss" scoped>
.header-nav-dropdown {
  position: relative;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-8);
    margin: 0;
    padding: var(--sp-6) var(--sp-0);
    border: none;
    border-bottom: var(--border-2) solid transparent;
    background: transparent;
    font-family: var(--second-family);
    font-weight: var(--font-regular);
    font-size: var(--size-20);
    text-align: center;
    color: var(--osnovnoy-tekst);
    cursor: pointer;
    transition: border-color 0.25s ease, color 0.25s ease;

    &:hover,
    &:focus-visible,
    &_open {
      border-bottom-color: var(--podcherkivanie-pri-navedenii);
      color: var(--text-accent);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
      border-radius: 4px;
    }
  }

  &__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;

    &_open {
      transform: rotate(180deg);
    }
  }

  &__panel {
    position: absolute;
    top: calc(100% + var(--sp-8));
    left: 0;
    z-index: calc(var(--z-header) + 1);
    min-width: max(100%, 280px);
    width: max-content;
    max-width: min(420px, calc(100vw - 48px));

    &_wide {
      max-width: min(480px, calc(100vw - 48px));
    }
  }
}
</style>
