<script setup lang="ts">
import { ref } from 'vue'
import AdminNotificationMailingActions from '@/components/molecules/AdminNotificationMailingActions.vue'
import AdminInfoModal from '@/components/organisms/AdminInfoModal.vue'
import {
  getMailingStatusLabel,
  type AdminNotificationMailingRow,
} from '@/utils/adminNotificationsMailings'

interface Props {
  mailings: AdminNotificationMailingRow[]
  loading?: boolean
  deleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  deleting: false,
})

interface Emits {
  (e: 'copy', row: AdminNotificationMailingRow): void
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

const deleteTargetId = ref<string | null>(null)
const deleteModalOpen = ref(false)

const onCopy = (row: AdminNotificationMailingRow) => {
  emit('copy', row)
}

const onDeleteRequest = (row: AdminNotificationMailingRow) => {
  deleteTargetId.value = row.id
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (props.deleting) return
  deleteModalOpen.value = false
  deleteTargetId.value = null
}

const onDeleteConfirm = () => {
  const id = deleteTargetId.value
  if (!id) return
  emit('delete', id)
}

const closeDeleteModalAfterSuccess = () => {
  deleteModalOpen.value = false
  deleteTargetId.value = null
}

defineExpose({ closeDeleteModalAfterSuccess })
</script>

<template>
  <section class="admin-notifications-mailings-section">
    <div v-if="loading" class="admin-notifications-mailings-section__empty">
      Загружаем рассылки…
    </div>

    <div v-else-if="mailings.length === 0" class="admin-notifications-mailings-section__empty">
      Рассылок пока нет
    </div>

    <template v-else>
      <div class="admin-notifications-mailings-section__scroll">
        <div class="admin-notifications-mailings-section__table">
          <div class="admin-notifications-mailings-section__head" role="row">
            <span class="admin-notifications-mailings-section__col admin-notifications-mailings-section__col_subject">
              Заголовок письма
            </span>
            <span class="admin-notifications-mailings-section__col">Продукт</span>
            <span class="admin-notifications-mailings-section__col">Тема</span>
            <span class="admin-notifications-mailings-section__col">Отослано</span>
            <span class="admin-notifications-mailings-section__col">Дата</span>
            <span class="admin-notifications-mailings-section__col">Статус</span>
            <span class="admin-notifications-mailings-section__col admin-notifications-mailings-section__col_actions">
              Действия
            </span>
          </div>

          <ul class="admin-notifications-mailings-section__list" aria-label="Список рассылок">
            <li
              v-for="row in mailings"
              :key="row.id"
              class="admin-notifications-mailings-section__row"
              role="row"
            >
              <span
                class="admin-notifications-mailings-section__cell admin-notifications-mailings-section__cell_subject"
              >
                {{ row.subject }}
              </span>
              <span class="admin-notifications-mailings-section__cell">{{ row.productTitle }}</span>
              <span class="admin-notifications-mailings-section__cell">{{ row.topicTitle }}</span>
              <span class="admin-notifications-mailings-section__cell">{{ row.sentCount }}</span>
              <span class="admin-notifications-mailings-section__cell">{{ row.sentDate }}</span>
              <span class="admin-notifications-mailings-section__cell">
                {{ getMailingStatusLabel(row.status) }}
              </span>
              <span class="admin-notifications-mailings-section__cell admin-notifications-mailings-section__cell_actions">
                <AdminNotificationMailingActions
                  @copy="onCopy(row)"
                  @delete="onDeleteRequest(row)"
                />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <AdminInfoModal
      :is-open="deleteModalOpen"
      title="Удалить рассылку?"
      message="Рассылка будет удалена без возможности восстановления."
      confirm-label="Удалить"
      @close="closeDeleteModal"
      @confirm="onDeleteConfirm"
    />
  </section>
</template>

<style lang="scss" scoped>
.admin-notifications-mailings-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
}

.admin-notifications-mailings-section__empty {
  font-family: var(--font-family);
  font-size: var(--size-15);
  color: var(--osnovnoy-tekst);
  text-align: center;
  padding: var(--sp-40) 0;
}

.admin-notifications-mailings-section__scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-notifications-mailings-section__table {
  width: 100%;
  min-width: 900px;
}

.admin-notifications-mailings-section__head {
  display: grid;
  grid-template-columns: 112px 1fr 1fr 0.6fr 0.8fr 1fr auto;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  padding-bottom: var(--sp-10);
  border-bottom: 1px solid var(--osnovnoy-tekst);
  box-sizing: border-box;
}

.admin-notifications-mailings-section__col {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  text-align: left;

  &_actions {
    text-align: center;
  }
}

.admin-notifications-mailings-section__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-notifications-mailings-section__row {
  display: grid;
  grid-template-columns: 112px 1fr 1fr 0.6fr 0.8fr 1fr auto;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  padding: var(--sp-20) 0;
  border-bottom: 1px solid var(--osnovnoy-tekst);
  box-sizing: border-box;
}

.admin-notifications-mailings-section__cell {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  min-width: 0;
  word-break: break-word;

  &_subject {
    font-weight: var(--font-semi-bold);
  }

  &_actions {
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 1023px) {
  .admin-notifications-mailings-section__col,
  .admin-notifications-mailings-section__cell {
    font-size: var(--size-15);
  }
}
</style>
