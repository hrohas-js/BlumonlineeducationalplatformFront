<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminMaterialsCategorySection from '@/components/organisms/AdminMaterialsCategorySection.vue'
import { MOCK_ADMIN_CATEGORY_SECTIONS, type AdminCategorySectionConfig } from '@/utils/adminMaterialCatalog'

const router = useRouter()

const adminCategorySections = MOCK_ADMIN_CATEGORY_SECTIONS

const onEditMaterialCard = (sectionId: string, cardId: string) => {
  void router.push({
    name: 'admin-material-product-edit',
    params: { sectionId, productId: cardId },
  })
}

const onOpenStudents = (section: AdminCategorySectionConfig) => {
  void router.push({
    name: 'admin-materials-students',
    params: { sectionId: section.sectionId },
    state: { usersCount: section.usersCount },
  })
}
</script>

<template>
  <AppLayout>
    <section class="admin-page">
      <div class="admin-page__panel">
        <HomeProfileInfoTableItem label="Имя админа" tone="#178ef0" is-student-name />

        <h1 class="admin-page__title">Рабочие материалы</h1>

        <ul class="admin-page__list">
          <AdminMaterialsCategorySection
            v-for="section in adminCategorySections"
            :key="section.sectionId"
            :section-id="section.sectionId"
            :title="section.title"
            :users-count="section.usersCount"
            :folders-count="section.foldersCount"
            :border-color="section.borderColor"
            :accent-key="section.accentKey"
            :cards="section.cards"
            @edit-card="(cardId) => onEditMaterialCard(section.sectionId, cardId)"
            @open-students="onOpenStudents(section)"
          />
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

    &__title {
      font-size: var(--size-30);
    }
  }
}
</style>
