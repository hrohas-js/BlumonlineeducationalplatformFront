<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminCopyableText from '@/components/molecules/AdminCopyableText.vue'
import AdminMaterialsStudentsToolbar from '@/components/organisms/AdminMaterialsStudentsToolbar.vue'
import {
  getAdminStudentsScopeTitle,
  isAdminMaterialSectionId,
  isAdminStudentsSectionParam,
  type AdminMaterialSectionId,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminStudentItem, AdminStudentsDirectoryItem, ProductResponse } from '@/services/api/types'
import type { AdminStudentRow } from '@/utils/adminMockStudents'
import { sectionIdToProductType, studentsScopeToExportQuery } from '@/utils/adminProductType'

const STUDENTS_PAGE_LIMIT = 1000
const PRODUCT_STUDENTS_PAGE_LIMIT = 100

const route = useRoute()
const router = useRouter()
const { notify } = useNotification()
const loading = ref(true)
const exporting = ref(false)
const rows = ref<AdminStudentRow[]>([])
const usersTotal = ref(0)
const sectionProducts = ref<ProductResponse[]>([])
const productsLoading = ref(false)
const productsError = ref<string | null>(null)
let loadRequestId = 0
let productsRequestId = 0
let productStudentsCache: { productId: string; rows: AdminStudentRow[] } | null = null

const sectionId = computed(() => route.params.sectionId as string)
const validatedStudentsScope = computed<AdminStudentsSectionScope | null>(() =>
  isAdminStudentsSectionParam(sectionId.value) ? (sectionId.value as AdminStudentsSectionScope) : null,
)
const categoryTitle = computed(() => getAdminStudentsScopeTitle(sectionId.value) ?? '')
const searchQuery = ref('')
const debouncedSearch = useDebouncedRef(searchQuery, 300)
const sortAscending = ref(true)

const queryProductId = computed(() => {
  const raw = route.query.product
  return typeof raw === 'string' && raw ? raw : null
})

const selectedProductId = computed(() => {
  const id = queryProductId.value
  const scope = validatedStudentsScope.value
  if (!id || !scope || !isAdminMaterialSectionId(scope) || productsLoading.value) return null
  if (!sectionProducts.value.some((product) => product.id === id)) return null
  return id
})

const selectedProduct = computed(
  () => sectionProducts.value.find((product) => product.id === selectedProductId.value) ?? null,
)

const toolbarProducts = computed(() =>
  sectionProducts.value.map((product) => ({ id: product.id, title: product.title })),
)

function studentDisplayName(item: { first_name: string; last_name: string; email: string }): string {
  const name = [item.first_name, item.last_name].filter(Boolean).join(' ').trim()
  return name || item.email
}

function toStudentRow(item: AdminStudentsDirectoryItem): AdminStudentRow {
  return {
    id: item.user_id,
    name: studentDisplayName(item),
    email: item.email,
    productsCount: item.products_count,
    avatarUrl: item.avatar_url,
  }
}

function toProductStudentRow(item: AdminStudentItem): AdminStudentRow {
  return {
    id: item.user_id,
    name: studentDisplayName(item),
    email: item.email,
    productsCount: null,
    avatarUrl: null,
  }
}

function applyProductStudentView() {
  if (!productStudentsCache) return
  const search = debouncedSearch.value.trim().toLowerCase()
  const filtered = search
    ? productStudentsCache.rows.filter(
        (row) =>
          row.name.toLowerCase().includes(search) || row.email.toLowerCase().includes(search),
      )
    : productStudentsCache.rows
  const sorted = [...filtered].sort((a, b) => {
    const compared = a.name.localeCompare(b.name, 'ru')
    return sortAscending.value ? compared : -compared
  })
  rows.value = sorted
  usersTotal.value = sorted.length
  loading.value = false
}

const toolbarUserCount = computed(() => usersTotal.value)

async function loadSectionProducts(section: AdminMaterialSectionId) {
  const requestId = ++productsRequestId
  productsLoading.value = true
  productsError.value = null
  const productType = sectionIdToProductType(section)
  const result = await adminService.listProducts({
    ...(productType ? { product_type: productType } : {}),
    is_archived: section === 'archive',
    skip: 0,
    limit: 100,
  })
  if (requestId !== productsRequestId) return
  productsLoading.value = false
  if (!result.success || !result.data) {
    sectionProducts.value = []
    productsError.value = result.error || 'Не удалось загрузить продукты'
    return
  }
  sectionProducts.value = result.data.items
}

async function loadProductStudents(productId: string) {
  if (productStudentsCache?.productId === productId) {
    loadRequestId += 1
    applyProductStudentView()
    return
  }
  const requestId = ++loadRequestId
  loading.value = true
  let skip = 0
  let total = Infinity
  const items: AdminStudentItem[] = []

  while (items.length < total) {
    const result = await adminService.listStudents(productId, skip, PRODUCT_STUDENTS_PAGE_LIMIT)
    if (requestId !== loadRequestId) return
    if (!result.success || !result.data) {
      loading.value = false
      notify({
        type: 'error',
        message: result.error || 'Не удалось загрузить список учеников',
      })
      return
    }
    items.push(...result.data.items)
    total = result.data.total
    skip += PRODUCT_STUDENTS_PAGE_LIMIT
    if (result.data.items.length === 0) break
  }

  if (requestId !== loadRequestId) return
  productStudentsCache = { productId, rows: items.map(toProductStudentRow) }
  applyProductStudentView()
}

async function loadDirectoryStudents(scope: AdminStudentsSectionScope) {
  const requestId = ++loadRequestId
  loading.value = true
  const search = debouncedSearch.value.trim()
  const scopeQuery = studentsScopeToExportQuery(scope)
  let skip = 0
  let total = Infinity
  const items: AdminStudentsDirectoryItem[] = []

  while (items.length < total) {
    const result = await adminService.listAllStudents({
      ...scopeQuery,
      ...(search ? { search } : {}),
      order: sortAscending.value ? 'asc' : 'desc',
      skip,
      limit: STUDENTS_PAGE_LIMIT,
    })
    if (requestId !== loadRequestId) return
    if (!result.success || !result.data) {
      loading.value = false
      notify({
        type: 'error',
        message: result.error || 'Не удалось загрузить список учеников',
      })
      return
    }
    items.push(...result.data.items)
    total = result.data.total
    skip += STUDENTS_PAGE_LIMIT
    if (result.data.items.length === 0) break
  }

  if (requestId !== loadRequestId) return
  productStudentsCache = null
  rows.value = items.map(toStudentRow)
  usersTotal.value = Number.isFinite(total) ? total : items.length
  loading.value = false
}

async function loadStudents() {
  const scope = validatedStudentsScope.value
  if (!scope) {
    loading.value = false
    return
  }
  if (isAdminMaterialSectionId(scope) && productsLoading.value && queryProductId.value) {
    loading.value = true
    return
  }
  const productId = selectedProductId.value
  if (productId) {
    await loadProductStudents(productId)
    return
  }
  await loadDirectoryStudents(scope)
}

watch(
  validatedStudentsScope,
  (scope) => {
    productStudentsCache = null
    if (!scope || !isAdminMaterialSectionId(scope)) {
      productsRequestId += 1
      sectionProducts.value = []
      productsLoading.value = false
      productsError.value = null
      return
    }
    void loadSectionProducts(scope)
  },
  { immediate: true },
)

watch(
  [validatedStudentsScope, debouncedSearch, sortAscending, selectedProductId],
  () => {
    void loadStudents()
  },
  { immediate: true },
)

watch(productsLoading, (isLoading) => {
  if (isLoading || !queryProductId.value || selectedProductId.value) return
  void loadStudents()
})

watch(sectionId, (id) => {
  if (!isAdminStudentsSectionParam(id)) {
    void router.replace({ name: 'admin-materials' })
  }
})

const toggleNameSort = () => {
  sortAscending.value = !sortAscending.value
}

const onAddStudent = () => {
  const scope = validatedStudentsScope.value
  if (!scope) return
  if (scope === 'archive') {
    notify({ type: 'info', message: 'Добавление учеников в архив недоступно' })
    return
  }
  void router.push({
    name: 'admin-materials-students-add',
    params: { sectionId: scope },
  })
}

const onSelectProduct = (productId: string) => {
  const scope = validatedStudentsScope.value
  if (!scope || !isAdminMaterialSectionId(scope)) return
  void router.replace({
    name: 'admin-materials-students',
    params: { sectionId: scope },
    query: { product: productId },
  })
}

const onExportCsv = async () => {
  if (exporting.value) return
  const scope = validatedStudentsScope.value
  if (!scope) return
  exporting.value = true
  try {
    const product = selectedProduct.value
    if (product) {
      const result = await adminService.exportStudentsCsv(product.id)
      if (!result.success || !result.data) {
        notify({ type: 'error', message: result.error || 'Не удалось выгрузить' })
        return
      }
      const url = URL.createObjectURL(result.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `students-${csvNamePart(product.title)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const result = await adminService.exportAllStudentsCsv(studentsScopeToExportQuery(scope))
    if (!result.success || !result.data) {
      notify({ type: 'error', message: result.error || 'Не удалось выгрузить' })
      return
    }
    const url = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filenameFromContentDisposition(
      result.data.contentDisposition,
      `students-${scope}.csv`,
    )
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

function csvNamePart(title: string): string {
  const safe = title.replace(/[/\\?%*:|"<>]/g, '').trim()
  return safe || 'product'
}

function filenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback
  const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)
  let name = ''
  if (encoded?.[1]) {
    try {
      name = decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
    } catch {
      name = ''
    }
  }
  if (!name) {
    const quoted = /filename\s*=\s*"([^"]+)"/i.exec(header)
    const plain = /filename\s*=\s*([^;]+)/i.exec(header)
    name = (quoted?.[1] ?? plain?.[1] ?? '').trim()
  }
  name = name.replace(/[/\\]/g, '').trim()
  return name || fallback
}
</script>

<template>
  <AppLayout>
    <section class="admin-materials-students-page">
      <div class="admin-materials-students-page__panel">
        <AdminMaterialsStudentsToolbar
          v-if="validatedStudentsScope"
          v-model:search-query="searchQuery"
          :category-title="categoryTitle"
          :section-id="validatedStudentsScope"
          :users-count="toolbarUserCount"
          :exporting="exporting"
          :products="toolbarProducts"
          :selected-product-id="selectedProductId"
          :products-loading="productsLoading"
          :products-error="productsError"
          @add-student="onAddStudent"
          @export-csv="onExportCsv"
          @select-product="onSelectProduct"
        />

        <div v-if="validatedStudentsScope" class="admin-materials-students-page__sheet">
          <div class="admin-materials-students-page__table-head">
            <button
              type="button"
              class="admin-materials-students-page__col-user admin-materials-students-page__sort-btn"
              :class="{ 'admin-materials-students-page__sort-btn_desc': !sortAscending }"
              @click="toggleNameSort"
            >
              Пользователь
              <span class="admin-materials-students-page__sort-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4v12M6 8l4-4 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </span>
            </button>
            <span class="admin-materials-students-page__col-products">Продуктов</span>
          </div>

          <ul class="admin-materials-students-page__list" aria-label="Список учеников">
            <li v-for="row in rows" :key="row.id" class="admin-materials-students-page__row-item">
              <RouterLink
                class="admin-materials-students-page__row"
                :to="{
                  name: 'admin-materials-student-profile',
                  params: { sectionId: sectionId, studentId: row.id },
                }"
              >
                <div class="admin-materials-students-page__user-cell">
                  <div class="admin-materials-students-page__avatar">
                    <img
                      v-if="row.avatarUrl"
                      class="admin-materials-students-page__avatar-img"
                      :src="row.avatarUrl"
                      alt=""
                    />
                    <svg
                      v-else
                      class="admin-materials-students-page__avatar-placeholder"
                      width="52"
                      height="52"
                      viewBox="0 0 52 52"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle cx="26" cy="26" r="25" stroke="currentColor" stroke-width="2" />
                      <circle cx="26" cy="20" r="8" stroke="currentColor" stroke-width="1.5" />
                      <path
                        d="M14 42c0-6.627 5.373-12 12-12s12 5.373 12 12"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div class="admin-materials-students-page__user-text">
                    <AdminCopyableText
                      class="admin-materials-students-page__user-name"
                      :text="row.name"
                      ariaLabel="Скопировать имя"
                      success-message="Имя скопировано"
                    />
                    <AdminCopyableText
                      class="admin-materials-students-page__user-email"
                      :text="row.email"
                      ariaLabel="Скопировать почту"
                      success-message="Почта скопирована"
                    />
                  </div>
                </div>
                <span class="admin-materials-students-page__products-count">{{ row.productsCount ?? '—' }}</span>
              </RouterLink>
            </li>
          </ul>

          <p v-if="!loading && rows.length === 0" class="admin-materials-students-page__empty">Нет учеников по запросу</p>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-materials-students-page {
  margin-top: var(--sp-40);
}

.admin-materials-students-page__panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  border-radius: var(--radius-20);
  background-color: var(--fon-bloka);
  padding: var(--sp-40) var(--sp-50);
}

.admin-materials-students-page__sheet {
  border-radius: var(--radius-20);
  background-color: var(--white);
  padding: var(--sp-20) var(--sp-50) var(--sp-40);
  box-sizing: border-box;
}

.admin-materials-students-page__table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-10) 0;
  margin-bottom: var(--sp-4);
}

.admin-materials-students-page__col-user {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
}

.admin-materials-students-page__sort-btn {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}

.admin-materials-students-page__sort-icon {
  display: inline-flex;
  color: var(--black);
  transition: transform 0.2s ease;
}

.admin-materials-students-page__sort-btn_desc .admin-materials-students-page__sort-icon {
  transform: rotate(180deg);
}

.admin-materials-students-page__col-products {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  text-align: right;
}

.admin-materials-students-page__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-materials-students-page__row-item {
  padding: 0;
  border-top: var(--border-2) solid var(--black);
}

.admin-materials-students-page__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  padding: var(--sp-10);
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--fon-bloka) 65%, var(--white));
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-materials-students-page__user-cell {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  flex: 1;
}

.admin-materials-students-page__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: var(--black);
}

.admin-materials-students-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admin-materials-students-page__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-materials-students-page__user-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.admin-materials-students-page__user-name,
.admin-materials-students-page__user-email {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
}

.admin-materials-students-page__products-count {
  flex-shrink: 0;
  width: fit-content;
  max-width: 100%;
  margin-left: auto;
  text-align: right;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
  box-sizing: border-box;
  border-bottom: 2px solid transparent;
}

.admin-materials-students-page__row:hover .admin-materials-students-page__products-count {
  border-bottom-color: var(--knopka);
}

.admin-materials-students-page__empty {
  margin: var(--sp-20) 0 0;
  text-align: center;
  font-family: var(--font-family);
  font-size: var(--size-20);
  color: var(--black-300);
}

@media (max-width: 1023px) {
  .admin-materials-students-page__panel {
    padding: var(--sp-24);
  }

  .admin-materials-students-page__sheet {
    padding: var(--sp-20) var(--sp-24) var(--sp-32);
  }

  .admin-materials-students-page__sort-btn {
    font-size: var(--size-15);
  }

  .admin-materials-students-page__col-products {
    font-size: var(--size-15);
  }

  .admin-materials-students-page__row {
    flex-wrap: wrap;
  }

  .admin-materials-students-page__user-name,
  .admin-materials-students-page__user-email {
    font-size: var(--size-15);
  }

  .admin-materials-students-page__products-count {
    width: fit-content;
    margin-left: auto;
    align-self: flex-end;
    font-size: var(--size-15);
  }

  .admin-materials-students-page__empty {
    font-size: var(--size-15);
  }
}
</style>
