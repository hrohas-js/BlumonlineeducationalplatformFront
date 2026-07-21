<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminTopicNotificationRecipientRow from '@/components/molecules/AdminTopicNotificationRecipientRow.vue'
import AdminTopicNotificationsPageSizeSelect from '@/components/molecules/AdminTopicNotificationsPageSizeSelect.vue'
import type { AdminTopicNotificationRecipient } from '@/utils/adminTopicNotifications'
import type { AdminTopicNotificationPageSize } from '@/utils/adminTopicNotifications'

interface Props {
  recipients: AdminTopicNotificationRecipient[]
  totalRecipients: number
  selectedById: Record<string, boolean>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

interface Emits {
  (e: 'update:selectedById', value: Record<string, boolean>): void
}

const emit = defineEmits<Emits>()

const sortAscending = ref(true)
const pageSize = ref<AdminTopicNotificationPageSize>(10)

const sortedRecipients = computed(() => {
  const rows = [...props.recipients]
  rows.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
    return sortAscending.value ? cmp : -cmp
  })
  return rows
})

const visibleRecipients = computed(() => sortedRecipients.value.slice(0, pageSize.value))

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
}

const setRecipientSelected = (id: string, selected: boolean) => {
  emit('update:selectedById', { ...props.selectedById, [id]: selected })
}

const selectAllVisible = () => {
  const next = { ...props.selectedById }
  for (const row of visibleRecipients.value) {
    next[row.id] = true
  }
  emit('update:selectedById', next)
}
</script>

<template>
  <section class="admin-topic-notifications-recipients-section">
    <p class="admin-topic-notifications-recipients-section__total">
      Всего получателей: {{ totalRecipients }}
    </p>

    <p v-if="loading" class="admin-topic-notifications-recipients-section__status">
      Загружаем получателей…
    </p>

    <p
      v-else-if="recipients.length === 0"
      class="admin-topic-notifications-recipients-section__status"
    >
      Нет получателей для выбранного продукта
    </p>

    <div v-else class="admin-topic-notifications-recipients-section__main">
      <button
        type="button"
        class="admin-topic-notifications-recipients-section__select-all"
        @click="selectAllVisible"
      >
        Выбрать всех
      </button>

      <div class="admin-topic-notifications-recipients-section__table">
        <div class="admin-topic-notifications-recipients-section__table-head">
          <button
            type="button"
            class="admin-topic-notifications-recipients-section__sort"
            @click="toggleSort"
          >
            Пользователь
          </button>
          <span class="admin-topic-notifications-recipients-section__contacts-col">Контакты</span>
        </div>

        <ul class="admin-topic-notifications-recipients-section__list" aria-label="Получатели рассылки">
          <li v-for="row in visibleRecipients" :key="row.id">
            <AdminTopicNotificationRecipientRow
              :recipient-id="row.id"
              :name="row.name"
              :email="row.email"
              :selected="selectedById[row.id] === true"
              @update:selected="setRecipientSelected(row.id, $event)"
            />
          </li>
        </ul>

        <div class="admin-topic-notifications-recipients-section__pagination">
          <span class="admin-topic-notifications-recipients-section__pagination-label">Показывать:</span>
          <AdminTopicNotificationsPageSizeSelect v-model="pageSize" />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-notifications-recipients-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
  box-sizing: border-box;
}

.admin-topic-notifications-recipients-section__total {
  margin: 0;
  width: 100%;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  text-align: left;
}

.admin-topic-notifications-recipients-section__status {
  margin: 0;
  width: 100%;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  text-align: left;
}

.admin-topic-notifications-recipients-section__main {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--sp-20);
  width: 100%;
  max-width: 583px;
}

@media (min-width: 1024px) {
  .admin-topic-notifications-recipients-section__main {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--sp-40);
    max-width: none;
    width: 100%;
  }
}

.admin-topic-notifications-recipients-section__select-all {
  flex-shrink: 0;
  align-self: flex-start;
  margin: 0;
  padding: var(--sp-10);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  @media (min-width: 1024px) {
    align-self: flex-start;
    margin-top: calc(var(--size-20) + var(--sp-20));
  }
}

.admin-topic-notifications-recipients-section__table {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--sp-20);
  min-width: 0;
  width: 100%;
  max-width: 583px;
}

.admin-topic-notifications-recipients-section__table-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  padding-left: 46px;
  box-sizing: border-box;
}

.admin-topic-notifications-recipients-section__sort {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-topic-notifications-recipients-section__contacts-col {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  text-align: right;
}

.admin-topic-notifications-recipients-section__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-topic-notifications-recipients-section__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  width: 100%;
  box-sizing: border-box;
}

.admin-topic-notifications-recipients-section__pagination-label {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}

@media (max-width: 1023px) {
  .admin-topic-notifications-recipients-section__total,
  .admin-topic-notifications-recipients-section__select-all,
  .admin-topic-notifications-recipients-section__sort,
  .admin-topic-notifications-recipients-section__contacts-col,
  .admin-topic-notifications-recipients-section__pagination-label {
    font-size: var(--size-15);
  }
}
</style>
