<script setup lang="ts">
import { useRouter } from 'vue-router'
import HomeProfileMenu from '@/components/home/HomeProfileMenu.vue'
import type { ProfileSection } from '@/components/home/profile-menu.types'
import { useLogout } from '@/composables/useLogout'

defineProps<{
  activeSection: ProfileSection
}>()

const router = useRouter()
const { openLogoutModal, logoutLoading } = useLogout()

const onSelectSection = (section: ProfileSection) => {
  void router.push({ name: 'home-section', params: { section } })
}
</script>

<template>
  <div class="home-profile">
    <section class="home-profile__content">
      <slot />
    </section>

    <div class="home-profile__menu">
      <HomeProfileMenu
        :active-section="activeSection"
        :logout-loading="logoutLoading"
        @select-section="onSelectSection"
        @logout="openLogoutModal"
      />
    </div>
  </div>
</template>
