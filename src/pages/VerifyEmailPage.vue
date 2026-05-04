<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { authService } from '@/services/api/endpoints/auth'
import { useNotification } from '@/composables/useNotification'

type Status = 'pending' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const { notify } = useNotification()

const status = ref<Status>('pending')
const errorMessage = ref<string>('')

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

onMounted(verify)
</script>

<template>
  <AppLayout>
    <div class="verify-email">
      <div class="verify-email__card">
        <template v-if="status === 'pending'">
          <h1 class="verify-email__title">Подтверждаем email…</h1>
          <p class="verify-email__text">Пожалуйста, подождите.</p>
        </template>

        <template v-else-if="status === 'success'">
          <h1 class="verify-email__title">Email подтверждён</h1>
          <p class="verify-email__text">
            Ваш email успешно подтверждён. Теперь вы можете войти в аккаунт.
          </p>
          <BaseButton
            class="verify-email__action"
            variant="primary"
            size="medium"
            text="Перейти ко входу"
            @click="goToLogin"
          />
        </template>

        <template v-else>
          <h1 class="verify-email__title">Не удалось подтвердить email</h1>
          <p class="verify-email__text">{{ errorMessage }}</p>
          <div class="verify-email__actions">
            <BaseButton
              variant="primary"
              size="medium"
              text="Попробовать снова"
              @click="retry"
            />
            <BaseButton
              variant="secondary"
              size="medium"
              text="Перейти ко входу"
              @click="goToLogin"
            />
          </div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.verify-email {
  margin-top: var(--sp-40);
  display: flex;
  justify-content: center;

  &__card {
    background: var(--white);
    border-radius: var(--radius-20);
    padding: var(--sp-40) var(--sp-60);
    width: 100%;
    max-width: var(--size-560);
    text-align: center;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-35);
    color: var(--black);
  }

  &__text {
    margin: var(--sp-20) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    color: var(--black);
  }

  &__action {
    margin-top: var(--sp-40);
  }

  &__actions {
    margin-top: var(--sp-40);
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    align-items: center;
  }
}
</style>
