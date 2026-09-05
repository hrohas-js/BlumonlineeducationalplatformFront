<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminStudentAccessStatusModal from '@/components/organisms/AdminStudentAccessStatusModal.vue'
import AdminStudentDeadlineModal from '@/components/organisms/AdminStudentDeadlineModal.vue'
import AdminStudentProfileCategorySection from '@/components/organisms/AdminStudentProfileCategorySection.vue'
import {
  ADMIN_MATERIAL_SECTION_BORDER_COLORS,
  ADMIN_MATERIAL_SECTION_LIST,
  isAdminStudentsSectionParam,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import type { AdminStudentProfileProductRow } from '@/utils/adminMockStudents'
import { useAdminStore } from '@/stores/admin'
import { deadlineRuLabelToIso } from '@/utils/adminDateInput'
import { useNotification } from '@/composables/useNotification'
import type { StudentAccessStatusValue } from '@/components/organisms/AdminStudentAccessStatusModal.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const { notify } = useNotification()
const profileProductsBySection = ref<Record<string, AdminStudentProfileProductRow[]>>({})
const profileUser = ref<{
  id: string
  email: string
  first_name: string
  last_name: string
} | null>(null)
const profileLoaded = ref(false)

const sectionId = computed(() => route.params.sectionId as string)
const studentId = computed(() => route.params.studentId as string)

const validatedScope = computed(() =>
  isAdminStudentsSectionParam(sectionId.value) ? sectionId.value : null,
)

const student = computed(() => {
  if (!validatedScope.value) return null
  const agg = adminStore.findAggregatedStudent(validatedScope.value, studentId.value)
  if (agg) {
    return {
      id: agg.user_id,
      name: agg.name,
      email: agg.email,
      productsCount: agg.productIds.length,
      avatarUrl: null as string | null,
    }
  }
  if (profileUser.value && profileUser.value.id === studentId.value) {
    const u = profileUser.value
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email
    return {
      id: u.id,
      name,
      email: u.email,
      productsCount: Object.values(profileProductsBySection.value).reduce(
        (sum, rows) => sum + rows.length,
        0,
      ),
      avatarUrl: null as string | null,
    }
  }
  return null
})

watch(
  () => [sectionId.value, studentId.value] as const,
  ([sid]) => {
    if (!isAdminStudentsSectionParam(sid)) {
      void router.replace({ name: 'admin-materials' })
    }
  },
  { immediate: true },
)

watch(
  () => [validatedScope.value, student.value, profileLoaded.value] as const,
  ([scope, st, loaded]) => {
    if (!scope || !loaded) return
    if (!st) {
      void router.replace({ name: 'admin-materials-students', params: { sectionId: scope } })
    }
  },
)

function productAccessCompositeKey(sectionKey: AdminMaterialSectionId, productId: string) {
  return `${sectionKey}:${productId}`
}

const productDeadlineLabels = ref<Record<string, string>>({})
const productAccessStatuses = ref<Record<string, StudentAccessStatusValue>>({})

function syncAccessStatusesFromProducts(
  bySection: Record<string, AdminStudentProfileProductRow[]>,
) {
  const next: Record<string, StudentAccessStatusValue> = {}
  for (const s of ADMIN_MATERIAL_SECTION_LIST) {
    for (const p of bySection[s.id] ?? []) {
      next[productAccessCompositeKey(s.id, p.id)] = p.status
    }
  }
  productAccessStatuses.value = next
}

async function loadProfileProducts() {
  if (!studentId.value) return
  const isInitial = !profileLoaded.value
  if (isInitial) profileLoaded.value = false
  const result = await adminStore.fetchStudentProfileProducts(studentId.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить продукты ученика' })
    if (isInitial) {
      profileProductsBySection.value = {}
      profileUser.value = null
      productAccessStatuses.value = {}
    }
    profileLoaded.value = true
    return
  }
  profileUser.value = result.data.user
  profileProductsBySection.value = result.data.bySection
  syncAccessStatusesFromProducts(result.data.bySection)
  productDeadlineLabels.value = {}
  profileLoaded.value = true
}

watch(studentId, () => {
  profileLoaded.value = false
  profileUser.value = null
  profileProductsBySection.value = {}
  productAccessStatuses.value = {}
  productDeadlineLabels.value = {}
  void loadProfileProducts()
}, { immediate: true })

const profileSections = computed(() =>
  ADMIN_MATERIAL_SECTION_LIST.map((s) => ({
    sectionKey: s.id,
    title: s.title,
    borderColor: ADMIN_MATERIAL_SECTION_BORDER_COLORS[s.id],
    products: (profileProductsBySection.value[s.id] ?? []).map((p) => ({
      ...p,
      deadlineLabel:
        productDeadlineLabels.value[productAccessCompositeKey(s.id, p.id)] ?? p.deadlineLabel,
    })),
    initiallyExpanded: s.id === 'courses',
  })),
)

const accessModalOpen = ref(false)
const accessModalProductId = ref<string | null>(null)
const accessModalSectionKey = ref<AdminMaterialSectionId | null>(null)

const modalInitialAccessStatus = computed<StudentAccessStatusValue>(() => {
  const sk = accessModalSectionKey.value
  const pid = accessModalProductId.value
  if (!sk || !pid) return 'active'
  return productAccessStatuses.value[productAccessCompositeKey(sk, pid)] ?? 'active'
})

const onAddToProduct = (payload: { sectionKey: AdminMaterialSectionId }) => {
  if (!student.value || !validatedScope.value) return
  if (payload.sectionKey === 'archive') return
  void router.push({
    name: 'admin-materials-students-add',
    params: { sectionId: payload.sectionKey },
    query: {
      studentId: student.value.id,
      returnSectionId: validatedScope.value,
    },
  })
}

const onGeneralAccess = (payload: { productId: string; sectionKey: AdminMaterialSectionId }) => {
  accessModalSectionKey.value = payload.sectionKey
  accessModalProductId.value = payload.productId
  accessModalOpen.value = true
}

const onAccessModalClose = () => {
  accessModalOpen.value = false
  accessModalProductId.value = null
  accessModalSectionKey.value = null
}

const onAccessModalSave = async (payload: {
  status: StudentAccessStatusValue
  notifyByEmail: boolean
}) => {
  const sk = accessModalSectionKey.value
  const pid = accessModalProductId.value
  if (!sk || !pid) return
  const key = productAccessCompositeKey(sk, pid)

  const result = await adminStore.updateStudentAccess(studentId.value, pid, {
    status: payload.status,
    notify_email: payload.notifyByEmail,
  })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось обновить статус доступа' })
    return
  }
  productAccessStatuses.value = { ...productAccessStatuses.value, [key]: payload.status }
  notify({ type: 'success', message: 'Статус доступа обновлён' })
  onAccessModalClose()
}

const deadlineModalOpen = ref(false)
const deadlineModalCurrentLabel = ref('')
const deadlineModalProductId = ref<string | null>(null)
const deadlineModalSectionKey = ref<AdminMaterialSectionId | null>(null)

const onDeadlineClick = (payload: {
  productId: string
  sectionKey: AdminMaterialSectionId
  deadlineLabel: string
}) => {
  deadlineModalSectionKey.value = payload.sectionKey
  deadlineModalProductId.value = payload.productId
  deadlineModalCurrentLabel.value = payload.deadlineLabel
  deadlineModalOpen.value = true
}

const onDeadlineModalClose = () => {
  deadlineModalOpen.value = false
  deadlineModalProductId.value = null
  deadlineModalSectionKey.value = null
  deadlineModalCurrentLabel.value = ''
}

const onDeadlineModalSave = async (payload: { newDeadlineDisplay: string }) => {
  const sk = deadlineModalSectionKey.value
  const pid = deadlineModalProductId.value
  if (!sk || !pid) return
  const iso = deadlineRuLabelToIso(payload.newDeadlineDisplay)
  if (!iso) {
    notify({ type: 'warning', message: 'Укажите дату в формате ДД.ММ.ГГГГ' })
    return
  }
  const result = await adminStore.updateStudentAccess(studentId.value, pid, {
    deadline: `${iso}T00:00:00Z`,
  })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось обновить дедлайн' })
    return
  }
  const key = productAccessCompositeKey(sk, pid)
  productDeadlineLabels.value = {
    ...productDeadlineLabels.value,
    [key]: payload.newDeadlineDisplay,
  }
  notify({ type: 'success', message: 'Дедлайн обновлён' })
  onDeadlineModalClose()
}
</script>

<template>
  <AppLayout>
    <section v-if="student && validatedScope" class="admin-student-profile-page">
      <div class="admin-student-profile-page__panel">
        <RouterLink
          class="admin-student-profile-page__back"
          :to="{ name: 'admin-materials-students', params: { sectionId: validatedScope } }"
        >
          <svg
            class="admin-student-profile-page__back-icon"
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
          <span class="admin-student-profile-page__back-text">Назад к ученикам</span>
        </RouterLink>

        <h1 class="admin-student-profile-page__title">Профиль ученика</h1>

        <div class="admin-student-profile-page__user">
          <div class="admin-student-profile-page__avatar">
            <img
              v-if="student.avatarUrl"
              class="admin-student-profile-page__avatar-img"
              :src="student.avatarUrl"
              alt=""
            />
            <svg
              v-else
              class="admin-student-profile-page__avatar-placeholder"
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
          <span class="admin-student-profile-page__user-name">{{ student.name }}</span>
        </div>

        <ul class="admin-student-profile-page__list">
          <AdminStudentProfileCategorySection
            v-for="sec in profileSections"
            :key="sec.sectionKey"
            :section-key="sec.sectionKey"
            :title="sec.title"
            :border-color="sec.borderColor"
            :products="sec.products"
            :students-list-section-id="validatedScope"
            :student-row-id="studentId"
            :initially-expanded="sec.initiallyExpanded"
            :product-access-statuses="productAccessStatuses"
            @add-to-product="onAddToProduct"
            @general-access="onGeneralAccess"
            @deadline-click="onDeadlineClick"
          />
        </ul>
      </div>

      <AdminStudentAccessStatusModal
        v-if="student"
        :is-open="accessModalOpen"
        :student-name="student.name"
        :avatar-url="student.avatarUrl"
        :initial-access-status="modalInitialAccessStatus"
        @close="onAccessModalClose"
        @save="onAccessModalSave"
      />

      <AdminStudentDeadlineModal
        v-if="student"
        :is-open="deadlineModalOpen"
        :student-name="student.name"
        :avatar-url="student.avatarUrl"
        :current-deadline-display="deadlineModalCurrentLabel"
        @close="onDeadlineModalClose"
        @save="onDeadlineModalSave"
      />
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-student-profile-page {
  margin-top: var(--sp-40);
}

.admin-student-profile-page__panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  border-radius: var(--radius-20);
  background-color: var(--fon-bloka);
  padding: var(--sp-40) var(--sp-50);
}

.admin-student-profile-page__back {
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
  color: var(--black);
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

.admin-student-profile-page__back-icon {
  flex-shrink: 0;
  display: block;
}

.admin-student-profile-page__back-text {
  white-space: nowrap;
}

.admin-student-profile-page__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  text-align: center;
  color: var(--black);
}

.admin-student-profile-page__user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.admin-student-profile-page__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: var(--black);
}

.admin-student-profile-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admin-student-profile-page__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-profile-page__user-name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: var(--black);
}

.admin-student-profile-page__list {
  margin: var(--sp-20) 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
}

@media (max-width: 1023px) {
  .admin-student-profile-page {
    margin-top: var(--sp-24);
  }

  .admin-student-profile-page__panel {
    padding: var(--sp-24);
    gap: var(--sp-16);
  }

  .admin-student-profile-page__title {
    font-size: var(--size-15);
    line-height: 1.3;
  }

  .admin-student-profile-page__user-name {
    font-size: var(--size-15);
  }

  .admin-student-profile-page__back,
  .admin-student-profile-page__back-text {
    font-size: var(--size-15);
  }

  .admin-student-profile-page__user {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }

  .admin-student-profile-page__back-text {
    white-space: normal;
  }

  .admin-student-profile-page__list {
    margin-top: var(--sp-16);
    gap: var(--sp-16);
  }
}

@media (max-width: 479px) {
  .admin-student-profile-page__panel {
    padding: var(--sp-16);
    border-radius: var(--radius-lg);
  }

  .admin-student-profile-page__back {
    font-size: var(--size-15);
  }
}
</style>
