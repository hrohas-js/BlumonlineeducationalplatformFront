<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { usePaymentsStore } from '@/stores/payments'

const router = useRouter()
const paymentsStore = usePaymentsStore()

const rows = computed(() => paymentsStore.history)

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU')
}

function statusLabel(s: string): string {
  switch (s.toLowerCase()) {
    case 'paid':
    case 'success':
    case 'completed':
      return 'Оплачено'
    case 'pending':
    case 'created':
      return 'Ожидает оплаты'
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return 'Не прошёл'
    default:
      return s
  }
}

function goToProfile() {
  void router.push({ name: 'home-section', params: { section: 'profile' } })
}

onMounted(() => {
  void paymentsStore.fetchHistory()
})
</script>

<template>
  <AppLayout>
    <section class="payments">
      <header class="payments__header">
        <button type="button" class="payments__back" @click="goToProfile">
          <span aria-hidden="true">←</span> В профиль
        </button>
        <h1 class="payments__title">История платежей</h1>
      </header>

      <div class="payments__panel">
        <div v-if="paymentsStore.loading" class="payments__empty">Загружаем…</div>
        <div v-else-if="paymentsStore.error" class="payments__empty payments__empty_error">
          {{ paymentsStore.error }}
        </div>
        <div v-else-if="rows.length === 0" class="payments__empty">
          Платежей пока нет.
        </div>

        <table v-else class="payments__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Курс / описание</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Тип</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.id">
              <td>{{ formatDate(p.paid_at ?? p.created_at) }}</td>
              <td>{{ p.description }}</td>
              <td>{{ p.amount }} {{ p.currency }}</td>
              <td>
                <span
                  class="payments__status"
                  :class="{
                    'payments__status_ok':
                      ['paid', 'success', 'completed'].includes(p.status.toLowerCase()),
                    'payments__status_warn':
                      ['pending', 'created'].includes(p.status.toLowerCase()),
                    'payments__status_err':
                      ['failed', 'cancelled', 'canceled'].includes(p.status.toLowerCase()),
                  }"
                >
                  {{ statusLabel(p.status) }}
                </span>
              </td>
              <td>{{ p.payment_type }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.payments {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-32);

  &__header {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__back {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-20);
    }
  }

  &__panel {
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-32) var(--sp-40);
    overflow-x: auto;

    @media (max-width: 1023px) {
      padding: var(--sp-20);
    }
  }

  &__empty {
    text-align: center;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
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
      padding: var(--sp-12) var(--sp-16);
      text-align: left;
      font-family: var(--second-family);
      font-size: var(--size-15);
    }

    th {
      font-weight: var(--font-semi-bold);
      color: var(--osnovnoy-tekst);
      border-bottom: var(--border-1) solid var(--divider);
    }

    td {
      color: var(--osnovnoy-tekst);
      font-weight: var(--font-medium);
      border-bottom: var(--border-1) solid var(--divider);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  }

  &__status {
    display: inline-block;
    padding: var(--size-4) var(--size-10);
    border-radius: var(--radius-pill);
    font-size: var(--size-13);
    font-weight: var(--font-semi-bold);

    &_ok {
      background: var(--success-bg);
      color: var(--success);
    }

    &_warn {
      background: var(--warning-bg);
      color: var(--warning);
    }

    &_err {
      background: var(--error-bg);
      color: var(--error);
    }
  }
}
</style>
