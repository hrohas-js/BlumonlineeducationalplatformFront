<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

export type AdminMaterialCourseAccent = 'courses' | 'projects' | 'other' | 'archive'

interface Props {
  accentKey: AdminMaterialCourseAccent
  title: string
  topicsCount: number
  usersCount: number
  /** Текст после «Дедлайн (общий): » — дата, «бессрочно», «закрыт» и т.д. */
  deadlineSuffix: string
}

interface Emits {
  (e: 'edit-click'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <article
    class="admin-material-course-card"
    :class="`admin-material-course-card_${accentKey}`"
  >
    <div class="admin-material-course-card__title-bar">
      <h3 class="admin-material-course-card__title">{{ title }}</h3>
    </div>

    <div class="admin-material-course-card__row">
      <span class="admin-material-course-card__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.5 3.5h9A1 1 0 0115.5 4.5v11a1 1 0 01-1 1h-9a1 1 0 01-1-1v-11a1 1 0 011-1z"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linejoin="round"
          />
          <path d="M7 7.5h6M7 10h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </span>
      <span class="admin-material-course-card__value">{{ topicsCount }}</span>
    </div>

    <div class="admin-material-course-card__row admin-material-course-card__row_users">
      <span class="admin-material-course-card__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.5 8.5a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zM3 16v-.5A3.5 3.5 0 016.5 12h3"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M12.5 7a1.75 1.75 0 110 3.5M10 16v-.25A2.75 2.75 0 0112.75 13H14"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span class="admin-material-course-card__value">{{ usersCount }}</span>
    </div>

    <p class="admin-material-course-card__deadline">
      Дедлайн (общий): {{ deadlineSuffix }}
    </p>

    <BaseButton
      class="admin-material-course-card__edit"
      variant="outline"
      size="small"
      text="Редактировать"
      @click="emit('edit-click')"
    />
  </article>
</template>

<style lang="scss" scoped>
.admin-material-course-card {
  --accent: #178ef0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  padding: var(--sp-20);
  border-radius: var(--radius-10);
  border: var(--border-2) solid var(--accent);
  background-color: var(--white);
  box-sizing: border-box;

  @media (max-width: 1023px) {
    padding: var(--sp-10);
    gap: var(--sp-10);
  }

  &_courses {
    --accent: #178ef0;
  }

  &_projects {
    --accent: #0098a3;
  }

  &_other {
    --accent: #b842ef;
  }

  &_archive {
    --accent: #010307;
  }

  &__title-bar {
    width: 100%;
    padding: var(--sp-10);
    border-radius: var(--radius-10);
    border: 3px solid var(--accent);
    background-color: var(--accent);
    box-sizing: border-box;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    line-height: normal;
    text-align: center;
    color: var(--white);

    @media (max-width: 1023px) {
      font-size: var(--size-15);
    }
  }

  &__row {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-20);

    @media (max-width: 1023px) {
      gap: var(--sp-10);
    }
  }

  &__row_users {
    gap: var(--sp-10);
  }

  &__icon {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--size-20);
    height: var(--size-20);
    color: #010307;

    @media (max-width: 1023px) {
      width: var(--size-15);
      height: var(--size-15);
    }
  }

  &__value {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    line-height: normal;
    color: #010307;

    @media (max-width: 1023px) {
      font-size: var(--size-15);
    }
  }

  &__deadline {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    line-height: normal;
    color: #010307;

    @media (max-width: 1023px) {
      font-size: var(--size-15);
    }
  }

  :deep(.admin-material-course-card__edit.base-button) {
    border-radius: var(--radius-10);
    border-color: #178ef0;
    padding: var(--size-5) var(--sp-10);
    min-height: 0;
    height: auto;

    @media (max-width: 1023px) {
      font-size: var(--size-15);
    }
  }

  :deep(.admin-material-course-card__edit.base-button_outline:hover:not(.base-button_disabled)) {
    border-color: #178ef0;
    background-color: #178ef0;
    color: var(--white);
  }
}
</style>
