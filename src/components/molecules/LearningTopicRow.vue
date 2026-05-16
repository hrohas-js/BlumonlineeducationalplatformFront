<script setup lang="ts">
const props = defineProps<{
  title: string
  accessUntil: string | null
  isCompleted: boolean
  isActive?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const accessLabel = (value: string | null) => value ?? 'бессрочно'

const onClick = () => {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="learning-topic-row"
    :class="{ 'learning-topic-row_active': props.isActive }"
    :aria-current="props.isActive ? 'true' : undefined"
    @click="onClick"
  >
    <span class="learning-topic-row__main">
      <span
        class="learning-topic-row__icon"
        :class="{ 'learning-topic-row__icon_completed': isCompleted }"
        aria-hidden="true"
      >
        <svg
          v-if="isCompleted"
          width="10"
          height="9"
          viewBox="0 0 10 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4.5L3.5 7L9 1.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="learning-topic-row__title">{{ title }}</span>
    </span>
    <span class="learning-topic-row__access">Срок доступа: {{ accessLabel(accessUntil) }}</span>
  </button>
</template>

<style lang="scss" scoped>
.learning-topic-row {
  width: 100%;
  border: none;
  border-radius: var(--radius-10);
  background: var(--osnovnoy-fon);
  padding: var(--sp-10) var(--sp-20);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);
  cursor: pointer;
  text-align: left;
  transition: outline-color 0.15s ease, background-color 0.15s ease;

  &_active {
    outline: var(--border-2) solid var(--dopolnitelnyy-tekst);
    outline-offset: calc(-1 * var(--border-2));
    background: var(--fon-bloka);
  }

  &__main {
    display: flex;
    align-items: center;
    gap: var(--sp-20);
    min-width: 0;
  }

  &__icon {
    flex-shrink: 0;
    width: var(--size-20);
    height: var(--size-20);
    border: var(--border-1) solid var(--osnovnoy-tekst);
    border-radius: var(--radius-10);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--fon-bloka);

    &_completed {
      background: var(--dopolnitelnyy-tekst);
      border-color: var(--dopolnitelnyy-tekst);
    }
  }

  &__title {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__access {
    flex-shrink: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-13);
    color: var(--osnovnoy-tekst);
    text-align: right;
  }
}

@media (max-width: 1023px) {
  .learning-topic-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--size-5);

    &__title {
      font-size: var(--size-13);
      white-space: normal;
    }

    &__access {
      font-size: var(--size-10);
    }
  }
}
</style>
