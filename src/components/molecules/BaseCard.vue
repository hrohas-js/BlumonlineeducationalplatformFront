<script setup lang="ts">
/**
 * BaseCard — molecules/BaseCard.vue
 *
 * Архитектурное решение (см. ARCHITECTURE_ANALYSIS.md §3):
 * Карточка — молекула, составленная из атомарных стилей.
 * Использует именованные слоты (header, default, footer) для гибкой компоновки.
 * Паттерн слотов идентичен компонентам из mirror-frontend.
 */

interface Props {
  title?: string
  shadow?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: true,
  padding: 'medium',
  rounded: true,
})
</script>

<template>
  <article
    class="base-card"
    :class="[
      `base-card_padding-${padding}`,
      { 'base-card_shadow': shadow, 'base-card_rounded': rounded }
    ]"
  >
  
    <!-- Слот default: основное содержимое -->
    <div class="base-card__body">
      <slot />
    </div>

    <!-- Слот footer: кнопки действий и т.п. -->
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.base-card {
  background-color: var(--white);
  overflow: hidden;

  &_rounded {
    border-radius: var(--radius-xl);
  }

  &_shadow {
    box-shadow: var(--shadow-card);
  }

  &_padding {
    &-none {
      .base-card__header,
      .base-card__body,
      .base-card__footer {
        padding: 0;
      }
    }

    &-small {
      .base-card__body,
      .base-card__footer {
        padding: var(--sp-12) var(--sp-16);
      }
    }

    &-medium {
      .base-card__body,
      .base-card__footer {
        padding: var(--sp-20) var(--sp-24);
      }
    }

    &-large {
      .base-card__body,
      .base-card__footer {
        padding: var(--sp-32) var(--sp-40);
      }
    }
  }

  &__header {
    border-bottom: var(--border-1) solid var(--divider);
  }

  &__title {
    @include inter-semi-bold;
    font-size: var(--fs-lg);
    color: var(--black);
    margin: 0;
  }

  &__footer {
    border-top: var(--border-1) solid var(--divider);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--sp-12);
  }
}
</style>
