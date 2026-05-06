<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import gearIcon from '@/assets/icons/admin-gear.svg'
import userIcon from '@/assets/icons/admin-user.svg'
import folderIcon from '@/assets/icons/admin-folder.svg'

type AdminFolderRow = {
  title: string
  usersCount: number
  foldersCount: number
  borderColor: string
}

const adminFolders: AdminFolderRow[] = [
  { title: 'Курсы', usersCount: 670, foldersCount: 6, borderColor: '#178EF0' },
  { title: 'Проекты', usersCount: 1200, foldersCount: 2, borderColor: '#0098A3' },
  { title: 'Иное', usersCount: 250, foldersCount: 2, borderColor: '#B842EF' },
  { title: 'Архив', usersCount: 450, foldersCount: 6, borderColor: '#010307' },
]
</script>

<template>
  <AppLayout>
    <section class="admin-page">
      <div class="admin-page__panel">
        <HomeProfileInfoTableItem label="Имя админа" tone="#178ef0" is-student-name />

        <h1 class="admin-page__title">Рабочие материалы</h1>

        <ul class="admin-page__list">
          <li
            v-for="folder in adminFolders"
            :key="folder.title"
            class="admin-page__list-item"
            :style="{ '--admin-row-border': folder.borderColor }"
          >
            <div class="admin-page__item-left">
              <h2 class="admin-page__item-title">{{ folder.title }}</h2>
              <div class="admin-page__stats">
                <div class="admin-page__stat">
                  <button type="button" class="admin-page__icon-button" aria-label="Настройки">
                    <img class="admin-page__icon" :src="gearIcon" alt="" aria-hidden="true" />
                  </button>
                </div>

                <div class="admin-page__stat">
                  <button type="button" class="admin-page__metric-link" aria-label="Пользователи">
                    <img class="admin-page__icon" :src="userIcon" alt="" aria-hidden="true" />
                    <span class="admin-page__stat-value">{{ folder.usersCount }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="admin-page__item-right">
              <div class="admin-page__stat">
                <button type="button" class="admin-page__icon-button" aria-label="Папки">
                  <img class="admin-page__icon" :src="folderIcon" alt="" aria-hidden="true" />
                </button>
                <span class="admin-page__stat-value">{{ folder.foldersCount }}</span>
              </div>

              <button type="button" class="admin-page__add-button" aria-label="Добавить папку">+</button>
            </div>
          </li>
        </ul>

        <div class="admin-page__create-folder">
          <BaseButton class="admin-page__create-folder-button" variant="outline" size="medium">
            Создать новую папку
          </BaseButton>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
  }

  &__title {
    margin: var(--sp-20) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-40);
    text-align: center;
    color: var(--black);
  }

  &__list {
    margin: var(--sp-40) 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
  }

  &__list-item {
    --admin-row-border: var(--black);
    border: var(--border-2) solid var(--admin-row-border);
    border-radius: var(--radius-10);
    padding: var(--sp-16) var(--sp-20);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-20);
  }

  &__item-left {
    display: flex;
    align-items: center;
    gap: var(--sp-20);
  }

  &__item-title {
    margin: 0;
    min-width: var(--size-100);
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-25);
    color: var(--black);
  }

  &__stats,
  &__item-right {
    display: flex;
    align-items: center;
    gap: var(--sp-20);
  }

  &__stat {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-10);
  }

  &__stat-value {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-25);
    color: var(--black);
  }

  &__icon-button {
    width: var(--size-24);
    height: var(--size-24);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--black);
    transition: color 0.2s ease;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: calc(var(--sp-6) * -1);
      height: var(--border-2);
      background-color: #178ef0;
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    &:hover::after,
    &:focus-visible::after {
      transform: scaleX(1);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
      border-radius: var(--radius-sm);
    }
  }

  &__metric-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--sp-10);
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: calc(var(--sp-6) * -1);
      height: var(--border-2);
      background-color: #178ef0;
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    &:hover::after,
    &:focus-visible::after {
      transform: scaleX(1);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring-main);
      border-radius: var(--radius-sm);
    }
  }

  &__icon {
    width: var(--size-20);
    height: var(--size-20);
    display: block;
  }

  &__add-button {
    width: var(--size-30);
    height: var(--size-30);
    border: var(--border-2) solid #178ef0;
    border-radius: var(--radius-round);
    color: var(--black);
    font-size: var(--size-20);
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background-color: #178ef0;
      color: var(--white);
    }
  }

  &__create-folder {
    margin-top: var(--sp-40);
    display: flex;
    justify-content: center;
  }

  :deep(.admin-page__create-folder-button.base-button) {
    border-radius: var(--radius-10);
  }

  :deep(.admin-page__create-folder-button.base-button_outline:hover:not(.base-button_disabled)) {
    background-color: #178ef0;
    border-color: #178ef0;
    color: var(--white);
    transform: var(--motion-shift-none);
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }

    &__list-item {
      flex-direction: column;
      align-items: flex-start;
    }

    &__item-right {
      width: 100%;
      justify-content: space-between;
    }

    &__title {
      font-size: var(--size-30);
    }

    &__item-title,
    &__stat-value {
      font-size: var(--size-25);
    }
  }
}
</style>
