<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'

const authStore = useAuthStore()
const { notify } = useNotification()

const email = ref('')
const sent = ref(false)

const handleSubmit = async () => {
  const trimmed = email.value.trim()
  if (!trimmed) {
    notify({ type: 'warning', message: 'Введите email' })
    return
  }

  const result = await authStore.forgotPassword(trimmed)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось отправить письмо' })
    return
  }

  sent.value = true
  notify({
    type: 'success',
    message: result.message || 'Письмо отправлено. Проверьте почту.',
  })
}

const handleResend = async () => {
  if (!email.value.trim()) {
    notify({ type: 'warning', message: 'Введите email' })
    return
  }
  await handleSubmit()
}
</script>

<template>
  <AppLayout>
    <section class="reset-pwd">
      <div class="reset-pwd__card">
        <h1 class="reset-pwd__title">Сброс пароля</h1>

        <div class="reset-pwd__mid">
          <p class="reset-pwd__hint">
            Введите email, указанный при регистрации.<br />
            Мы отправим на него данные для смены пароля.
          </p>

          <form class="reset-pwd__row" @submit.prevent="handleSubmit">
            <label class="reset-pwd__label" for="reset-pwd-email">Введите ваш Email</label>
            <input
              id="reset-pwd-email"
              v-model="email"
              type="email"
              class="reset-pwd__input"
              :disabled="sent"
              required
            />
          </form>
        </div>

        <div class="reset-pwd__actions">
          <button
            type="button"
            class="reset-pwd__submit"
            :disabled="authStore.loading"
            @click="handleSubmit"
          >
            Отправить
          </button>

          <div class="reset-pwd__resend">
            <span class="reset-pwd__resend-text">Не получили письмо?</span>
            <button
              type="button"
              class="reset-pwd__resend-link"
              :disabled="authStore.loading"
              @click="handleResend"
            >
              Отправить повторно
            </button>
          </div>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.reset-pwd {
  margin-top: var(--sp-40);
  display: flex;
  justify-content: center;
  align-items: flex-start;

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

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

  &__resend {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-10);
  }

  &__resend-text {
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }

  &__resend-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);
    text-decoration: none;

    &:hover:not(:disabled) {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }
}
</style>
