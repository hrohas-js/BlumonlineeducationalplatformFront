<script setup lang="ts">
withDefaults(
  defineProps<{
    accessLabel?: string
    buttonLabel?: string
    showAccess?: boolean
  }>(),
  {
    accessLabel: '',
    buttonLabel: 'К изучению',
    showAccess: true,
  },
)

const emit = defineEmits<{
  buttonClick: []
}>()
</script>

<template>
  <footer class="learning-course-card-footer">
    <button type="button" class="learning-course-card-footer__button" @click="emit('buttonClick')">
      <span>{{ buttonLabel }}</span>
      <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M0.5 3.18188H0V4.18188H0.5V3.68188V3.18188ZM10.8536 4.03544C11.0488 3.84018 11.0488 3.52359 10.8536 3.32833L7.67157 0.146351C7.47631 -0.0489113 7.15973 -0.0489113 6.96447 0.146351C6.7692 0.341613 6.7692 0.658195 6.96447 0.853458L9.79289 3.68188L6.96447 6.51031C6.7692 6.70557 6.7692 7.02216 6.96447 7.21742C7.15973 7.41268 7.47631 7.41268 7.67157 7.21742L10.8536 4.03544ZM0.5 3.68188V4.18188H10.5V3.68188V3.18188H0.5V3.68188Z"
          fill="#010307"
        />
      </svg>
    </button>

    <span v-if="showAccess" class="learning-course-card-footer__access">Срок доступа: {{ accessLabel }}</span>
  </footer>
</template>

<style lang="scss" scoped>
.learning-course-card-footer {
  margin-top: var(--sp-10);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-10);

  &__button {
    border: var(--border-1) solid var(--dopolnitelnyy-tekst);
    border-radius: var(--radius-10);
    padding: var(--size-5);
    width: 100%;
    max-width: var(--size-130);
    height: 28px;
    background: var(--fon-bloka);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-5);
    cursor: pointer;

    span {
      font-family: var(--font-family);
      font-weight: var(--font-medium);
      font-size: var(--size-15);
      text-align: center;
      color: var(--osnovnoy-tekst);
      line-height: 1;
    }
  }

  &__access {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-10);
    color: var(--osnovnoy-tekst);
  }

  &_renewal &__button {
    max-width: var(--size-180);
  }
}

@media (max-width: 1023px) {
  .learning-course-card-footer {
    &__button {
      max-width: var(--size-95);
      height: 22px;

      span {
        font-size: var(--size-10);
      }
    }

    &_renewal &__button {
      max-width: var(--size-130);
    }
  }
}
</style>
