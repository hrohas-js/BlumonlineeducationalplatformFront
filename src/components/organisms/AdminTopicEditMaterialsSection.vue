<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AdminTopicEditMaterialFileMock } from '@/utils/adminMaterialCatalog'
import { isAllowedTopicMaterialFileName } from '@/utils/adminMaterialCatalog'

const files = defineModel<AdminTopicEditMaterialFileMock[]>('files', { required: true })

const props = withDefaults(
  defineProps<{
    deletingFileId?: string | null
  }>(),
  {
    deletingFileId: null,
  },
)

interface Emits {
  (e: 'material-upload', file: File): void
  (e: 'material-delete', fileId: string): void
}

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const draftFiles = ref<AdminTopicEditMaterialFileMock[]>([])
const addFileError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const ACCEPT_INPUT =
  '.pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg'

/** Серверные id файлов — UUID; временные строки до upload имеют вид `mf-...`. */
const SERVER_FILE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isServerFileId(id: string): boolean {
  return SERVER_FILE_ID_RE.test(id)
}

const displayedFiles = computed(() => (isEditing.value ? draftFiles.value : files.value))

const isDeleting = computed(() => props.deletingFileId != null)

const hasMaterials = computed(() => files.value.length > 0)

const materialsActionLabel = computed(() => (hasMaterials.value ? 'Редактировать' : 'Добавить'))

watch(files, () => {
  isEditing.value = false
  addFileError.value = ''
})

const startEditing = () => {
  draftFiles.value = files.value.map((f) => ({ ...f }))
  addFileError.value = ''
  isEditing.value = true
}

const openFilePicker = () => {
  addFileError.value = ''
  fileInputRef.value?.click()
}

const onFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const list = input.files
  if (!list?.length) {
    input.value = ''
    return
  }
  const file = list[0]
  if (!isAllowedTopicMaterialFileName(file.name)) {
    addFileError.value = 'Допустимые форматы: PDF, DOCX, PNG, JPEG.'
    input.value = ''
    return
  }
  draftFiles.value = [
    ...draftFiles.value,
    { id: `mf-${Date.now()}`, fileName: file.name },
  ]
  emit('material-upload', file)
  addFileError.value = ''
  input.value = ''
}

const removeById = (id: string) => {
  if (isDeleting.value) return
  if (isServerFileId(id)) {
    emit('material-delete', id)
    return
  }
  draftFiles.value = draftFiles.value.filter((f) => f.id !== id)
}

const saveDraft = () => {
  files.value = draftFiles.value.map((f) => ({ ...f }))
  addFileError.value = ''
  isEditing.value = false
}

const cancelEditing = () => {
  addFileError.value = ''
  isEditing.value = false
}
</script>

<template>
  <section class="admin-topic-edit-materials-section">
    <h2 class="admin-topic-edit-materials-section__heading">Учебный материал</h2>
    <div class="admin-topic-edit-materials-section__box">
      <input
        ref="fileInputRef"
        class="admin-topic-edit-materials-section__file-input"
        type="file"
        :accept="ACCEPT_INPUT"
        tabindex="-1"
        aria-hidden="true"
        @change="onFileInputChange"
      />
      <ul class="admin-topic-edit-materials-section__list" aria-label="Файлы учебного материала">
        <li
          v-for="row in displayedFiles"
          :key="row.id"
          class="admin-topic-edit-materials-section__item"
          :class="{ 'admin-topic-edit-materials-section__item_editing': isEditing }"
        >
          <span class="admin-topic-edit-materials-section__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 3h6l4 4v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
              <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </span>
          <span class="admin-topic-edit-materials-section__name">{{ row.fileName }}</span>
          <button
            v-if="isEditing"
            type="button"
            class="admin-topic-edit-materials-section__remove-btn"
            :aria-label="`Удалить файл ${row.fileName}`"
            :aria-busy="deletingFileId === row.id"
            :disabled="isDeleting"
            @click="removeById(row.id)"
          >
            <svg
              class="admin-topic-edit-materials-section__remove-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 7h16M8 5h8v2M7 7l2 14h6l2-14M10.5 11v8M13.5 11v8"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </li>
      </ul>
      <p v-if="addFileError" class="admin-topic-edit-materials-section__error" role="alert">
        {{ addFileError }}
      </p>
      <div v-if="!isEditing" class="admin-topic-edit-materials-section__actions">
        <button type="button" class="admin-topic-edit-materials-section__edit-btn" @click="startEditing">
          {{ materialsActionLabel }}
        </button>
      </div>
      <div v-else class="admin-topic-edit-materials-section__toolbar">
        <button type="button" class="admin-topic-edit-materials-section__toolbar-btn" @click="openFilePicker">
          Добавить файл
        </button>
        <button type="button" class="admin-topic-edit-materials-section__toolbar-btn" @click="saveDraft">
          Сохранить
        </button>
        <button type="button" class="admin-topic-edit-materials-section__toolbar-btn" @click="cancelEditing">
          Отмена
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-edit-materials-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 1084px;
  align-items: flex-start;
}

.admin-topic-edit-materials-section__heading {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
}

.admin-topic-edit-materials-section__box {
  width: 100%;
  box-sizing: border-box;
  padding: var(--sp-20);
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
}

.admin-topic-edit-materials-section__file-input {
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

.admin-topic-edit-materials-section__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-10);
}

.admin-topic-edit-materials-section__item {
  display: flex;
  align-items: center;
  gap: var(--sp-10);
  min-width: 0;

  &_editing {
    .admin-topic-edit-materials-section__name {
      flex: 1 1 auto;
      min-width: 0;
    }
  }
}

.admin-topic-edit-materials-section__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: #010307;
}

.admin-topic-edit-materials-section__name {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  word-break: break-word;
}

.admin-topic-edit-materials-section__remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: auto;
  padding: var(--sp-6);
  border: none;
  border-radius: var(--radius-input);
  background: transparent;
  color: #010307;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.admin-topic-edit-materials-section__remove-icon {
  display: block;
  flex-shrink: 0;
}

.admin-topic-edit-materials-section__error {
  margin: var(--sp-10) 0 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-16);
  line-height: normal;
  color: var(--danger);
}

.admin-topic-edit-materials-section__actions {
  margin-top: var(--sp-20);
  display: flex;
  justify-content: flex-start;
}

.admin-topic-edit-materials-section__edit-btn {
  margin: 0;
  padding: 10px;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    filter: brightness(0.98);
  }
}

.admin-topic-edit-materials-section__toolbar {
  margin-top: var(--sp-20);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-topic-edit-materials-section__toolbar-btn {
  margin: 0;
  padding: 10px;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    filter: brightness(0.98);
  }
}

@media (max-width: 1023px) {
  .admin-topic-edit-materials-section__heading {
    font-size: var(--size-15);
  }

  .admin-topic-edit-materials-section__name {
    font-size: var(--size-15);
  }

  .admin-topic-edit-materials-section__error {
    font-size: var(--size-15);
  }

  .admin-topic-edit-materials-section__edit-btn {
    font-size: var(--size-15);
  }

  .admin-topic-edit-materials-section__toolbar-btn {
    font-size: var(--size-15);
  }
}
</style>
