<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ADMIN_MATERIAL_SECTION_LIST,
  ADMIN_STUDENTS_SCOPE_ALL,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'

export interface AdminStudentsToolbarProduct {
  id: string
  title: string
}

interface Props {
  categoryTitle: string
  sectionId: AdminStudentsSectionScope
  usersCount: number
  exporting?: boolean
  products?: AdminStudentsToolbarProduct[]
  selectedProductId?: string | null
  productsLoading?: boolean
  productsError?: string | null
}

interface Emits {
  (e: 'add-student'): void
  (e: 'export-csv'): void
  (e: 'select-product', productId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  products: () => [],
  selectedProductId: null,
  productsLoading: false,
  productsError: null,
})

const emit = defineEmits<Emits>()
const searchQuery = defineModel<string>('searchQuery', { default: '' })

const router = useRouter()
const sectionMenuOpen = ref(false)
const productMenuOpen = ref(false)
const sectionMenuWrapRef = ref<HTMLElement | null>(null)
const productMenuWrapRef = ref<HTMLElement | null>(null)
const sectionCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const productCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const CLOSE_DELAY_MS = 180

const showProductMenu = computed(() => props.sectionId !== ADMIN_STUDENTS_SCOPE_ALL)

const productTriggerLabel = computed(() => {
  const selected = props.products.find((product) => product.id === props.selectedProductId)
  return selected?.title || 'Выберите продукт'
})

const anyMenuOpen = computed(() => sectionMenuOpen.value || productMenuOpen.value)

const cancelCloseTimer = (timer: typeof sectionCloseTimer) => {
  if (timer.value != null) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

const scheduleClose = (open: typeof sectionMenuOpen, timer: typeof sectionCloseTimer) => {
  cancelCloseTimer(timer)
  timer.value = setTimeout(() => {
    open.value = false
    timer.value = null
  }, CLOSE_DELAY_MS)
}

const openSectionMenu = () => {
  cancelCloseTimer(sectionCloseTimer)
  cancelCloseTimer(productCloseTimer)
  productMenuOpen.value = false
  sectionMenuOpen.value = true
}

const openProductMenu = () => {
  cancelCloseTimer(productCloseTimer)
  cancelCloseTimer(sectionCloseTimer)
  sectionMenuOpen.value = false
  productMenuOpen.value = true
}

const toggleSectionMenu = () => {
  if (sectionMenuOpen.value) {
    sectionMenuOpen.value = false
    return
  }
  openSectionMenu()
}

const toggleProductMenu = () => {
  if (productMenuOpen.value) {
    productMenuOpen.value = false
    return
  }
  openProductMenu()
}

const scheduleCloseSectionMenu = () => {
  scheduleClose(sectionMenuOpen, sectionCloseTimer)
}

const scheduleCloseProductMenu = () => {
  scheduleClose(productMenuOpen, productCloseTimer)
}

const onSectionMenuFocusOut = (event: FocusEvent) => {
  onMenuWrapFocusOut(event, sectionMenuWrapRef.value, scheduleCloseSectionMenu)
}

const onProductMenuFocusOut = (event: FocusEvent) => {
  onMenuWrapFocusOut(event, productMenuWrapRef.value, scheduleCloseProductMenu)
}

const goToAdmin = () => {
  void router.push({ name: 'admin-materials' })
}

const onMenuWrapFocusOut = (event: FocusEvent, wrap: HTMLElement | null, close: () => void) => {
  const next = event.relatedTarget as Node | null
  if (wrap?.contains(next)) return
  close()
}

const closeMenuIfOutside = (
  open: typeof sectionMenuOpen,
  wrap: HTMLElement | null,
  target: Node | null,
) => {
  if (!open.value || !wrap || !target || wrap.contains(target)) return
  open.value = false
}

const onDocumentPointerDown = (event: MouseEvent | PointerEvent) => {
  const target = event.target as Node | null
  closeMenuIfOutside(sectionMenuOpen, sectionMenuWrapRef.value, target)
  closeMenuIfOutside(productMenuOpen, productMenuWrapRef.value, target)
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  sectionMenuOpen.value = false
  productMenuOpen.value = false
}

watch(anyMenuOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('keydown', onDocumentKeydown, true)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('keydown', onDocumentKeydown, true)
  }
})

onUnmounted(() => {
  cancelCloseTimer(sectionCloseTimer)
  cancelCloseTimer(productCloseTimer)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown, true)
})

const onSectionNavigate = () => {
  sectionMenuOpen.value = false
  cancelCloseTimer(sectionCloseTimer)
}

const onMenuItemClick = () => {
  void nextTick(() => {
    onSectionNavigate()
  })
}

const onProductSelect = (productId: string) => {
  productMenuOpen.value = false
  cancelCloseTimer(productCloseTimer)
  emit('select-product', productId)
}
</script>

<template>
  <div class="admin-materials-students-toolbar" role="toolbar" aria-label="Ученики: действия и поиск">
    <button type="button" class="admin-materials-students-toolbar__back" @click="goToAdmin">
      <svg
        class="admin-materials-students-toolbar__back-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12.5 15L7.5 10l5-5"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="admin-materials-students-toolbar__back-text">Назад</span>
    </button>

    <div class="admin-materials-students-toolbar__row">
      <div class="admin-materials-students-toolbar__breadcrumbs">
        <div
          ref="sectionMenuWrapRef"
          class="admin-materials-students-toolbar__dropdown-wrap"
          @mouseenter="openSectionMenu"
          @mouseleave="scheduleCloseSectionMenu"
          @focusin="openSectionMenu"
          @focusout="onSectionMenuFocusOut"
        >
          <button
            type="button"
            class="admin-materials-students-toolbar__crumb admin-materials-students-toolbar__crumb_trigger"
            :aria-expanded="sectionMenuOpen"
            aria-haspopup="menu"
            aria-controls="admin-materials-section-menu"
            @click="toggleSectionMenu"
          >
            {{ categoryTitle }}
          </button>

          <div
            v-show="sectionMenuOpen"
            id="admin-materials-section-menu"
            class="admin-materials-students-toolbar__menu"
            role="menu"
            aria-label="Выбор раздела материалов"
          >
            <RouterLink
              class="admin-materials-students-toolbar__menu-item"
              :class="{
                'admin-materials-students-toolbar__menu-item_active': sectionId === ADMIN_STUDENTS_SCOPE_ALL,
              }"
              role="menuitem"
              replace
              :to="{ name: 'admin-materials-students', params: { sectionId: ADMIN_STUDENTS_SCOPE_ALL }, query: {} }"
              @click="onMenuItemClick"
            >
              <span class="admin-materials-students-toolbar__menu-item-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7 17L17 7M17 7h-6M17 7v6"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="admin-materials-students-toolbar__menu-item-text">Все материалы</span>
            </RouterLink>

            <RouterLink
              v-for="sec in ADMIN_MATERIAL_SECTION_LIST"
              :key="sec.id"
              class="admin-materials-students-toolbar__menu-item"
              :class="{ 'admin-materials-students-toolbar__menu-item_active': sec.id === sectionId }"
              role="menuitem"
              replace
              :to="{ name: 'admin-materials-students', params: { sectionId: sec.id }, query: {} }"
              @click="onMenuItemClick"
            >
              <span class="admin-materials-students-toolbar__menu-item-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7 17L17 7M17 7h-6M17 7v6"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="admin-materials-students-toolbar__menu-item-text">{{ sec.title }}</span>
            </RouterLink>
          </div>
        </div>

        <template v-if="showProductMenu">
          <span class="admin-materials-students-toolbar__arrow" aria-hidden="true">
            <svg width="30" height="8" viewBox="0 0 30 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4h22M22 0l6 4-6 4"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <div
            ref="productMenuWrapRef"
            class="admin-materials-students-toolbar__dropdown-wrap"
            @mouseenter="openProductMenu"
            @mouseleave="scheduleCloseProductMenu"
            @focusin="openProductMenu"
            @focusout="onProductMenuFocusOut"
          >
            <button
              type="button"
              class="admin-materials-students-toolbar__crumb admin-materials-students-toolbar__crumb_trigger"
              :aria-expanded="productMenuOpen"
              aria-haspopup="menu"
              aria-controls="admin-materials-product-menu"
              @click="toggleProductMenu"
            >
              {{ productTriggerLabel }}
            </button>

            <div
              v-show="productMenuOpen"
              id="admin-materials-product-menu"
              class="admin-materials-students-toolbar__menu"
              role="menu"
              aria-label="Выбор продукта"
            >
              <p v-if="productsLoading" class="admin-materials-students-toolbar__menu-status">Загружаем…</p>
              <p v-else-if="productsError" class="admin-materials-students-toolbar__menu-status">{{ productsError }}</p>
              <p v-else-if="products.length === 0" class="admin-materials-students-toolbar__menu-status">Нет продуктов</p>
              <template v-else>
              <button
                v-for="product in products"
                :key="product.id"
                type="button"
                class="admin-materials-students-toolbar__menu-item"
                :class="{
                  'admin-materials-students-toolbar__menu-item_active': product.id === selectedProductId,
                }"
                role="menuitem"
                @click="onProductSelect(product.id)"
              >
                <span class="admin-materials-students-toolbar__menu-item-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7 17L17 7M17 7h-6M17 7v6"
                      stroke="currentColor"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="admin-materials-students-toolbar__menu-item-text">{{ product.title }}</span>
              </button>
              </template>
            </div>
          </div>
        </template>
      </div>

      <div class="admin-materials-students-toolbar__center">
        <img
          class="admin-materials-students-toolbar__users-icon"
          src="@/assets/icons/admin-user.svg"
          alt=""
          width="24"
          height="24"
        />
        <span class="admin-materials-students-toolbar__count" aria-live="polite">{{ usersCount }}</span>
        <label class="admin-materials-students-toolbar__search">
          <span class="admin-materials-students-toolbar__search-visually-hidden">Поиск по имени или почте ученика</span>
          <span class="admin-materials-students-toolbar__search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 16A7 7 0 109 2a7 7 0 000 14zM17 17l-3.5-3.5"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="search"
            class="admin-materials-students-toolbar__search-input"
            autocomplete="off"
            placeholder=""
          />
        </label>
      </div>

      <div class="admin-materials-students-toolbar__right">
        <button
          type="button"
          class="admin-materials-students-toolbar__icon-btn"
          aria-label="Скачать учеников в формате CSV"
          :disabled="exporting"
          :aria-busy="exporting"
          @click="emit('export-csv')"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="admin-materials-students-toolbar__add-btn" @click="emit('add-student')">
          <span class="admin-materials-students-toolbar__add-btn-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1.5v9M1.5 6h9" stroke="#178ef0" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </span>
          <span class="admin-materials-students-toolbar__add-btn-text">Ученик</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-materials-students-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--sp-10);
  padding: 17px var(--sp-20);
  border: var(--border-2) solid var(--black);
  border-radius: var(--radius-10);
  background-color: var(--white);
  box-sizing: border-box;
}

.admin-materials-students-toolbar__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}

.admin-materials-students-toolbar__back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--sp-8);
  padding: var(--sp-6) 0;
  margin: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  color: var(--osnovnoy-tekst);
  flex-shrink: 0;

  &:hover {
    opacity: 0.88;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-materials-students-toolbar__back-icon {
  display: block;
  flex-shrink: 0;
  color: inherit;
}

.admin-materials-students-toolbar__back-text {
  white-space: nowrap;
}

.admin-materials-students-toolbar__breadcrumbs {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  flex-shrink: 0;
}

.admin-materials-students-toolbar__dropdown-wrap {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}

.admin-materials-students-toolbar__crumb {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  white-space: nowrap;
}

.admin-materials-students-toolbar__crumb_trigger {
  margin: 0;
  padding: var(--sp-6) var(--sp-0);
  background: none;
  border: none;
  border-bottom: var(--border-2) solid transparent;
  cursor: pointer;
  text-align: left;
  appearance: none;
  line-height: normal;
  vertical-align: baseline;
  box-sizing: border-box;
  transition: border-color 0.25s ease;

  &:hover {
    border-bottom-color: var(--podcherkivanie-pri-navedenii);
  }

  &[aria-expanded='true'] {
    border-bottom-color: var(--podcherkivanie-pri-navedenii);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}

.admin-materials-students-toolbar__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: calc(var(--z-header) + 1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
  min-width: max(100%, 300px);
  width: max-content;
  max-width: min(420px, calc(100vw - 32px));
  padding: var(--sp-20);
  border: 1px solid var(--black);
  border-radius: var(--radius-20);
  background-color: var(--white);
  box-shadow: 0 8px 24px rgba(1, 3, 7, 0.08);
}

.admin-materials-students-toolbar__menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: var(--osnovnoy-tekst);
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  font: inherit;
  text-align: left;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    color: #178ef0;

    .admin-materials-students-toolbar__menu-item-icon,
    .admin-materials-students-toolbar__menu-item-text {
      color: #178ef0;
    }
  }
}

.admin-materials-students-toolbar__menu-item-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: inherit;
}

.admin-materials-students-toolbar__menu-item-text {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: inherit;
  white-space: nowrap;
}

.admin-materials-students-toolbar__menu-status {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--osnovnoy-tekst);
}

.admin-materials-students-toolbar__menu-item_active {
  color: #178ef0;

  .admin-materials-students-toolbar__menu-item-icon {
    color: #178ef0;
  }

  .admin-materials-students-toolbar__menu-item-text {
    color: #178ef0;
  }
}

.admin-materials-students-toolbar__arrow {
  display: inline-flex;
  align-items: center;
  color: var(--black);
  flex-shrink: 0;
}

.admin-materials-students-toolbar__center {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  flex: 1 1 auto;
  justify-content: center;
  min-width: 0;
}

.admin-materials-students-toolbar__users-icon {
  display: block;
  flex-shrink: 0;
}

.admin-materials-students-toolbar__count {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  color: var(--black);
  white-space: nowrap;
}

.admin-materials-students-toolbar__search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 250px;
  min-height: 36px;
  padding: var(--sp-8) var(--sp-10);
  background-color: var(--bg);
  border-radius: 5px;
  box-sizing: border-box;
}

.admin-materials-students-toolbar__search-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-materials-students-toolbar__search-icon {
  display: inline-flex;
  flex-shrink: 0;
  margin-right: var(--sp-8);
  color: var(--black);
}

.admin-materials-students-toolbar__search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-regular);
  font-size: var(--size-20);
  color: var(--black);
  outline: none;

  &::placeholder {
    color: var(--black-300);
  }
}

.admin-materials-students-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  flex-shrink: 0;
}

.admin-materials-students-toolbar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--black);
  cursor: pointer;
  border-radius: var(--radius-sm);

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.admin-materials-students-toolbar__add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-10);
  padding: 5px var(--sp-10);
  border: none;
  border-radius: 5px;
  background-color: #178ef0;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    filter: brightness(1.05);
  }
}

.admin-materials-students-toolbar__add-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 16px;
  background-color: var(--white);
  border: var(--border-2) solid #178ef0;
  box-sizing: border-box;
}

.admin-materials-students-toolbar__add-btn-text {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  color: var(--white);
  white-space: nowrap;
}

@media (max-width: 1023px) {
  .admin-materials-students-toolbar__row {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-materials-students-toolbar__back {
    align-self: stretch;
    width: 100%;
    font-size: var(--size-15);
  }

  .admin-materials-students-toolbar__crumb {
    font-size: var(--size-15);
  }

  .admin-materials-students-toolbar__menu-item-text,
  .admin-materials-students-toolbar__menu-status {
    font-size: var(--size-15);
  }

  .admin-materials-students-toolbar__center {
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 100%;
  }

  .admin-materials-students-toolbar__count {
    font-size: var(--size-15);
  }

  .admin-materials-students-toolbar__search {
    max-width: none;
  }

  .admin-materials-students-toolbar__search-input {
    font-size: var(--size-15);
  }

  .admin-materials-students-toolbar__right {
    justify-content: flex-end;
    width: 100%;
  }

  .admin-materials-students-toolbar__add-btn-text {
    font-size: var(--size-15);
  }
}
</style>
