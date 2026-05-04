<script setup lang="ts">
const currentYear = new Date().getFullYear()
const instagramGradientId = 'app-footer-instagram-gradient'
</script>

<template>
  <footer class="app-footer" role="contentinfo">
    <h2 class="app-footer__title">Быть в курсе:</h2>

    <div class="app-footer__columns">
      <section class="app-footer__social" aria-label="Социальные сети">
        <a
          class="app-footer__social-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
        >
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="60" height="60" rx="30" fill="#27A6E5" />
            <path
              d="M42 18.9033L37.4919 42.4384C37.4919 42.4384 36.8611 44.0702 35.1283 43.2876L24.7269 35.0289L24.6786 35.0045C26.0836 33.6981 36.9786 23.554 37.4548 23.0942C38.1919 22.382 37.7343 21.9581 36.8784 22.496L20.7852 33.0795L14.5765 30.9161C14.5765 30.9161 13.5994 30.5562 13.5054 29.7737C13.4102 28.9898 14.6086 28.5658 14.6086 28.5658L39.9197 18.2834C39.9197 18.2834 42 17.3369 42 18.9033V18.9033Z"
              fill="#FEFEFE"
            />
          </svg>
        </a>

        <a
          class="app-footer__social-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="60" height="60" rx="30" :fill="`url(#${instagramGradientId})`" />
            <path
              d="M30 17.7108C33.9759 17.7108 34.5181 17.7108 36.1446 17.7108C37.5904 17.7108 38.3133 18.0723 38.8554 18.253C39.5783 18.6145 40.1205 18.7952 40.6627 19.3374C41.2048 19.8795 41.5663 20.4217 41.747 21.1446C41.9277 21.6867 42.1084 22.4096 42.2892 23.8554C42.2892 25.4819 42.2892 25.8434 42.2892 30C42.2892 34.1566 42.2892 34.5181 42.2892 36.1446C42.2892 37.5904 41.9277 38.3133 41.747 38.8554C41.3855 39.5783 41.2048 40.1205 40.6627 40.6627C40.1205 41.2048 39.5783 41.5663 38.8554 41.747C38.3133 41.9277 37.5904 42.1084 36.1446 42.2892C34.5181 42.2892 34.1566 42.2892 30 42.2892C25.8434 42.2892 25.4819 42.2892 23.8554 42.2892C22.4096 42.2892 21.6867 41.9277 21.1446 41.747C20.4217 41.3855 19.8795 41.2048 19.3374 40.6627C18.7952 40.1205 18.4337 39.5783 18.253 38.8554C18.0723 38.3133 17.8916 37.5904 17.7108 36.1446C17.7108 34.5181 17.7108 34.1566 17.7108 30C17.7108 25.8434 17.7108 25.4819 17.7108 23.8554C17.7108 22.4096 18.0723 21.6867 18.253 21.1446C18.6145 20.4217 18.7952 19.8795 19.3374 19.3374C19.8795 18.7952 20.4217 18.4337 21.1446 18.253C21.6867 18.0723 22.4096 17.8916 23.8554 17.7108C25.4819 17.7108 26.0241 17.7108 30 17.7108ZM30 15C25.8434 15 25.4819 15 23.8554 15C22.2289 15 21.1446 15.3614 20.241 15.7229C19.3374 16.0843 18.4337 16.6265 17.5301 17.5301C16.6265 18.4337 16.2651 19.1566 15.7229 20.241C15.3614 21.1446 15.1807 22.2289 15 23.8554C15 25.4819 15 26.0241 15 30C15 34.1566 15 34.5181 15 36.1446C15 37.7711 15.3614 38.8554 15.7229 39.759C16.0843 40.6627 16.6265 41.5663 17.5301 42.4699C18.4337 43.3735 19.1566 43.7349 20.241 44.2771C21.1446 44.6386 22.2289 44.8193 23.8554 45C25.4819 45 26.0241 45 30 45C33.9759 45 34.5181 45 36.1446 45C37.7711 45 38.8554 44.6386 39.759 44.2771C40.6627 43.9157 41.5663 43.3735 42.4699 42.4699C43.3735 41.5663 43.7349 40.8434 44.2771 39.759C44.6386 38.8554 44.8193 37.7711 45 36.1446C45 34.5181 45 33.9759 45 30C45 26.0241 45 25.4819 45 23.8554C45 22.2289 44.6386 21.1446 44.2771 20.241C43.9157 19.3374 43.3735 18.4337 42.4699 17.5301C41.5663 16.6265 40.8434 16.2651 39.759 15.7229C38.8554 15.3614 37.7711 15.1807 36.1446 15C34.5181 15 34.1566 15 30 15Z"
              fill="white"
            />
            <path
              d="M30 22.2289C25.6627 22.2289 22.2289 25.6627 22.2289 30C22.2289 34.3374 25.6627 37.7711 30 37.7711C34.3374 37.7711 37.7711 34.3374 37.7711 30C37.7711 25.6627 34.3374 22.2289 30 22.2289ZM30 35.0602C27.2892 35.0602 24.9398 32.8916 24.9398 30C24.9398 27.2892 27.1084 24.9398 30 24.9398C32.7108 24.9398 35.0602 27.1084 35.0602 30C35.0602 32.7108 32.7108 35.0602 30 35.0602Z"
              fill="white"
            />
            <path
              d="M37.9518 23.8554C38.9499 23.8554 39.759 23.0463 39.759 22.0482C39.759 21.0501 38.9499 20.241 37.9518 20.241C36.9537 20.241 36.1446 21.0501 36.1446 22.0482C36.1446 23.0463 36.9537 23.8554 37.9518 23.8554Z"
              fill="white"
            />
            <defs>
              <radialGradient
                :id="instagramGradientId"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(61.207 1.21875) scale(138.558)"
              >
                <stop stop-color="#F9ED32" />
                <stop offset="0.36" stop-color="#EE2A7B" />
                <stop offset="0.44" stop-color="#D22A8A" />
                <stop offset="0.6" stop-color="#8B2AB2" />
                <stop offset="0.83" stop-color="#1B2AF0" />
                <stop offset="0.88" stop-color="#002AFF" />
              </radialGradient>
            </defs>
          </svg>
        </a>

        <a
          class="app-footer__social-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="60" height="60" rx="30" fill="#F40000" />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.8937 40.5852C16.3053 40.4111 15.7685 40.1015 15.3284 39.6823C14.8884 39.2631 14.5581 38.7468 14.3654 38.1768C13.2644 35.2311 12.9381 22.9304 15.0587 20.5021C15.7644 19.7122 16.7608 19.2258 17.8317 19.1486C23.5204 18.5515 41.0962 18.6311 43.1148 19.3477C43.6825 19.5275 44.2012 19.8304 44.632 20.2337C45.0628 20.637 45.3945 21.1302 45.6023 21.6764C46.8053 24.7218 46.8461 35.7884 45.4392 38.7142C45.066 39.4759 44.4412 40.0928 43.6653 40.4658C41.5448 41.5008 19.7075 41.4809 16.8937 40.5852V40.5852ZM25.9263 34.8131L36.1211 29.638L25.9263 24.4232V34.8131Z"
              fill="white"
            />
          </svg>
        </a>

        <a
          class="app-footer__social-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ВКонтакте"
        >
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="60" height="60" rx="30" fill="#0077FF" />
            <path
              d="M31.4738 40.5C20.1989 40.5 13.768 32.6171 13.5 19.5H19.1477C19.3332 29.1276 23.4969 33.2057 26.7948 34.0465V19.5H32.1127V27.8033C35.3695 27.4459 38.7911 23.6622 39.9453 19.5H45.2633C44.8283 21.6586 43.9613 23.7025 42.7164 25.5038C41.4715 27.305 39.8756 28.825 38.0284 29.9685C40.0903 31.0133 41.9115 32.4922 43.3718 34.3076C44.8321 36.123 45.8982 38.2335 46.5 40.5H40.6462C40.106 38.5314 39.0081 36.7692 37.4901 35.4342C35.9721 34.0993 34.1015 33.2509 32.1127 32.9955V40.5H31.4738V40.5Z"
              fill="white"
            />
          </svg>
        </a>
      </section>

      <section class="app-footer__links" aria-label="Основные документы">
        <a href="#" class="app-footer__link">#Новостная повестка</a>
        <a href="#" class="app-footer__link">#Маршрут знаний</a>
        <a href="#" class="app-footer__link">#Партнёрам</a>
      </section>

      <section class="app-footer__legal" aria-label="Юридическая информация">
        <a href="#" class="app-footer__legal-link">Согласие на обработку ПД</a>
        <a href="#" class="app-footer__legal-link">Политика конфиденциальности</a>
        <a href="#" class="app-footer__legal-link">Пользовательское соглашение</a>
        <a href="#" class="app-footer__legal-link">Договор оферта</a>
      </section>
    </div>

    <div class="app-footer__bottom">
      <p class="app-footer__bottom-text">Doktor_Blum&copy; {{ currentYear }}</p>
      <p class="app-footer__bottom-text">Все права защищены</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  width: 100%;
  background: var(--fon-podvala);
  padding: var(--sp-40) var(--sp-80) var(--sp-80);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: clamp(20px, calc(20px + 10 * ((100vw - 430px) / 594)), 30px);
    color: var(--osnovnoy-tekst);
  }

  &__columns {
    margin-top: var(--sp-40);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: clamp(24px, calc(24px + 45 * ((100vw - 1024px) / 256)), 69px);
  }

  &__social {
    display: flex;
    align-items: center;
    gap: var(--sp-20);
  }

  &__social-link {
    width: var(--size-60);
    height: var(--size-60);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__links {
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    text-align: center;
  }

  &__link {
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: clamp(20px, calc(20px + 10 * ((100vw - 430px) / 594)), 30px);
    text-align: center;
    color: var(--osnovnoy-tekst);
    text-decoration: none;
  }

  &__legal {
    padding-bottom: var(--sp-17);
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    text-align: right;
  }

  &__legal-link {
    font-family: var(--second-family);
    font-weight: var(--font-medium);
    font-size: clamp(15px, calc(15px + 10 * ((100vw - 430px) / 594)), 25px);
    text-align: right;
    color: var(--osnovnoy-tekst);
    text-decoration: none;
  }

  &__bottom {
    margin-top: var(--size-5);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--sp-20);
  }

  &__bottom-text {
    margin: 0;
    font-family: var(--second-family);
    font-weight: var(--font-regular);
    font-size: clamp(15px, calc(15px + 10 * ((100vw - 430px) / 594)), 25px);
    color: var(--osnovnoy-tekst);
  }

  @media (max-width: 1024px) {
    padding: var(--sp-40) var(--sp-86) var(--sp-40);

    &__title {
      font-weight: var(--font-medium);
      text-align: center;
    }

    &__columns {
      margin-top: var(--sp-40);
      flex-direction: column;
      align-items: center;
      gap: var(--sp-80);
    }

    &__social-link {
      width: 50px;
      height: 50px;
    }

    &__link {
      text-align: center;
    }

    &__legal {
      padding-bottom: 0;
      text-align: center;
    }

    &__legal-link {
      text-align: center;
    }

    &__bottom {
      margin-top: var(--sp-80);
      flex-direction: column;
      align-items: center;
    }

    &__bottom-text {
      text-align: center;
    }
  }
}
</style>
