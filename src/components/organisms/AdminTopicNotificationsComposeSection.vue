<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import AdminTopicNotificationsTemplateSelect from '@/components/molecules/AdminTopicNotificationsTemplateSelect.vue'
import type { AdminTopicNotificationTemplate } from '@/utils/adminTopicNotifications'

export interface AdminTopicNotificationsComposePayload {
  sendDateIso: string
  subject: string
  body: string
  templateId: string | null
}

export interface AdminTopicNotificationsComposePrefill {
  sendDateIso?: string
  subject?: string
  body?: string
  templateId?: string | null
}

interface Props {
  templates: AdminTopicNotificationTemplate[]
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
})

interface Emits {
  (e: 'save-and-send', payload: AdminTopicNotificationsComposePayload): void
  (e: 'save-as-template', payload: AdminTopicNotificationsComposePayload): void
}

const emit = defineEmits<Emits>()

const sendDateIso = ref('')
const templateId = ref<string | null>(null)
const subject = ref('')
const body = ref('')

const templatePlaceholder = computed(() =>
  props.templates.length > 0 ? 'Выберите шаблон' : 'Нет шаблонов',
)

const onTemplateSelect = (template: AdminTopicNotificationTemplate) => {
  subject.value = template.subject
  body.value = template.body
}

const buildPayload = (): AdminTopicNotificationsComposePayload => ({
  sendDateIso: sendDateIso.value,
  subject: subject.value,
  body: body.value,
  templateId: templateId.value,
})

const onSaveAndSend = () => {
  if (props.saving) return
  emit('save-and-send', buildPayload())
}

const onSaveAsTemplate = () => {
  if (props.saving) return
  emit('save-as-template', buildPayload())
}

const applyPrefill = (prefill: AdminTopicNotificationsComposePrefill) => {
  if (prefill.sendDateIso !== undefined) sendDateIso.value = prefill.sendDateIso
  if (prefill.subject !== undefined) subject.value = prefill.subject
  if (prefill.body !== undefined) body.value = prefill.body
  if (prefill.templateId !== undefined) templateId.value = prefill.templateId
}

const resetForm = () => {
  sendDateIso.value = ''
  templateId.value = null
  subject.value = ''
  body.value = ''
}

defineExpose({ applyPrefill, resetForm })
</script>

<template>
  <section class="admin-topic-notifications-compose-section">
    <div class="admin-topic-notifications-compose-section__field admin-topic-notifications-compose-section__field_date">
      <p class="admin-topic-notifications-compose-section__label">
        <span>Дата рассылки </span>
        <span class="admin-topic-notifications-compose-section__required">*</span>
      </p>
      <div class="admin-topic-notifications-compose-section__date-wrap">
        <AdminDateField
          v-model="sendDateIso"
          placeholder="мм.дд.гггг"
          fluid
          input-id="admin-topic-notifications-send-date"
        />
      </div>
    </div>

    <div class="admin-topic-notifications-compose-section__field admin-topic-notifications-compose-section__field_template">
      <p class="admin-topic-notifications-compose-section__label">Шаблон письма</p>
      <AdminTopicNotificationsTemplateSelect
        v-model="templateId"
        :templates="templates"
        :placeholder="templatePlaceholder"
        @select="onTemplateSelect"
      />
    </div>

    <div class="admin-topic-notifications-compose-section__field">
      <p class="admin-topic-notifications-compose-section__label">
        <span>Тема письма </span>
        <span class="admin-topic-notifications-compose-section__required">*</span>
      </p>
      <input
        v-model="subject"
        class="admin-topic-notifications-compose-section__input"
        type="text"
        autocomplete="off"
        :disabled="saving"
      />
    </div>

    <div class="admin-topic-notifications-compose-section__field admin-topic-notifications-compose-section__field_body">
      <p class="admin-topic-notifications-compose-section__label">
        <span>Текст письма </span>
        <span class="admin-topic-notifications-compose-section__required">*</span>
      </p>
      <textarea
        v-model="body"
        class="admin-topic-notifications-compose-section__textarea"
        rows="12"
        :disabled="saving"
      />
    </div>

    <div class="admin-topic-notifications-compose-section__actions">
      <BaseButton
        class="admin-topic-notifications-compose-section__btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Сохранить и отправить"
        :disabled="saving"
        @click="onSaveAndSend"
      />
      <BaseButton
        class="admin-topic-notifications-compose-section__btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Сохранить как шаблон"
        :disabled="saving"
        @click="onSaveAsTemplate"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-notifications-compose-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 794px;
}

.admin-topic-notifications-compose-section__field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
}

.admin-topic-notifications-compose-section__field_date {
  max-width: 200px;
}

.admin-topic-notifications-compose-section__field_template {
  max-width: 400px;
}

.admin-topic-notifications-compose-section__field_body {
  max-width: 794px;
}

.admin-topic-notifications-compose-section__label {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}

.admin-topic-notifications-compose-section__required {
  color: #f11;
}

.admin-topic-notifications-compose-section__date-wrap {
  width: 100%;
  padding: var(--sp-10) var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);

  :deep(.admin-date-field) {
    width: 100%;
    --admin-date-pad-y: 0px;
    --admin-date-pad-x: 0px;
  }

  :deep(.admin-date-field__field) {
    border: none;
    min-height: auto;
  }

  :deep(.admin-date-field__input) {
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    min-height: auto;
    padding: 0;
    text-align: left;
  }
}

.admin-topic-notifications-compose-section__input {
  width: 100%;
  height: 44px;
  margin: 0;
  padding: var(--sp-10) var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;

  &:focus {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-notifications-compose-section__textarea {
  width: 100%;
  min-height: 300px;
  margin: 0;
  padding: var(--sp-10) var(--sp-20);
  box-sizing: border-box;
  border: 1px solid #010307;
  border-radius: 5px;
  background-color: var(--white);
  resize: vertical;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;

  &:focus {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-notifications-compose-section__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  width: 100%;
  max-width: 794px;
}

:deep(.admin-topic-notifications-compose-section__btn.base-button) {
  height: auto;
  padding: var(--sp-10);
  border-color: #010307;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}

:deep(
  .admin-topic-notifications-compose-section__btn.base-button_outline:hover:not(.base-button_disabled)
) {
  background-color: var(--text-accent);
  border-color: var(--text-accent);
  color: var(--white);
  transform: none;
}

:deep(
  .admin-topic-notifications-compose-section__btn.base-button_outline:active:not(.base-button_disabled)
) {
  background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  color: var(--white);
  transform: none;
}

@media (max-width: 1023px) {
  .admin-topic-notifications-compose-section__label,
  .admin-topic-notifications-compose-section__input,
  .admin-topic-notifications-compose-section__textarea {
    font-size: var(--size-15);
  }

  .admin-topic-notifications-compose-section__date-wrap {
    :deep(.admin-date-field__input),
    :deep(.admin-date-field__format-hint) {
      font-size: var(--size-15);
    }
  }

  :deep(.admin-topic-notifications-compose-section__btn.base-button) {
    font-size: var(--size-15);
  }
}
</style>
