<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { authService } from '@/services/api/endpoints/auth'
import { useNotification } from '@/composables/useNotification'

type Status = 'pending' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const { notify } = useNotification()

const status = ref<Status>('pending')
const errorMessage = ref<string>('')
const resendEmail = ref('')
const resendLoading = ref(false)

const verify = async () => {
  const raw = route.query.token
  const token = Array.isArray(raw) ? raw[0] : raw

  if (!token || typeof token !== 'string') {
    status.value = 'error'
    errorMessage.value = 'В ссылке отсутствует token подтверждения'
    return
  }

  status.value = 'pending'
  const result = await authService.verifyEmail(token)

  if (result.success) {
    status.value = 'success'
    notify({ type: 'success', message: 'Email успешно подтверждён' })
    return
  }

  status.value = 'error'
  errorMessage.value = result.error || 'Не удалось подтвердить email'
}

const goToLogin = () => {
  void router.push({ name: 'login' })
}

const retry = () => {
  void verify()
}

const handleResend = async () => {
  const trimmed = resendEmail.value.trim()
  if (!trimmed) {
    notify({ type: 'warning', message: 'Введите email' })
    return
  }
  resendLoading.value = true
  const result = await authService.resendVerification(trimmed)
  resendLoading.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось отправить письмо' })
    return
  }
  notify({
    type: 'success',
    message: result.data?.message || 'Письмо отправлено повторно. Проверьте почту.',
  })
}

onMounted(verify)
</script>

<template>
  <AppLayout>
    <section class="verify-email">
      <div class="verify-email__card">
        <h1 class="verify-email__title">
          {{
            status === 'success'
              ? 'Email подтверждён'
              : status === 'error'
                ? 'Не удалось подтвердить'
                : 'Подтверждаем email…'
          }}
        </h1>

        <div class="verify-email__mid">
          <p v-if="status === 'pending'" class="verify-email__hint">
            Пожалуйста, подождите.
          </p>

          <p v-else-if="status === 'success'" class="verify-email__hint">
            Ваш email успешно подтверждён.<br />
            Теперь вы можете войти в аккаунт.
          </p>

          <p v-else class="verify-email__hint verify-email__hint_error">
            {{ errorMessage }}
          </p>

          <form
            v-if="status === 'error'"
            class="verify-email__row"
            @submit.prevent="handleResend"
          >
            <label class="verify-email__label" for="verify-email-resend">
              Введите ваш Email
            </label>
            <input
              id="verify-email-resend"
              v-model="resendEmail"
              type="email"
              class="verify-email__input"
            />
          </form>
        </div>

        <div class="verify-email__actions">
          <button
            v-if="status === 'success'"
            type="button"
            class="verify-email__submit"
            @click="goToLogin"
          >
            Перейти ко входу
          </button>

          <template v-else-if="status === 'error'">
            <button
              type="button"
              class="verify-email__submit"
              :disabled="resendLoading"
              @click="handleResend"
            >
              Отправить
            </button>

            <div class="verify-email__sub">
              <button type="button" class="verify-email__sub-link" @click="retry">
                Попробовать снова
              </button>
              <button type="button" class="verify-email__sub-link" @click="goToLogin">
                Перейти ко входу
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.verify-email {
  margin-top: var(--sp-40);
  display: flex;
  justify-content: center;

  &__card {
    width: 100%;
    max-width: 640px;
    background: var(--fon-bloka);
    border-radius: var(--radius-10);
    padding: var(--sp-40) 106px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-40);
    box-sizing: border-box;

    @media (max-width: 1023px) {
      max-width: 380px;
      border-radius: var(--radius-20);
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

  &__mid {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-20);
  }

  &__hint {
    margin: 0;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-align: center;
    max-width: 386px;

    &_error {
      color: var(--error);
    }

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }

  &__row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: var(--sp-20);

    @media (max-width: 1023px) {
      gap: var(--size-15);
    }
  }

  &__label {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-align: right;
    white-space: nowrap;

    @media (max-width: 1023px) {
      font-size: var(--size-10);
    }
  }

  &__input {
    flex: 1;
    background: var(--pole-vvoda);
    border: none;
    border-radius: var(--radius-input);
    padding: var(--sp-10);
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    outline: none;

    &:focus {
      box-shadow: var(--focus-ring-soft-blue);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-20);
  }

  &__submit {
    background: var(--knopka);
    color: var(--cvet-v-knopke);
    border: none;
    border-radius: var(--radius-10);
    padding: var(--sp-10) var(--sp-40);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--knopka) 92%, black);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 1023px) {
      font-size: var(--size-15);
    }
  }

  &__sub {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-10);
  }

  &__sub-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);

    &:hover {
      text-decoration: underline;
    }

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }
}
</style>
