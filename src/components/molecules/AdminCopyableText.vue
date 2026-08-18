<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const props = defineProps<{
  text: string
  ariaLabel: string
  successMessage: string
}>()

const { notify } = useNotification()

async function onCopy() {
  try {
    await navigator.clipboard.writeText(props.text)
    notify({ type: 'success', message: props.successMessage })
  } catch {
    notify({ type: 'error', message: 'Не удалось скопировать' })
  }
}
</script>

<template>
  <span class="admin-copyable-text">
    <span class="admin-copyable-text__value">{{ text }}</span>
    <button
      type="button"
      class="admin-copyable-text__copy"
      :aria-label="ariaLabel"
      @click.stop.prevent="onCopy"
    >
      <svg
        class="admin-copyable-text__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2" />
        <path
          d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </span>
</template>

<style lang="scss" scoped>
.admin-copyable-text {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-6);
  min-width: 0;
  max-width: 100%;
}

.admin-copyable-text__value {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-copyable-text__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--knopka);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  border-radius: var(--radius-sm);

  .admin-copyable-text:hover &,
  .admin-copyable-text:focus-within & {
    opacity: 1;
    pointer-events: auto;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    opacity: 1;
    pointer-events: auto;
  }
}

.admin-copyable-text__icon {
  display: block;
  width: 18px;
  height: 18px;
}
</style>
