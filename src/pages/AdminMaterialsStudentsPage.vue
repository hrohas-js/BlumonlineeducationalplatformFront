<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminMaterialsStudentsToolbar from '@/components/organisms/AdminMaterialsStudentsToolbar.vue'
import {
  ADMIN_STUDENTS_SCOPE_ALL,
  getAdminStudentsScopeTitle,
  isAdminMaterialSectionId,
  isAdminStudentsSectionParam,
  type AdminStudentsSectionScope,
} from '@/constants/adminMaterials'
import {
  getAllMockAdminStudentRows,
  mockStudentsForAdminSection,
  type AdminStudentRow,
} from '@/utils/adminMockStudents'

const route = useRoute()
const router = useRouter()

const sectionId = computed(() => route.params.sectionId as string)
const validatedStudentsScope = computed<AdminStudentsSectionScope | null>(() =>
  isAdminStudentsSectionParam(sectionId.value) ? (sectionId.value as AdminStudentsSectionScope) : null,
)
const categoryTitle = computed(() => getAdminStudentsScopeTitle(sectionId.value) ?? '')
const searchQuery = ref('')
const sortAscending = ref(true)
const declaredUserCount = ref<number | null>(null)

const sourceRows = computed<AdminStudentRow[]>(() => {
  if (sectionId.value === ADMIN_STUDENTS_SCOPE_ALL) {
    return getAllMockAdminStudentRows()
  }
  if (isAdminMaterialSectionId(sectionId.value)) {
    return mockStudentsForAdminSection(sectionId.value)
  }
  return []
})

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sourceRows.value
  return sourceRows.value.filter((row) => row.email.toLowerCase().includes(q))
})

const displayRows = computed(() => {
  const rows = [...filteredRows.value]
  rows.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
    return sortAscending.value ? cmp : -cmp
  })
  return rows
})

const toolbarUserCount = computed(() => {
  if (sectionId.value === ADMIN_STUDENTS_SCOPE_ALL) {
    return sourceRows.value.length
  }
  if (declaredUserCount.value != null) return declaredUserCount.value
  return sourceRows.value.length
})

const readDeclaredCountFromHistory = () => {
  const state = window.history.state as { usersCount?: unknown } | undefined
  if (typeof state?.usersCount === 'number' && Number.isFinite(state.usersCount)) {
    declaredUserCount.value = state.usersCount
  } else {
    declaredUserCount.value = null
  }
}

onMounted(() => {
  if (sectionId.value === ADMIN_STUDENTS_SCOPE_ALL) {
    declaredUserCount.value = null
  } else {
    readDeclaredCountFromHistory()
  }
})

watch(sectionId, (id) => {
  if (!isAdminStudentsSectionParam(id)) {
    void router.replace({ name: 'admin' })
    return
  }
  if (id === ADMIN_STUDENTS_SCOPE_ALL) {
    declaredUserCount.value = null
  } else {
    readDeclaredCountFromHistory()
  }
})

const toggleNameSort = () => {
  sortAscending.value = !sortAscending.value
}

const onAddStudent = () => {
  /* до API добавления ученика */
}

const onExportXlsx = () => {
  /* до API выгрузки */
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
          @add-student="onAddStudent"
          @export-xlsx="onExportXlsx"
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
            <li v-for="row in displayRows" :key="row.id" class="admin-materials-students-page__row-item">
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
                    <span class="admin-materials-students-page__user-name">{{ row.name }}</span>
                    <span class="admin-materials-students-page__user-email">{{ row.email }}</span>
                  </div>
                </div>
                <span class="admin-materials-students-page__products-count">{{ row.productsCount }}</span>
              </RouterLink>
            </li>
          </ul>

          <p v-if="displayRows.length === 0" class="admin-materials-students-page__empty">Нет учеников по запросу</p>
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

  .admin-materials-students-page__row {
    flex-wrap: wrap;
  }

  .admin-materials-students-page__products-count {
    width: fit-content;
    margin-left: auto;
    align-self: flex-end;
  }
}
</style>
