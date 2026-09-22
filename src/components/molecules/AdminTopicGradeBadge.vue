<script setup lang="ts">
export type AdminTopicGradeBadgeVariant = 'passed' | 'neutral'

defineProps<{
  variant: AdminTopicGradeBadgeVariant
}>()
</script>

<template>
  <span
    class="admin-topic-grade-badge"
    :class="{
      'admin-topic-grade-badge_passed': variant === 'passed',
      'admin-topic-grade-badge_neutral': variant === 'neutral',
    }"
    role="status"
    :aria-label="variant === 'passed' ? 'Зачёт' : 'Без зачёта'"
  >
    Зачёт
  </span>
</template>

<style lang="scss" scoped>
.admin-topic-grade-badge {
  margin: 0;
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 5px;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  white-space: nowrap;
}

.admin-topic-grade-badge_passed {
  border: none;
  background-color: #00a600;
  color: #fff;
}

.admin-topic-grade-badge_neutral {
  border: 1px solid #010307;
  background-color: #fff;
  color: #010307;
}

@media (max-width: 1023px) {
  .admin-topic-grade-badge {
    font-size: var(--size-15);
  }
}
</style>
