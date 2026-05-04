<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="not-found">
      <div class="not-found__content">
        <h1 class="not-found__title">
          <span>Ошибка!</span>
          <span>А как это?</span>
          <span>Хм....</span>
          <span>Скоро исправим!</span>
        </h1>
        <RouterLink class="not-found__home-link" to="/profile">Перейти в профиль</RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: var(--size-572);
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/img/webp/404.webp');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: var(--radius-20);
  margin: var(--sp-80) 0 0;
  @media (max-width: 1024px) {
    margin: var(--sp-40) 0 0;
  }

  &__content {
    width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--second-family);
    font-weight: 500;
    font-size: clamp(20px, calc(20px + 15 * ((100vw - 430px) / 594)), 35px);
    text-align: center;
    color: var(--fon-bloka);
    line-height: 1.2;
  }

  &__home-link {
    margin-top: var(--size-20);
    width: clamp(var(--size-220), calc(var(--size-220) + (283 - 220) * ((100vw - 430px) / (1024 - 430))), var(--size-283));
    height: clamp(var(--size-42), calc(var(--size-42) + (50 - 42) * ((100vw - 430px) / (1024 - 430))), var(--size-50));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(var(--size-8), calc(var(--size-8) + (10 - 8) * ((100vw - 430px) / (1024 - 430))), var(--size-10));
    border: 3px solid var(--dopolnitelnyy-tekst);
    border-radius: var(--radius-10);
    background: var(--fon-bloka);
    font-family: var(--second-family);
    font-weight: 500;
    font-size: clamp(var(--size-20), calc(var(--size-20) + (25 - 20) * ((100vw - 430px) / (1024 - 430))), var(--size-25));
    text-align: center;
    color: var(--osnovnoy-tekst);
    text-decoration: none;
  }
}

@media (max-width: 1024px) {
  .not-found {
    min-height: var(--size-360);

    &__content {
      width: 185px;
    }
  }
}
</style>
