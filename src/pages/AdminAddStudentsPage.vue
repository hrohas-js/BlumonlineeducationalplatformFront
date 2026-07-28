<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminAddStudentsForm from '@/components/organisms/AdminAddStudentsForm.vue'
import AdminInfoModal from '@/components/organisms/AdminInfoModal.vue'
import type { AddStudentRow } from '@/components/molecules/AdminStudentAutocompleteField.vue'
import {
  ADMIN_STUDENTS_SCOPE_ALL,
  getAdminStudentsScopeTitle,
  isAdminStudentsSectionParam,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminBulkStudentItem } from '@/services/api/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const { notify } = useNotification()

const loading = ref(true)
const submitting = ref(false)
const successModalOpen = ref(false)

const sectionId = computed(() => route.params.sectionId as string)

const validatedScope = computed<AdminStudentsSectionScope | null>(() =>
  isAdminStudentsSectionParam(sectionId.value) && sectionId.value !== 'archive'
    ? sectionId.value
    : null,
)

const breadcrumbItems = computed(() => {
  const scope = validatedScope.value
  if (!scope) return []
  const title = getAdminStudentsScopeTitle(scope) ?? scope
  return [{ label: title, to: { name: 'admin-materials' as const } }]
})

const studentCandidates = computed(() => adminStore.aggregatedStudents[ADMIN_STUDENTS_SCOPE_ALL] ?? [])

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

  await adminStore.aggregateAllSections()
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

const onSubmit = async (rows: AddStudentRow[]) => {
  const students = buildBulkPayload(rows)
  if (!students) return

  submitting.value = true
  const result = await adminService.bulkAddStudents({ students })
  submitting.value = false

  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось добавить учеников' })
    return
  }

  const { created_count, existing_count } = result.data
  notify({
    type: 'success',
    message: `Создано ${created_count}, уже было ${existing_count}`,
  })
  void adminStore.aggregateAllSections()
  successModalOpen.value = true
}

const onExcelUpload = async (file: File) => {
  submitting.value = true
  const result = await adminService.bulkAddStudentsExcel(file)
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
  successModalOpen.value = true
}

const onSuccessModalConfirm = () => {
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
</script>

<template>
  <AppLayout>
    <section v-if="validatedScope && !loading" class="admin-add-students-page">
      <div class="admin-add-students-page__panel">
        <RouterLink
          class="admin-add-students-page__back"
          :to="{ name: 'admin-materials-students', params: { sectionId: validatedScope } }"
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

          <h1 class="admin-add-students-page__title">Добавление ученика</h1>

          <AdminAddStudentsForm
            :candidates="studentCandidates"
            :submitting="submitting"
            @submit="onSubmit"
            @excel="onExcelUpload"
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
      @close="successModalOpen = false"
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
  .admin-add-students-page__panel {
    padding: var(--sp-24);
  }

  .admin-add-students-page__sheet {
    padding: var(--sp-24);
  }
}
</style>
