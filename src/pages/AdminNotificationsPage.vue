<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminNotificationsMailingsSection from '@/components/organisms/AdminNotificationsMailingsSection.vue'
import AdminNotificationsCreateFiltersSection from '@/components/organisms/AdminNotificationsCreateFiltersSection.vue'
import AdminTopicNotificationsRecipientsSection from '@/components/organisms/AdminTopicNotificationsRecipientsSection.vue'
import AdminTopicNotificationsComposeSection from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import type { AdminTopicNotificationsComposePayload } from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminMaterialSectionId } from '@/constants/adminMaterials'
import type { AdminNotificationMailingRow } from '@/utils/adminNotificationsMailings'
import type {
  AdminTopicNotificationRecipient,
  AdminTopicNotificationTemplate,
} from '@/utils/adminTopicNotifications'
import {
  mapBroadcastToMailingRow,
  mapStudentToRecipient,
  mapTemplateToUi,
  scheduledAtToDateInput,
  toScheduledAtIso,
} from '@/utils/adminNotificationsMappers'
import { productTypeToSectionId } from '@/utils/adminProductType'

const authStore = useAuthStore()
const adminStore = useAdminStore()
const { notify } = useNotification()

const mailings = ref<AdminNotificationMailingRow[]>([])
const loadingMailings = ref(false)
const deletingMailing = ref(false)
const saving = ref(false)

const filterSectionId = ref<AdminMaterialSectionId | null>(null)
const filterProductId = ref<string | null>(null)
const filterTopicId = ref<string | null>(null)

const recipients = ref<AdminTopicNotificationRecipient[]>([])
const totalRecipients = ref(0)
const loadingRecipients = ref(false)
const templates = ref<AdminTopicNotificationTemplate[]>([])
const selectedById = ref<Record<string, boolean>>({})

const composeRef = ref<InstanceType<typeof AdminTopicNotificationsComposeSection> | null>(null)
const mailingsSectionRef = ref<InstanceType<typeof AdminNotificationsMailingsSection> | null>(null)

const selectedRecipientIds = computed(() =>
  Object.entries(selectedById.value)
    .filter(([, selected]) => selected)
    .map(([id]) => id),
)

const selectedRecipientCount = computed(() => selectedRecipientIds.value.length)

const initSelection = () => {
  const next: Record<string, boolean> = {}
  for (const row of recipients.value) {
    next[row.id] = row.selectedByDefault
  }
  selectedById.value = next
}

async function loadMailings() {
  loadingMailings.value = true
  const result = await adminService.listBroadcasts({ skip: 0, limit: 50 })
  loadingMailings.value = false
  if (!result.success || !result.data) {
    mailings.value = []
    notify({ type: 'error', message: result.error || 'Не удалось загрузить рассылки' })
    return
  }
  mailings.value = result.data.items.map(mapBroadcastToMailingRow)
}

async function loadTemplates() {
  const result = await adminService.listBroadcastTemplates()
  if (!result.success || !result.data) {
    templates.value = []
    notify({ type: 'error', message: result.error || 'Не удалось загрузить шаблоны' })
    return
  }
  templates.value = result.data.map(mapTemplateToUi)
}

/**
 * Recipients come from product students API (not topic-scoped),
 * until a dedicated recipients endpoint is available.
 * Topic filter is kept for createBroadcast.module_id context.
 */
async function loadRecipients(productId: string | null) {
  if (!productId) {
    recipients.value = []
    totalRecipients.value = 0
    selectedById.value = {}
    return
  }

  loadingRecipients.value = true
  const result = await adminService.listStudents(productId, 0, 100)
  loadingRecipients.value = false

  if (!result.success || !result.data) {
    recipients.value = []
    totalRecipients.value = 0
    selectedById.value = {}
    notify({ type: 'error', message: result.error || 'Не удалось загрузить получателей' })
    return
  }

  recipients.value = result.data.items.map(mapStudentToRecipient)
  totalRecipients.value = result.data.total ?? result.data.items.length
  initSelection()
}

watch(
  () => filterProductId.value,
  (productId) => {
    void loadRecipients(productId)
  },
)

function validateCompose(payload: AdminTopicNotificationsComposePayload): string | null {
  if (!payload.sendDateIso.trim()) return 'Укажите дату рассылки'
  if (!payload.subject.trim()) return 'Укажите тему письма'
  if (!payload.body.trim()) return 'Укажите текст письма'
  if (!filterProductId.value) return 'Выберите продукт'
  if (!filterTopicId.value) return 'Выберите тему'
  if (selectedRecipientCount.value === 0) return 'Выберите хотя бы одного получателя'
  return null
}

const onSaveAndSend = async (payload: AdminTopicNotificationsComposePayload) => {
  const error = validateCompose(payload)
  if (error) {
    notify({ type: 'error', message: error })
    return
  }

  const productId = filterProductId.value!
  const moduleId = filterTopicId.value!
  const allRecipients = selectedRecipientCount.value === totalRecipients.value

  saving.value = true
  const result = await adminService.createBroadcast({
    subject: payload.subject.trim(),
    body: payload.body.trim(),
    product_id: productId,
    module_id: moduleId,
    template_id: payload.templateId || undefined,
    scheduled_at: toScheduledAtIso(payload.sendDateIso),
    all_recipients: allRecipients,
    user_ids: allRecipients ? [] : selectedRecipientIds.value,
    send: true,
  })
  saving.value = false

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось создать рассылку' })
    return
  }

  notify({ type: 'success', message: 'Рассылка создана' })
  composeRef.value?.resetForm()
  await loadMailings()
}

const onSaveAsTemplate = async (payload: AdminTopicNotificationsComposePayload) => {
  if (!payload.subject.trim() && !payload.body.trim()) {
    notify({ type: 'error', message: 'Укажите тему или текст письма для шаблона' })
    return
  }

  const name =
    payload.subject.trim() || `Шаблон ${new Date().toLocaleDateString('ru-RU')}`

  saving.value = true
  const result = await adminService.createBroadcastTemplate({
    name,
    subject: payload.subject.trim(),
    body: payload.body.trim(),
  })
  saving.value = false

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить шаблон' })
    return
  }

  notify({ type: 'success', message: 'Шаблон сохранён' })
  await loadTemplates()
}

const onDeleteMailing = async (id: string) => {
  deletingMailing.value = true
  const result = await adminService.deleteBroadcast(id)
  deletingMailing.value = false

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить рассылку' })
    return
  }

  notify({ type: 'success', message: 'Рассылка удалена' })
  mailingsSectionRef.value?.closeDeleteModalAfterSuccess()
  await loadMailings()
}

async function resolveSectionForProduct(productId: string): Promise<AdminMaterialSectionId | null> {
  for (const [sectionId, products] of Object.entries(adminStore.productsBySection)) {
    if (products.some((p) => p.id === productId)) {
      return sectionId as AdminMaterialSectionId
    }
  }

  const detail = await adminStore.fetchProductDetail(productId)
  if (detail.success && detail.data.product_type) {
    return productTypeToSectionId(detail.data.product_type)
  }
  return null
}

const onCopyMailing = async (row: AdminNotificationMailingRow) => {
  const result = await adminService.getBroadcast(row.id)
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить рассылку' })
    return
  }

  const broadcast = result.data
  const sectionId = await resolveSectionForProduct(broadcast.product_id)
  if (sectionId) {
    filterSectionId.value = sectionId
  }
  filterProductId.value = broadcast.product_id
  filterTopicId.value = broadcast.module_id

  composeRef.value?.applyPrefill({
    sendDateIso: scheduledAtToDateInput(broadcast.scheduled_at),
    subject: broadcast.subject,
    body: broadcast.body,
    templateId: broadcast.template_id ?? null,
  })

  notify({ type: 'success', message: 'Данные рассылки скопированы в форму' })
}

onMounted(() => {
  void loadMailings()
  void loadTemplates()
})
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

        <div class="admin-notifications-page__section">
          <h2 class="admin-notifications-page__section-title">Рассылки</h2>
          <AdminNotificationsMailingsSection
            ref="mailingsSectionRef"
            :mailings="mailings"
            :loading="loadingMailings"
            :deleting="deletingMailing"
            @copy="onCopyMailing"
            @delete="onDeleteMailing"
          />
        </div>

        <hr class="admin-notifications-page__rule" />

        <div class="admin-notifications-page__section admin-notifications-page__section_create">
          <h2 class="admin-notifications-page__section-title">Создать рассылку</h2>

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
            :total-recipients="totalRecipients"
            :selected-by-id="selectedById"
            :loading="loadingRecipients"
            @update:selected-by-id="selectedById = $event"
          />

          <AdminTopicNotificationsComposeSection
            ref="composeRef"
            :templates="templates"
            :saving="saving"
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

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    width: 100%;

    &_create {
      gap: var(--sp-40);
    }
  }

  &__section-title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    line-height: normal;
    color: var(--text-accent);
    text-align: left;
  }

  &__rule {
    width: 100%;
    margin: 0;
    border: none;
    border-top: 1px solid rgba(1, 3, 7, 0.12);
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }

    &__section-title {
      text-align: center;
      width: 100%;
    }
  }
}
</style>
