<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'

const route = useRoute()
const title = computed(() => String(route.meta.stubTitle ?? 'Страница'))
</script>

<template>
  <AppLayout>
    <div class="content-stub">
      <h1 class="content-stub__title">{{ title }}</h1>
      <p class="content-stub__text">Раздел в разработке.</p>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.content-stub {
  margin-top: var(--sp-40);
  border-radius: var(--radius-20);
  background-color: var(--white);
  padding: var(--sp-40) var(--sp-60);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: var(--size-35);
    color: var(--black);
  }

  &__text {
    margin: var(--sp-20) 0 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    color: var(--black);
  }
}
</style>
