<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AdminTopicNotificationTemplate } from '@/utils/adminTopicNotifications'

interface Props {
  modelValue: string | null
  templates: AdminTopicNotificationTemplate[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Выберите шаблон',
})

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'select', template: AdminTopicNotificationTemplate): void
}

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const selectedTemplate = computed(() =>
  props.templates.find((t) => t.id === props.modelValue) ?? null,
)

const displayLabel = computed(() => selectedTemplate.value?.label ?? '')

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectTemplate = (template: AdminTopicNotificationTemplate) => {
  emit('update:modelValue', template.id)
  emit('select', template)
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
  <div ref="rootRef" class="admin-topic-notifications-template-select">
    <button
      type="button"
      class="admin-topic-notifications-template-select__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <span
        class="admin-topic-notifications-template-select__label-text"
        :class="{ 'admin-topic-notifications-template-select__label-text_placeholder': !displayLabel }"
      >
        {{ displayLabel || placeholder }}
      </span>
      <span class="admin-topic-notifications-template-select__chevron" aria-hidden="true">
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
      class="admin-topic-notifications-template-select__list"
      role="listbox"
      @click.stop
    >
      <li v-for="tpl in templates" :key="tpl.id" role="presentation">
        <button
          type="button"
          class="admin-topic-notifications-template-select__option"
          role="option"
          :aria-selected="tpl.id === modelValue"
          @click="selectTemplate(tpl)"
        >
          {{ tpl.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
/* Figma 492:1504 */
.admin-topic-notifications-template-select {
  position: relative;
  width: 100%;
}

.admin-topic-notifications-template-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: var(--sp-10) var(--sp-20);
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
  text-align: left;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-notifications-template-select__label-text_placeholder {
  color: rgba(1, 3, 7, 0.35);
}

.admin-topic-notifications-template-select__chevron {
  display: inline-flex;
  flex-shrink: 0;
  margin-left: var(--sp-12);
}

.admin-topic-notifications-template-select__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 2;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  box-shadow: 0 4px 12px rgba(1, 3, 7, 0.12);
}

.admin-topic-notifications-template-select__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px var(--sp-20);
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  color: #010307;
  cursor: pointer;

  &:hover,
  &[aria-selected='true'] {
    background-color: rgba(23, 142, 240, 0.12);
  }
}
</style>
