<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileFieldRow from '@/components/molecules/ProfileFieldRow.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'

const authStore = useAuthStore()
const { notify } = useNotification()

const email = ref('')
const phone = ref('')
const about = ref('')

const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const passwordLoading = ref(false)

function syncFromUser() {
  const u = authStore.user
  if (!u) return
  email.value = u.email
  phone.value = u.phone ?? ''
}

watch(() => authStore.user, syncFromUser, { immediate: true })

const onChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value) {
    notify({ type: 'warning', message: 'Заполните оба поля пароля' })
    return
  }
  passwordLoading.value = true
  const result = await authStore.changePassword(oldPassword.value, newPassword.value)
  passwordLoading.value = false
  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось сменить пароль' })
    return
  }
  notify({
    type: 'success',
    message: result.message || 'Пароль изменён. Войдите снова на всех устройствах.',
  })
  oldPassword.value = ''
  newPassword.value = ''
  showChangePassword.value = false
  await authStore.logout()
}

const onLogoutAll = async () => {
  if (!window.confirm('Завершить все сессии на всех устройствах?')) return
  await authStore.logoutAll()
  notify({ type: 'success', message: 'Вы вышли на всех устройствах' })
}
</script>

<template>
  <section class="profile-details-form" aria-label="Контактные данные профиля">
    <ProfileFieldRow v-model="email" label="Email" placeholder="Указанная почта" with-checkbox />
    <ProfileFieldRow v-model="phone" label="Телефон" placeholder="Номер телефона" />
    <ProfileFieldRow v-model="about" label="Обо мне" placeholder="Обо мне" as="textarea" />

    <p v-if="authStore.user && !authStore.user.email_verified" class="profile-details-form__hint">
      Email не подтверждён.
      <RouterLink :to="{ name: 'verify-email' }">Подтвердить</RouterLink>
    </p>

    <div class="profile-details-form__actions">
      <BaseButton
        variant="outline"
        size="small"
        :text="showChangePassword ? 'Скрыть смену пароля' : 'Сменить пароль'"
        @click="showChangePassword = !showChangePassword"
      />
      <BaseButton variant="outline" size="small" text="Выйти везде" @click="onLogoutAll" />
    </div>

    <div v-if="showChangePassword" class="profile-details-form__password">
      <label class="profile-details-form__pw-label">
        Текущий пароль
        <BaseInput v-model="oldPassword" type="password" placeholder="••••••••" />
      </label>
      <label class="profile-details-form__pw-label">
        Новый пароль
        <BaseInput v-model="newPassword" type="password" placeholder="••••••••" />
      </label>
      <BaseButton
        variant="primary"
        size="small"
        :text="passwordLoading ? 'Сохраняем…' : 'Сохранить пароль'"
        :disabled="passwordLoading"
        @click="onChangePassword"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.profile-details-form {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__hint {
    font-family: var(--font-family);
    font-size: var(--size-15);
    color: var(--warning);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-12);
  }

  &__password {
    display: flex;
    flex-direction: column;
    gap: var(--sp-16);
    padding-top: var(--sp-12);
  }

  &__pw-label {
    display: flex;
    flex-direction: column;
    gap: var(--sp-8);
    font-family: var(--font-family);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
  }
}
</style>
