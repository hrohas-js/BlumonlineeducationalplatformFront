<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { paymentsService } from '@/services/api/endpoints/payments'
import type { PaymentStatusResponse } from '@/services/api/types'

type Status = 'pending' | 'success' | 'error'

const route = useRoute()
const router = useRouter()

const status = ref<Status>('pending')
const data = ref<PaymentStatusResponse | null>(null)
const errorMessage = ref<string>('')

const invId = computed<number | null>(() => {
  const raw = route.query.InvId ?? route.query.invId ?? route.query.inv_id
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
})

async function load() {
  if (invId.value === null) {
    status.value = 'success'
    return
  }

  const result = await paymentsService.success(invId.value)
  if (result.success && result.data) {
    status.value = 'success'
    data.value = result.data
    return
  }

  status.value = 'error'
  errorMessage.value = result.error || 'Не удалось получить статус оплаты'
}

const goToProfile = () => {
  void router.push({ name: 'home-section', params: { section: 'profile' } })
}

const goToLearning = () => {
  void router.push({ name: 'home-section', params: { section: 'learning' } })
}

onMounted(load)
</script>

<template>
  <AppLayout>
    <section class="payment-result">
      <div class="payment-result__card">
        <h1 class="payment-result__title">
          {{
            status === 'pending'
              ? 'Проверяем оплату…'
              : status === 'error'
                ? 'Не удалось проверить оплату'
                : 'Оплата прошла успешно'
          }}
        </h1>

        <p v-if="status === 'pending'" class="payment-result__hint">
          Пожалуйста, подождите.
        </p>

        <p v-else-if="status === 'error'" class="payment-result__hint payment-result__hint_error">
          {{ errorMessage }}
        </p>

        <template v-else>
          <p class="payment-result__hint">
            Спасибо! Доступ к курсу откроется в личном кабинете в ближайшее время.
          </p>
          <dl v-if="data?.payment" class="payment-result__details">
            <div class="payment-result__row">
              <dt>Сумма</dt>
              <dd>{{ data.payment.amount }} {{ data.payment.currency }}</dd>
            </div>
            <div class="payment-result__row">
              <dt>Статус</dt>
              <dd>{{ data.payment.status }}</dd>
            </div>
            <div v-if="data.payment.paid_at" class="payment-result__row">
              <dt>Оплачено</dt>
              <dd>{{ new Date(data.payment.paid_at).toLocaleString('ru-RU') }}</dd>
            </div>
          </dl>
        </template>

        <div class="payment-result__actions">
          <button type="button" class="payment-result__primary" @click="goToLearning">
            К моим курсам
          </button>
          <button type="button" class="payment-result__secondary" @click="goToProfile">
            В профиль
          </button>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.payment-result {
  margin-top: var(--sp-40);
  display: flex;
  justify-content: center;

  &__card {
    width: 100%;
    max-width: 640px;
    background: var(--fon-bloka);
    border-radius: var(--radius-20);
    padding: var(--sp-40) var(--sp-60);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-20);

    @media (max-width: 1023px) {
      max-width: 380px;
      padding: var(--sp-40) var(--sp-20);
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--text-accent);
    text-align: center;

    @media (max-width: 1023px) {
      font-size: var(--size-20);
    }
  }

  &__hint {
    margin: 0;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-align: center;

    &_error {
      color: var(--error);
    }
  }

  &__details {
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: var(--sp-20);
    font-family: var(--second-family);
    font-size: var(--size-15);

    dt {
      color: var(--osnovnoy-tekst);
      font-weight: var(--font-medium);
      margin: 0;
    }

    dd {
      color: var(--osnovnoy-tekst);
      font-weight: var(--font-semi-bold);
      margin: 0;
    }
  }

  &__actions {
    margin-top: var(--sp-20);
    display: flex;
    flex-direction: row;
    gap: var(--size-15);
    flex-wrap: wrap;
    justify-content: center;
  }

  &__primary {
    background: var(--knopka);
    color: var(--cvet-v-knopke);
    border: none;
    border-radius: var(--radius-10);
    padding: var(--sp-10) var(--sp-32);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--knopka) 92%, black);
    }
  }

  &__secondary {
    background: transparent;
    color: var(--osnovnoy-tekst);
    border: var(--border-2) solid var(--knopka);
    border-radius: var(--radius-10);
    padding: var(--sp-10) var(--sp-32);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--knopka);
      color: var(--cvet-v-knopke);
    }
  }
}
</style>
