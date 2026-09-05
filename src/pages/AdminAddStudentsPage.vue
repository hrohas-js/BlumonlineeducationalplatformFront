<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminAddStudentsForm from '@/components/organisms/AdminAddStudentsForm.vue'
import AdminAddStudentsProductsStep from '@/components/organisms/AdminAddStudentsProductsStep.vue'
import AdminInfoModal from '@/components/organisms/AdminInfoModal.vue'
import type { AddStudentRow } from '@/components/molecules/AdminStudentAutocompleteField.vue'
import {
  ADMIN_MATERIAL_SECTION_LIST,
  ADMIN_MATERIAL_SECTION_TITLES,
  ADMIN_STUDENTS_SCOPE_ALL,
  getAdminStudentsScopeTitle,
  isAdminMaterialSectionId,
  isAdminStudentsSectionParam,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminBulkStudentItem } from '@/services/api/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AddStudentsStep = 'form' | 'products'
type PendingMode = 'manual' | 'excel' | null

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const { notify } = useNotification()

const loading = ref(true)
const submitting = ref(false)
const successModalOpen = ref(false)

const step = ref<AddStudentsStep>('form')
const pendingMode = ref<PendingMode>(null)
const pendingRows = ref<AddStudentRow[] | null>(null)
const pendingExcelFile = ref<File | null>(null)
const selectedById = ref<Record<string, boolean>>({})
const enrolledProductIds = ref<Set<string>>(new Set())

const sectionId = computed(() => route.params.sectionId as string)

function queryString(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

const existingStudentId = computed(() => queryString(route.query.studentId).trim())
const isExistingStudentMode = computed(() => existingStudentId.value.length > 0)

const validatedScope = computed<AdminStudentsSectionScope | null>(() =>
  isAdminStudentsSectionParam(sectionId.value) && sectionId.value !== 'archive'
    ? sectionId.value
    : null,
)

const returnSectionId = computed<AdminStudentsSectionScope>(() => {
  const raw = queryString(route.query.returnSectionId)
  if (isAdminStudentsSectionParam(raw)) return raw
  return validatedScope.value ?? ADMIN_STUDENTS_SCOPE_ALL
})

const existingStudentProfileTo = computed(() => {
  if (!existingStudentId.value) return null
  return {
    name: 'admin-materials-student-profile' as const,
    params: {
      sectionId: returnSectionId.value,
      studentId: existingStudentId.value,
    },
  }
})

const backLink = computed(() => {
  if (isExistingStudentMode.value && existingStudentProfileTo.value) {
    return existingStudentProfileTo.value
  }
  return {
    name: 'admin-materials-students' as const,
    params: { sectionId: validatedScope.value ?? ADMIN_STUDENTS_SCOPE_ALL },
  }
})

const breadcrumbItems = computed(() => {
  const scope = validatedScope.value
  if (!scope) return []
  const title = getAdminStudentsScopeTitle(scope) ?? scope
  return [{ label: title, to: { name: 'admin-materials' as const } }]
})

const studentCandidates = computed(() => adminStore.aggregatedStudents[ADMIN_STUDENTS_SCOPE_ALL] ?? [])

const productSections = computed(() => {
  const scope = validatedScope.value
  if (!scope) return []
  const sectionIds =
    scope === ADMIN_STUDENTS_SCOPE_ALL
      ? ADMIN_MATERIAL_SECTION_LIST.map((s) => s.id)
      : isAdminMaterialSectionId(scope)
        ? [scope]
        : []
  return sectionIds
    .map((id) => ({
      id,
      title: ADMIN_MATERIAL_SECTION_TITLES[id],
      products: (adminStore.productsBySection[id] ?? [])
        .filter((p) => !isExistingStudentMode.value || !enrolledProductIds.value.has(p.id))
        .map((p) => ({
          id: p.id,
          title: p.title,
        })),
    }))
    .filter((s) => s.products.length > 0)
})

const pageTitle = computed(() =>
  step.value === 'products' ? 'Выбор материалов' : 'Добавление ученика',
)

function getSelectedProductIds(): string[] | undefined {
  const selectedIds = Object.entries(selectedById.value)
    .filter(([, v]) => v)
    .map(([id]) => id)
  return selectedIds.length ? selectedIds : undefined
}

function resetPendingState() {
  step.value = 'form'
  pendingMode.value = null
  pendingRows.value = null
  pendingExcelFile.value = null
  selectedById.value = {}
}

function goToExistingStudentProfile(replace = false) {
  const to = existingStudentProfileTo.value
  if (!to) return
  if (replace) {
    void router.replace(to)
    return
  }
  void router.push(to)
}

async function initExistingStudentMode(): Promise<boolean> {
  const studentId = existingStudentId.value
  if (!studentId) return false

  const result = await adminStore.fetchStudentProfileProducts(studentId)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить данные ученика' })
    goToExistingStudentProfile(true)
    return false
  }

  const user = result.data.user
  const enrolled = new Set<string>()
  for (const rows of Object.values(result.data.bySection)) {
    for (const product of rows) {
      enrolled.add(product.id)
    }
  }
  enrolledProductIds.value = enrolled

  pendingRows.value = [
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name.trim() || user.email,
      lastName: user.last_name.trim() || user.email,
      selectedUserId: user.id,
    },
  ]
  pendingExcelFile.value = null
  pendingMode.value = 'manual'
  step.value = 'products'
  return true
}

async function loadPageData() {
  loading.value = true
  const scope = validatedScope.value
  if (!scope) {
    loading.value = false
    void router.replace({
      name: 'admin-materials-students',
      params: { sectionId: ADMIN_STUDENTS_SCOPE_ALL },
    })
    return
  }

  await Promise.all([
    adminStore.aggregateAllSections(),
    adminStore.fetchProductsForStudentsScope(scope),
  ])

  if (isExistingStudentMode.value) {
    const ok = await initExistingStudentMode()
    if (!ok) {
      loading.value = false
      return
    }
  }

  loading.value = false
}

onMounted(() => {
  void loadPageData()
})

function buildBulkPayload(rows: AddStudentRow[]): AdminBulkStudentItem[] | null {
  const filled = rows.filter((row) => row.email.trim() || row.firstName.trim() || row.lastName.trim())
  if (filled.length === 0) {
    notify({ type: 'warning', message: 'Заполните e-mail, имя и фамилию учеников' })
    return null
  }

  const students: AdminBulkStudentItem[] = []
  const seen = new Set<string>()

  for (const row of filled) {
    const email = row.email.trim()
    const first_name = row.firstName.trim()
    const last_name = row.lastName.trim()

    if (!email || !first_name || !last_name) {
      notify({ type: 'warning', message: 'Заполните e-mail, имя и фамилию учеников' })
      return null
    }

    if (!EMAIL_RE.test(email)) {
      notify({ type: 'warning', message: `Некорректный e-mail: ${email}` })
      return null
    }

    const key = email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    students.push({ email, first_name, last_name })
  }

  if (students.length === 0) {
    notify({ type: 'warning', message: 'Заполните e-mail, имя и фамилию учеников' })
    return null
  }

  return students
}

const onSubmit = (rows: AddStudentRow[]) => {
  const students = buildBulkPayload(rows)
  if (!students) return

  pendingRows.value = rows
  pendingExcelFile.value = null
  pendingMode.value = 'manual'
  step.value = 'products'
}

const onExcelChosen = (file: File) => {
  pendingExcelFile.value = file
  pendingRows.value = null
  pendingMode.value = 'excel'
  step.value = 'products'
}

const onBackToForm = () => {
  if (isExistingStudentMode.value) {
    goToExistingStudentProfile()
    return
  }
  step.value = 'form'
}

const onConfirmProducts = async () => {
  const mode = pendingMode.value
  if (!mode) return

  const product_ids = getSelectedProductIds()
  if (isExistingStudentMode.value && !product_ids) {
    notify({ type: 'warning', message: 'Выберите хотя бы один продукт' })
    return
  }

  submitting.value = true

  if (mode === 'manual') {
    const students = pendingRows.value ? buildBulkPayload(pendingRows.value) : null
    if (!students) {
      submitting.value = false
      if (!isExistingStudentMode.value) {
        step.value = 'form'
      }
      return
    }

    const result = await adminService.bulkAddStudents({
      students,
      product_ids,
    })
    submitting.value = false

    if (!result.success || !result.data) {
      notify({ type: 'error', message: result.error || 'Не удалось добавить учеников' })
      return
    }

    if (isExistingStudentMode.value) {
      notify({ type: 'success', message: 'Ученик добавлен на выбранные продукты' })
      selectedById.value = {}
    } else {
      const { created_count, existing_count } = result.data
      notify({
        type: 'success',
        message: `Создано ${created_count}, уже было ${existing_count}`,
      })
      resetPendingState()
    }
    void adminStore.aggregateAllSections()
    successModalOpen.value = true
    return
  }

  const file = pendingExcelFile.value
  if (!file) {
    submitting.value = false
    step.value = 'form'
    return
  }

  const result = await adminService.bulkAddStudentsExcel(file, product_ids)
  submitting.value = false

  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить Excel' })
    return
  }

  const { created_count, existing_count } = result.data
  notify({
    type: 'success',
    message: `Создано ${created_count}, уже было ${existing_count}`,
  })
  void adminStore.aggregateAllSections()
  resetPendingState()
  successModalOpen.value = true
}

const onSuccessModalConfirm = () => {
  successModalOpen.value = false
  if (isExistingStudentMode.value) {
    goToExistingStudentProfile()
    return
  }
  const scope = validatedScope.value
  if (!scope) {
    void router.push({ name: 'admin-materials' })
    return
  }
  void router.push({
    name: 'admin-materials-students',
    params: { sectionId: scope },
  })
}

const onSuccessModalClose = () => {
  successModalOpen.value = false
  if (isExistingStudentMode.value) {
    goToExistingStudentProfile()
  }
}
</script>

<template>
  <AppLayout>
    <section v-if="validatedScope && !loading" class="admin-add-students-page">
      <div class="admin-add-students-page__panel">
        <RouterLink
          class="admin-add-students-page__back"
          :to="backLink"
        >
          <svg
            class="admin-add-students-page__back-icon"
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
          <span class="admin-add-students-page__back-text">Назад</span>
        </RouterLink>

        <div class="admin-add-students-page__sheet">
          <HomeProfileInfoTableItem
            class="admin-add-students-page__badge"
            :label="authStore.studentNameBadgeLabel"
            tone="#178ef0"
            is-student-name
          />

          <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

          <hr class="admin-add-students-page__rule" />

          <h1 class="admin-add-students-page__title">{{ pageTitle }}</h1>

          <AdminAddStudentsForm
            v-if="!isExistingStudentMode && step === 'form'"
            :candidates="studentCandidates"
            :submitting="submitting"
            @submit="onSubmit"
            @excel="onExcelChosen"
          />

          <AdminAddStudentsProductsStep
            v-if="step === 'products'"
            :sections="productSections"
            v-model:selected-by-id="selectedById"
            :submitting="submitting"
            @back="onBackToForm"
            @confirm="onConfirmProducts"
          />
        </div>
      </div>
    </section>

    <section v-else-if="loading" class="admin-add-students-page admin-add-students-page_loading">
      <p class="admin-add-students-page__loading">Загружаем…</p>
    </section>

    <AdminInfoModal
      :is-open="successModalOpen"
      title="Добавление ученика"
      message="Через несколько минут ученик сможет начать обучение по ссылке из письма"
      @close="onSuccessModalClose"
      @confirm="onSuccessModalConfirm"
    />
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-add-students-page {
  margin-top: var(--sp-40);

  &_loading {
    display: flex;
    justify-content: center;
    padding: var(--sp-40);
  }
}

.admin-add-students-page__loading {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--size-20);
  color: var(--black-300);
}

.admin-add-students-page__panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  border-radius: var(--radius-20);
  background-color: var(--fon-bloka);
  padding: var(--sp-40) var(--sp-50);
}

.admin-add-students-page__back {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
  align-self: flex-start;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  color: #010307;
  text-decoration: none;

  &:hover {
    color: #178ef0;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}

.admin-add-students-page__back-icon {
  flex-shrink: 0;
  display: block;
}

.admin-add-students-page__sheet {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  border-radius: var(--radius-20);
  background-color: var(--white);
  padding: var(--sp-40) var(--sp-50);
  box-sizing: border-box;
  width: 100%;
}

.admin-add-students-page__badge {
  align-self: flex-start;
}

.admin-add-students-page__rule {
  width: 100%;
  margin: 0;
  border: none;
  border-top: var(--border-2) solid var(--black);
}

.admin-add-students-page__title {
  align-self: stretch;
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

@media (max-width: 1023px) {
  .admin-add-students-page__loading {
    font-size: var(--size-15);
  }

  .admin-add-students-page__panel {
    padding: var(--sp-24);
  }

  .admin-add-students-page__back {
    font-size: var(--size-15);
  }

  .admin-add-students-page__sheet {
    padding: var(--sp-24);
  }

  .admin-add-students-page__title {
    font-size: var(--size-15);
  }
}
</style>
