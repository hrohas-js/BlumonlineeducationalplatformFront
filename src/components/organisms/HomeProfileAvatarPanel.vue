<script setup lang="ts">
import { ref } from 'vue'
import ProfileAvatar from '@/components/atoms/ProfileAvatar.vue'
import ProfileEditAction from '@/components/molecules/ProfileEditAction.vue'
import ProfileEditModal from '@/components/organisms/ProfileEditModal.vue'

defineProps<{
  avatarUrl?: string | null
}>()

const isEditModalOpen = ref(false)

const openEditModal = () => {
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}
</script>

<template>
  <div class="home-profile-avatar-panel">
    <ProfileAvatar :src="avatarUrl" alt="Аватар пользователя" />
    <ProfileEditAction @edit="openEditModal" />
    <ProfileEditModal :is-open="isEditModalOpen" @close="closeEditModal" />
  </div>
</template>

<style lang="scss" scoped>
.home-profile-avatar-panel {
  display: flex;
  align-items: center;
  gap: var(--sp-20);

  @media (max-width: 539px) {
    flex-direction: column;
  }
}
</style>
