<script setup lang="ts">
export type AdminNotificationsTabId = 'mailings' | 'create'

interface TabItem {
  id: AdminNotificationsTabId
  label: string
}

const tabs: TabItem[] = [
  { id: 'mailings', label: 'Рассылки' },
  { id: 'create', label: 'Создать рассылку' },
]

const model = defineModel<AdminNotificationsTabId>({ required: true })

const selectTab = (id: AdminNotificationsTabId) => {
  model.value = id
}
</script>

<template>
  <div class="admin-notifications-tabs" role="tablist" aria-label="Разделы уведомлений">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="admin-notifications-tabs__tab"
      :class="{ 'admin-notifications-tabs__tab_active': model === tab.id }"
      :aria-selected="model === tab.id"
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.admin-notifications-tabs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
}

.admin-notifications-tabs__tab {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--osnovnoy-tekst);
  cursor: pointer;
  text-align: left;

  &_active {
    color: var(--text-accent);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}
</style>
