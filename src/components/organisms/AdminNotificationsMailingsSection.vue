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
        <table class="admin-notifications-mailings-section__table">
          <colgroup>
            <col class="admin-notifications-mailings-section__col_subject" />
            <col class="admin-notifications-mailings-section__col_product" />
            <col class="admin-notifications-mailings-section__col_topic" />
            <col class="admin-notifications-mailings-section__col_sent" />
            <col class="admin-notifications-mailings-section__col_date" />
            <col class="admin-notifications-mailings-section__col_status" />
            <col class="admin-notifications-mailings-section__col_actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Заголовок письма</th>
              <th>Продукт</th>
              <th>Тема</th>
              <th>Отослано</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in mailings" :key="row.id">
              <td>{{ row.subject }}</td>
              <td>{{ row.productTitle }}</td>
              <td>{{ row.topicTitle }}</td>
              <td>{{ row.sentCount }}</td>
              <td>{{ row.sentDate }}</td>
              <td>{{ getMailingStatusLabel(row.status) }}</td>
              <td>
                <AdminNotificationMailingActions
                  @copy="onCopy(row)"
                  @delete="onDeleteRequest(row)"
                />
              </td>
            </tr>
          </tbody>
        </table>
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

.admin-notifications-mailings-section__col_subject {
  width: 20%;
}

.admin-notifications-mailings-section__col_product {
  width: 16%;
}

.admin-notifications-mailings-section__col_topic,
.admin-notifications-mailings-section__col_status {
  width: 12%;
}

.admin-notifications-mailings-section__col_sent {
  width: 11%;
}

.admin-notifications-mailings-section__col_date {
  width: 14%;
}

.admin-notifications-mailings-section__col_actions {
  width: 120px;
}

.admin-notifications-mailings-section__table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    border: 1px solid var(--osnovnoy-tekst);
    padding: var(--sp-10) var(--sp-12);
    vertical-align: middle;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-12);
    line-height: normal;
    color: var(--osnovnoy-tekst);
    text-align: center;
    overflow-wrap: break-word;
  }

  th:first-child,
  td:first-child {
    text-align: left;
  }

  th:nth-child(4),
  td:nth-child(4),
  th:nth-child(5),
  td:nth-child(5),
  th:nth-child(6),
  td:nth-child(6) {
    white-space: nowrap;
  }

  td:last-child {
    text-align: center;
  }
}

@media (max-width: 1023px) {
  .admin-notifications-mailings-section__table {
    th,
    td {
      font-size: var(--size-15);
    }
  }
}
</style>
