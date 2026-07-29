<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import type { AggregatedAdminStudentRow } from '@/stores/admin'

export interface AddStudentRow {
  id: string
  email: string
  firstName: string
  lastName: string
  selectedUserId: string | null
}

interface Props {
  row: AddStudentRow
  rowIndex: number
  candidates: AggregatedAdminStudentRow[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:row', value: AddStudentRow): void
}

const emit = defineEmits<Emits>()

type ActiveField = 'email' | 'firstName' | 'lastName' | null

const activeField = ref<ActiveField>(null)
const rootRef = ref<HTMLElement | null>(null)
const dropdownOpen = ref(false)

const searchQuery = ref('')
const debouncedQuery = useDebouncedRef(searchQuery, 300)

watch(debouncedQuery, (q) => {
  dropdownOpen.value = q.trim().length > 0 && activeField.value != null
})

const matches = computed(() => {
  const q = debouncedQuery.value.trim().toLowerCase()
  if (!q) return []
  return props.candidates
    .filter((student) => {
      const haystack = [
        student.email,
        student.first_name,
        student.last_name,
        student.name,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    .slice(0, 10)
})

const updateField = (field: keyof Pick<AddStudentRow, 'email' | 'firstName' | 'lastName'>, value: string) => {
  emit('update:row', {
    ...props.row,
    [field]: value,
    selectedUserId: null,
  })
}

const onFieldFocus = (field: ActiveField) => {
  activeField.value = field
  const current =
    field === 'email'
      ? props.row.email
      : field === 'firstName'
        ? props.row.firstName
        : props.row.lastName
  searchQuery.value = current
  if (current.trim()) {
    dropdownOpen.value = true
  }
}

const onFieldInput = (field: ActiveField, event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (field === 'email') updateField('email', value)
  else if (field === 'firstName') updateField('firstName', value)
  else if (field === 'lastName') updateField('lastName', value)
  searchQuery.value = value
  activeField.value = field
}

const selectStudent = (student: AggregatedAdminStudentRow) => {
  emit('update:row', {
    ...props.row,
    email: student.email,
    firstName: student.first_name,
    lastName: student.last_name,
    selectedUserId: student.user_id,
  })
  dropdownOpen.value = false
  activeField.value = null
  searchQuery.value = ''
}

const onDocumentPointerDown = (event: MouseEvent) => {
  if (!dropdownOpen.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target)) return
  dropdownOpen.value = false
  activeField.value = null
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && dropdownOpen.value) {
    dropdownOpen.value = false
    activeField.value = null
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onKeydown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onKeydown, true)
})
</script>

<template>
  <div ref="rootRef" class="admin-student-autocomplete-row">
    <span class="admin-student-autocomplete-row__index" aria-hidden="true">{{ rowIndex }}</span>

    <div class="admin-student-autocomplete-row__field-wrap">
      <input
        class="admin-student-autocomplete-row__input"
        type="text"
        :value="row.email"
        placeholder="E-mail"
        autocomplete="off"
        @focus="onFieldFocus('email')"
        @input="onFieldInput('email', $event)"
      />
      <ul
        v-if="dropdownOpen && activeField === 'email'"
        class="admin-student-autocomplete-row__list"
        role="listbox"
      >
        <li v-if="matches.length === 0" class="admin-student-autocomplete-row__empty" role="presentation">
          Будет создан новый ученик
        </li>
        <li v-for="student in matches" :key="student.user_id" role="presentation">
          <button
            type="button"
            class="admin-student-autocomplete-row__option"
            role="option"
            @mousedown.prevent="selectStudent(student)"
          >
            {{ student.email }} — {{ student.name }}
          </button>
        </li>
      </ul>
    </div>

    <div class="admin-student-autocomplete-row__field-wrap">
      <input
        class="admin-student-autocomplete-row__input"
        type="text"
        :value="row.firstName"
        placeholder="Имя ученика"
        autocomplete="off"
        @focus="onFieldFocus('firstName')"
        @input="onFieldInput('firstName', $event)"
      />
      <ul
        v-if="dropdownOpen && activeField === 'firstName'"
        class="admin-student-autocomplete-row__list"
        role="listbox"
      >
        <li v-if="matches.length === 0" class="admin-student-autocomplete-row__empty" role="presentation">
          Будет создан новый ученик
        </li>
        <li v-for="student in matches" :key="student.user_id" role="presentation">
          <button
            type="button"
            class="admin-student-autocomplete-row__option"
            role="option"
            @mousedown.prevent="selectStudent(student)"
          >
            {{ student.email }} — {{ student.name }}
          </button>
        </li>
      </ul>
    </div>

    <div class="admin-student-autocomplete-row__field-wrap">
      <input
        class="admin-student-autocomplete-row__input"
        type="text"
        :value="row.lastName"
        placeholder="Фамилия ученика"
        autocomplete="off"
        @focus="onFieldFocus('lastName')"
        @input="onFieldInput('lastName', $event)"
      />
      <ul
        v-if="dropdownOpen && activeField === 'lastName'"
        class="admin-student-autocomplete-row__list"
        role="listbox"
      >
        <li v-if="matches.length === 0" class="admin-student-autocomplete-row__empty" role="presentation">
          Будет создан новый ученик
        </li>
        <li v-for="student in matches" :key="student.user_id" role="presentation">
          <button
            type="button"
            class="admin-student-autocomplete-row__option"
            role="option"
            @mousedown.prevent="selectStudent(student)"
          >
            {{ student.email }} — {{ student.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-student-autocomplete-row {
  display: grid;
  grid-template-columns: 24px 1fr 1fr 1fr;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-student-autocomplete-row__index {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  color: #010307;
  text-align: center;
}

.admin-student-autocomplete-row__field-wrap {
  position: relative;
  min-width: 0;
}

.admin-student-autocomplete-row__input {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 5px;
  background-color: #f3f4f6;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  outline: none;

  &::placeholder {
    color: rgba(1, 3, 7, 0.35);
  }

  &:focus {
    border-color: #178ef0;
    background-color: var(--white);
  }
}

.admin-student-autocomplete-row__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 3;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  box-shadow: 0 4px 12px rgba(1, 3, 7, 0.12);
  max-height: 240px;
  overflow-y: auto;
}

.admin-student-autocomplete-row__empty {
  padding: 10px var(--sp-20);
  font-family: var(--font-family);
  font-size: var(--size-18);
  color: var(--black-300);
}

.admin-student-autocomplete-row__option {
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px var(--sp-20);
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-18);
  color: #010307;
  cursor: pointer;

  &:hover {
    background-color: rgba(23, 142, 240, 0.12);
  }
}

@media (max-width: 1023px) {
  .admin-student-autocomplete-row__index {
    font-size: var(--size-15);
  }

  .admin-student-autocomplete-row__input {
    font-size: var(--size-15);
  }

  .admin-student-autocomplete-row__empty {
    font-size: var(--size-15);
  }

  .admin-student-autocomplete-row__option {
    font-size: var(--size-15);
  }
}

@media (max-width: 767px) {
  .admin-student-autocomplete-row {
    grid-template-columns: 24px 1fr;
    grid-template-rows: auto auto auto;
  }

  .admin-student-autocomplete-row__index {
    grid-row: 1 / -1;
    align-self: start;
    padding-top: 10px;
  }
}
</style>
