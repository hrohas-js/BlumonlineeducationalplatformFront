<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminTopicNotificationsRecipientsSection from '@/components/organisms/AdminTopicNotificationsRecipientsSection.vue'
import AdminTopicNotificationsComposeSection from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import { getProductTopicsList, resolveAdminMaterialProductTopic } from '@/utils/adminMaterialCatalog'
import {
  getMockTopicNotificationRecipients,
  getMockTopicNotificationTemplates,
  MOCK_TOPIC_NOTIFICATION_TOTAL_RECIPIENTS,
} from '@/utils/adminTopicNotifications'

const route = useRoute()
const router = useRouter()

const resolved = computed(() =>
  resolveAdminMaterialProductTopic(
    route.params.sectionId as string,
    route.params.productId as string,
    route.params.topicId as string,
  ),
)

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

watch(
  resolved,
  (r) => {
    if (!r) {
      const sectionId = route.params.sectionId as string | undefined
      const productId = route.params.productId as string | undefined
      if (sectionId && productId) {
        void router.replace({
          name: 'admin-material-product-edit',
          params: { sectionId, productId },
        })
      } else {
        void router.replace({ name: 'admin' })
      }
    }
  },
  { immediate: true },
)

const breadcrumbItems = computed(() => {
  const r = resolved.value
  if (!r) return []
  return [
    { label: `Папка «${r.section.title}»`, to: { name: 'admin' as const } },
    {
      label: `Продукт «${r.card.title}»`,
      to: {
        name: 'admin-material-product-edit' as const,
        params: { sectionId: r.section.sectionId, productId: r.card.id },
      },
      topicsMenu: {
        sectionId: r.section.sectionId,
        productId: r.card.id,
        topics: getProductTopicsList(r.card.id, r.card.edit.topics),
        activeTopicId: r.topic.id,
      },
    },
    { label: r.topic.title },
  ]
})

const onSaveAndSend = () => {
  /* до API */
}

const onSaveAsTemplate = () => {
  /* до API */
}
</script>

<template>
  <AppLayout>
    <section v-if="resolved" class="admin-material-product-topic-notifications-page">
      <div class="admin-material-product-topic-notifications-page__panel">
        <HomeProfileInfoTableItem
          class="admin-material-product-topic-notifications-page__badge"
          label="Имя админа"
          tone="#178ef0"
          is-student-name
        />

        <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

        <hr class="admin-material-product-topic-notifications-page__rule" />

        <h1 class="admin-material-product-topic-notifications-page__title">Уведомления</h1>

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
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-topic-notifications-page {
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

  &__badge {
    align-self: flex-start;
  }

  &__rule {
    width: 100%;
    margin: 0;
    border: none;
    border-top: 1px solid rgba(1, 3, 7, 0.12);
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

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
