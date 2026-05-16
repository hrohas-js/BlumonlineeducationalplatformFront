<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  ADMIN_TOPIC_NOTIFICATION_PAGE_SIZE_OPTIONS,
  type AdminTopicNotificationPageSize,
} from '@/utils/adminTopicNotifications'

interface Props {
  modelValue: AdminTopicNotificationPageSize
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: AdminTopicNotificationPageSize): void
}

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const options = ADMIN_TOPIC_NOTIFICATION_PAGE_SIZE_OPTIONS.map((n) => ({
  id: String(n),
  label: String(n),
  value: n,
}))

const displayLabel = computed(() => String(props.modelValue))

const toggle = () => {
  isOpen.value = !isOpen.value
}

const select = (value: AdminTopicNotificationPageSize) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const onDocumentPointerDown = (event: MouseEvent) => {
  if (!isOpen.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target)) return
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
</script>

<template>
  <div ref="rootRef" class="admin-topic-notifications-page-size-select">
    <button
      type="button"
      class="admin-topic-notifications-page-size-select__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <span class="admin-topic-notifications-page-size-select__value">{{ displayLabel }}</span>
      <span class="admin-topic-notifications-page-size-select__chevron" aria-hidden="true">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
    <ul
      v-if="isOpen"
      class="admin-topic-notifications-page-size-select__list"
      role="listbox"
      @click.stop
    >
      <li v-for="opt in options" :key="opt.id" role="presentation">
        <button
          type="button"
          class="admin-topic-notifications-page-size-select__option"
          role="option"
          :aria-selected="opt.value === modelValue"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
/* Figma 489:1371 */
.admin-topic-notifications-page-size-select {
  position: relative;
  display: inline-flex;
}

.admin-topic-notifications-page-size-select__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: 0;
  padding: var(--sp-10);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-notifications-page-size-select__value {
  min-width: 1.5em;
  text-align: center;
}

.admin-topic-notifications-page-size-select__chevron {
  display: inline-flex;
  flex-shrink: 0;
  color: #010307;
}

.admin-topic-notifications-page-size-select__list {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 2;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  min-width: 100%;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  box-shadow: 0 4px 12px rgba(1, 3, 7, 0.12);
}

.admin-topic-notifications-page-size-select__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: 8px 12px;
  border: none;
  background: transparent;
  text-align: center;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #010307;
  cursor: pointer;

  &:hover,
  &[aria-selected='true'] {
    background-color: rgba(23, 142, 240, 0.12);
  }
}
</style>
