<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminProductEditGeneralSection from '@/components/organisms/AdminProductEditGeneralSection.vue'
import AdminProductTopicsSection from '@/components/organisms/AdminProductTopicsSection.vue'
import AdminProductExtensionSection from '@/components/organisms/AdminProductExtensionSection.vue'
import AdminProductActiveExtensionsSection from '@/components/organisms/AdminProductActiveExtensionsSection.vue'
import AdminProductOtherSettingsSection from '@/components/organisms/AdminProductOtherSettingsSection.vue'
import type { AdminProductTopicMenuAction } from '@/components/organisms/AdminProductTopicMenuModal.vue'
import type { AdminMaterialActiveExtensionMock, AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/api/endpoints/admin'
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
const breadcrumbProductTitle = ref('')
const folderLabel = ref('')
const topics = ref<AdminMaterialProductTopicRow[]>([])
const activeExtensions = ref<AdminMaterialActiveExtensionMock[]>([])
const paymentLink = ref('')

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
  activeExtensions.value = []
}

onMounted(() => {
  void loadProduct()
})

watch(productId, () => {
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
  { id: 'all', label: 'Все темы' },
  ...topics.value.map((t) => ({ id: t.id, label: t.title })),
])

const onCancel = () => {
  void router.back()
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

const onExtensionCreate = () => {
  notify({ type: 'info', message: 'Продления настраиваются через оплату на стороне Robokassa' })
}

const onExtensionSelectTopic = (_payload: { topicId: string }) => {}
const onExtensionSelectDuration = (_payload: { durationId: string }) => {}

const onActiveExtensionDelete = (id: string) => {
  activeExtensions.value = activeExtensions.value.filter((item) => item.id !== id)
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

        <AdminProductExtensionSection
          :topic-options="extensionTopicOptions"
          v-model:payment-link="paymentLink"
          @select-topic="onExtensionSelectTopic"
          @select-duration="onExtensionSelectDuration"
          @create="onExtensionCreate"
        />

        <AdminProductActiveExtensionsSection
          :items="activeExtensions"
          @pay-click="() => {}"
          @delete-click="onActiveExtensionDelete"
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
