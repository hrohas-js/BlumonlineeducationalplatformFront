<script setup lang="ts">
import modalCloseIcon from '@/assets/icons/modal-close.svg'

interface Emits {
  (event: 'click'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <button
    type="button"
    class="modal-close-button"
    aria-label="Закрыть окно"
    @click="emit('click')"
  >
    <img :src="modalCloseIcon" width="23" height="23" alt="" aria-hidden="true" />
  </button>
</template>

<style lang="scss" scoped>
.modal-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}
</style>
