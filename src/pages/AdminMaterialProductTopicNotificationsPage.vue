<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminTopicNotificationsRecipientsSection from '@/components/organisms/AdminTopicNotificationsRecipientsSection.vue'
import AdminTopicNotificationsComposeSection from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import type { AdminTopicNotificationsComposePayload } from '@/components/organisms/AdminTopicNotificationsComposeSection.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useNotification } from '@/composables/useNotification'
import { adminService } from '@/services/api/endpoints/admin'
import {
  getAdminMaterialSectionTitle,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import type { AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'
import type {
  AdminTopicNotificationRecipient,
  AdminTopicNotificationTemplate,
} from '@/utils/adminTopicNotifications'
import {
  mapStudentToRecipient,
  mapTemplateToUi,
  toScheduledAtIso,
} from '@/utils/adminNotificationsMappers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const { notify } = useNotification()

const sectionId = computed(() => route.params.sectionId as string)
const productId = computed(() => route.params.productId as string)
const topicId = computed(() => route.params.topicId as string)

const loading = ref(true)
const contextReady = ref(false)
const productTitle = ref('')
const topicTitle = ref('')
const modulesForMenu = ref<AdminMaterialProductTopicRow[]>([])

const recipients = ref<AdminTopicNotificationRecipient[]>([])
const totalRecipients = ref(0)
const loadingRecipients = ref(false)
const templates = ref<AdminTopicNotificationTemplate[]>([])
const selectedById = ref<Record<string, boolean>>({})
const saving = ref(false)

const composeRef = ref<InstanceType<typeof AdminTopicNotificationsComposeSection> | null>(null)

const sectionTitle = computed(() =>
  isAdminMaterialSectionId(sectionId.value)
    ? getAdminMaterialSectionTitle(sectionId.value as AdminMaterialSectionId) ?? sectionId.value
    : sectionId.value,
)

const selectedRecipientIds = computed(() =>
  Object.entries(selectedById.value)
    .filter(([, selected]) => selected)
    .map(([id]) => id),
)

const selectedRecipientCount = computed(() => selectedRecipientIds.value.length)

const breadcrumbItems = computed(() => {
  if (!contextReady.value) return []
  return [
    {
      label: `Папка «${sectionTitle.value}»`,
      to: { name: 'admin-materials' as const },
    },
    {
      label: `Продукт «${productTitle.value}»`,
      to: {
        name: 'admin-material-product-edit' as const,
        params: { sectionId: sectionId.value, productId: productId.value },
      },
      topicsMenu: {
        sectionId: sectionId.value,
        productId: productId.value,
        topics: modulesForMenu.value,
        activeTopicId: topicId.value,
      },
    },
    { label: topicTitle.value },
  ]
})

const initSelection = () => {
  const next: Record<string, boolean> = {}
  for (const row of recipients.value) {
    next[row.id] = row.selectedByDefault
  }
  selectedById.value = next
}

function redirectToEditOrMaterials() {
  if (isAdminMaterialSectionId(sectionId.value) && productId.value) {
    void router.replace({
      name: 'admin-material-product-edit',
      params: { sectionId: sectionId.value, productId: productId.value },
    })
  } else {
    void router.replace({ name: 'admin-materials' })
  }
}

async function loadContext() {
  if (!isAdminMaterialSectionId(sectionId.value) || !productId.value || !topicId.value) {
    contextReady.value = false
    redirectToEditOrMaterials()
    return
  }

  loading.value = true
  const result = await adminStore.fetchProductDetail(productId.value)
  loading.value = false

  if (!result.success || !result.data) {
    contextReady.value = false
    notify({ type: 'error', message: result.error || 'Продукт не найден' })
    redirectToEditOrMaterials()
    return
  }

  const product = result.data
  const modules = [...product.modules].sort((a, b) => a.order_index - b.order_index)
  const module = modules.find((m) => m.id === topicId.value)

  if (!module) {
    contextReady.value = false
    notify({ type: 'error', message: 'Тема не найдена' })
    redirectToEditOrMaterials()
    return
  }

  productTitle.value = product.title
  topicTitle.value = module.title
  modulesForMenu.value = modules.map((m) => ({
    id: m.id,
    title: m.title,
    accessUntil: '—',
  }))
  contextReady.value = true
}

async function loadRecipients() {
  const id = productId.value
  if (!id) {
    recipients.value = []
    totalRecipients.value = 0
    selectedById.value = {}
    return
  }

  loadingRecipients.value = true
  const result = await adminService.listStudents(id, 0, 100)
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

async function loadTemplates() {
  const result = await adminService.listBroadcastTemplates()
  if (!result.success || !result.data) {
    templates.value = []
    notify({ type: 'error', message: result.error || 'Не удалось загрузить шаблоны' })
    return
  }
  templates.value = result.data.map(mapTemplateToUi)
}

function validateCompose(payload: AdminTopicNotificationsComposePayload): string | null {
  if (!payload.sendDateIso.trim()) return 'Укажите дату рассылки'
  if (!payload.subject.trim()) return 'Укажите тему письма'
  if (!payload.body.trim()) return 'Укажите текст письма'
  if (selectedRecipientCount.value === 0) return 'Выберите хотя бы одного получателя'
  return null
}

const onSaveAndSend = async (payload: AdminTopicNotificationsComposePayload) => {
  const error = validateCompose(payload)
  if (error) {
    notify({ type: 'error', message: error })
    return
  }

  const allRecipients = selectedRecipientCount.value === totalRecipients.value

  saving.value = true
  const result = await adminService.createBroadcast({
    subject: payload.subject.trim(),
    body: payload.body.trim(),
    product_id: productId.value,
    module_id: topicId.value,
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

async function bootstrap() {
  await loadContext()
  if (!contextReady.value) return
  await Promise.all([loadRecipients(), loadTemplates()])
}

onMounted(() => {
  void bootstrap()
})

watch([productId, topicId], () => {
  void bootstrap()
})
</script>

<template>
  <AppLayout>
    <section
      v-if="loading && !contextReady"
      class="admin-material-product-topic-notifications-page"
    >
      <div class="admin-material-product-topic-notifications-page__panel">
        <p class="admin-material-product-topic-notifications-page__status">Загружаем…</p>
      </div>
    </section>

    <section
      v-else-if="contextReady"
      class="admin-material-product-topic-notifications-page"
    >
      <div class="admin-material-product-topic-notifications-page__panel">
        <HomeProfileInfoTableItem
          class="admin-material-product-topic-notifications-page__badge"
          :label="authStore.studentNameBadgeLabel"
          tone="#178ef0"
          is-student-name
        />

        <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

        <hr class="admin-material-product-topic-notifications-page__rule" />

        <h1 class="admin-material-product-topic-notifications-page__title">Уведомления</h1>

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

  &__status {
    margin: 0;
    font-family: var(--font-family);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-align: center;
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }

    &__title {
      font-size: var(--size-15);
    }
  }
}
</style>
