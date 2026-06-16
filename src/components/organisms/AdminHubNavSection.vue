<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ADMIN_STUDENTS_SCOPE_ALL } from '@/constants/adminMaterials'
</script>

<template>
  <nav class="admin-hub-nav-section" aria-labelledby="admin-hub-nav-title">
    <h2 id="admin-hub-nav-title" class="admin-hub-nav-section__title">Администрирование</h2>

    <ul class="admin-hub-nav-section__list">
      <li>
        <RouterLink :to="{ name: 'admin-materials' }" class="admin-hub-nav-section__link">
          Рабочие материалы
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'admin-glossary' }" class="admin-hub-nav-section__link">
          Глоссарий
        </RouterLink>
      </li>
      <li>
        <RouterLink
          :to="{ name: 'admin-materials-students', params: { sectionId: ADMIN_STUDENTS_SCOPE_ALL } }"
          class="admin-hub-nav-section__link"
        >
          Ученики
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'admin-notifications' }" class="admin-hub-nav-section__link">
          Уведомления
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.admin-hub-nav-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--sp-40);
  width: 100%;
  max-width: 292px;

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--osnovnoy-tekst);
    text-align: center;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);

    li {
      width: fit-content;
    }
  }

  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: var(--sp-10);
    border-radius: var(--radius-input);
    background-color: #178ef0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-25);
    color: var(--white);
    text-decoration: none;
    text-align: center;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: color-mix(in srgb, #178ef0 92%, black);
    }
  }
}
</style>
