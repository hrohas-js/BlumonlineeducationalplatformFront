<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue'
import AdminStartPanel from '@/components/organisms/AdminStartPanel.vue'
</script>

<template>
  <AppLayout>
    <section class="admin-start-page">
      <div class="admin-start-page__panel">
        <AdminStartPanel />
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-start-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: 0 var(--sp-50);
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
