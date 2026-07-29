<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminProductTopicModuleRow from '@/components/molecules/AdminProductTopicModuleRow.vue'
import AdminProductTopicMenuModal from '@/components/organisms/AdminProductTopicMenuModal.vue'
import AdminProductTopicDeadlineModal from '@/components/organisms/AdminProductTopicDeadlineModal.vue'
import AdminProductActionConfirmModal from '@/components/organisms/AdminProductActionConfirmModal.vue'
import type { AdminProductTopicMenuAction } from '@/components/organisms/AdminProductTopicMenuModal.vue'
import type { AdminMaterialProductTopicRow } from '@/utils/adminMaterialCatalog'

interface Props {
  topics: AdminMaterialProductTopicRow[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'create-topic'): void
  (e: 'topic-edit-click', topicId: string): void
  (e: 'topic-menu-action', payload: { topicId: string; action: AdminProductTopicMenuAction }): void
  (e: 'topic-deadline-save', payload: { topicId: string; accessUntil: string }): void
}

const emit = defineEmits<Emits>()

const openMenuTopicId = ref<string | null>(null)
const openDeadlineTopicId = ref<string | null>(null)
const openDeleteTopicId = ref<string | null>(null)

const menuTopic = computed(() =>
  props.topics.find((topic) => topic.id === openMenuTopicId.value) ?? null,
)

const deadlineTopic = computed(() =>
  props.topics.find((topic) => topic.id === openDeadlineTopicId.value) ?? null,
)

const isMenuOpen = computed(() => openMenuTopicId.value !== null)
const isDeadlineOpen = computed(() => openDeadlineTopicId.value !== null)
const isDeleteConfirmOpen = computed(() => openDeleteTopicId.value !== null)

const onTopicMenuClick = (topicId: string) => {
  openMenuTopicId.value = topicId
}

const closeTopicMenu = () => {
  openMenuTopicId.value = null
}

const closeDeadlineModal = () => {
  openDeadlineTopicId.value = null
}

const closeDeleteConfirm = () => {
  openDeleteTopicId.value = null
}

const onTopicMenuAction = (action: AdminProductTopicMenuAction) => {
  const topicId = openMenuTopicId.value
  if (!topicId) return

  if (action === 'deadline') {
    openDeadlineTopicId.value = topicId
    return
  }

  if (action === 'delete') {
    openDeleteTopicId.value = topicId
    return
  }

  emit('topic-menu-action', { topicId, action })
}

const onDeleteConfirm = () => {
  const topicId = openDeleteTopicId.value
  if (!topicId) return
  emit('topic-menu-action', { topicId, action: 'delete' })
  closeDeleteConfirm()
}

const onDeadlineSave = (payload: { accessUntil: string }) => {
  const topicId = openDeadlineTopicId.value
  if (!topicId) return
  emit('topic-deadline-save', { topicId, accessUntil: payload.accessUntil })
}
</script>

<template>
  <section class="admin-product-topics-section">
    <hr class="admin-product-topics-section__rule" />
    <h2 class="admin-product-topics-section__title">Все темы (модули)</h2>
    <div class="admin-product-topics-section__list">
      <AdminProductTopicModuleRow
        v-for="topic in topics"
        :key="topic.id"
        :title="topic.title"
        :access-until-label="`Срок доступа: ${topic.accessUntil}`"
        @menu-click="onTopicMenuClick(topic.id)"
        @edit-click="emit('topic-edit-click', topic.id)"
      />
    </div>
    <AdminProductTopicMenuModal
      :is-open="isMenuOpen"
      :topic-title="menuTopic?.title"
      @close="closeTopicMenu"
      @action="onTopicMenuAction"
    />
    <AdminProductTopicDeadlineModal
      :is-open="isDeadlineOpen"
      :access-until="deadlineTopic?.accessUntil ?? ''"
      :topic-title="deadlineTopic?.title"
      @close="closeDeadlineModal"
      @save="onDeadlineSave"
    />
    <AdminProductActionConfirmModal
      :is-open="isDeleteConfirmOpen"
      variant="delete-topic"
      @close="closeDeleteConfirm"
      @confirm="onDeleteConfirm"
    />
    <div class="admin-product-topics-section__cta">
      <BaseButton
        class="admin-product-topics-section__create"
        variant="outline"
        size="medium"
        text="Создать новую тему"
        @click="emit('create-topic')"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-product-topics-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-topics-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-topics-section__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--black);
  text-align: center;
}

.admin-product-topics-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  align-items: center;
}

.admin-product-topics-section__cta {
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.admin-product-topics-section__create.base-button) {
  border-radius: var(--radius-10);
  border: 2px solid #178ef0;
}

:deep(.admin-product-topics-section__create.base-button_outline:hover:not(.base-button_disabled)) {
  background-color: #178ef0;
  border-color: #178ef0;
  color: var(--white);
}

@media (max-width: 1023px) {
  .admin-product-topics-section__title {
    font-size: var(--size-15);
  }
}
</style>
