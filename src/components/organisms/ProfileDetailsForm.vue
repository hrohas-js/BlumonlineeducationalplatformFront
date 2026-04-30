<script setup lang="ts">
import { ref } from 'vue'
import ProfileFieldRow from '@/components/molecules/ProfileFieldRow.vue'

const email = ref('')
const phone = ref('')
const about = ref('')
</script>

<template>
  <section class="profile-details-form" aria-label="Контактные данные профиля">
    <ProfileFieldRow v-model="email" label="Email" placeholder="Указанная почта" with-checkbox />
    <ProfileFieldRow v-model="phone" label="Телефон" placeholder="Номер телефона" />
    <ProfileFieldRow v-model="about" label="Обо мне" placeholder="Обо мне" as="textarea" />
  </section>
</template>

<style lang="scss" scoped>
.profile-details-form {
  margin-top: var(--sp-40);
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
}
</style>
