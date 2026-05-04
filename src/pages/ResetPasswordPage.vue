<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notify } = useNotification()

const password = ref('')
const passwordConfirm = ref('')

const token = computed<string>(() => {
  const raw = route.query.token
  if (Array.isArray(raw)) return raw[0] ?? ''
  return typeof raw === 'string' ? raw : ''
})

const handleSubmit = async () => {
  if (!token.value) {
    notify({ type: 'error', message: 'В ссылке отсутствует token' })
    return
  }

  if (password.value.length < 8 || password.value.length > 128) {
    notify({ type: 'warning', message: 'Пароль должен быть от 8 до 128 символов' })
    return
  }

  if (password.value !== passwordConfirm.value) {
    notify({ type: 'warning', message: 'Пароли не совпадают' })
    return
  }

  const result = await authStore.resetPassword(token.value, password.value)
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сбросить пароль' })
    return
  }

  notify({
    type: 'success',
    message: result.message || 'Пароль успешно изменён',
  })
  await router.push({ name: 'login' })
}
</script>

<template>
  <AppLayout>
    <section class="reset-pwd">
      <div class="reset-pwd__card">
        <h1 class="reset-pwd__title">Новый пароль</h1>

        <div class="reset-pwd__mid">
          <p v-if="!token" class="reset-pwd__hint reset-pwd__hint_error">
            В ссылке отсутствует token. Запросите новое письмо для сброса пароля.
          </p>
          <p v-else class="reset-pwd__hint">
            Введите новый пароль и повторите его, чтобы подтвердить смену.
          </p>

          <form class="reset-pwd__form" @submit.prevent="handleSubmit">
            <div class="reset-pwd__row">
              <label class="reset-pwd__label" for="reset-pwd-pass">Новый пароль</label>
              <input
                id="reset-pwd-pass"
                v-model="password"
                type="password"
                class="reset-pwd__input"
                :disabled="!token"
                required
              />
            </div>
            <div class="reset-pwd__row">
              <label class="reset-pwd__label" for="reset-pwd-pass2">Повторите пароль</label>
              <input
                id="reset-pwd-pass2"
                v-model="passwordConfirm"
                type="password"
                class="reset-pwd__input"
                :disabled="!token"
                required
              />
            </div>
          </form>
        </div>

        <button
          type="button"
          class="reset-pwd__submit"
          :disabled="authStore.loading || !token"
          @click="handleSubmit"
        >
          Сохранить
        </button>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.reset-pwd {
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

  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
  }

  &__row {
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
    min-width: 140px;

    @media (max-width: 1023px) {
      font-size: var(--size-10);
      min-width: 100px;
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
}
</style>
