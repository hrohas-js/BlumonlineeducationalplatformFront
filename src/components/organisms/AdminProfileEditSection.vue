<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminProfileFieldRow from '@/components/molecules/AdminProfileFieldRow.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'

const authStore = useAuthStore()
const router = useRouter()
const { notify } = useNotification()

const displayName = ref('')
const email = ref('')
const backupEmail = ref('')

const oldPassword = ref('')
const newPassword = ref('')
const passwordLoading = ref(false)

function syncFromUser() {
  const u = authStore.user
  if (!u) return
  displayName.value = authStore.studentNameBadgeLabel
  email.value = u.email
  backupEmail.value = ''
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
    message: result.message || 'Пароль изменён. Войдите снова.',
  })
  oldPassword.value = ''
  newPassword.value = ''
  await authStore.logout()
  void router.push({ name: 'login' })
}
</script>

<template>
  <section class="admin-profile-edit-section" aria-labelledby="admin-profile-edit-title">
    <h2 id="admin-profile-edit-title" class="admin-profile-edit-section__title">
      Редактирование профиля
    </h2>

    <div class="admin-profile-edit-section__block">
      <AdminProfileFieldRow label="Новое имя:" :model-value="displayName" />
      <AdminProfileFieldRow label="E-mail:" :model-value="email" highlighted />
      <AdminProfileFieldRow label="Резервная почта" :model-value="backupEmail" />

      <BaseButton
        class="admin-profile-edit-section__save"
        variant="outline"
        size="medium"
        text="Сохранить"
        disabled
        title="Сохранение профиля будет доступно позже"
      />
    </div>

    <h3 class="admin-profile-edit-section__subtitle">Сменить пароль</h3>

    <div class="admin-profile-edit-section__password-block">
      <div class="admin-profile-edit-section__password-row">
        <span class="admin-profile-edit-section__password-label">Старый</span>
        <div class="admin-profile-edit-section__password-field">
          <BaseInput v-model="oldPassword" type="password" placeholder="••••••••" />
        </div>
      </div>
      <div class="admin-profile-edit-section__password-row">
        <span class="admin-profile-edit-section__password-label">Новый</span>
        <div class="admin-profile-edit-section__password-field">
          <BaseInput v-model="newPassword" type="password" placeholder="••••••••" />
        </div>
      </div>

      <BaseButton
        class="admin-profile-edit-section__save"
        variant="outline"
        size="medium"
        :text="passwordLoading ? 'Сохраняем…' : 'Сохранить'"
        :disabled="passwordLoading"
        @click="onChangePassword"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-profile-edit-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-20);

  &__title,
  &__subtitle {
    margin: 0;
    width: 100%;
    max-width: 301px;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--osnovnoy-tekst);
    text-align: right;
  }

  &__block,
  &__password-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--sp-20);
    width: 100%;
  }

  &__password-block {
    gap: 23px;
  }

  &__password-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: var(--sp-20);
    width: 100%;
  }

  &__password-label {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: var(--osnovnoy-tekst);
    text-align: right;
    flex-shrink: 0;
  }

  &__password-field {
    width: 200px;
    max-width: 100%;
  }

  &__save {
    align-self: flex-end;
  }

  :deep(.admin-profile-edit-section__save.base-button) {
    border-radius: var(--radius-input);
    border-color: var(--osnovnoy-tekst);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    padding: 5px var(--sp-10);
  }

  :deep(.admin-profile-edit-section__password-field .base-input__field) {
    background-color: #f3f4f6;
    border-radius: var(--radius-input);
    border: none;
  }
}
</style>
