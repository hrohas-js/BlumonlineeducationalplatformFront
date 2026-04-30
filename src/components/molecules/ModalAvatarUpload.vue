<script setup lang="ts">
import { ref } from 'vue'

const MAX_FILE_SIZE = 3 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFileName = ref('')
const errorMessage = ref('')

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  errorMessage.value = ''
  selectedFileName.value = ''

  if (!file) return

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'Допустимы только файлы jpg, jpeg или png.'
    input.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Размер файла не должен превышать 3 Mb.'
    input.value = ''
    return
  }

  selectedFileName.value = file.name
}
</script>

<template>
  <div class="modal-avatar-upload">
    <div class="modal-avatar-upload__head">
      <p class="modal-avatar-upload__text">
        Загрузите своё
        <br />
        изображение в формате
        <br />
        jpg, jpeg, png, размером
        <br />
        не более 3 Mb
      </p>

      <button type="button" class="modal-avatar-upload__button" aria-label="Загрузить изображение" @click="openFilePicker">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1" y="1" width="98" height="98" rx="49" fill="white" />
          <rect x="1" y="1" width="98" height="98" rx="49" stroke="black" stroke-width="2" />
          <path d="M50.3916 35V65" stroke="black" stroke-width="2" stroke-linecap="square" />
          <path d="M65 50.1304H35" stroke="black" stroke-width="2" stroke-linecap="square" />
        </svg>
      </button>
    </div>

    <input
      ref="fileInputRef"
      class="modal-avatar-upload__input"
      type="file"
      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
      @change="onFileChange"
    />

    <p v-if="selectedFileName" class="modal-avatar-upload__file-name">{{ selectedFileName }}</p>
    <p v-if="errorMessage" class="modal-avatar-upload__error">{{ errorMessage }}</p>
  </div>
</template>

<style lang="scss" scoped>
.modal-avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-40);
  }

  &__text {
    margin: 0;
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    text-align: center;
    color: var(--black);
    line-height: 1.2;
  }

  &__button {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }

  &__input {
    display: none;
  }

  &__file-name {
    margin: var(--sp-10) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-14);
    color: var(--black);
  }

  &__error {
    margin: var(--sp-10) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-14);
    color: var(--error);
  }
}
</style>
