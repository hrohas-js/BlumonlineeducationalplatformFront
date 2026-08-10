<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import { glossaryService } from '@/services/api/endpoints/glossary'

const { notify } = useNotification()

const content = ref('')
const draftContent = ref('')
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)

const isEmpty = computed(() => content.value.trim().length === 0)

const loadGlossary = async () => {
  loading.value = true
  const result = await glossaryService.getGlossary()
  loading.value = false

  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить глоссарий' })
    return
  }

  content.value = result.data.content ?? ''
}

const onEdit = () => {
  draftContent.value = content.value
  isEditing.value = true
}

const onCancel = () => {
  draftContent.value = content.value
  isEditing.value = false
}

const onSave = async () => {
  saving.value = true
  const result = await adminService.updateGlossary({ content: draftContent.value })
  saving.value = false

  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить глоссарий' })
    return
  }

  content.value = result.data.content ?? draftContent.value
  isEditing.value = false
  notify({ type: 'success', message: 'Глоссарий сохранён' })
}

onMounted(() => {
  void loadGlossary()
})
</script>

<template>
  <div class="admin-glossary-panel">
    <h1 class="admin-glossary-panel__title">Глоссарий</h1>

    <p v-if="loading" class="admin-glossary-panel__status">Загружаем…</p>

    <template v-else>
      <textarea
        v-if="isEditing"
        v-model="draftContent"
        class="admin-glossary-panel__textarea"
        rows="16"
        :disabled="saving"
        aria-label="Текст глоссария"
      />

      <p
        v-else-if="isEmpty"
        class="admin-glossary-panel__status admin-glossary-panel__status_empty"
      >
        Глоссарий пока пуст
      </p>

      <div v-else class="admin-glossary-panel__content">{{ content }}</div>

      <div class="admin-glossary-panel__actions">
        <template v-if="isEditing">
          <BaseButton
            class="admin-glossary-panel__edit"
            variant="outline"
            size="medium"
            shape="rounded"
            text="Отмена"
            :disabled="saving"
            @click="onCancel"
          />
          <BaseButton
            class="admin-glossary-panel__edit"
            variant="outline"
            size="medium"
            shape="rounded"
            :text="saving ? 'Сохраняем…' : 'Сохранить'"
            :disabled="saving"
            @click="onSave"
          />
        </template>
        <BaseButton
          v-else
          class="admin-glossary-panel__edit"
          variant="outline"
          size="medium"
          shape="rounded"
          text="Редактировать"
          :disabled="loading"
          @click="onEdit"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.admin-glossary-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-32);
  width: 100%;

  &__title {
    margin: var(--sp-24) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    line-height: normal;
    text-align: center;
    color: var(--osnovnoy-tekst);
  }

  &__status {
    margin: 0;
    width: 100%;
    max-width: 578px;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    line-height: normal;
    color: var(--black-300);
    text-align: center;

    &_empty {
      color: var(--osnovnoy-tekst);
    }
  }

  &__content {
    margin: 0;
    width: 100%;
    max-width: 578px;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    line-height: normal;
    color: var(--osnovnoy-tekst);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__textarea {
    box-sizing: border-box;
    width: 100%;
    max-width: 578px;
    min-height: 320px;
    padding: var(--sp-16);
    border: 1px solid #010307;
    border-radius: var(--radius-10);
    background-color: var(--white);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    line-height: 1.4;
    color: var(--osnovnoy-tekst);
    resize: vertical;

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--sp-16);
    margin: var(--sp-20) 0 var(--sp-40);
  }

  &__edit {
    margin: 0;
  }

  :deep(.admin-glossary-panel__edit.base-button) {
    height: auto;
    padding: var(--sp-10);
    border-color: var(--knopka);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-25);
    line-height: normal;
    color: var(--osnovnoy-tekst);
  }

  :deep(.admin-glossary-panel__edit.base-button_outline:hover:not(.base-button_disabled)) {
    background-color: rgba(23, 142, 240, 0.08);
  }

  @media (max-width: 1023px) {
    &__title {
      font-size: var(--size-15);
    }

    &__status,
    &__content,
    &__textarea {
      font-size: var(--size-15);
    }

    &__actions {
      width: 100%;
      max-width: 320px;
      flex-direction: column;
      align-items: stretch;
    }

    &__edit {
      width: 100%;
    }

    :deep(.admin-glossary-panel__edit.base-button) {
      width: 100%;
      font-size: var(--size-15);
    }
  }
}
</style>
