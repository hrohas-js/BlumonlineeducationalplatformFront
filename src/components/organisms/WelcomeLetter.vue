<script setup lang="ts">
/**
 * WelcomeLetter — organisms/WelcomeLetter.vue
 *
 * Приветственный блок на странице /login, расположенный справа от формы.
 * Отображается только на десктопе (скрытие управляется снаружи через CSS).
 *
 * BEM-соглашения проекта:
 *   Блок с двойным названием: welcome-letter
 *   Элемент: welcome-letter__cloud
 *   Модификатор: welcome-letter__element_mod
 */
import avatarImg from '@/assets/img/webp/avatar.webp'
</script>

<template>
  <aside
    class="welcome-letter"
    aria-label="Приветственное письмо от Доктора Блюм"
  >
    <div class="welcome-letter__cloud">
      <p class="welcome-letter__paragraph">
        Есть два пути помочь самому себе в первую очередь — это найти доктора,
        который просто будет вас лечить, что само по себе сложно с точки зрения
        отслеживания динамики, так как каждый врач собирает разную информацию в
        плане анамнеза, многие вещи вы сами не стараетесь озвучивать на
        приёме, вы все живые люди и нет одинаковых ситуациях по дням, которые
        не требуют корректировки по лечению.
      </p>
      <p class="welcome-letter__paragraph">
        Второй вариант — это начать разбираться в процессах, хотя бы на уровне
        элементарной базы и уже при помощи доктора (с пониманием механизмов)
        корректировать состояние.
      </p>
      <p class="welcome-letter__paragraph">
        Нет и никогда не будет "волшебной таблетки" и схемы, которая подходит
        всем, особенно если состояние уже декомпенсировано и нет другого пути
        для выхода из порочного круга, как детальное изучение себя и Да, нужно
        вникать глубоко в процессы и учиться.
      </p>
    </div>

    <footer class="welcome-letter__footer">
      <img
        class="welcome-letter__avatar"
        :src="avatarImg"
        alt="Доктор Блюм Юлия Васильевна"
        width="60"
        height="60"
      />
      <span class="welcome-letter__author">Доктор Блюм Юлия Васильевна</span>
    </footer>
  </aside>
</template>

<style lang="scss" scoped>
.welcome-letter {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--sp-40);
  border-radius: var(--sp-10);
  background-image: url('@/assets/img/webp/mainBg.webp');
  background-size: cover;
  background-position: center;

  &__cloud {
    display: flex;
    flex-direction: column;
    gap: var(--size-14);
    background-color: var(--white);
    border-radius: var(--radius-2xl) var(--radius-2xl) var(--radius-2xl) var(--radius-cloud-tail);
    padding: var(--size-30);
  }

  &__paragraph {
    font-family: var(--second-family);
    font-style: italic;
    font-weight: 600;
    font-size: var(--size-15);
    color: var(--black);
    margin: 0;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--sp-20);
    margin-top: var(--sp-20);
    align-self: flex-start;
  }

  &__avatar {
    width: var(--size-60);
    height: var(--size-60);
    border-radius: var(--radius-round);
    object-fit: cover;
    flex-shrink: 0;
  }

  &__author {
    font-family: var(--font-family);
    font-weight: 800;
    font-size: var(--size-20);
    color: var(--white);
  }
}
</style>
