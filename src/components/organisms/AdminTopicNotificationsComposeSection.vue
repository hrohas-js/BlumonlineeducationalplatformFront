<script setup lang="ts">
import { ref } from 'vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import AdminTopicNotificationsTemplateSelect from '@/components/molecules/AdminTopicNotificationsTemplateSelect.vue'
import type { AdminTopicNotificationTemplate } from '@/utils/adminTopicNotifications'

interface Props {
  templates: AdminTopicNotificationTemplate[]
}

defineProps<Props>()

interface Emits {
  (e: 'save-and-send'): void
  (e: 'save-as-template'): void
}

const emit = defineEmits<Emits>()

const sendDateIso = ref('')
const templateId = ref<string | null>(null)
const subject = ref('')
const body = ref('')

const onTemplateSelect = (template: AdminTopicNotificationTemplate) => {
  subject.value = template.subject
  body.value = template.body
}
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
          center
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
      />
    </div>

    <div class="admin-topic-notifications-compose-section__field admin-topic-notifications-compose-section__field_body">
      <p class="admin-topic-notifications-compose-section__label">
        <span>Текст письма </span>
        <span class="admin-topic-notifications-compose-section__required">*</span>
      </p>
      <textarea v-model="body" class="admin-topic-notifications-compose-section__textarea" rows="12" />
    </div>

    <div class="admin-topic-notifications-compose-section__actions">
      <button
        type="button"
        class="admin-topic-notifications-compose-section__btn"
        @click="emit('save-and-send')"
      >
        Сохранить и отправить
      </button>
      <button
        type="button"
        class="admin-topic-notifications-compose-section__btn"
        @click="emit('save-as-template')"
      >
        Сохранить как шаблон
      </button>
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

.admin-topic-notifications-compose-section__btn {
  margin: 0;
  padding: var(--sp-10);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    background-color: var(--text-accent);
    border-color: var(--text-accent);
    color: var(--white);
  }

  &:active {
    background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
    color: var(--white);
  }
}
</style>
