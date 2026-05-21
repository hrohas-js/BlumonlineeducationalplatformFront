<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ADMIN_MATERIAL_SECTION_LIST,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import {
  MOCK_ADMIN_CATEGORY_SECTIONS,
  getProductTopicsList,
  type AdminMaterialProductTopicRow,
} from '@/utils/adminMaterialCatalog'

interface SelectOption {
  id: string
  label: string
}

interface Props {
  sectionId: AdminMaterialSectionId | null
  productId: string | null
  topicId: string | null
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:sectionId', value: AdminMaterialSectionId | null): void
  (e: 'update:productId', value: string | null): void
  (e: 'update:topicId', value: string | null): void
}

const emit = defineEmits<Emits>()

const FILTER_SECTION_IDS = ['courses', 'projects', 'other'] as const satisfies readonly AdminMaterialSectionId[]

const sectionOptions = computed(() =>
  ADMIN_MATERIAL_SECTION_LIST.filter((s) =>
    (FILTER_SECTION_IDS as readonly AdminMaterialSectionId[]).includes(s.id),
  ).map((s) => ({ id: s.id, label: s.title })),
)

const productOptions = computed((): SelectOption[] => {
  if (!props.sectionId) return []
  const section = MOCK_ADMIN_CATEGORY_SECTIONS.find((s) => s.sectionId === props.sectionId)
  return (section?.cards ?? []).map((card) => ({ id: card.id, label: card.title }))
})

const topicOptions = computed((): SelectOption[] => {
  if (!props.sectionId || !props.productId) return []
  const section = MOCK_ADMIN_CATEGORY_SECTIONS.find((s) => s.sectionId === props.sectionId)
  const card = section?.cards.find((c) => c.id === props.productId)
  if (!card) return []
  const topics: AdminMaterialProductTopicRow[] = getProductTopicsList(card.id, card.edit.topics)
  return topics.map((t) => ({ id: t.id, label: t.title }))
})

const sectionLabel = computed(
  () => sectionOptions.value.find((o) => o.id === props.sectionId)?.label ?? 'Выберите папку',
)
const productLabel = computed(
  () => productOptions.value.find((o) => o.id === props.productId)?.label ?? 'Выберите продукт',
)
const topicLabel = computed(
  () => topicOptions.value.find((o) => o.id === props.topicId)?.label ?? 'Выберите тему',
)

const openField = ref<'section' | 'product' | 'topic' | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const toggleField = (field: 'section' | 'product' | 'topic') => {
  openField.value = openField.value === field ? null : field
}

const closeMenus = () => {
  openField.value = null
}

const selectSection = (id: AdminMaterialSectionId) => {
  emit('update:sectionId', id)
  emit('update:productId', null)
  emit('update:topicId', null)
  closeMenus()
}

const selectProduct = (id: string) => {
  emit('update:productId', id)
  emit('update:topicId', null)
  closeMenus()
}

const selectTopic = (id: string) => {
  emit('update:topicId', id)
  closeMenus()
}

const onDocumentPointerDown = (event: MouseEvent) => {
  if (!openField.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target)) return
  closeMenus()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})

watch(
  () => props.sectionId,
  (sectionId) => {
    if (!sectionId && sectionOptions.value.length > 0) {
      emit('update:sectionId', sectionOptions.value[0].id as AdminMaterialSectionId)
    }
  },
  { immediate: true },
)

watch(productOptions, (options) => {
  if (options.length === 0) return
  if (!props.productId || !options.some((o) => o.id === props.productId)) {
    emit('update:productId', options[0].id)
  }
})

watch(topicOptions, (options) => {
  if (options.length === 0) return
  if (!props.topicId || !options.some((o) => o.id === props.topicId)) {
    emit('update:topicId', options[0].id)
  }
})
</script>

<template>
  <section ref="rootRef" class="admin-notifications-create-filters-section">
    <div class="admin-notifications-create-filters-section__row">
      <span class="admin-notifications-create-filters-section__label">Выбрать папку</span>
      <div class="admin-notifications-create-filters-section__dropdown">
        <button
          type="button"
          class="admin-notifications-create-filters-section__trigger"
          :aria-expanded="openField === 'section'"
          aria-haspopup="listbox"
          @click.stop="toggleField('section')"
        >
          <span class="admin-notifications-create-filters-section__trigger-text">{{ sectionLabel }}</span>
          <span class="admin-notifications-create-filters-section__chevron" aria-hidden="true">
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
          v-if="openField === 'section'"
          class="admin-notifications-create-filters-section__list"
          role="listbox"
        >
          <li v-for="opt in sectionOptions" :key="opt.id" role="presentation">
            <button
              type="button"
              role="option"
              class="admin-notifications-create-filters-section__option"
              :aria-selected="opt.id === sectionId"
              @click="selectSection(opt.id as AdminMaterialSectionId)"
            >
              {{ opt.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="admin-notifications-create-filters-section__row">
      <span class="admin-notifications-create-filters-section__label">Выбрать продукт</span>
      <div class="admin-notifications-create-filters-section__dropdown">
        <button
          type="button"
          class="admin-notifications-create-filters-section__trigger"
          :disabled="!sectionId"
          :aria-expanded="openField === 'product'"
          aria-haspopup="listbox"
          @click.stop="toggleField('product')"
        >
          <span class="admin-notifications-create-filters-section__trigger-text">{{ productLabel }}</span>
          <span class="admin-notifications-create-filters-section__chevron" aria-hidden="true">
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
          v-if="openField === 'product'"
          class="admin-notifications-create-filters-section__list"
          role="listbox"
        >
          <li v-for="opt in productOptions" :key="opt.id" role="presentation">
            <button
              type="button"
              role="option"
              class="admin-notifications-create-filters-section__option"
              :aria-selected="opt.id === productId"
              @click="selectProduct(opt.id)"
            >
              {{ opt.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="admin-notifications-create-filters-section__row">
      <span class="admin-notifications-create-filters-section__label">Выбрать тему</span>
      <div class="admin-notifications-create-filters-section__dropdown">
        <button
          type="button"
          class="admin-notifications-create-filters-section__trigger"
          :disabled="!productId"
          :aria-expanded="openField === 'topic'"
          aria-haspopup="listbox"
          @click.stop="toggleField('topic')"
        >
          <span class="admin-notifications-create-filters-section__trigger-text">{{ topicLabel }}</span>
          <span class="admin-notifications-create-filters-section__chevron" aria-hidden="true">
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
        <ul v-if="openField === 'topic'" class="admin-notifications-create-filters-section__list" role="listbox">
          <li v-for="opt in topicOptions" :key="opt.id" role="presentation">
            <button
              type="button"
              role="option"
              class="admin-notifications-create-filters-section__option"
              :aria-selected="opt.id === topicId"
              @click="selectTopic(opt.id)"
            >
              {{ opt.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-notifications-create-filters-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
}

.admin-notifications-create-filters-section__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--sp-20);
  flex-wrap: wrap;
}

.admin-notifications-create-filters-section__label {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  text-align: right;
  min-width: 140px;
}

.admin-notifications-create-filters-section__dropdown {
  position: relative;
}

.admin-notifications-create-filters-section__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-20);
  width: 200px;
  margin: 0;
  padding: var(--sp-10);
  border: 1px solid var(--osnovnoy-tekst);
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  cursor: pointer;
  box-sizing: border-box;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-notifications-create-filters-section__trigger-text {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-notifications-create-filters-section__chevron {
  flex-shrink: 0;
  display: inline-flex;
  color: var(--osnovnoy-tekst);
}

.admin-notifications-create-filters-section__list {
  position: absolute;
  top: calc(100% + var(--sp-4));
  left: 0;
  z-index: 10;
  width: 200px;
  margin: 0;
  padding: var(--sp-6) 0;
  list-style: none;
  border: 1px solid var(--osnovnoy-tekst);
  border-radius: var(--radius-10);
  background-color: var(--white);
  box-shadow: 0 4px 12px rgba(1, 3, 7, 0.08);
  max-height: 240px;
  overflow-y: auto;
}

.admin-notifications-create-filters-section__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: var(--sp-10) var(--sp-16);
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  text-align: left;
  cursor: pointer;

  &:hover,
  &[aria-selected='true'] {
    background-color: rgba(23, 142, 240, 0.08);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}
</style>
