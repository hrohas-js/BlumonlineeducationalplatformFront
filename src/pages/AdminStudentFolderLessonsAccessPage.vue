<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import AdminInfoModal from '@/components/organisms/AdminInfoModal.vue'
import { useNotification } from '@/composables/useNotification'
import {
  ADMIN_MATERIAL_SECTION_BORDER_COLORS,
  isAdminMaterialSectionId,
  isAdminStudentsSectionParam,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import {
  deadlineRuLabelToIso,
  formatLocalDateForInput,
  parseIsoDateToTime,
} from '@/utils/adminDateInput'
import {
  getMockFolderProductsForLessonsAccess,
  getMockStudentProfileProducts,
  resolveAdminStudentRow,
  type AdminFolderLessonProductRow,
} from '@/utils/adminMockStudents'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const { notify } = useNotification()

const minDateForDateInput = computed(() => formatLocalDateForInput(new Date()))
const studentId = computed(() => route.params.studentId as string)
const materialSectionKey = computed(() => route.params.materialSectionKey as string)
const sourceProductId = computed(() => route.params.sourceProductId as string)
const sectionId = computed(() => route.params.sectionId as string)

const validatedScope = computed(() =>
  isAdminStudentsSectionParam(sectionId.value) ? sectionId.value : null,
)

const validatedMaterialSection = computed<AdminMaterialSectionId | null>(() =>
  isAdminMaterialSectionId(materialSectionKey.value) ? materialSectionKey.value : null,
)

const student = computed(() => {
  if (!validatedScope.value) return null
  const agg = adminStore.findAggregatedStudent(validatedScope.value, studentId.value)
  if (agg) {
    return { id: agg.user_id, name: agg.name, email: agg.email, productsCount: agg.productIds.length }
  }
  return resolveAdminStudentRow(validatedScope.value, studentId.value)
})

const accentColor = computed(() => {
  const k = validatedMaterialSection.value
  if (!k) return ADMIN_MATERIAL_SECTION_BORDER_COLORS.courses
  return ADMIN_MATERIAL_SECTION_BORDER_COLORS[k]
})

const folderProducts = computed<AdminFolderLessonProductRow[]>(() => {
  const k = validatedMaterialSection.value
  if (!k) return []
  return getMockFolderProductsForLessonsAccess(k, sourceProductId.value)
})

/** Выбранные строки по id продукта папки. */
const selectedById = ref<Record<string, boolean>>({})
/** Значения `input type="date"` (YYYY-MM-DD) по id строки. */
const deadlineByProductId = ref<Record<string, string>>({})
/** Ошибка дедлайна после сабмита (красная рамка). */
const deadlineErrorById = ref<Record<string, boolean>>({})

const successModalOpen = ref(false)

watch(
  folderProducts,
  (rows) => {
    const nextSel: Record<string, boolean> = {}
    const nextDl: Record<string, string> = {}
    for (const r of rows) {
      nextSel[r.id] = r.selectedByDefault
      const fromMock = deadlineRuLabelToIso(r.deadlineLabel)
      const minStr = minDateForDateInput.value
      nextDl[r.id] = fromMock && fromMock < minStr ? minStr : fromMock
    }
    selectedById.value = nextSel
    deadlineByProductId.value = nextDl
    deadlineErrorById.value = {}
  },
  { immediate: true },
)

function isSourceProductInProfile(): boolean {
  const scope = validatedScope.value
  const mat = validatedMaterialSection.value
  const sid = studentId.value
  const src = sourceProductId.value
  if (!scope || !mat || !sid || !src.trim()) return false
  const profileProducts = getMockStudentProfileProducts(sid, mat)
  return profileProducts.some((p) => p.id === src)
}

watch(
  () =>
    [
      sectionId.value,
      studentId.value,
      materialSectionKey.value,
      sourceProductId.value,
    ] as const,
  ([sid, stid, mkey, src]) => {
    if (!isAdminStudentsSectionParam(sid)) {
      void router.replace({ name: 'admin-materials' })
      return
    }
    const row =
      adminStore.findAggregatedStudent(sid, stid) ??
      resolveAdminStudentRow(sid, stid)
    if (!row) {
      void router.replace({ name: 'admin-materials-students', params: { sectionId: sid } })
      return
    }
    if (!isAdminMaterialSectionId(mkey)) {
      void router.replace({
        name: 'admin-materials-student-profile',
        params: { sectionId: sid, studentId: stid },
      })
      return
    }
    if (!src.trim() || !isSourceProductInProfile()) {
      void router.replace({
        name: 'admin-materials-student-profile',
        params: { sectionId: sid, studentId: stid },
      })
    }
  },
  { immediate: true },
)

const toggleRow = (id: string, checked: boolean) => {
  selectedById.value = { ...selectedById.value, [id]: checked }
}

const updateDeadline = (id: string, value: string) => {
  const minStr = minDateForDateInput.value
  let v = value.trim()
  if (v && v < minStr) {
    v = minStr
  }
  deadlineByProductId.value = { ...deadlineByProductId.value, [id]: v }
  if (deadlineErrorById.value[id]) {
    const next = { ...deadlineErrorById.value, [id]: false }
    deadlineErrorById.value = next
  }
}

const onAddStudent = () => {
  const rows = folderProducts.value
  const selectedIds = rows.filter((r) => selectedById.value[r.id]).map((r) => r.id)

  deadlineErrorById.value = {}

  if (selectedIds.length === 0) {
    notify({ type: 'warning', message: 'Выберите хотя бы один продукт' })
    return
  }

  const missing: string[] = []
  for (const id of selectedIds) {
    const v = deadlineByProductId.value[id]?.trim() ?? ''
    if (!v) missing.push(id)
  }
  if (missing.length > 0) {
    const err: Record<string, boolean> = {}
    for (const id of missing) err[id] = true
    deadlineErrorById.value = err
    notify({
      type: 'warning',
      message: 'Заполните поле дедлайна для всех выбранных продуктов',
    })
    return
  }

  const minStr = minDateForDateInput.value

  for (const id of selectedIds) {
    const v = deadlineByProductId.value[id] ?? ''
    const t = parseIsoDateToTime(v)
    if (Number.isNaN(t)) {
      notify({ type: 'warning', message: 'Укажите корректную дату дедлайна' })
      return
    }
    if (v < minStr) {
      deadlineErrorById.value = { ...deadlineErrorById.value, [id]: true }
      notify({
        type: 'warning',
        message: 'Дата дедлайна не может быть раньше сегодняшнего дня',
      })
      return
    }
  }

  void validatedMaterialSection.value
  void sourceProductId.value
  /* до API: добавление ученика к выбранным продуктам папки с дедлайнами */
  successModalOpen.value = true
}

const onSuccessModalConfirm = () => {
  void router.push({
    name: 'admin-materials-student-profile',
    params: { sectionId: sectionId.value, studentId: studentId.value },
  })
}
</script>

<template>
  <AppLayout>
    <section v-if="student && validatedScope && validatedMaterialSection" class="admin-student-folder-lessons-access-page">
      <div class="admin-student-folder-lessons-access-page__panel">
        <RouterLink
          class="admin-student-folder-lessons-access-page__back"
          :to="{
            name: 'admin-materials-student-profile',
            params: { sectionId: validatedScope, studentId: student.id },
          }"
        >
          <svg
            class="admin-student-folder-lessons-access-page__back-icon"
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
          <span class="admin-student-folder-lessons-access-page__back-text">Назад</span>
        </RouterLink>

        <h1 class="admin-student-folder-lessons-access-page__title">Профиль ученика</h1>

        <div class="admin-student-folder-lessons-access-page__user">
          <div class="admin-student-folder-lessons-access-page__avatar">
            <img
              v-if="student.avatarUrl"
              class="admin-student-folder-lessons-access-page__avatar-img"
              :src="student.avatarUrl"
              alt=""
            />
            <svg
              v-else
              class="admin-student-folder-lessons-access-page__avatar-placeholder"
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
          <span class="admin-student-folder-lessons-access-page__user-name">{{ student.name }}</span>
        </div>

        <p class="admin-student-folder-lessons-access-page__intro">
          Выберите продукт из выбранной папки, куда вы хотите добавить ученика:
        </p>

        <ul class="admin-student-folder-lessons-access-page__list" aria-label="Продукты папки">
          <li
            v-for="row in folderProducts"
            :key="row.id"
            class="admin-student-folder-lessons-access-page__row"
          >
            <div class="admin-student-folder-lessons-access-page__row-inner">
              <label
                class="admin-student-folder-lessons-access-page__checkbox-label"
                :for="`folder-lessons-cb-${row.id}`"
              >
                <span class="admin-student-folder-lessons-access-page__checkbox-wrap">
                  <input
                    :id="`folder-lessons-cb-${row.id}`"
                    class="admin-student-folder-lessons-access-page__checkbox-input"
                    type="checkbox"
                    :checked="selectedById[row.id] === true"
                    @change="toggleRow(row.id, ($event.target as HTMLInputElement).checked)"
                  />
                  <span
                    class="admin-student-folder-lessons-access-page__checkbox-ui"
                    :class="{ 'admin-student-folder-lessons-access-page__checkbox-ui_checked': selectedById[row.id] }"
                    aria-hidden="true"
                  >
                    <svg
                      v-if="selectedById[row.id]"
                      class="admin-student-folder-lessons-access-page__checkbox-check"
                      width="10"
                      height="9"
                      viewBox="0 0 10 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4.5L3.8 7.3L9 1"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </label>

              <span
                class="admin-student-folder-lessons-access-page__product-title"
                :class="{
                  'admin-student-folder-lessons-access-page__product-title_narrow': row.id === 'folder-closed-club',
                }"
                :style="{ '--folder-lessons-accent': accentColor }"
              >
                {{ row.title }}
              </span>

              <span class="admin-student-folder-lessons-access-page__topics">
                <svg
                  class="admin-student-folder-lessons-access-page__topics-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h8v2H4v-2z"
                    fill="currentColor"
                  />
                </svg>
                <span class="admin-student-folder-lessons-access-page__topics-count">{{ row.topicsCount }}</span>
              </span>

              <AdminDateField
                class="admin-student-folder-lessons-access-page__deadline"
                label="Дедлайн (общий)"
                :model-value="deadlineByProductId[row.id] ?? ''"
                :min="minDateForDateInput"
                :invalid="deadlineErrorById[row.id] === true"
                @update:model-value="updateDeadline(row.id, $event)"
              />
            </div>
          </li>
        </ul>

        <div class="admin-student-folder-lessons-access-page__footer">
          <button
            type="button"
            class="admin-student-folder-lessons-access-page__add-btn"
            @click="onAddStudent"
          >
            Добавить ученика
          </button>
        </div>
      </div>
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
/* Макет Figma 444:922 + строки 445:1091–445:1138 (Dev Mode) */

.admin-student-folder-lessons-access-page {
  box-sizing: border-box;
  margin-top: var(--sp-40);
  padding: 0 var(--sp-16) var(--sp-40);
  background-color: #f5f5f5;
  min-height: 100%;
}

.admin-student-folder-lessons-access-page__panel {
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

.admin-student-folder-lessons-access-page__back {
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

.admin-student-folder-lessons-access-page__back-icon {
  flex-shrink: 0;
  display: block;
}

.admin-student-folder-lessons-access-page__back-text {
  white-space: nowrap;
}

.admin-student-folder-lessons-access-page__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 25px;
  line-height: normal;
  text-align: center;
  color: #010307;
}

.admin-student-folder-lessons-access-page__user {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.admin-student-folder-lessons-access-page__avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-round);
  overflow: hidden;
  color: #010307;
}

.admin-student-folder-lessons-access-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admin-student-folder-lessons-access-page__avatar-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.admin-student-folder-lessons-access-page__user-name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  color: #010307;
}

.admin-student-folder-lessons-access-page__intro {
  margin: 0;
  align-self: stretch;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  color: #010307;
  text-align: left;
}

.admin-student-folder-lessons-access-page__list {
  margin: 44px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.admin-student-folder-lessons-access-page__row {
  margin: 0;
  width: fit-content;
  max-width: 100%;
}

.admin-student-folder-lessons-access-page__row-inner {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 30px;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px 30px;
  border: 1px solid #010307;
  border-radius: 10px;
  background-color: #fff;
  overflow-x: auto;
}

.admin-student-folder-lessons-access-page__checkbox-label {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
}

.admin-student-folder-lessons-access-page__checkbox-wrap {
  position: relative;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
}

.admin-student-folder-lessons-access-page__checkbox-input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.admin-student-folder-lessons-access-page__checkbox-ui {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid #010307;
  background-color: #fff;
  box-sizing: border-box;
  color: #fff;
  pointer-events: none;
}

.admin-student-folder-lessons-access-page__checkbox-ui_checked {
  border: none;
  background-color: #178ef0;
}

.admin-student-folder-lessons-access-page__checkbox-check {
  display: block;
  flex-shrink: 0;
}

.admin-student-folder-lessons-access-page__product-title {
  --folder-lessons-accent: #178ef0;
  flex: 0 0 auto;
  min-width: 0;
  margin: 0;
  padding: 10px;
  border: 3px solid var(--folder-lessons-accent);
  border-radius: 10px;
  background-color: var(--folder-lessons-accent);
  color: #fff;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  text-align: center;
  white-space: nowrap;
}

.admin-student-folder-lessons-access-page__product-title_narrow {
  width: 141px;
  box-sizing: border-box;
}

.admin-student-folder-lessons-access-page__topics {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  color: #010307;
}

.admin-student-folder-lessons-access-page__topics-icon {
  flex-shrink: 0;
  display: block;
}

.admin-student-folder-lessons-access-page__topics-count {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: normal;
  color: #010307;
}

.admin-student-folder-lessons-access-page__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 36px;
}

.admin-student-folder-lessons-access-page__add-btn {
  margin: 0;
  padding: 10px;
  border: 1px solid #010307;
  border-radius: 10px;
  background: #fff;
  color: #010307;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: 20px;
  line-height: normal;
  cursor: pointer;

  &:hover {
    filter: brightness(0.98);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

@media (max-width: 1023px) {
  .admin-student-folder-lessons-access-page {
    margin-top: var(--sp-24);
    padding-left: var(--sp-16);
    padding-right: var(--sp-16);
  }

  .admin-student-folder-lessons-access-page__panel {
    padding: var(--sp-24) 24px;
    gap: var(--sp-16);
  }

  .admin-student-folder-lessons-access-page__title {
    font-size: var(--size-15);
    line-height: 1.3;
  }

  .admin-student-folder-lessons-access-page__user-name {
    font-size: var(--size-15);
  }

  .admin-student-folder-lessons-access-page__intro {
    font-size: var(--size-15);
  }

  .admin-student-folder-lessons-access-page__back,
  .admin-student-folder-lessons-access-page__add-btn {
    font-size: var(--size-15);
  }

  .admin-student-folder-lessons-access-page__user {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }

  .admin-student-folder-lessons-access-page__back-text {
    white-space: normal;
  }

  .admin-student-folder-lessons-access-page__list {
    margin-top: 32px;
  }
}

@media (max-width: 767px) {
  .admin-student-folder-lessons-access-page__row-inner {
    gap: 20px;
    padding: 10px 16px;
  }

  .admin-student-folder-lessons-access-page__product-title_narrow {
    width: auto;
    min-width: 120px;
  }
}

@media (max-width: 479px) {
  .admin-student-folder-lessons-access-page__panel {
    padding: var(--sp-16);
    border-radius: 20px;
  }

  .admin-student-folder-lessons-access-page__back {
    font-size: var(--size-15);
  }

  .admin-student-folder-lessons-access-page__add-btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>
