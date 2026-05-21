<script setup lang="ts">
interface Emits {
  (e: 'copy'): void
  (e: 'delete'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="admin-notification-mailing-actions">
    <button
      type="button"
      class="admin-notification-mailing-actions__btn"
      aria-label="Скопировать рассылку"
      @click="emit('copy')"
    >
      <img
        src="@/assets/icons/admin-notification-copy.svg"
        alt=""
        width="24"
        height="24"
        class="admin-notification-mailing-actions__icon"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      class="admin-notification-mailing-actions__btn"
      aria-label="Удалить рассылку"
      @click="emit('delete')"
    >
      <img
        src="@/assets/icons/admin-notification-delete.svg"
        alt=""
        width="24"
        height="24"
        class="admin-notification-mailing-actions__icon"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.admin-notification-mailing-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-10);
}

.admin-notification-mailing-actions__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: var(--sp-6);
  border: 1px solid var(--osnovnoy-tekst);
  border-radius: var(--radius-10);
  background-color: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    background-color: rgba(1, 3, 7, 0.04);
  }
}

.admin-notification-mailing-actions__icon {
  display: block;
  width: 24px;
  height: 24px;
}
</style>
