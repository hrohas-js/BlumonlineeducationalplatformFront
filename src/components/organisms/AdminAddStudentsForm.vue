<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminStudentAutocompleteField, {
  type AddStudentRow,
} from '@/components/molecules/AdminStudentAutocompleteField.vue'
import type { AggregatedAdminStudentRow } from '@/stores/admin'

interface Props {
  candidates: AggregatedAdminStudentRow[]
  submitting?: boolean
}

withDefaults(defineProps<Props>(), {
  submitting: false,
})

interface Emits {
  (e: 'submit', rows: AddStudentRow[]): void
  (e: 'excel', file: File): void
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)

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
  fileInputRef.value?.click()
}

const onExcelChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('excel', file)
  }
  input.value = ''
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

    <input
      ref="fileInputRef"
      class="admin-add-students-form__file-input"
      type="file"
      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      @change="onExcelChange"
    />

    <div class="admin-add-students-form__footer">
      <BaseButton
        class="admin-add-students-form__excel-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Загрузить из Excel"
        :disabled="submitting"
        @click="onExcelClick"
      />
      <BaseButton
        class="admin-add-students-form__submit-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        :text="submitting ? 'Добавляем…' : 'Добавить учеников'"
        :disabled="submitting"
        @click="onSubmit"
      />
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

.admin-add-students-form__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
}

.admin-add-students-form__submit-btn {
  margin: 0;
  margin-left: auto;
}

:deep(.admin-add-students-form__excel-btn.base-button),
:deep(.admin-add-students-form__submit-btn.base-button) {
  height: auto;
  padding: 10px;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
}

:deep(.admin-add-students-form__excel-btn.base-button) {
  border-color: #010307;
  color: #010307;
}

:deep(.admin-add-students-form__submit-btn.base-button) {
  border-color: var(--knopka);
  color: #010307;
}

:deep(.admin-add-students-form__submit-btn.base-button_outline:hover:not(.base-button_disabled)) {
  background-color: rgba(23, 142, 240, 0.06);
}

@media (max-width: 1023px) {
  :deep(.admin-add-students-form__excel-btn.base-button),
  :deep(.admin-add-students-form__submit-btn.base-button) {
    font-size: var(--size-15);
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
  }

  .admin-add-students-form__submit-btn {
    margin-left: 0;
  }
}
</style>
