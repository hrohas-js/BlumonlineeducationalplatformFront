<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import AdminToggleSwitch from '@/components/molecules/AdminToggleSwitch.vue'
import AdminTopicGradeBadge from '@/components/molecules/AdminTopicGradeBadge.vue'
import {
  ADMIN_MATERIAL_SECTION_BORDER_COLORS,
  ADMIN_MATERIAL_SECTION_TITLES,
  isAdminMaterialSectionId,
  isAdminStudentsSectionParam,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import { formatLocalDateForInput } from '@/utils/adminDateInput'
import type { AdminTopicGradeStatus, AdminProductTopicRow } from '@/utils/adminMockStudents'
import { useAdminStore } from '@/stores/admin'

interface PageStudent {
  id: string
  name: string
  avatarUrl: string | null
}

function formatTopicTitle(index: number, rawTitle: string): string {
  const title = rawTitle.trim()
  const alreadyNumbered = new RegExp(`^${index}\\s*тема\\b`, 'i')
  if (alreadyNumbered.test(title)) return title
  return `${index} тема: ${title}`
}

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const topicSource = ref<AdminProductTopicRow[]>([])
const student = ref<PageStudent | null>(null)
const productTitle = ref('')
const loading = ref(true)
const loadError = ref('')
let loadSeq = 0

const sectionId = computed(() => route.params.sectionId as string)
const studentId = computed(() => route.params.studentId as string)
const materialSectionKey = computed(() => route.params.materialSectionKey as string)
const productId = computed(() => route.params.productId as string)

const validatedScope = computed(() =>
  isAdminStudentsSectionParam(sectionId.value) ? sectionId.value : null,
)

const validatedMaterialSection = computed<AdminMaterialSectionId | null>(() =>
  isAdminMaterialSectionId(materialSectionKey.value) ? materialSectionKey.value : null,
)

const accentColor = computed(() => {
  const k = validatedMaterialSection.value
  if (!k) return ADMIN_MATERIAL_SECTION_BORDER_COLORS.courses
  return ADMIN_MATERIAL_SECTION_BORDER_COLORS[k]
})

const sectionBreadcrumbTitle = computed(() => {
  const k = validatedMaterialSection.value
  if (!k) return ''
  return ADMIN_MATERIAL_SECTION_TITLES[k]
})

const profileBackTo = computed(() => ({
  name: 'admin-materials-student-profile' as const,
  params: { sectionId: sectionId.value, studentId: studentId.value },
}))

async function loadPage() {
  const seq = ++loadSeq
  const sid = sectionId.value
  const stid = studentId.value
  const mkey = materialSectionKey.value
  const pid = productId.value.trim()

  if (!isAdminStudentsSectionParam(sid)) {
    loading.value = false
    void router.replace({ name: 'admin-materials' })
    return
  }
  if (!isAdminMaterialSectionId(mkey) || !stid.trim() || !pid) {
    loading.value = false
    void router.replace({
      name: 'admin-materials-student-profile',
      params: { sectionId: sid, studentId: stid },
    })
    return
  }

  loading.value = true
  loadError.value = ''
  student.value = null
  productTitle.value = ''
  topicSource.value = []

  const profileRes = await adminStore.fetchStudentProfileProducts(stid)
  if (seq !== loadSeq) return
  if (!profileRes.success) {
    loadError.value = profileRes.error || 'Не удалось загрузить данные ученика'
    loading.value = false
    return
  }

  const productRow = Object.values(profileRes.data.bySection)
    .flat()
    .find((p) => p.id === pid)
  if (!productRow) {
    loading.value = false
    void router.replace({
      name: 'admin-materials-student-profile',
      params: { sectionId: sid, studentId: stid },
    })
    return
  }

  const u = profileRes.data.user
  student.value = {
    id: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email,
    avatarUrl: null,
  }
  productTitle.value = productRow.title

  const detail = await adminStore.fetchProductDetail(pid)
  if (seq !== loadSeq) return
  if (!detail.success || !detail.data) {
    loadError.value = detail.error || 'Не удалось загрузить темы продукта'
    loading.value = false
    return
  }

  productTitle.value = detail.data.title || productRow.title

  const studentsRes = await adminStore.fetchStudentsForProduct(pid)
  if (seq !== loadSeq) return
  const studentRow = studentsRes.success
    ? studentsRes.data?.find((s) => s.user_id === stid)
    : undefined
  const gradeStatus: AdminTopicGradeStatus = studentRow?.is_completed ? 'passed' : 'neutral'

  topicSource.value = [...detail.data.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m, index) => ({
      id: m.id,
      title: formatTopicTitle(index + 1, m.title),
      deadlineLabel: null,
      gradeStatus,
      topicEnabled: true,
    }))

  loading.value = false
}

watch(
  () => [sectionId.value, studentId.value, materialSectionKey.value, productId.value] as const,
  () => {
    void loadPage()
  },
  { immediate: true },
)

const minDateForDateInput = computed(() => formatLocalDateForInput(new Date()))

const deadlineByTopicId = ref<Record<string, string>>({})
const gradeByTopicId = ref<Record<string, AdminTopicGradeStatus>>({})
const enabledByTopicId = ref<Record<string, boolean>>({})

watch(
  topicSource,
  (rows) => {
    const nextDl: Record<string, string> = {}
    const nextG: Record<string, AdminTopicGradeStatus> = {}
    const nextE: Record<string, boolean> = {}
    for (const r of rows) {
      nextDl[r.id] = ''
      nextG[r.id] = r.gradeStatus
      nextE[r.id] = r.topicEnabled
    }
    deadlineByTopicId.value = nextDl
    gradeByTopicId.value = nextG
    enabledByTopicId.value = nextE
  },
  { immediate: true },
)

const updateDeadline = (id: string, value: string) => {
  const minStr = minDateForDateInput.value
  let v = value.trim()
  if (v && v < minStr) {
    v = minStr
  }
  deadlineByTopicId.value = { ...deadlineByTopicId.value, [id]: v }
}

const toggleGrade = (id: string) => {
  const cur = gradeByTopicId.value[id] ?? 'neutral'
  gradeByTopicId.value = {
    ...gradeByTopicId.value,
    [id]: cur === 'passed' ? 'neutral' : 'passed',
  }
}

const openAllTopics = () => {
  const next = { ...enabledByTopicId.value }
  for (const k of Object.keys(next)) {
    next[k] = true
  }
  enabledByTopicId.value = next
}

const setTopicEnabled = (id: string, value: boolean) => {
  enabledByTopicId.value = { ...enabledByTopicId.value, [id]: value }
}
</script>

<template>
  <AppLayout>
    <section
      v-if="validatedScope && validatedMaterialSection"
      class="admin-student-product-topics-page"
    >
      <div class="admin-student-product-topics-page__panel">
        <RouterLink class="admin-student-product-topics-page__back" :to="profileBackTo">
          <svg
            class="admin-student-product-topics-page__back-icon"
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
          <span class="admin-student-product-topics-page__back-text">Назад</span>
        </RouterLink>

        <h1 class="admin-student-product-topics-page__title">Темы продукта</h1>

        <p v-if="loading" class="admin-student-product-topics-page__status">Загружаем темы…</p>
        <p v-else-if="loadError" class="admin-student-product-topics-page__error">{{ loadError }}</p>

        <template v-else-if="student && productTitle">
          <div class="admin-student-product-topics-page__user">
            <div class="admin-student-product-topics-page__avatar">
              <img
                v-if="student.avatarUrl"
                class="admin-student-product-topics-page__avatar-img"
                :src="student.avatarUrl"
                alt=""
              />
              <svg
                v-else
                class="admin-student-product-topics-page__avatar-placeholder"
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
            <span class="admin-student-product-topics-page__user-name">{{ student.name }}</span>
          </div>

          <div class="admin-student-product-topics-page__toolbar">
            <div class="admin-student-product-topics-page__crumbs">
              <span class="admin-student-product-topics-page__crumb">{{ sectionBreadcrumbTitle }}</span>
              <span class="admin-student-product-topics-page__crumb-sep" aria-hidden="true">
                <svg width="30" height="8" viewBox="0 0 30 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4h22M22 1l5 3-5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="admin-student-product-topics-page__crumb admin-student-product-topics-page__crumb_current">
                {{ productTitle }}
              </span>
            </div>
            <button
              type="button"
              class="admin-student-product-topics-page__open-all"
              :style="{ '--product-topics-accent': accentColor }"
              @click="openAllTopics"
            >
              Открыть все темы продукта
            </button>
          </div>

          <p v-if="topicSource.length === 0" class="admin-student-product-topics-page__empty">
            У этого продукта пока нет тем
          </p>
          <ul v-else class="admin-student-product-topics-page__list" aria-label="Темы продукта">
            <li v-for="row in topicSource" :key="row.id" class="admin-student-product-topics-page__row">
              <span class="admin-student-product-topics-page__topic-title">{{ row.title }}</span>
              <div class="admin-student-product-topics-page__row-controls">
                <AdminDateField
                  label="Дедлайн"
                  :model-value="deadlineByTopicId[row.id] ?? ''"
                  :min="minDateForDateInput"
                  @update:model-value="updateDeadline(row.id, $event)"
                />
                <AdminTopicGradeBadge
                  :variant="gradeByTopicId[row.id] === 'passed' ? 'passed' : 'neutral'"
                  @toggle="toggleGrade(row.id)"
                />
                <AdminToggleSwitch
                  :model-value="enabledByTopicId[row.id] ?? false"
                  :label="`Доступ к теме: ${row.title}`"
                  @update:model-value="setTopicEnabled(row.id, $event)"
                />
              </div>
            </li>
          </ul>
        </template>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-student-product-topics-page {
  box-sizing: border-box;
  margin-top: var(--sp-40);
  padding: 0 var(--sp-16) var(--sp-40);
  background-color: #f5f5f5;
  min-height: 100%;
}

.admin-student-product-topics-page__panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 1084px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #fff;
  padding: var(--sp-40) 40px;
}

.admin-student-product-topics-page__back {
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

.admin-student-product-topics-page__back-icon {
  flex-shrink: 0;
  display: block;
}

.admin-student-product-topics-page__back-text {
  white-space: nowrap;
}

.admin-student-product-topics-page__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-student-product-topics-page__status,
.admin-student-product-topics-page__empty {
  margin: 0;
  text-align: center;
  font-family: var(--font-family);
  font-size: var(--size-20);
  color: #010307;
}

.admin-student-product-topics-page__error {
  margin: 0;
  text-align: center;
  font-family: var(--font-family);
  font-size: var(--size-20);
  color: var(--error);
}

.admin-student-product-topics-page__user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.admin-student-product-topics-page__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: #010307;
}

.admin-student-product-topics-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admin-student-product-topics-page__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-product-topics-page__user-name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #010307;
}

.admin-student-product-topics-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-16);
  padding: 17px 20px;
  border: 1px solid #010307;
  border-radius: 10px;
  box-sizing: border-box;
}

.admin-student-product-topics-page__crumbs {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.admin-student-product-topics-page__crumb {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #010307;
  white-space: nowrap;
}

.admin-student-product-topics-page__crumb_current {
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-student-product-topics-page__crumb-sep {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #010307;
}

.admin-student-product-topics-page__open-all {
  --product-topics-accent: #178ef0;
  margin: 0;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: var(--product-topics-accent);
  color: #fff;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    filter: brightness(1.03);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-student-product-topics-page__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-student-product-topics-page__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20) 40px;
  min-height: 90px;
  padding: 17px 20px;
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 10px;
  background-color: #fff;
}

.admin-student-product-topics-page__topic-title {
  margin: 0;
  flex: 1 1 200px;
  min-width: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #010307;
}

.admin-student-product-topics-page__row-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 40px;
  flex-shrink: 0;
}

@media (max-width: 1023px) {
  .admin-student-product-topics-page__back {
    font-size: var(--size-15);
  }

  .admin-student-product-topics-page__title {
    font-size: var(--size-15);
  }

  .admin-student-product-topics-page__user-name {
    font-size: var(--size-15);
  }

  .admin-student-product-topics-page__crumb {
    font-size: var(--size-15);
  }

  .admin-student-product-topics-page__open-all {
    font-size: var(--size-15);
  }

  .admin-student-product-topics-page__topic-title {
    font-size: var(--size-15);
    flex: 1 1 100%;
  }

  .admin-student-product-topics-page__status,
  .admin-student-product-topics-page__empty,
  .admin-student-product-topics-page__error {
    font-size: var(--size-15);
  }
}

@media (max-width: 767px) {
  .admin-student-product-topics-page__row {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-student-product-topics-page__row-controls {
    justify-content: center;
  }
}
</style>
