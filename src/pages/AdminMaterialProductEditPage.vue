<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminProductEditGeneralSection from '@/components/organisms/AdminProductEditGeneralSection.vue'
import AdminProductTopicsSection from '@/components/organisms/AdminProductTopicsSection.vue'
import AdminProductExtensionSection from '@/components/organisms/AdminProductExtensionSection.vue'
import AdminProductActiveExtensionsSection from '@/components/organisms/AdminProductActiveExtensionsSection.vue'
import AdminProductOtherSettingsSection from '@/components/organisms/AdminProductOtherSettingsSection.vue'
import type { AdminProductTopicMenuAction } from '@/components/organisms/AdminProductTopicMenuModal.vue'
import type { AdminMaterialActiveExtensionMock, AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'
import {
  buildCopiedTopicTitle,
  cloneTopicEditContent,
  createTopicId,
  removeTopicEditContent,
  resolveAdminMaterialProduct,
  setSessionProductTopics,
} from '@/utils/adminMaterialCatalog'

const route = useRoute()
const router = useRouter()

const resolved = computed(() =>
  resolveAdminMaterialProduct(route.params.sectionId as string, route.params.productId as string),
)

const formTitle = ref('')
const formDescription = ref('')
const formDeadline = ref('')
const breadcrumbProductTitle = ref('')
const folderLabel = ref('')
const topics = ref<AdminMaterialProductTopicRow[]>([])
const activeExtensions = ref<AdminMaterialActiveExtensionMock[]>([])
const paymentLink = ref('')

watch(
  resolved,
  (r) => {
    if (!r) {
      void router.replace({ name: 'admin' })
      return
    }
    formTitle.value = r.card.title
    formDescription.value = r.card.edit.description
    formDeadline.value = r.card.deadlineSuffix
    breadcrumbProductTitle.value = r.card.title
    folderLabel.value = `Папка «${r.section.title}»`
    topics.value = [...r.card.edit.topics]
    setSessionProductTopics(r.card.id, topics.value)
    activeExtensions.value = [...r.card.edit.activeExtensions]
    paymentLink.value = ''
  },
  { immediate: true },
)

watch(
  topics,
  (list) => {
    const productId = route.params.productId as string | undefined
    if (productId) {
      setSessionProductTopics(productId, list)
    }
  },
  { deep: true },
)

const editingBreadcrumbLabel = computed(
  () => `Общее редактирование «${breadcrumbProductTitle.value}»`,
)

const breadcrumbItems = computed(() => {
  const r = resolved.value
  if (!r) return []
  return [
    { label: `Папка «${r.section.title}»`, to: { name: 'admin' as const } },
    { label: editingBreadcrumbLabel.value },
  ]
})

const extensionTopicOptions = computed(() => [
  { id: 'all', label: 'Все темы' },
  ...topics.value.map((t) => ({ id: t.id, label: t.title })),
])

const onCancel = () => {
  void router.back()
}

const onSave = () => {
  /* до API */
}

const onCreateTopic = () => {
  /* до API */
}

const onExtensionCreate = () => {
  /* до API */
}

const onExtensionSelectTopic = (_payload: { topicId: string }) => {
  /* до API */
}

const onExtensionSelectDuration = (_payload: { durationId: string }) => {
  /* до API */
}

const onActiveExtensionDelete = (id: string) => {
  activeExtensions.value = activeExtensions.value.filter((item) => item.id !== id)
}

const onTopicEditClick = (topicId: string) => {
  const sectionId = route.params.sectionId as string
  const productId = route.params.productId as string
  void router.push({
    name: 'admin-material-product-topic-edit',
    params: { sectionId, productId, topicId },
  })
}

const onTopicMenuAction = ({
  topicId,
  action,
}: {
  topicId: string
  action: AdminProductTopicMenuAction
}) => {
  const productId = route.params.productId as string

  if (action === 'delete') {
    topics.value = topics.value.filter((topic) => topic.id !== topicId)
    removeTopicEditContent(productId, topicId)
    return
  }

  if (action === 'copy') {
    const sourceIndex = topics.value.findIndex((topic) => topic.id === topicId)
    if (sourceIndex === -1) return

    const source = topics.value[sourceIndex]
    const newTopic: AdminMaterialProductTopicRow = {
      id: createTopicId(productId),
      title: buildCopiedTopicTitle(source.title),
      accessUntil: source.accessUntil,
    }

    cloneTopicEditContent(productId, source.id, source.title, newTopic.id)

    const next = [...topics.value]
    next.splice(sourceIndex + 1, 0, newTopic)
    topics.value = next
    return
  }

  if (action === 'notifications') {
    const sectionId = route.params.sectionId as string
    const productId = route.params.productId as string
    void router.push({
      name: 'admin-material-product-topic-notifications',
      params: { sectionId, productId, topicId },
    })
    return
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
</script>

<template>
  <AppLayout>
    <section v-if="resolved" class="admin-material-product-edit-page">
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

        <AdminProductOtherSettingsSection @move-archive="() => {}" @delete-product="() => {}" />
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-edit-page {
  margin-top: var(--sp-40);

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
