<script setup lang="ts">
import {
  SUPPORT_EMAIL,
  SUPPORT_INSTAGRAM_URL,
  SUPPORT_TELEGRAM_URL,
} from '@/constants/supportContacts'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div
    class="support-contacts-grid"
    :class="{ 'support-contacts-grid_compact': compact }"
  >
    <div class="support-contacts-grid__grid">
      <p class="support-contacts-grid__label">Рабочая почта</p>
      <a class="support-contacts-grid__mail-link" :href="`mailto:${SUPPORT_EMAIL}`">
        {{ SUPPORT_EMAIL }}
      </a>

      <p class="support-contacts-grid__label">Телеграм</p>
      <a
        class="support-contacts-grid__link support-contacts-grid__link_primary"
        :href="SUPPORT_TELEGRAM_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ссылка
      </a>

      <p class="support-contacts-grid__label">Нельзаграм*</p>
      <a
        class="support-contacts-grid__link support-contacts-grid__link_secondary"
        :href="SUPPORT_INSTAGRAM_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ссылка
      </a>
    </div>

    <p class="support-contacts-grid__meta-note">(Meta* запрещена на территории РФ)</p>
  </div>
</template>

<style lang="scss" scoped>
.support-contacts-grid {
  &__grid {
    margin-top: var(--sp-40);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--sp-20);
    row-gap: var(--sp-20);
    align-items: center;
  }

  &_compact &__grid {
    margin-top: var(--sp-20);
  }

  &__label {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &__mail-link {
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    text-decoration: none;

    @media (max-width: 1023px) {
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &__link {
    width: var(--size-180);
    height: var(--size-38);
    box-sizing: border-box;
    justify-self: end;
    border-radius: var(--radius-10);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--sp-10) var(--sp-60);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-15);
    text-align: center;
    text-decoration: none;

    @media (max-width: 1023px) {
      width: var(--size-132);
      height: var(--size-30);
      padding: var(--size-7) var(--size-40);
      font-size: clamp(
        var(--size-13),
        calc(
          var(--size-13) + (var(--size-15) - var(--size-13)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }

    &_primary {
      background: var(--dopolnitelnyy-tekst);
      border: none;
      color: var(--fon-bloka);
    }

    &_secondary {
      border: var(--border-2) solid var(--dopolnitelnyy-tekst);
      background: var(--fon-bloka);
      color: var(--osnovnoy-tekst);
    }
  }

  &__meta-note {
    margin: var(--sp-40) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-regular);
    font-size: var(--size-15);
    text-align: center;
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      margin-top: var(--sp-20);
      font-size: clamp(
        var(--size-10),
        calc(
          var(--size-10) + (var(--size-15) - var(--size-10)) *
            ((100vw - var(--size-430)) / (var(--size-1024) - var(--size-430)))
        ),
        var(--size-15)
      );
    }
  }

  &_compact &__meta-note {
    margin-top: var(--sp-20);
  }
}
</style>
