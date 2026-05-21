<script setup lang="ts">
import { ref } from 'vue'
import AdminNotificationMailingActions from '@/components/molecules/AdminNotificationMailingActions.vue'
import AdminInfoModal from '@/components/organisms/AdminInfoModal.vue'
import { useNotification } from '@/composables/useNotification'
import {
  ADMIN_NOTIFICATION_MAILING_STATUS_LABELS,
  type AdminNotificationMailingRow,
} from '@/utils/adminNotificationsMailings'

interface Props {
  mailings: AdminNotificationMailingRow[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:mailings', value: AdminNotificationMailingRow[]): void
}

const emit = defineEmits<Emits>()

const { notify } = useNotification()

const deleteTargetId = ref<string | null>(null)
const deleteModalOpen = ref(false)

const onCopy = (_row: AdminNotificationMailingRow) => {
  notify({ type: 'info', message: 'Копирование рассылки — до API' })
}

const onDeleteRequest = (row: AdminNotificationMailingRow) => {
  deleteTargetId.value = row.id
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  deleteTargetId.value = null
}

const onDeleteConfirm = () => {
  const id = deleteTargetId.value
  if (!id) return
  const next = props.mailings.filter((row) => row.id !== id)
  emit('update:mailings', next)
  notify({ type: 'success', message: 'Рассылка удалена (мок)' })
  closeDeleteModal()
}
</script>

<template>
  <section class="admin-notifications-mailings-section">
    <div v-if="mailings.length === 0" class="admin-notifications-mailings-section__empty">
      Рассылок пока нет
    </div>

    <template v-else>
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
            {{ ADMIN_NOTIFICATION_MAILING_STATUS_LABELS[row.status] }}
          </span>
          <span class="admin-notifications-mailings-section__cell admin-notifications-mailings-section__cell_actions">
            <AdminNotificationMailingActions
              @copy="onCopy(row)"
              @delete="onDeleteRequest(row)"
            />
          </span>
        </li>
      </ul>
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

.admin-notifications-mailings-section__head {
  display: grid;
  grid-template-columns: 112px 1fr 1fr 0.6fr 0.8fr 1fr auto;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  padding-bottom: var(--sp-10);
  border-bottom: 1px solid var(--osnovnoy-tekst);
  box-sizing: border-box;

  @media (max-width: 1023px) {
    display: none;
  }
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

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: var(--sp-10);
    padding: var(--sp-16) 0;
  }
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

  @media (max-width: 1023px) {
    &::before {
      display: block;
      font-size: var(--size-13);
      font-weight: var(--font-medium);
      color: rgba(1, 3, 7, 0.55);
      margin-bottom: var(--sp-4);
    }
  }
}

@media (max-width: 1023px) {
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(1)::before {
    content: 'Заголовок: ';
  }
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(2)::before {
    content: 'Продукт: ';
  }
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(3)::before {
    content: 'Тема: ';
  }
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(4)::before {
    content: 'Отослано: ';
  }
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(5)::before {
    content: 'Дата: ';
  }
  .admin-notifications-mailings-section__row .admin-notifications-mailings-section__cell:nth-child(6)::before {
    content: 'Статус: ';
  }
}
</style>
