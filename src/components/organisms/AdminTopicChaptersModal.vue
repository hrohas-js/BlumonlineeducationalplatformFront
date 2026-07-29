<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { LessonChapter } from '@/services/api/types'
import { formatChaptersToText, parseChaptersText } from '@/utils/adminTopicChapters'

interface Props {
  isOpen: boolean
  chapters: LessonChapter[]
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
})

interface Emits {
  (e: 'close'): void
  (e: 'save', chapters: LessonChapter[]): void
}

const emit = defineEmits<Emits>()

const text = ref('')
const parseError = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      text.value = formatChaptersToText(props.chapters)
      parseError.value = ''
    }
  },
)

const closeModal = () => {
  if (props.saving) return
  emit('close')
}

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const onSave = () => {
  const result = parseChaptersText(text.value)
  if (!result.ok) {
    parseError.value = result.error
    return
  }
  parseError.value = ''
  emit('save', result.chapters)
}

const onTextInput = () => {
  if (parseError.value) parseError.value = ''
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

const canSave = computed(() => !props.saving)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.isOpen"
      class="admin-topic-chapters-modal"
      @click="onOverlayClick"
    >
      <div
        class="admin-topic-chapters-modal__content"
        role="dialog"
        aria-modal="true"
        aria-label="Тайм-коды"
        @click.stop
      >
        <textarea
          v-model="text"
          class="admin-topic-chapters-modal__textarea"
          rows="18"
          spellcheck="false"
          placeholder="00:08 Введение&#10;03:05 Основная часть"
          :disabled="props.saving"
          @input="onTextInput"
        />
        <p v-if="parseError" class="admin-topic-chapters-modal__error" role="alert">
          {{ parseError }}
        </p>
        <div class="admin-topic-chapters-modal__actions">
          <BaseButton
            class="admin-topic-chapters-modal__save"
            variant="primary"
            size="medium"
            :text="props.saving ? 'Сохраняем…' : 'Сохранить'"
            :disabled="!canSave"
            @click="onSave"
          />
          <BaseButton
            class="admin-topic-chapters-modal__cancel"
            variant="outline"
            size="medium"
            text="Отмена"
            :disabled="props.saving"
            @click="closeModal"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.admin-topic-chapters-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-notification);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-20);
  box-sizing: border-box;
  background-color: rgba(1, 3, 7, 0.4);
}

.admin-topic-chapters-modal__content {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  box-sizing: border-box;
  width: 100%;
  max-width: 720px;
  max-height: min(90vh, 820px);
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
}

.admin-topic-chapters-modal__textarea {
  flex: 1 1 auto;
  width: 100%;
  min-height: 360px;
  margin: 0;
  padding: var(--sp-16);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: 15px;
  line-height: 1.45;
  color: #010307;
  resize: vertical;
  outline: none;

  &:focus-visible {
    box-shadow: var(--focus-ring-main);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.admin-topic-chapters-modal__error {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-16);
  line-height: normal;
  color: var(--danger);
}

.admin-topic-chapters-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-16);
  justify-content: flex-end;
  width: 100%;
}

:deep(.admin-topic-chapters-modal__save.base-button) {
  min-width: 120px;
  border-radius: var(--radius-10);
}

:deep(.admin-topic-chapters-modal__cancel.base-button) {
  min-width: 120px;
  border-radius: var(--radius-10);
  border-color: #010307;
  color: #010307;
}

@media (max-width: 1023px) {
  .admin-topic-chapters-modal__error {
    font-size: var(--size-15);
  }
}
</style>
