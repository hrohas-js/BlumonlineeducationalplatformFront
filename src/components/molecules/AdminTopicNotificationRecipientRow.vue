<script setup lang="ts">
import AdminTopicNotificationCheckbox from '@/components/atoms/AdminTopicNotificationCheckbox.vue'

interface Props {
  recipientId: string
  name: string
  email: string
  selected: boolean
}

defineProps<Props>()

interface Emits {
  (e: 'update:selected', value: boolean): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="admin-topic-notification-recipient-row">
    <AdminTopicNotificationCheckbox
      :input-id="`topic-notify-recipient-${recipientId}`"
      :model-value="selected"
      @update:model-value="emit('update:selected', $event)"
    />
    <div class="admin-topic-notification-recipient-row__content">
      <span class="admin-topic-notification-recipient-row__name">{{ name }}</span>
      <span class="admin-topic-notification-recipient-row__email">{{ email }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-topic-notification-recipient-row {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  max-width: 583px;
  box-sizing: border-box;
}

.admin-topic-notification-recipient-row__content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  min-width: 0;
  padding: var(--sp-10) 0;
  border-bottom: 1px solid #010307;
}

.admin-topic-notification-recipient-row__name {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-topic-notification-recipient-row__email {
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  text-align: right;
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 1023px) {
  .admin-topic-notification-recipient-row__name,
  .admin-topic-notification-recipient-row__email {
    font-size: var(--size-15);
  }
}
</style>
