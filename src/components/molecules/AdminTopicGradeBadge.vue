<script setup lang="ts">
export type AdminTopicGradeBadgeVariant = 'passed' | 'neutral'

interface Props {
  variant: AdminTopicGradeBadgeVariant
}

defineProps<Props>()

interface Emits {
  (e: 'toggle'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <button
    type="button"
    class="admin-topic-grade-badge"
    :class="{
      'admin-topic-grade-badge_passed': variant === 'passed',
      'admin-topic-grade-badge_neutral': variant === 'neutral',
    }"
    @click="emit('toggle')"
  >
    Зачёт
  </button>
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
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
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
