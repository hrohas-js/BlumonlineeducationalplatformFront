<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminGlossaryPanel from '@/components/organisms/AdminGlossaryPanel.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const adminDisplayName = computed(() => authStore.studentNameBadgeLabel)
</script>

<template>
  <AppLayout>
    <section class="admin-glossary-page">
      <div class="admin-glossary-page__panel">
        <HomeProfileInfoTableItem
          class="admin-glossary-page__badge"
          :label="adminDisplayName"
          tone="#178ef0"
          is-student-name
        />

        <RouterLink :to="{ name: 'admin' }" class="admin-glossary-page__back">← Админка</RouterLink>

        <AdminGlossaryPanel />
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-glossary-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  &__badge {
    align-self: flex-start;
  }

  &__back {
    margin-top: var(--sp-12);
    align-self: flex-start;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--text-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
