<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminProfileFieldRow from '@/components/molecules/AdminProfileFieldRow.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import type { UpdateUserRequest } from '@/services/api/types'

const authStore = useAuthStore()
const router = useRouter()
const { notify } = useNotification()

const displayName = ref('')
const email = ref('')
const backupEmail = ref('')

const saveLoading = ref(false)
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

function parseDisplayName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first_name: '', last_name: '' }
  if (parts.length === 1) return { first_name: parts[0], last_name: '' }
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') }
}

function buildUpdatePayload(): UpdateUserRequest {
  const { first_name, last_name } = parseDisplayName(displayName.value)
  return { first_name, last_name }
}

const onSaveProfile = async () => {
  const { first_name, last_name } = parseDisplayName(displayName.value)
  if (!first_name || !last_name) {
    notify({ type: 'warning', message: 'Укажите имя и фамилию' })
    return
  }

  saveLoading.value = true
  try {
    const result = await authStore.updateProfile(buildUpdatePayload())
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось сохранить профиль' })
      return
    }
    notify({ type: 'success', message: 'Профиль сохранён' })
    syncFromUser()
  } finally {
    saveLoading.value = false
  }
}

function getChangePasswordErrorMessage(
  error: string | undefined,
  errorCode: string | null | undefined,
): string {
  if (errorCode === 'invalid_credentials') return 'Неверный текущий пароль'
  return error || 'Не удалось сменить пароль'
}

const onChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value) {
    notify({ type: 'warning', message: 'Заполните оба поля пароля' })
    return
  }
  if (oldPassword.value === newPassword.value) {
    notify({ type: 'warning', message: 'Новый пароль должен отличаться от текущего' })
    return
  }

  passwordLoading.value = true
  const result = await authStore.changePassword(oldPassword.value, newPassword.value)
  passwordLoading.value = false
  if (!result.success) {
    notify({
      type: 'error',
      message: getChangePasswordErrorMessage(
        result.error,
        'errorCode' in result ? result.errorCode : null,
      ),
    })
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
    <header class="admin-profile-edit-section__header">
      <HomeProfileInfoTableItem
        class="admin-profile-edit-section__header-badge"
        :label="authStore.studentNameBadgeLabel"
        tone="#178ef0"
        is-student-name
      />
      <h2 id="admin-profile-edit-title" class="admin-profile-edit-section__title">
        Редактирование профиля
      </h2>
    </header>

    <div class="admin-profile-edit-section__block">
      <div class="admin-profile-edit-section__name-row">
        <span class="admin-profile-edit-section__name-label">Новое имя:</span>
        <div class="admin-profile-edit-section__name-field">
          <BaseInput v-model="displayName" placeholder="Имя Фамилия" />
        </div>
      </div>
      <AdminProfileFieldRow label="E-mail:" :model-value="email" highlighted />
      <AdminProfileFieldRow label="Резервная почта" :model-value="backupEmail" />

      <BaseButton
        class="admin-profile-edit-section__save"
        variant="outline"
        size="medium"
        :text="saveLoading ? 'Сохраняем…' : 'Сохранить'"
        :disabled="saveLoading"
        @click="onSaveProfile"
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
  width: 100%;
  align-self: stretch;

  &__header {
    display: flex;
    align-items: center;
    gap: var(--sp-20);
    width: 100%;
    align-self: stretch;
  }

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

  &__title {
    margin-left: auto;
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

  &__name-row,
  &__password-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: var(--sp-20);
    width: 100%;
  }

  &__name-label,
  &__password-label {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: var(--osnovnoy-tekst);
    text-align: right;
    flex-shrink: 0;
  }

  &__name-field,
  &__password-field {
    width: 200px;
    max-width: 100%;
  }

  &__save {
    align-self: flex-end;
  }

  :deep(.admin-profile-edit-section__save.base-button) {
    height: auto;
    border-radius: var(--radius-input);
    border-color: var(--osnovnoy-tekst);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    padding: 5px var(--sp-10);

    &:hover:not(.base-button_disabled),
    &:active:not(.base-button_disabled) {
      background-color: var(--white);
      transform: none;
    }
  }

  :deep(.admin-profile-edit-section__name-field .base-input__field),
  :deep(.admin-profile-edit-section__password-field .base-input__field) {
    background-color: #f3f4f6;
    border-radius: var(--radius-input);
    border: none;
  }

  @media (max-width: 1023px) {
    align-items: stretch;

    &__header {
      justify-content: center;
    }

    &__header-badge {
      display: none;
    }

    &__title,
    &__subtitle {
      max-width: none;
      text-align: center;
      font-size: var(--size-15);
    }

    &__title {
      margin-left: 0;
    }

    &__name-row,
    &__password-row {
      display: grid;
      grid-template-columns: minmax(72px, 38%) minmax(0, 1fr);
      gap: var(--sp-12);
      justify-content: stretch;
    }

    &__name-label,
    &__password-label {
      text-align: left;
      align-self: center;
      font-size: var(--size-15);
    }

    &__name-field,
    &__password-field {
      width: 100%;
      min-width: 0;
    }

    :deep(.admin-profile-edit-section__save.base-button) {
      font-size: var(--size-13);
    }

    :deep(.admin-profile-edit-section__name-field .base-input__field),
    :deep(.admin-profile-edit-section__password-field .base-input__field) {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    &__save {
      align-self: flex-end;
    }
  }
}
</style>
