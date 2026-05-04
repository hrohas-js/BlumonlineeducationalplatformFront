<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseCard from '@/components/molecules/BaseCard.vue'

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
  <div class="reset-page">
    <div class="reset-page__content">
      <BaseCard :shadow="true" padding="medium">
        <form class="reset-page__form" @submit.prevent="handleSubmit">
          <h1 class="reset-page__title">Новый пароль</h1>

          <p v-if="!token" class="reset-page__error">
            В ссылке отсутствует token. Запросите новое письмо для сброса пароля.
          </p>

          <BaseInput
            v-model="password"
            label="Новый пароль"
            type="password"
            placeholder="Минимум 8 символов"
            :disabled="!token"
            required
          />

          <BaseInput
            v-model="passwordConfirm"
            label="Повторите пароль"
            type="password"
            placeholder="Повторите новый пароль"
            :disabled="!token"
            required
          />

          <BaseButton
            variant="primary"
            size="medium"
            text="Сохранить пароль"
            :loading="authStore.loading"
            :disabled="!token"
            :block="true"
            type="submit"
          />
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reset-page {
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

  &__error {
    margin: 0;
    font-family: var(--font-family);
    font-weight: 500;
    font-size: var(--size-15);
    color: var(--error);
  }
}
</style>
