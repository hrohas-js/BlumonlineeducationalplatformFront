<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminNotificationsTabs from '@/components/molecules/AdminNotificationsTabs.vue'
import type { AdminNotificationsTabId } from '@/components/molecules/AdminNotificationsTabs.vue'
import AdminNotificationsMailingsSection from '@/components/organisms/AdminNotificationsMailingsSection.vue'
import AdminNotificationsCreateFiltersSection from '@/components/organisms/AdminNotificationsCreateFiltersSection.vue'
import AdminTopicNotificationsRecipientsSection from '@/components/organisms/AdminTopicNotificationsRecipientsSection.vue'
import AdminTopicNotificationsComposeSection from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import type { AdminMaterialSectionId } from '@/constants/adminMaterials'
import {
  getMockNotificationMailings,
  type AdminNotificationMailingRow,
} from '@/utils/adminNotificationsMailings'
import {
  getMockTopicNotificationRecipients,
  getMockTopicNotificationTemplates,
  MOCK_TOPIC_NOTIFICATION_TOTAL_RECIPIENTS,
} from '@/utils/adminTopicNotifications'

const authStore = useAuthStore()
const { notify } = useNotification()

const activeTab = ref<AdminNotificationsTabId>('mailings')
const mailings = ref<AdminNotificationMailingRow[]>(getMockNotificationMailings())

const filterSectionId = ref<AdminMaterialSectionId | null>('projects')
const filterProductId = ref<string | null>(null)
const filterTopicId = ref<string | null>(null)

const recipients = ref(getMockTopicNotificationRecipients())
const templates = ref(getMockTopicNotificationTemplates())
const selectedById = ref<Record<string, boolean>>({})

const initSelection = () => {
  const next: Record<string, boolean> = {}
  for (const row of recipients.value) {
    next[row.id] = row.selectedByDefault
  }
  selectedById.value = next
}

initSelection()

const onSaveAndSend = () => {
  notify({ type: 'success', message: 'Рассылка сохранена и отправлена (мок)' })
}

const onSaveAsTemplate = () => {
  notify({ type: 'success', message: 'Шаблон сохранён (мок)' })
}
</script>

<template>
  <AppLayout>
    <section class="admin-notifications-page">
      <div class="admin-notifications-page__panel">
        <RouterLink :to="{ name: 'admin' }" class="admin-notifications-page__back">← Админка</RouterLink>

        <HomeProfileInfoTableItem
          class="admin-notifications-page__badge"
          :label="authStore.studentNameBadgeLabel"
          tone="#178ef0"
          is-student-name
        />

        <h1 class="admin-notifications-page__title">Уведомления</h1>

        <AdminNotificationsTabs v-model="activeTab" />

        <div v-if="activeTab === 'mailings'" class="admin-notifications-page__tab-content">
          <AdminNotificationsMailingsSection
            :mailings="mailings"
            @update:mailings="mailings = $event"
          />
        </div>

        <div v-else class="admin-notifications-page__tab-content admin-notifications-page__tab-content_create">
          <AdminNotificationsCreateFiltersSection
            :section-id="filterSectionId"
            :product-id="filterProductId"
            :topic-id="filterTopicId"
            @update:section-id="filterSectionId = $event"
            @update:product-id="filterProductId = $event"
            @update:topic-id="filterTopicId = $event"
          />

          <AdminTopicNotificationsRecipientsSection
            :recipients="recipients"
            :total-recipients="MOCK_TOPIC_NOTIFICATION_TOTAL_RECIPIENTS"
            :selected-by-id="selectedById"
            @update:selected-by-id="selectedById = $event"
          />

          <AdminTopicNotificationsComposeSection
            :templates="templates"
            @save-and-send="onSaveAndSend"
            @save-as-template="onSaveAsTemplate"
          />
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-notifications-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
    max-width: 1084px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
  }

  &__back {
    align-self: flex-start;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__badge {
    align-self: flex-start;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    line-height: normal;
    color: #010307;
    text-align: center;
  }

  &__tab-content {
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
    width: 100%;

    &_create {
      gap: var(--sp-40);
    }
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
