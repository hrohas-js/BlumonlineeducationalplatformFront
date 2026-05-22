<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminProfileEditSection from '@/components/organisms/AdminProfileEditSection.vue'
import AdminHubNavSection from '@/components/organisms/AdminHubNavSection.vue'
import AdminLogoutConfirmModal from '@/components/organisms/AdminLogoutConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'

const authStore = useAuthStore()
const productsStore = useProductsStore()
const router = useRouter()

const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)

const openLogoutModal = () => {
  isLogoutModalOpen.value = true
}

const closeLogoutModal = () => {
  if (isLoggingOut.value) return
  isLogoutModalOpen.value = false
}

async function onLogoutConfirm() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await authStore.logout()
    productsStore.reset()
    isLogoutModalOpen.value = false
    void router.push({ name: 'login' })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="admin-start-panel">
    <HomeProfileInfoTableItem
      class="admin-start-panel__badge"
      :label="authStore.studentNameBadgeLabel"
      tone="#178ef0"
      is-student-name
    />

    <div class="admin-start-panel__divider" aria-hidden="true" />

    <div class="admin-start-panel__profile">
      <AdminProfileEditSection />
    </div>

    <div class="admin-start-panel__hub">
      <AdminHubNavSection />
    </div>

    <BaseButton
      class="admin-start-panel__logout"
      :class="{ 'admin-start-panel__logout_active': isLogoutModalOpen }"
      variant="outline"
      size="medium"
      text="Выйти"
      @click="openLogoutModal"
    />

    <AdminLogoutConfirmModal
      :is-open="isLogoutModalOpen"
      :confirm-loading="isLoggingOut"
      @close="closeLogoutModal"
      @confirm="onLogoutConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.admin-start-panel {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto 1fr auto;
  column-gap: var(--sp-40);
  row-gap: var(--sp-20);
  min-height: 480px;

  &__badge {
    grid-column: 1 / -1;
    justify-self: start;
  }

  &__divider {
    grid-column: 2;
    grid-row: 2;
    width: 0;
    align-self: stretch;
    border-left: var(--border-1) solid var(--osnovnoy-tekst);
    min-height: 200px;
  }

  &__profile {
    grid-column: 1;
    grid-row: 2;
    display: flex;
    justify-content: flex-end;
    padding-right: var(--sp-20);
  }

  &__hub {
    grid-column: 3;
    grid-row: 2;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-left: var(--sp-20);
  }

  &__logout {
    grid-column: 3;
    grid-row: 3;
    justify-self: end;
  }

  :deep(.admin-start-panel__logout.base-button) {
    border-radius: var(--radius-input);
    border-color: var(--osnovnoy-tekst);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    padding: var(--sp-10);
  }

  :deep(.admin-start-panel__logout_active.base-button) {
    background-color: rgba(23, 142, 240, 0.2);
    border-color: #178ef0;
    color: var(--white);
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;

    &__divider {
      grid-column: 1;
      grid-row: 3;
      width: 100%;
      height: 0;
      min-height: 0;
      border-left: none;
      border-top: var(--border-1) solid var(--osnovnoy-tekst);
    }

    &__profile {
      grid-column: 1;
      grid-row: 2;
      padding-right: 0;
      justify-content: stretch;
    }

    &__hub {
      grid-column: 1;
      grid-row: 4;
      padding-left: 0;
    }

    &__logout {
      grid-column: 1;
      grid-row: 5;
      justify-self: stretch;
    }

    :deep(.admin-start-panel__logout.base-button_block),
    :deep(.admin-start-panel__logout) {
      width: 100%;
    }
  }
}
</style>
