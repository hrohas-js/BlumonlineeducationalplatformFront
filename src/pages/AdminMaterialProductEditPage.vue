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
const productImageInput = ref<HTMLInputElement | null>(null)

const sectionTitle = computed(() =>
  isAdminMaterialSectionId(sectionId.value)
    ? getAdminMaterialSectionTitle(sectionId.value as AdminMaterialSectionId)
    : '',
)

const productDetail = computed(() => adminStore.productDetails[productId.value] ?? null)

async function loadProduct() {
  if (!isAdminMaterialSectionId(sectionId.value)) {
    void router.replace({ name: 'admin' })
    return
  }
  loading.value = true
  const result = await adminStore.fetchProductDetail(productId.value)
  loading.value = false
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Продукт не найден' })
    void router.replace({ name: 'admin' })
    return
  }
  const p = result.data
  formTitle.value = p.title
  formDescription.value = p.description ?? ''
  formDeadline.value = ''
  breadcrumbProductTitle.value = p.title
  folderLabel.value = `Папка «${sectionTitle.value}»`
  topics.value = [...p.modules]
    .sort((a, b) => a.order_index - b.order_index)
    .map((m) => ({
      id: m.id,
      title: m.title,
      accessUntil: '—',
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
  { label: folderLabel.value, to: { name: 'admin' as const } },
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
  const result = await adminStore.updateProduct(productId.value, {
    title: formTitle.value.trim(),
    description: formDescription.value.trim(),
  })
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сохранить' })
    return
  }
  notify({ type: 'success', message: 'Продукт сохранён' })
  breadcrumbProductTitle.value = formTitle.value
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
    topics.value = topics.value.filter((topic) => topic.id !== topicId)
    await loadProduct()
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

const onTopicDeadlineSave = ({
  topicId,
  accessUntil,
}: {
  topicId: string
  accessUntil: string
}) => {
  topics.value = topics.value.map((topic) =>
    topic.id === topicId ? { ...topic, accessUntil } : topic,
  )
}

const onDeleteProduct = async () => {
  if (!window.confirm('Удалить продукт безвозвратно?')) return
  const result = await adminStore.deleteProduct(productId.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось удалить' })
    return
  }
  notify({ type: 'success', message: 'Продукт удалён' })
  void router.push({ name: 'admin' })
}

const onUploadImage = () => {
  productImageInput.value?.click()
}

const onImageSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await adminService.uploadProductImage(productId.value, file)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось загрузить изображение' })
    return
  }
  notify({ type: 'success', message: 'Изображение загружено' })
  await loadProduct()
  input.value = ''
}
</script>

<template>
  <AppLayout>
    <section v-if="!loading && productDetail" class="admin-material-product-edit-page">
      <input
        ref="productImageInput"
        type="file"
        accept="image/*"
        class="admin-material-product-edit-page__file-input"
        @change="onImageSelected"
      />
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

        <button type="button" class="admin-material-product-edit-page__upload" @click="onUploadImage">
          Загрузить обложку
        </button>

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

        <AdminProductOtherSettingsSection @move-archive="() => {}" @delete-product="onDeleteProduct" />
      </div>
    </section>
    <p v-else-if="loading" class="admin-material-product-edit-page__loading">Загружаем…</p>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-edit-page {
  margin-top: var(--sp-40);

  &__file-input {
    display: none;
  }

  &__upload {
    align-self: flex-start;
    background: none;
    border: none;
    color: var(--text-accent);
    cursor: pointer;
    font-family: var(--font-family);
    font-size: var(--size-15);

    &:hover {
      text-decoration: underline;
    }
  }

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
