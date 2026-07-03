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

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const { notify } = useNotification()

const loading = ref(true)
const submitting = ref(false)
const successModalOpen = ref(false)
const targetProducts = ref<{ id: string }[]>([])

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

  const products = await adminStore.fetchProductsForStudentsScope(scope)
  if (products.length === 0) {
    loading.value = false
    notify({ type: 'warning', message: 'Нет продуктов для добавления учеников' })
    void router.replace({
      name: 'admin-materials-students',
      params: { sectionId: scope },
    })
    return
  }

  targetProducts.value = products
  await adminStore.aggregateAllSections()
  loading.value = false
}

onMounted(() => {
  void loadPageData()
})

const onSubmit = async (rows: AddStudentRow[]) => {
  const scope = validatedScope.value
  if (!scope) return

  const withUserId = rows.filter((row) => row.selectedUserId)
  if (withUserId.length === 0) {
    notify({ type: 'warning', message: 'Выберите учеников из списка или заполните данные' })
    return
  }

  const seen = new Set<string>()
  const uniqueRows: AddStudentRow[] = []
  for (const row of withUserId) {
    const uid = row.selectedUserId!
    if (seen.has(uid)) continue
    seen.add(uid)
    uniqueRows.push(row)
  }

  const products = targetProducts.value
  if (products.length === 0) {
    const loaded = await adminStore.fetchProductsForStudentsScope(scope)
    targetProducts.value = loaded
    if (loaded.length === 0) {
      notify({ type: 'warning', message: 'Нет продуктов для добавления учеников' })
      return
    }
  }

  const grantPairs: { userId: string; productId: string }[] = []
  for (const row of uniqueRows) {
    const student = studentCandidates.value.find((s) => s.user_id === row.selectedUserId)
    for (const product of targetProducts.value) {
      if (student?.productIds.includes(product.id)) continue
      grantPairs.push({ userId: row.selectedUserId!, productId: product.id })
    }
  }

  if (grantPairs.length === 0) {
    notify({ type: 'info', message: 'Выбранные ученики уже имеют доступ ко всем продуктам' })
    return
  }

  submitting.value = true
  for (const { userId, productId } of grantPairs) {
    const result = await adminStore.grantAccess(userId, {
      product_id: productId,
      access_type: 'immediate',
    })
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось добавить ученика' })
      submitting.value = false
      return
    }
  }

  submitting.value = false
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
