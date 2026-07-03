<script setup lang="ts">
import { ref } from 'vue'
import AdminStudentAutocompleteField, {
  type AddStudentRow,
} from '@/components/molecules/AdminStudentAutocompleteField.vue'
import type { AggregatedAdminStudentRow } from '@/stores/admin'
import { useNotification } from '@/composables/useNotification'

interface Props {
  candidates: AggregatedAdminStudentRow[]
  submitting?: boolean
}

withDefaults(defineProps<Props>(), {
  submitting: false,
})

interface Emits {
  (e: 'submit', rows: AddStudentRow[]): void
}

const emit = defineEmits<Emits>()
const { notify } = useNotification()

function createEmptyRow(): AddStudentRow {
  return {
    id: crypto.randomUUID(),
    email: '',
    firstName: '',
    lastName: '',
    selectedUserId: null,
  }
}

const rows = ref<AddStudentRow[]>([
  createEmptyRow(),
  createEmptyRow(),
  createEmptyRow(),
  createEmptyRow(),
  createEmptyRow(),
])

const updateRow = (index: number, row: AddStudentRow) => {
  const next = [...rows.value]
  next[index] = row
  rows.value = next
}

const onExcelClick = () => {
  notify({ type: 'info', message: 'Загрузка из Excel будет доступна позже' })
}

const onSubmit = () => {
  emit('submit', rows.value)
}
</script>

<template>
  <div class="admin-add-students-form">
    <div class="admin-add-students-form__rows" role="group" aria-label="Данные учеников">
      <AdminStudentAutocompleteField
        v-for="(row, index) in rows"
        :key="row.id"
        :row="row"
        :row-index="index + 1"
        :candidates="candidates"
        @update:row="updateRow(index, $event)"
      />
    </div>

    <div class="admin-add-students-form__footer">
      <button type="button" class="admin-add-students-form__excel-btn" @click="onExcelClick">
        Загрузить из Excel
      </button>
      <button
        type="button"
        class="admin-add-students-form__submit-btn"
        :disabled="submitting"
        @click="onSubmit"
      >
        {{ submitting ? 'Добавляем…' : 'Добавить учеников' }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-add-students-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-40);
  width: 100%;
}

.admin-add-students-form__rows {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
}

.admin-add-students-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  flex-wrap: wrap;
}

.admin-add-students-form__excel-btn {
  margin: 0;
  padding: 10px;
  border: 1px solid #010307;
  border-radius: 10px;
  background: var(--white);
  color: #010307;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
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

.admin-add-students-form__submit-btn {
  margin: 0;
  margin-left: auto;
  padding: 10px;
  border: 1px solid #178ef0;
  border-radius: 10px;
  background: var(--white);
  color: #010307;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: rgba(23, 142, 240, 0.06);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

@media (max-width: 479px) {
  .admin-add-students-form__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-add-students-form__excel-btn,
  .admin-add-students-form__submit-btn {
    width: 100%;
    min-height: 44px;
  }

  .admin-add-students-form__submit-btn {
    margin-left: 0;
  }
}
</style>
