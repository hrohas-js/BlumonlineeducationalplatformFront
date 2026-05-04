<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  isHeaderMenuOpen?: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle-header-menu'): void
}>()

const headerEl = ref<HTMLElement | null>(null)
const shouldDisableSticky = ref(false)

const updateStickyVsFooter = () => {
  const headerNode = headerEl.value
  const footerNode = document.querySelector('.app-footer') as HTMLElement | null
  if (!headerNode || !footerNode) return

  const headerRect = headerNode.getBoundingClientRect()
  const footerRect = footerNode.getBoundingClientRect()
  const styles = window.getComputedStyle(headerNode)
  const stickyTop = Number.parseFloat(styles.top || '0') || 0
  shouldDisableSticky.value = window.innerWidth <= 1024 && footerRect.top <= headerRect.height + stickyTop
}

onMounted(() => {
  window.addEventListener('scroll', updateStickyVsFooter, { passive: true })
  updateStickyVsFooter()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateStickyVsFooter)
})
</script>

<template>
  <header ref="headerEl" class="app-header" :class="{ 'app-header_sticky-disabled': shouldDisableSticky }">
    <RouterLink to="/" class="app-header__logo">
      <img src="/src/assets/img/webp/logo.webp" alt="Doktor Blum" class="app-header__logo-image" />
    </RouterLink>

    <nav class="app-header__nav" aria-label="Основная навигация">
      <RouterLink to="/training-programs" class="app-header__nav-link">Программы обучения</RouterLink>
      <RouterLink to="/training-archive" class="app-header__nav-link">Архив обучения</RouterLink>
      <RouterLink to="/articles" class="app-header__nav-link">Полезные статьи</RouterLink>
      <RouterLink to="/about-doctor" class="app-header__nav-link app-header__nav-link_one-line">
        О докторе
      </RouterLink>
    </nav>

    <div class="app-header__support">
      <button type="button" class="app-header__support-button">Нужна помощь?</button>
    </div>

    <div class="app-header__mobile" aria-label="Мобильная навигация">
      <RouterLink to="/" class="app-header__nav-link app-header__nav-link_mobile">На главную</RouterLink>
      <button
        type="button"
        class="app-header__burger-button"
        aria-label="Открыть меню"
        @click="emit('toggle-header-menu')"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2.44078 2.44078C0 4.88155 0 8.80993 0 16.6667C0 24.5234 0 28.4518 2.44078 30.8926C4.88155 33.3333 8.80992 33.3333 16.6667 33.3333C24.5234 33.3333 28.4518 33.3333 30.8926 30.8926C33.3333 28.4518 33.3333 24.5234 33.3333 16.6667C33.3333 8.80993 33.3333 4.88155 30.8926 2.44078C28.4518 0 24.5234 0 16.6667 0C8.80992 0 4.88155 0 2.44078 2.44078ZM21.8323 16.8226C21.5242 16.3194 21.2238 15.8287 20.9299 15.4775C20.618 15.1047 20.0712 14.592 19.235 14.6255C18.3987 14.6591 17.8948 15.214 17.6137 15.6105C17.3489 15.9842 17.0888 16.4973 16.8221 17.0235L13.509 23.5565C13.3839 23.8032 13.2797 24.0085 13.1859 24.1851C13.072 24.0209 12.9442 23.8293 12.7907 23.5991L12.4959 23.1569C12.157 22.6485 11.8568 22.1981 11.569 21.8429C11.2569 21.4578 10.9054 21.1138 10.4315 20.8602C9.95766 20.6066 9.4765 20.5049 8.98287 20.4589C8.52772 20.4165 7.98648 20.4165 7.37543 20.4165H5C4.30964 20.4165 3.75 20.9762 3.75 21.6665C3.75 22.3569 4.30964 22.9165 5 22.9165H7.32408C8.00189 22.9165 8.4255 22.9178 8.75078 22.9481C9.05029 22.976 9.17298 23.0222 9.25186 23.0644C9.33075 23.1066 9.43723 23.1831 9.62661 23.4168C9.83227 23.6707 10.0683 24.0224 10.4443 24.5864L10.7543 25.0515C11.0681 25.5224 11.3768 25.9858 11.6759 26.3163C11.9973 26.6716 12.547 27.1452 13.3589 27.0969C14.1708 27.0487 14.6605 26.5134 14.9377 26.1226C15.1955 25.759 15.4472 25.2623 15.703 24.7576L19.0154 18.2261C19.146 17.9686 19.255 17.7537 19.3531 17.5691C19.4657 17.7453 19.5915 17.9507 19.7423 18.1969L20.8324 19.9765C21.1659 20.5211 21.461 21.0029 21.7474 21.3831C22.058 21.7954 22.4128 22.1646 22.9011 22.4382C23.3894 22.7117 23.8896 22.8213 24.4033 22.8709C24.8772 22.9166 25.4421 22.9166 26.0808 22.9165L28.3333 22.9165C29.0237 22.9165 29.5833 22.3569 29.5833 21.6665C29.5833 20.9762 29.0237 20.4165 28.3333 20.4165H26.1342C25.4261 20.4165 24.9829 20.4152 24.6433 20.3824C24.3305 20.3523 24.2038 20.3024 24.1229 20.2571C24.0419 20.2117 23.9333 20.1298 23.7441 19.8787C23.5388 19.6062 23.3062 19.229 22.9364 18.6252L21.8323 16.8226Z"
            fill="#178EF0"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
// Figma: 1084×100, padding 20×40, gap 60, white bg, radius 20, no border.
// Nav: Inter Regular 400 / 20px, color #010307, blue underline on hover.
// Поддержка: 3px stroke #178EF0, radius 10px, padding 10, Inter Medium 500 / 20.
.app-header {
  background-color: var(--white);
  position: static;
  z-index: var(--z-header);
  width: var(--size-content-width);
  max-width: var(--size-1148);
  margin: var(--sp-40) auto 0;
  border-radius: var(--radius-20);
  padding: var(--sp-20) var(--sp-40);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--sp-60);

  &__logo {
    text-decoration: none;
    flex-shrink: 0;
  }

  &__logo-image {
    display: block;
    width: var(--size-60);
    height: var(--size-60);
    object-fit: contain;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: var(--sp-60);
  }

  &__nav-link {
    font-family: var(--second-family);
    font-weight: var(--font-regular);
    font-size: var(--size-20);
    text-align: center;
    color: var(--osnovnoy-tekst);
    text-decoration: none;
    padding: var(--sp-6) var(--sp-0);
    border-bottom: var(--border-2) solid transparent;
    transition: border-color 0.25s ease;

    &:hover {
      border-bottom-color: var(--podcherkivanie-pri-navedenii);
    }

    &.router-link-active {
      border-bottom-color: var(--podcherkivanie-pri-navedenii);
    }
  }

  &__nav-link_one-line {
    white-space: nowrap;
  }

  &__support-button {
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: var(--size-20);
    white-space: nowrap;
    text-align: center;
    color: var(--osnovnoy-tekst);
    background-color: transparent;
    border: var(--size-3) solid var(--text-accent);
    border-radius: var(--radius-10);
    padding: var(--sp-10);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.25s ease, color 0.25s ease;

    &:hover {
      background: var(--text-accent);
      color: var(--white);
    }
  }

  &__mobile {
    display: none;
  }

  @media (min-width: 1025px) {
    &__support-button {
      min-width: var(--size-183, 183px);
    }
  }

  @media (max-width: 1024px) {
    position: sticky;
    top: var(--sp-10);
    justify-content: space-between;
    gap: var(--sp-20);

    &__nav,
    &__support {
      display: none;
    }

    &__mobile {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      column-gap: var(--sp-16);
    }

    &__nav-link_mobile {
      justify-self: center;
      white-space: nowrap;
      font-size: clamp(15px, calc(15px + 5 * ((100vw - 430px) / 594)), 20px);
      border-bottom: none;
      padding: 0;
    }

    &__burger-button {
      justify-self: end;
      width: var(--size-34, 34px);
      height: var(--size-34, 34px);
      border: 0;
      background: transparent;
      padding: 0;
      line-height: 0;
      cursor: pointer;
    }
  }

  &_sticky-disabled {
    @media (max-width: 1024px) {
      position: static;
    }
  }
}
</style>
