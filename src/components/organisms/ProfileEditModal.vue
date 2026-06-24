<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import ModalAvatarUpload from '@/components/molecules/ModalAvatarUpload.vue'
import ModalProfileFieldRow from '@/components/molecules/ModalProfileFieldRow.vue'
import ModalCloseButton from '@/components/atoms/ModalCloseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import type { UpdateUserRequest } from '@/services/api/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const authStore = useAuthStore()
const { notify } = useNotification()

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const about = ref('')

const forgotPasswordLoading = ref(false)
const saveLoading = ref(false)

const selectedAvatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)

const modalAvatarPreview = computed(
  () => avatarPreviewUrl.value ?? authStore.user?.avatar_url ?? null,
)

function revokeAvatarPreview() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = null
  }
  selectedAvatarFile.value = null
}

function syncFromUser() {
  const u = authStore.user
  if (!u) return
  firstName.value = u.first_name ?? ''
  lastName.value = u.last_name ?? ''
  middleName.value = u.middle_name ?? ''
  phone.value = u.phone ?? ''
  about.value = ''
}

function resetAvatarDraft() {
  revokeAvatarPreview()
}

const closeModal = () => {
  emit('close')
}

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    onCancel()
  }
}

const onCancel = () => {
  resetAvatarDraft()
  syncFromUser()
  closeModal()
}

const buildUpdatePayload = (): UpdateUserRequest => ({
  first_name: firstName.value.trim(),
  last_name: lastName.value.trim(),
  phone: phone.value.trim() || undefined,
})

const onAvatarSelect = (file: File | null) => {
  revokeAvatarPreview()
  if (!file) return
  selectedAvatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

const onSave = async () => {
  const trimmedFirstName = firstName.value.trim()
  const trimmedLastName = lastName.value.trim()

  if (!trimmedFirstName || !trimmedLastName) {
    notify({ type: 'warning', message: 'Укажите имя и фамилию' })
    return
  }

  saveLoading.value = true
  try {
    if (selectedAvatarFile.value) {
      const avatarResult = await authStore.uploadAvatar(selectedAvatarFile.value)
      if (!avatarResult.success) {
        notify({ type: 'error', message: avatarResult.error || 'Не удалось загрузить аватар' })
        return
      }
    }

    const result = await authStore.updateProfile(buildUpdatePayload())
    if (!result.success) {
      notify({ type: 'error', message: result.error || 'Не удалось сохранить профиль' })
      return
    }

    notify({ type: 'success', message: 'Профиль сохранён' })
    resetAvatarDraft()
    closeModal()
  } finally {
    saveLoading.value = false
  }
}

const onForgotPassword = async () => {
  const trimmedEmail = (authStore.user?.email ?? '').trim()
  if (!trimmedEmail) {
    notify({ type: 'warning', message: 'Email не указан в профиле' })
    return
  }

  forgotPasswordLoading.value = true
  const result = await authStore.forgotPassword(trimmedEmail)
  forgotPasswordLoading.value = false

  if (!result.success) {
    notify({ type: 'error', message: result.error || 'Не удалось отправить письмо' })
    return
  }

  notify({
    type: 'success',
    message: result.message || 'Письмо отправлено. Проверьте почту.',
  })
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen && !forgotPasswordLoading.value && !saveLoading.value) {
    onCancel()
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetAvatarDraft()
      syncFromUser()
      document.addEventListener('keydown', onEscapeKey)
    } else {
      document.removeEventListener('keydown', onEscapeKey)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onEscapeKey)
  revokeAvatarPreview()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="profile-edit-modal" @click="onOverlayClick">
      <div
        class="profile-edit-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-modal-title"
        @click.stop
      >
        <ModalCloseButton class="profile-edit-modal__close" @click="onCancel" />

        <h2 id="profile-edit-modal-title" class="profile-edit-modal__title">
          Редактирование основной информации
        </h2>

        <div class="profile-edit-modal__avatar-upload">
          <ModalAvatarUpload :preview-src="modalAvatarPreview" @select="onAvatarSelect" />
        </div>

        <div class="profile-edit-modal__form">
          <div class="profile-edit-modal__fields-main">
            <ModalProfileFieldRow v-model="firstName" label="Имя" placeholder="Введите ваше имя" />
            <ModalProfileFieldRow v-model="lastName" label="Фамилия" placeholder="Введите вашу фамилию" />
            <ModalProfileFieldRow v-model="middleName" label="Отчество" placeholder="Введите ваше отчество" />
            <ModalProfileFieldRow v-model="phone" label="Номер телефона" placeholder="Введите ваш номер телефона" />
            <ModalProfileFieldRow
              model-value=""
              label="Email"
              placeholder="Указанная при регистрации почта"
              with-checkbox
              readonly
            />
          </div>

          <div class="profile-edit-modal__fields-about">
            <ModalProfileFieldRow
              v-model="about"
              label="Обо мне"
              placeholder="Краткость - сестра таланта"
              as="textarea"
            />
          </div>

          <div class="profile-edit-modal__form-actions">
            <button
              type="button"
              class="profile-edit-modal__action-button"
              :disabled="saveLoading || forgotPasswordLoading"
              @click="onSave"
            >
              {{ saveLoading ? 'Сохраняем…' : 'Сохранить' }}
            </button>
            <button
              type="button"
              class="profile-edit-modal__action-button"
              :disabled="saveLoading"
              @click="onCancel"
            >
              Отмена
            </button>
          </div>
        </div>

        <div class="profile-edit-modal__bottom">
          <button
            type="button"
            class="profile-edit-modal__action-button"
            :disabled="forgotPasswordLoading || saveLoading"
            @click="onForgotPassword"
          >
            {{ forgotPasswordLoading ? 'Отправляем…' : 'Сменить пароль' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.profile-edit-modal {
  --profile-edit-modal-column-width: calc(140px + var(--sp-20) + var(--size-286));

  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-20);
  box-sizing: border-box;
  background-color: rgba(1, 3, 7, 0.4);
  z-index: var(--z-notification);

  &__content {
    box-sizing: border-box;
    width: fit-content;
    min-width: calc(var(--profile-edit-modal-column-width) * 2 + var(--sp-40) + var(--sp-64));
    max-width: calc(100vw - var(--sp-40));
    border: var(--border-1) solid var(--modal-border);
    background-color: var(--white);
    border-radius: var(--radius-20);
    padding: var(--sp-32);
    position: relative;

    @media (max-width: 1023px) {
      width: 100%;
      min-width: 0;
      overflow-x: hidden;
    }
  }

  &__close {
    position: absolute;
    top: var(--sp-16);
    right: var(--sp-16);
  }

  &__title {
    margin: 0 auto;
    max-width: var(--size-318);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    text-align: center;
    color: var(--text-accent);

    @media (max-width: 768px) {
      font-size: var(--size-15);
    }
  }

  &__avatar-upload {
    margin-top: var(--sp-20);
  }

  &__form {
    margin-top: var(--sp-40);
    display: grid;
    grid-template-columns: var(--profile-edit-modal-column-width) var(--profile-edit-modal-column-width);
    grid-template-areas:
      'main about'
      'actions about';
    align-items: center;
    gap: var(--sp-40) var(--sp-40);
    flex-shrink: 0;

    @media (max-width: 1023px) {
      grid-template-columns: 1fr;
      grid-template-areas:
        'main'
        'about'
        'actions';
      align-items: stretch;
      gap: var(--sp-20);
      flex-shrink: 1;
      min-width: 0;
    }
  }

  &__fields-main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    width: var(--profile-edit-modal-column-width);

    @media (max-width: 1023px) {
      width: 100%;
      min-width: 0;
    }
  }

  &__fields-about {
    grid-area: about;
    display: flex;
    width: var(--profile-edit-modal-column-width);
    align-self: center;

    @media (max-width: 1023px) {
      width: 100%;
      min-width: 0;
      align-self: stretch;
    }
  }

  &__form-actions {
    grid-area: actions;
    display: flex;
    justify-content: flex-end;
    gap: var(--sp-10);
    width: var(--profile-edit-modal-column-width);

    @media (max-width: 1023px) {
      width: 100%;
      min-width: 0;
      flex-wrap: wrap;
    }

    @media (max-width: 360px) {
      flex-wrap: wrap;
    }
  }

  &__action-button {
    border: var(--border-1) solid var(--black);
    border-radius: var(--radius-10);
    padding: var(--sp-10);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    line-height: 1;
    color: var(--black);
    background-color: var(--white);
    cursor: pointer;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: var(--size-10);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
    }
  }

  &__bottom {
    margin-top: var(--sp-40);
    display: flex;
    justify-content: flex-start;

    @media (max-width: 768px) {
      margin-top: var(--sp-20);
    }
  }
}
</style>
