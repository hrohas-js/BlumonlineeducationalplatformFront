<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminProductEditGeneralSection from '@/components/organisms/AdminProductEditGeneralSection.vue'
import AdminProductTopicsSection from '@/components/organisms/AdminProductTopicsSection.vue'
import AdminProductPriceSection from '@/components/organisms/AdminProductPriceSection.vue'
import AdminProductExtensionSection from '@/components/organisms/AdminProductExtensionSection.vue'
import AdminProductActiveExtensionsSection from '@/components/organisms/AdminProductActiveExtensionsSection.vue'
import AdminProductOtherSettingsSection from '@/components/organisms/AdminProductOtherSettingsSection.vue'
import type { AdminProductTopicMenuAction } from '@/components/organisms/AdminProductTopicMenuModal.vue'
import type { AdminProductExtensionDurationOption } from '@/components/organisms/AdminProductExtensionSection.vue'
import type { AdminActiveExtensionCardItem } from '@/components/organisms/AdminProductActiveExtensionsSection.vue'
import type { AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminProductPricing } from '@/services/api/types'
import { formatRenewalPeriodLabel } from '@/utils/pluralizeRu'
import {
  getAdminMaterialSectionTitle,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import { useNotification } from '@/composables/useNotification'
import {
  accessDurationToRuLabel,
  isRuDeadlineFormat,
  ruDeadlineToAccessDuration,
} from '@/utils/adminDateInput'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const { notify } = useNotification()

const sectionId = computed(() => route.params.sectionId as string)
const productId = computed(() => route.params.productId as string)
const loading = ref(true)

const formTitle = ref('')
const formDescription = ref('')
const formDeadline = ref('')
const formPrice = ref('')
const coursePriceSubmitting = ref(false)
const breadcrumbProductTitle = ref('')
const folderLabel = ref('')
const topics = ref<AdminMaterialProductTopicRow[]>([])
const productPricing = ref<AdminProductPricing[]>([])
const paymentLink = ref('')
const extensionTopicId = ref<string | null>(null)
const extensionDurationId = ref<string | null>(null)
const editingPricingId = ref<string | null>(null)
const pricingSubmitting = ref(false)

const ALL_TOPICS_ID = 'all'

const PRESET_DURATION_OPTIONS: AdminProductExtensionDurationOption[] = [
  { id: '1m', label: 'Продление на 1 месяц (с момента оплаты)' },
  { id: '2m', label: 'Продление на 2 месяца (с момента оплаты)' },
  { id: '6m', label: 'Продление на 6 месяцев (с момента оплаты)' },
]

function durationIdFromMonths(months: number): string {
  if (months === 1) return '1m'
  if (months === 2) return '2m'
  if (months === 6) return '6m'
  return `${months}m`
}

function monthsFromDurationId(id: string): number | null {
  if (id === '1m') return 1
  if (id === '2m') return 2
  if (id === '6m') return 6
  const match = /^(\d+)m$/.exec(id)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

function durationLabel(months: number): string {
  return `${formatRenewalPeriodLabel(months)} (с момента оплаты)`
}

function resetExtensionForm() {
  editingPricingId.value = null
  extensionTopicId.value = null
  extensionDurationId.value = null
  paymentLink.value = ''
}

const sectionTitle = computed(() =>
  isAdminMaterialSectionId(sectionId.value)
    ? getAdminMaterialSectionTitle(sectionId.value as AdminMaterialSectionId)
    : '',
)

const productDetail = computed(() => adminStore.productDetails[productId.value] ?? null)

async function loadProduct() {
  if (!isAdminMaterialSectionId(sectionId.value)) {
    void router.replace({ name: 'admin-materials' })
    return
  }
  loading.value = true
  const result = await adminStore.fetchProductDetail(productId.value)
  loading.value = false
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Продукт не найден' })
    void router.replace({ name: 'admin-materials' })
    return
  }
  const p = result.data
  formTitle.value = p.title
  formDescription.value = p.description ?? ''
  formPrice.value = p.price ?? ''
  const hasAnyTopicDeadline = p.modules.some((m) => m.access_duration != null)
  formDeadline.value = hasAnyTopicDeadline ? '' : accessDurationToRuLabel(p.access_duration)
  breadcrumbProductTitle.value = p.title
  folderLabel.value = `Папка «${sectionTitle.value}»`
  topics.value = [...p.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({
      id: m.id,
      title: m.title,
      accessUntil: (m.access_duration ? accessDurationToRuLabel(m.access_duration) : '') || '—',
    }))
  await loadPricing()
}

async function loadPricing() {
  const result = await adminService.listProductPricing(productId.value)
  if (!result.success || !Array.isArray(result.data)) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить продления' })
    productPricing.value = []
    return
  }
  productPricing.value = result.data
}

onMounted(() => {
  void loadProduct()
})

watch(productId, () => {
  resetExtensionForm()
  void loadProduct()
})

const editingBreadcrumbLabel = computed(
  () => `Общее редактирование «${breadcrumbProductTitle.value}»`,
)

const breadcrumbItems = computed(() => [
  { label: folderLabel.value, to: { name: 'admin-materials' as const } },
  { label: editingBreadcrumbLabel.value },
])

const extensionTopicOptions = computed(() => [
  { id: ALL_TOPICS_ID, label: 'Все темы' },
  ...topics.value.map((t) => ({ id: t.id, label: t.title })),
])

const extensionDurationOptions = computed<AdminProductExtensionDurationOption[]>(() => {
  const extras: AdminProductExtensionDurationOption[] = []
  const selected = extensionDurationId.value
  if (selected && !PRESET_DURATION_OPTIONS.some((o) => o.id === selected)) {
    const months = monthsFromDurationId(selected)
    if (months) {
      extras.push({ id: selected, label: durationLabel(months) })
    }
  }
  return [...PRESET_DURATION_OPTIONS, ...extras]
})

const activeExtensionCards = computed<AdminActiveExtensionCardItem[]>(() => {
  const badge = formTitle.value.trim() || productDetail.value?.title || ''
  return productPricing.value.map((item) => ({
    id: item.id,
    topicLabel: item.module_title?.trim() || 'Все темы',
    productBadge: badge,
    extensionText: durationLabel(item.period_months),
  }))
})

function notifyPricingSideEffects(item: AdminProductPricing) {
  if (item.sync_error) {
    notify({ type: 'warning', message: item.sync_error })
  }
  if (item.price_conflicts?.length) {
    notify({ type: 'warning', message: 'Цена совпадает с другой связкой продления' })
  }
}

const onCancel = () => {
  void router.back()
}

function parseCoursePrice(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized) return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

const onSaveCoursePrice = async () => {
  if (coursePriceSubmitting.value) return
  const price = parseCoursePrice(formPrice.value)
  if (price === null) {
    notify({ type: 'warning', message: 'Укажите корректную цену' })
    return
  }

  coursePriceSubmitting.value = true
  const result = await adminStore.updateProduct(productId.value, { price })
  coursePriceSubmitting.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить цену' })
    return
  }
  if (result.data?.price != null) {
    formPrice.value = String(result.data.price)
  }
  notify({ type: 'success', message: 'Цена сохранена' })
}

const onSave = async () => {
  const hasAnyTopicDeadline = topics.value.some(
    (t) => t.accessUntil !== '—' && t.accessUntil.trim().length > 0,
  )

  let accessDuration: string | null = null
  if (!hasAnyTopicDeadline) {
    const deadlineRaw = formDeadline.value.trim()
    if (deadlineRaw && !isRuDeadlineFormat(deadlineRaw)) {
      notify({ type: 'warning', message: 'Укажите дату в формате ДД.ММ.ГГГГ' })
      return
    }
    accessDuration = ruDeadlineToAccessDuration(formDeadline.value)
    if (deadlineRaw && accessDuration === null) {
      notify({ type: 'warning', message: 'Укажите дату в формате ДД.ММ.ГГГГ' })
      return
    }
  }

  const result = await adminStore.updateProduct(productId.value, {
    title: formTitle.value.trim(),
    description: formDescription.value.trim(),
    access_duration: hasAnyTopicDeadline ? null : accessDuration,
  })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить' })
    return
  }
  await loadProduct()
  notify({ type: 'success', message: 'Продукт сохранён' })
}

const onCreateTopic = async () => {
  const title = 'Новая тема'
  const result = await adminStore.createModule(productId.value, { title, description: '' })
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось создать тему' })
    return
  }
  topics.value = [
    ...topics.value,
    { id: result.data.id, title: result.data.title, accessUntil: '—' },
  ]
}

const onExtensionCreate = async () => {
  if (pricingSubmitting.value) return

  const topicId = extensionTopicId.value
  const durationId = extensionDurationId.value
  const link = paymentLink.value.trim()

  if (!topicId) {
    notify({ type: 'warning', message: 'Выберите тему' })
    return
  }
  if (!durationId) {
    notify({ type: 'warning', message: 'Выберите срок продления' })
    return
  }
  if (!link) {
    notify({ type: 'warning', message: 'Укажите ссылку на оплату' })
    return
  }

  const periodMonths = monthsFromDurationId(durationId)
  if (!periodMonths) {
    notify({ type: 'warning', message: 'Некорректный срок продления' })
    return
  }

  pricingSubmitting.value = true

  if (editingPricingId.value) {
    const result = await adminService.updateProductPricing(productId.value, editingPricingId.value, {
      payment_link: link,
    })
    pricingSubmitting.value = false
    if (!result.success || !result.data) {
      notify({ type: 'error', message: result.error || 'Не удалось сохранить продление' })
      return
    }
    notifyPricingSideEffects(result.data)
    resetExtensionForm()
    await loadPricing()
    notify({ type: 'success', message: 'Продление сохранено' })
    return
  }

  const result = await adminService.createProductPricing(productId.value, {
    module_id: topicId === ALL_TOPICS_ID ? null : topicId,
    period_months: periodMonths,
    payment_link: link,
  })
  pricingSubmitting.value = false
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Не удалось создать продление' })
    return
  }
  notifyPricingSideEffects(result.data)
  resetExtensionForm()
  await loadPricing()
  notify({ type: 'success', message: 'Продление создано' })
}

const onActiveExtensionEdit = (id: string) => {
  const item = productPricing.value.find((p) => p.id === id)
  if (!item) return
  editingPricingId.value = item.id
  extensionTopicId.value = item.module_id ?? ALL_TOPICS_ID
  extensionDurationId.value = durationIdFromMonths(item.period_months)
  paymentLink.value = item.payment_link ?? ''
}

const onActiveExtensionPay = (id: string) => {
  const item = productPricing.value.find((p) => p.id === id)
  const link = item?.payment_link?.trim() ?? ''
  if (!link) {
    notify({ type: 'error', message: 'Ссылка на оплату недоступна' })
    return
  }
  window.open(link, '_blank', 'noopener,noreferrer')
}

const onActiveExtensionDelete = async (id: string) => {
  if (!window.confirm('Удалить это продление?')) return
  const result = await adminService.deleteProductPricing(productId.value, id)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить продление' })
    return
  }
  if (editingPricingId.value === id) {
    resetExtensionForm()
  }
  await loadPricing()
  notify({ type: 'success', message: 'Продление удалено' })
}

const onTopicEditClick = (topicId: string) => {
  void router.push({
    name: 'admin-material-product-topic-edit',
    params: {
      sectionId: sectionId.value,
      productId: productId.value,
      topicId,
    },
  })
}

const onTopicMenuAction = async ({
  topicId,
  action,
}: {
  topicId: string
  action: AdminProductTopicMenuAction
}) => {
  if (action === 'delete') {
    const result = await adminService.deleteModule(topicId)
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось удалить тему' })
      return
    }
    await loadProduct()
    notify({ type: 'success', message: 'Тема удалена' })
    return
  }

  if (action === 'copy') {
    const result = await adminService.copyModule(topicId, {
      target_product_id: productId.value,
    })
    if (!result.success || !result.data) {
      notify({ type: 'error', message: result.error || 'Не удалось скопировать тему' })
      return
    }
    await loadProduct()
    return
  }

  if (action === 'notifications') {
    void router.push({
      name: 'admin-material-product-topic-notifications',
      params: { sectionId: sectionId.value, productId: productId.value, topicId },
    })
  }
}

const onTopicDeadlineSave = async ({
  topicId,
  accessUntil,
}: {
  topicId: string
  accessUntil: string
}) => {
  const accessDuration = ruDeadlineToAccessDuration(accessUntil)
  if (!accessDuration) {
    notify({ type: 'warning', message: 'Укажите дату в формате ДД.ММ.ГГГГ' })
    return
  }

  const moduleResult = await adminStore.updateModule(topicId, productId.value, {
    access_duration: accessDuration,
  })

  if (!moduleResult.success) {
    notify({ type: 'error', message: moduleResult.error || 'Не удалось сохранить дедлайн темы' })
    return
  }

  const productResult = await adminStore.updateProduct(productId.value, {
    access_duration: null,
  })
  if (!productResult.success) {
    notify({ type: 'error', message: productResult.error || 'Не удалось сбросить общий дедлайн' })
    return
  }

  formDeadline.value = ''
  await loadProduct()
  notify({ type: 'success', message: 'Дедлайн темы сохранён' })
}

const onDeleteProduct = async () => {
  if (!window.confirm('Удалить продукт безвозвратно?')) return
  const result = await adminStore.deleteProduct(productId.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить' })
    return
  }
  notify({ type: 'success', message: 'Продукт удалён' })
  void router.push({ name: 'admin-materials' })
}

const isProductArchived = computed(
  () =>
    productDetail.value?.is_archived === true || sectionId.value === 'archive',
)

const onMoveArchive = async () => {
  const result = await adminStore.archiveProduct(productId.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось переместить в архив' })
    return
  }
  notify({ type: 'success', message: 'Продукт перемещён в архив' })
  void router.push({ name: 'admin-materials' })
}

const onUnarchive = async () => {
  const result = await adminStore.unarchiveProduct(productId.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось вернуть из архива' })
    return
  }
  notify({ type: 'success', message: 'Продукт возвращён из архива' })
  void router.push({ name: 'admin-materials' })
}

</script>

<template>
  <AppLayout>
    <section v-if="!loading && productDetail" class="admin-material-product-edit-page">
      <div class="admin-material-product-edit-page__panel">
        <AdminProductEditGeneralSection
          v-model:title="formTitle"
          v-model:description="formDescription"
          v-model:deadline="formDeadline"
          admin-badge-label="Имя админа"
          :folder-label="folderLabel"
          :editing-breadcrumb-label="editingBreadcrumbLabel"
          :breadcrumb-items="breadcrumbItems"
          @save="onSave"
          @cancel="onCancel"
        />

        <AdminProductTopicsSection
          :topics="topics"
          @create-topic="onCreateTopic"
          @topic-menu-action="onTopicMenuAction"
          @topic-deadline-save="onTopicDeadlineSave"
          @topic-edit-click="onTopicEditClick"
        />

        <AdminProductPriceSection
          v-model:price="formPrice"
          :submitting="coursePriceSubmitting"
          @save="onSaveCoursePrice"
        />

        <AdminProductExtensionSection
          :topic-options="extensionTopicOptions"
          :duration-options="extensionDurationOptions"
          :is-editing="Boolean(editingPricingId)"
          :submitting="pricingSubmitting"
          v-model:payment-link="paymentLink"
          v-model:topic-id="extensionTopicId"
          v-model:duration-id="extensionDurationId"
          @create="onExtensionCreate"
        />

        <AdminProductActiveExtensionsSection
          :items="activeExtensionCards"
          @pay-click="onActiveExtensionPay"
          @delete-click="onActiveExtensionDelete"
          @edit-click="onActiveExtensionEdit"
        />

        <AdminProductOtherSettingsSection
          :is-archived="isProductArchived"
          @move-archive="onMoveArchive"
          @unarchive="onUnarchive"
          @delete-product="onDeleteProduct"
        />
      </div>
    </section>
    <p v-else-if="loading" class="admin-material-product-edit-page__loading">Загружаем…</p>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-edit-page {
  margin-top: var(--sp-40);

  &__loading {
    margin: var(--sp-40);
    text-align: center;
  }

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
    max-width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
