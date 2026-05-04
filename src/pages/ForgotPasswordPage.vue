<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseCard from '@/components/molecules/BaseCard.vue'

const router = useRouter()
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

const goToLogin = () => {
  void router.push({ name: 'login' })
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-page__content">
      <BaseCard :shadow="true" padding="medium">
        <form class="forgot-page__form" @submit.prevent="handleSubmit">
          <h1 class="forgot-page__title">Восстановление пароля</h1>

          <p class="forgot-page__hint">
            Введите email, и мы отправим ссылку для сброса пароля.
          </p>

          <BaseInput
            v-model="email"
            label="E-mail"
            type="email"
            placeholder="Введите E-mail"
            :disabled="sent"
            required
          />

          <BaseButton
            variant="primary"
            size="medium"
            :text="sent ? 'Письмо отправлено' : 'Отправить ссылку'"
            :loading="authStore.loading"
            :disabled="sent"
            :block="true"
            type="submit"
          />

          <p class="forgot-page__back">
            <a @click.prevent="goToLogin">Вернуться ко входу</a>
          </p>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  padding: var(--sp-24);

  &__content {
    width: 100%;
    max-width: var(--size-560);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
  }

  &__title {
    font-family: var(--font-family);
    font-weight: 600;
    font-size: var(--size-30);
    color: var(--black);
    margin: 0;
  }

  &__hint {
    margin: 0;
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-15);
    color: var(--black);
  }

  &__back {
    text-align: center;
    margin: 0;

    a {
      font-family: var(--font-family);
      font-weight: 600;
      color: var(--text-accent);
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
