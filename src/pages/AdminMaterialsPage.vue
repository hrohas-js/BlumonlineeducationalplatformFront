<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminMaterialsCategorySection from '@/components/organisms/AdminMaterialsCategorySection.vue'
import {
  ADMIN_MATERIAL_SECTION_LIST,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { buildSectionConfig } from '@/utils/adminCatalogAdapter'
import type { AdminCategorySectionConfig } from '@/utils/adminMaterialCatalog'

const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore()

const loading = ref(true)
const sectionConfigs = ref<AdminCategorySectionConfig[]>([])

const adminDisplayName = computed(() => authStore.studentNameBadgeLabel)

async function loadSections() {
  loading.value = true
  const configs: AdminCategorySectionConfig[] = []
  for (const section of ADMIN_MATERIAL_SECTION_LIST) {
    if (section.id === 'archive') {
      configs.push(
        buildSectionConfig(section.id, [], undefined, adminStore.productDetails)
      )
      continue
    }
    const agg = await adminStore.aggregateStudentsForSection(section.id as AdminMaterialSectionId)
    const products = adminStore.productsBySection[section.id] ?? []
    configs.push(
      buildSectionConfig(
        section.id,
        products,
        agg.success ? agg.data : undefined,
        adminStore.productDetails
      )
    )
  }
  sectionConfigs.value = configs
  loading.value = false
}

onMounted(() => {
  void loadSections()
})

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
    <section class="admin-materials-page">
      <div class="admin-materials-page__panel">
        <HomeProfileInfoTableItem :label="adminDisplayName" tone="#178ef0" is-student-name />

        <div class="admin-materials-page__toolbar">
          <RouterLink :to="{ name: 'admin' }" class="admin-materials-page__back">← Админка</RouterLink>
          <h1 class="admin-materials-page__title">Рабочие материалы</h1>
        </div>

        <p v-if="loading" class="admin-materials-page__loading">Загружаем материалы…</p>
        <p v-else-if="adminStore.error" class="admin-materials-page__error">{{ adminStore.error }}</p>

        <ul v-else class="admin-materials-page__list">
          <AdminMaterialsCategorySection
            v-for="section in sectionConfigs"
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
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-materials-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
  }

  &__toolbar {
    margin-top: var(--sp-20);
    display: flex;
    flex-direction: column;
    gap: var(--sp-8);
  }

  &__back {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-40);
    color: var(--black);
  }

  &__loading,
  &__error {
    margin-top: var(--sp-40);
    text-align: center;
    font-family: var(--font-family);
    font-size: var(--size-15);
  }

  &__error {
    color: var(--error);
  }

  &__list {
    margin: var(--sp-40) 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
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
