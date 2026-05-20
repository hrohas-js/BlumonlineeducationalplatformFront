<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { adminService } from '@/services/api/endpoints/admin'
import type { AdminPaymentItem } from '@/services/api/types'
import { useNotification } from '@/composables/useNotification'

const { notify } = useNotification()

const payments = ref<AdminPaymentItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const filter = ref<'all' | 'successful' | 'pending'>('all')
const searchEmail = ref('')

async function load() {
  loading.value = true
  error.value = null
  let result
  if (filter.value === 'successful') {
    result = await adminService.listSuccessfulPayments({ limit: 50 })
  } else if (filter.value === 'pending') {
    result = await adminService.listPendingPayments({ limit: 50 })
  } else {
    result = await adminService.listPayments({ limit: 50 })
  }
  loading.value = false
  if (!result.success || !result.data) {
    error.value = result.error || 'Не удалось загрузить платежи'
    payments.value = []
    return
  }
  payments.value = result.data.payments
}

async function searchByEmail() {
  const email = searchEmail.value.trim()
  if (!email) {
    void load()
    return
  }
  loading.value = true
  const result = await adminService.paymentsByUserEmail(email)
  loading.value = false
  if (!result.success || !result.data) {
    notify({ type: 'error', message: result.error || 'Поиск не удался' })
    return
  }
  payments.value = result.data.payments
}

const rows = computed(() => payments.value)

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <AppLayout>
    <section class="admin-payments-page">
      <div class="admin-payments-page__panel">
        <RouterLink :to="{ name: 'admin' }" class="admin-payments-page__back">← Админка</RouterLink>
        <h1 class="admin-payments-page__title">Платежи</h1>

        <div class="admin-payments-page__toolbar">
          <select v-model="filter" class="admin-payments-page__select" @change="load">
            <option value="all">Все</option>
            <option value="successful">Успешные</option>
            <option value="pending">Ожидающие</option>
          </select>
          <input
            v-model="searchEmail"
            type="email"
            class="admin-payments-page__input"
            placeholder="Email пользователя"
          />
          <button type="button" class="admin-payments-page__btn" @click="searchByEmail">Найти</button>
          <button type="button" class="admin-payments-page__btn" @click="load">Обновить</button>
        </div>

        <div v-if="loading" class="admin-payments-page__empty">Загружаем…</div>
        <div v-else-if="error" class="admin-payments-page__empty admin-payments-page__empty_error">
          {{ error }}
        </div>
        <div v-else-if="rows.length === 0" class="admin-payments-page__empty">Платежей нет</div>

        <table v-else class="admin-payments-page__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Email</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.id">
              <td>{{ formatDate(p.created_at) }}</td>
              <td>{{ p.user_email ?? '—' }}</td>
              <td>{{ p.amount }}</td>
              <td>{{ p.status }}</td>
              <td>{{ p.payment_type ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-payments-page {
  margin-top: var(--sp-40);

  &__panel {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);
  }

  &__back {
    color: var(--text-accent);
    text-decoration: none;
    font-size: var(--size-15);

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: var(--sp-16) 0 var(--sp-24);
    font-size: var(--size-30);
    font-weight: var(--font-semi-bold);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-12);
    margin-bottom: var(--sp-24);
  }

  &__select,
  &__input {
    padding: var(--sp-8) var(--sp-12);
    border-radius: var(--radius-10);
    border: var(--border-1) solid var(--divider);
    font-family: var(--font-family);
  }

  &__btn {
    padding: var(--sp-8) var(--sp-16);
    border-radius: var(--radius-10);
    border: none;
    background: var(--text-accent);
    color: var(--white);
    cursor: pointer;
    font-family: var(--font-family);
  }

  &__empty {
    text-align: center;
    padding: var(--sp-40);

    &_error {
      color: var(--error);
    }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: var(--sp-12);
      text-align: left;
      border-bottom: var(--border-1) solid var(--divider);
      font-size: var(--size-15);
    }
  }
}
</style>
