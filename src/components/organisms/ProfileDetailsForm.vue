<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileFieldRow from '@/components/molecules/ProfileFieldRow.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const phone = ref('')
const about = ref('')

function syncFromUser() {
  const u = authStore.user
  if (!u) return
  email.value = u.email
  phone.value = u.phone ?? ''
  about.value = u.about ?? ''
}

watch(() => authStore.user, syncFromUser, { immediate: true })
</script>

<template>
  <section class="profile-details-form" aria-label="Контактные данные профиля">
    <ProfileFieldRow v-model="email" label="Email" placeholder="Указанная почта" with-checkbox readonly />
    <ProfileFieldRow v-model="phone" label="Телефон" placeholder="Номер телефона" readonly />
    <ProfileFieldRow v-model="about" label="Обо мне" placeholder="Обо мне" as="textarea" readonly />

    <p v-if="authStore.user && !authStore.user.email_verified" class="profile-details-form__hint">
      Email не подтверждён.
      <RouterLink :to="{ name: 'verify-email' }">Подтвердить</RouterLink>
    </p>
  </section>
</template>

<style lang="scss" scoped>
.profile-details-form {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__hint {
    font-family: var(--font-family);
    font-size: var(--size-15);
    color: var(--warning);
  }
}
</style>
