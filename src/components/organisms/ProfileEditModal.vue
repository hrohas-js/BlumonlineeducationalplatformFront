<script setup lang="ts">
import { ref } from 'vue'
import ModalAvatarUpload from '@/components/molecules/ModalAvatarUpload.vue'
import ModalProfileFieldRow from '@/components/molecules/ModalProfileFieldRow.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const closeModal = () => emit('close')

const onOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const email = ref('')
const about = ref('')
</script>

<template>
  <Teleport to="body">
    <div v-if="props.isOpen" class="profile-edit-modal" @click="onOverlayClick">
      <div class="profile-edit-modal__content" role="dialog" aria-modal="true" aria-labelledby="profile-edit-modal-title">
        <button type="button" class="profile-edit-modal__close" aria-label="Закрыть окно" @click="closeModal">
          x
        </button>
        <h2 id="profile-edit-modal-title" class="profile-edit-modal__title">Редактирование основной информации</h2>

        <div class="profile-edit-modal__avatar-upload">
          <ModalAvatarUpload />
        </div>

        <div class="profile-edit-modal__form">
          <div class="profile-edit-modal__left-column">
            <ModalProfileFieldRow v-model="firstName" label="Имя" placeholder="Введите ваше имя" />
            <ModalProfileFieldRow v-model="lastName" label="Фамилия" placeholder="Введите вашу фамилию" />
            <ModalProfileFieldRow v-model="middleName" label="Отчество" placeholder="Введите ваше отчество" />
            <ModalProfileFieldRow v-model="phone" label="Номер телефона" placeholder="Введите ваш номер телефона" />
            <ModalProfileFieldRow
              v-model="email"
              label="Email"
              placeholder="Указанная при регистрации почта"
              with-checkbox
            />

            <button type="button" class="profile-edit-modal__password-button">Сменить пароль</button>
          </div>

          <div class="profile-edit-modal__right-column">
            <ModalProfileFieldRow v-model="about" label="Обо мне" placeholder="Краткость - сестра таланта" as="textarea" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.profile-edit-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(1, 3, 7, 0.4);
  z-index: var(--z-notification);

  &__content {
    border: var(--border-1) solid var(--modal-border);
    background-color: var(--white);
    border-radius: var(--radius-20);
    padding: var(--sp-32);
    position: relative;
    overflow: hidden;
  }

  &__close {
    position: absolute;
    top: var(--sp-16);
    right: var(--sp-16);
    width: var(--size-24);
    height: var(--size-24);
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: var(--black);
    font-size: var(--size-20);
    line-height: 1;
  }

  &__title {
    margin: 0 auto;
    max-width: var(--size-318);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    text-align: center;
    color: var(--text-accent);
  }

  &__avatar-upload {
    margin-top: var(--sp-20);
  }

  &__form {
    margin-top: var(--sp-40);
    display: flex;
    justify-content: space-between;
    gap: var(--sp-20);
  }

  &__left-column {
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
  }

  &__right-column {
    display: flex;
    align-items: center;
  }

  &__password-button {
    align-self: flex-end;
    border: var(--border-1) solid var(--black);
    border-radius: var(--radius-10);
    padding: var(--sp-10);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    color: var(--black);
    background-color: transparent;
    cursor: pointer;
  }
}
</style>
