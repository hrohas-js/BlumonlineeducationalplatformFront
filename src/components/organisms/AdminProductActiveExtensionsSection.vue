<script setup lang="ts">
import AdminActiveExtensionCard from '@/components/molecules/AdminActiveExtensionCard.vue'
import type { AdminMaterialActiveExtensionMock } from '@/utils/adminMaterialCatalog'

interface Props {
  items: AdminMaterialActiveExtensionMock[]
}

defineProps<Props>()

interface Emits {
  (e: 'pay-click', id: string): void
  (e: 'delete-click', id: string): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <section class="admin-product-active-extensions-section">
    <hr class="admin-product-active-extensions-section__rule" />
    <h2 class="admin-product-active-extensions-section__title">Активные</h2>
    <div class="admin-product-active-extensions-section__grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="admin-product-active-extensions-section__cell"
      >
        <AdminActiveExtensionCard
          :topic-label="item.topicLabel"
          :product-badge="item.productBadge"
          :extension-text="item.extensionText"
          @pay-click="emit('pay-click', item.id)"
          @delete-click="emit('delete-click', item.id)"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-product-active-extensions-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-active-extensions-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-active-extensions-section__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--black);
  text-align: center;
}

.admin-product-active-extensions-section__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-active-extensions-section__cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
