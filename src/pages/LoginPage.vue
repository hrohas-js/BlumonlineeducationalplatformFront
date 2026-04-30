<script setup lang="ts">
/**
 * LoginPage — страница входа / регистрации
 * Переключение между режимами login и register через mode ref.
 */
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseCard from '@/components/molecules/BaseCard.vue'
import AgreementCheck from '@/components/molecules/AgreementCheck.vue'
import WelcomeLetter from '@/components/organisms/WelcomeLetter.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notify } = useNotification()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')

onMounted(() => {
  const q = route.query.mode
  if (q === 'register' || q === 'login') {
    mode.value = q
  }
})

watch(
  () => route.query.mode,
  (q) => {
    if (q === 'register' || q === 'login') {
      mode.value = q
    }
  }
)

const email = ref('')
const password = ref('')
const rememberMe = ref(true)

const name = ref('')
const consentData = ref(false)
const consentOffer = ref(false)

const goToRegister = () => { mode.value = 'register' }
const goToLogin    = () => { mode.value = 'login' }

const handleLogin = async () => {
  const result = await authStore.login({
    email: email.value.trim(),
    password: password.value,
  })

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось выполнить вход' })
    return
  }

  notify({ type: 'success', message: 'Вход выполнен успешно' })
  await router.push({ name: 'home-section', params: { section: 'profile' } })
}

const handleRegister = async () => {
  if (!consentData.value || !consentOffer.value) {
    notify({ type: 'warning', message: 'Подтвердите согласия перед регистрацией' })
    return
  }

  const [firstName = '', ...lastNameParts] = name.value.trim().split(/\s+/).filter(Boolean)
  const lastName = lastNameParts.join(' ')
  if (!firstName || !lastName) {
    notify({ type: 'warning', message: 'Укажите имя и фамилию (не менее двух слов через пробел)' })
    return
  }

  const result = await authStore.register({
    email: email.value.trim(),
    password: password.value,
    firstName,
    lastName,
  })

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось выполнить регистрацию' })
    return
  }

  notify({
    type: 'success',
    message: result.message || 'Регистрация завершена. Проверьте email для подтверждения.',
  })
  mode.value = 'login'
}

const handleSubmit = async () => {
  if (mode.value === 'login') {
    await handleLogin()
    return
  }

  await handleRegister()
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__content">
      <BaseCard :shadow="true" padding="medium">
        <form class="login-page__form" @submit.prevent="handleSubmit">
          <h1 class="login-page__title">
            {{ mode === 'login' ? 'Вход в аккаунт' : 'Регистрация' }}
          </h1>

          <!-- Поле Имя — только в режиме регистрации (идёт первым) -->
          <BaseInput
            v-if="mode === 'register'"
            v-model="name"
            label="Имя и фамилия"
            placeholder="Например: Иван Петров"
          />

          <BaseInput
            v-model="email"
            label="E-mail или логин"
            type="email"
            placeholder="Введите E-mail или логин"
            required
          />
          <BaseInput
            v-model="password"
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            required
          />

          <!-- Опции только в режиме входа -->
          <div v-if="mode === 'login'" class="login-page__options">
            <label class="login-page__remember">
              <input v-model="rememberMe" type="checkbox" />
              <span>Запомнить меня</span>
            </label>
            <a href="#" class="login-page__forgot">Забыли пароль?</a>
          </div>

          <BaseButton
            variant="primary"
            size="medium"
            :text="mode === 'login' ? 'Войти в аккаунт' : 'Зарегистрироваться'"
            :loading="authStore.loading"
            :block="true"
            type="submit"
          />

          <p class="login-page__register">
            <template v-if="mode === 'login'">
              Если нет аккаунта?
              <a @click.prevent="goToRegister">Зарегистрироваться</a>
            </template>
            <template v-else>
              Уже есть аккаунт?
              <a @click.prevent="goToLogin">Войти</a>
            </template>
          </p>

          <!-- Блок согласий — только в режиме регистрации -->
          <div v-if="mode === 'register'" class="login-page__agreements">
            <AgreementCheck v-model="consentData">
              Я даю согласие на обработку персональных данных в соответствии с
              <a href="#">Согласием на обработку персональных данных</a>
              и <a href="#">Политикой обработки персональных данных</a>
            </AgreementCheck>
            <AgreementCheck v-model="consentOffer">
              Я принимаю условия <a href="#">Публичной оферты</a>
            </AgreementCheck>
          </div>
        </form>
      </BaseCard>

      <WelcomeLetter class="login-page__welcome" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  padding: var(--sp-24);

  // ── Обёртка двух колонок ─────────────────────────────────────────────────
  &__content {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: var(--sp-20);
    width: 100%;
    max-width: var(--size-1100);

    @media (max-width: 48em) {
      flex-direction: column;
    }
  }

  // ── Карточка ─────────────────────────────────────────────────────────────
  .base-card {
    flex-shrink: 0;
    width: var(--size-560);

    @media (max-width: 48em) {
      width: 100%;
      max-width: var(--size-420);
      margin: 0 auto;
    }
  }

  // ── Welcome letter ────────────────────────────────────────────────────────
  &__welcome {
    flex: 1;
    min-width: 0;

    @media (max-width: 48em) {
      display: none;
    }
  }

  :deep(.base-card__body) {
    padding: var(--size-99) var(--size-49);

    @media (max-width: 48em) {
      padding: var(--sp-40) var(--sp-24);
    }
  }

  // ── Форма ─────────────────────────────────────────────────────────────────
  // Убираем общий gap — каждый блок управляет своим margin-top самостоятельно
  &__form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  // ── Заголовок ─────────────────────────────────────────────────────────────
  &__title {
    font-family: var(--font-family);
    font-weight: 600;
    font-size: var(--size-35);
    color: var(--black);
    margin: 0;
    line-height: 1.1;

    @media (max-width: 48em) {
      font-size: var(--size-30);
    }
  }

  // ── BaseInput — точечные переопределения через :deep() ────────────────────

  // Группа label + field: расстояние между ними
  :deep(.base-input) {
    gap: var(--sp-20);
  }

  // Первый BaseInput (email) — токенизированный отступ от заголовка
  :deep(.base-input:first-of-type) {
    margin-top: var(--size-43);
  }

  // Второй BaseInput (password) — такой же токенизированный отступ
  :deep(.base-input + .base-input) {
    margin-top: var(--size-43);
  }

  // Label
  :deep(.base-input__label) {
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-20);
    color: var(--black);

    @media (max-width: 48em) {
      font-size: var(--size-15);
    }
  }

  // Field
  :deep(.base-input__field) {
    background: var(--input-bg, var(--bg));
    border: none;
    border-radius: var(--radius-input);
    padding: var(--sp-20);
    box-shadow: none;
    transition: box-shadow 0.2s ease-in-out;

    &:focus {
      box-shadow: var(--focus-ring-2);
      border: none;
    }

    @media (max-width: 48em) {
      padding: var(--size-15) var(--sp-20);
    }
  }

  :deep(.base-input__field_with-toggle) {
    padding-right: var(--size-48);

    @media (max-width: 48em) {
      padding: var(--size-15) var(--size-48) var(--size-15) var(--sp-20);
    }
  }

  // Placeholder
  :deep(.base-input .base-input__field::placeholder) {
    font-family: var(--third-family);
    font-weight: 250;
    font-size: var(--size-15);
    color: var(--black);
    opacity: 1;
  }

  :deep(.base-input .base-input__field::-webkit-input-placeholder) {
    font-family: var(--third-family);
    font-weight: 250;
    font-size: var(--size-15);
    color: var(--black);
    opacity: 1;
  }

  // ── Опции: «Запомнить меня» + «Забыли пароль?» ───────────────────────────
  &__options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--sp-20);
  }

  &__remember {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-20);
    cursor: pointer;

    // Кастомный чекбокс
    input[type='checkbox'] {
      appearance: none;
      -webkit-appearance: none;
      flex-shrink: 0;
      width: var(--size-18);
      height: var(--size-18);
      border: var(--border-1) solid var(--black-300);
      border-radius: var(--radius-check);
      background-color: var(--input-bg, var(--bg));
      cursor: pointer;
      position: relative;
      transition: background-color 0.3s ease, border-color 0.3s ease;
      margin: 0;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: var(--size-5);
        height: var(--size-9);
        border: var(--border-2) solid var(--white);
        border-top: none;
        border-left: none;
        transform: translate(-50%, -60%) rotate(45deg);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:checked {
        background-color: var(--text-accent);
        border-color: var(--text-accent);

        &::after {
          opacity: 1;
        }
      }
    }

    span {
      font-family: var(--font-family);
      font-weight: 600;
      font-size: var(--size-20);
      color: var(--text-accent);
      line-height: 1;

      @media (max-width: 48em) {
        font-size: var(--size-15);
      }
    }
  }

  &__forgot {
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-20);
    color: var(--black);
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }

    @media (max-width: 48em) {
      font-size: var(--size-15);
    }
  }

  // ── Кнопка ────────────────────────────────────────────────────────────────
  :deep(.base-button_primary) {
    background-color: var(--text-accent);
    border-color: var(--text-accent);
    font-family: var(--font-family);
    font-weight: 600;
    font-size: var(--size-25);
    color: var(--white);
    border-radius: var(--radius-sm);
    height: auto;
    padding: var(--size-15) 0;
    margin-top: var(--sp-60);

    &:hover:not(.base-button_disabled) {
      background-color: color-mix(in srgb, var(--text-accent) 92%, black);
      border-color: color-mix(in srgb, var(--text-accent) 92%, black);
      transform: none;
    }

    &:active:not(.base-button_disabled) {
      background-color: color-mix(in srgb, var(--text-accent) 86%, black);
      border-color: color-mix(in srgb, var(--text-accent) 86%, black);
      transform: none;
    }
  }

  // ── Блок согласий (режим регистрации) ────────────────────────────────────
  &__agreements {
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    margin-top: var(--size-53);
  }

  // ── Нижняя строка «Если нет аккаунта?» / «Уже есть аккаунт?» ────────────
  &__register {
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-20);
    color: var(--black);
    text-align: center;
    margin: var(--sp-20) 0 0;

    a {
      font-weight: 600;
      color: var(--text-accent);
      text-decoration: none;
      margin-left: var(--sp-6);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
