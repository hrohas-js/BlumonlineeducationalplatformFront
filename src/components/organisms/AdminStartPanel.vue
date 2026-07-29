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
    <div class="admin-start-panel__divider" aria-hidden="true" />

    <div class="admin-start-panel__profile">
      <AdminProfileEditSection />
    </div>

    <div class="admin-start-panel__hub-column">
      <div class="admin-start-panel__hub">
        <HomeProfileInfoTableItem
          class="admin-start-panel__hub-badge"
          :label="authStore.studentNameBadgeLabel"
          tone="#178ef0"
          is-student-name
        />
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
    </div>

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
  grid-template-rows: 1fr auto;
  column-gap: var(--sp-40);
  row-gap: var(--sp-20);
  min-height: 480px;

  &__hub-badge {
    display: none;
  }

  &__divider {
    grid-column: 2;
    grid-row: 1 / -1;
    width: 0;
    align-self: stretch;
    border-left: var(--border-1) solid var(--osnovnoy-tekst);
  }

  &__profile {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    justify-content: stretch;
    padding-right: var(--sp-20);
    padding-top: var(--sp-40);
  }

  &__hub-column {
    grid-column: 3;
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 15%;
    padding-left: var(--sp-20);
    padding-bottom: var(--sp-20);
    min-height: 0;
  }

  &__hub {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__logout {
    align-self: flex-end;
  }

  :deep(.admin-start-panel__logout.base-button) {
    height: auto;
    border-radius: var(--radius-input);
    border-color: var(--osnovnoy-tekst);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-20);
    padding: 5px var(--sp-10);

    &:hover:not(.base-button_disabled),
    &:active:not(.base-button_disabled) {
      background-color: var(--white);
      transform: none;
    }
  }

  :deep(.admin-start-panel__logout_active.base-button) {
    background-color: rgba(23, 142, 240, 0.2);
    border-color: #178ef0;
    color: var(--white);
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;

    &__hub-column {
      display: contents;
    }

    &__hub-badge {
      display: flex;
      justify-self: center;
    }

    &__divider {
      grid-column: 1;
      grid-row: 2;
      width: 100%;
      height: 0;
      border-left: none;
      border-top: var(--border-1) solid var(--osnovnoy-tekst);
    }

    &__hub {
      grid-column: 1;
      grid-row: 1;
      width: 100%;
      gap: var(--sp-20);
      justify-content: flex-start;
      align-items: center;
    }

    &__profile {
      grid-column: 1;
      grid-row: 3;
      padding-right: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    &__logout {
      grid-column: 1;
      grid-row: 4;
      justify-self: end;
      margin-top: var(--sp-20);
      font-size: var(--size-15) !important;
    }
  }
}
</style>
