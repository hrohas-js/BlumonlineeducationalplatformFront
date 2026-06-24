<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminMaterialCourseCard, {
  type AdminMaterialCourseAccent,
} from '@/components/organisms/AdminMaterialCourseCard.vue'
import userIcon from '@/assets/icons/admin-user.svg'
import folderIcon from '@/assets/icons/admin-folder.svg'
import type { AdminMaterialCardItem } from '@/utils/adminMaterialCatalog'

export type { AdminMaterialCardItem } from '@/utils/adminMaterialCatalog'

interface Props {
  sectionId: string
  title: string
  usersCount: number
  foldersCount: number
  borderColor: string
  accentKey: AdminMaterialCourseAccent
  cards: AdminMaterialCardItem[]
}

interface Emits {
  (e: 'edit-card', cardId: string): void
  (e: 'open-students'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expanded = ref(false)

const panelId = computed(() => `admin-materials-panel-${props.sectionId}`)

const toggleLabel = computed(() =>
  expanded.value ? `Свернуть список «${props.title}»` : `Развернуть список «${props.title}»`,
)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <li class="admin-materials-category-section">
    <div
      class="admin-materials-category-section__trigger"
      :style="{ '--admin-row-border': borderColor }"
    >
      <div class="admin-materials-category-section__item-left">
        <h2 class="admin-materials-category-section__item-title">{{ title }}</h2>
        <div class="admin-materials-category-section__stats">
          <div class="admin-materials-category-section__stat">
            <RouterLink
              v-if="sectionId !== 'archive'"
              class="admin-materials-category-section__icon-button"
              :to="{ name: 'admin-material-product-create', params: { sectionId } }"
              aria-label="Добавить продукт"
            >
              <svg
                class="admin-materials-category-section__icon admin-materials-category-section__icon_gear"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M15.1439 0.771215L15.2104 0.789036C16.3098 1.08361 17.181 1.31704 17.8662 1.56458C18.5672 1.81779 19.1388 2.10744 19.6097 2.54847C20.2953 3.19068 20.7752 4.02179 20.9885 4.93671C21.135 5.56503 21.1001 6.20486 20.9689 6.93849C20.8406 7.65573 20.6072 8.52697 20.3126 9.62638L19.7771 11.6247C19.4826 12.724 19.2491 13.5952 19.0016 14.2805C18.7484 14.9814 18.4587 15.553 18.0177 16.0239C17.3959 16.6877 16.5971 17.1587 15.7165 17.3816C15.4593 17.9713 15.0836 18.5054 14.6097 18.9493C14.1388 19.3903 13.5672 19.6799 12.8662 19.9332C12.181 20.1807 11.3098 20.4141 10.2105 20.7087L10.144 20.7265C9.04461 21.0211 8.17337 21.2545 7.45613 21.3828C6.7225 21.514 6.08266 21.5489 5.45435 21.4024C4.53943 21.1891 3.70832 20.7092 3.06611 20.0236C2.62508 19.5527 2.33542 18.9811 2.08222 18.2802C1.83468 17.5949 1.60124 16.7237 1.30667 15.6243L0.771222 13.626C0.47664 12.5266 0.243195 11.6554 0.114945 10.9382C-0.0162408 10.2046 -0.0511895 9.56472 0.0953127 8.93641C0.308642 8.02149 0.788486 7.19038 1.47417 6.54817C1.94505 6.10714 2.51664 5.81749 3.21758 5.56428C3.90283 5.31674 4.77404 5.0833 5.87341 4.78873L5.90665 4.77983C6.17112 4.70896 6.42134 4.64203 6.65825 4.57944C7.04986 3.18031 7.39448 2.19126 8.06611 1.47417C8.70831 0.788486 9.53943 0.308642 10.4543 0.0953127C11.0827 -0.0511895 11.7225 -0.0162408 12.4561 0.114945C13.1733 0.243194 14.0445 0.476636 15.1439 0.771215ZM6.20502 6.2528C5.11214 6.54571 4.32905 6.75764 3.7272 6.97505C3.11778 7.1952 2.75995 7.39907 2.49955 7.64296C2.0304 8.08237 1.70209 8.65103 1.55613 9.27703C1.47511 9.62449 1.47747 10.0363 1.59152 10.6742C1.70723 11.3212 1.92355 12.131 2.22902 13.271L2.74666 15.2029C3.05212 16.3429 3.26967 17.1523 3.49299 17.7705C3.71314 18.38 3.91701 18.7378 4.1609 18.9982C4.60031 19.4673 5.16897 19.7956 5.79496 19.9416C6.14242 20.0226 6.55425 20.0203 7.1921 19.9062C7.83915 19.7905 8.64893 19.5742 9.78894 19.2687C10.9289 18.9632 11.7384 18.7457 12.3566 18.5224C12.966 18.3022 13.3239 18.0984 13.5843 17.8545C13.7219 17.7256 13.8473 17.5857 13.9596 17.4365C13.7806 17.4112 13.5963 17.379 13.4057 17.3411C12.7339 17.2075 11.9269 16.9913 10.9308 16.7244L10.8734 16.709C9.77404 16.4144 8.90283 16.181 8.21758 15.9335C7.51664 15.6802 6.94505 15.3906 6.47416 14.9496C5.78849 14.3074 5.30864 13.4762 5.09531 12.5613C4.94881 11.933 4.98376 11.2932 5.11494 10.5595C5.2432 9.84232 5.47664 8.97112 5.77122 7.87174L6.20502 6.2528ZM12.1921 1.59152C11.5542 1.47747 11.1424 1.47511 10.795 1.55613C10.169 1.70209 9.60031 2.0304 9.1609 2.49955C8.72479 2.96518 8.45642 3.68452 7.9897 5.39323C7.91384 5.67093 7.83365 5.97023 7.74665 6.29488L7.22902 8.22673C6.92355 9.36674 6.70723 10.1765 6.59152 10.8236C6.47747 11.4614 6.47511 11.8732 6.55613 12.2207C6.70209 12.8467 7.0304 13.4154 7.49955 13.8548C7.75995 14.0987 8.11778 14.3025 8.7272 14.5227C9.34542 14.746 10.1549 14.9636 11.2949 15.269C12.3203 15.5438 13.0803 15.747 13.6982 15.8699C14.3135 15.9922 14.731 16.0223 15.0732 15.98C15.1476 15.9709 15.2191 15.9582 15.2889 15.9419C15.9149 15.7959 16.4835 15.4676 16.9229 14.9985C17.1668 14.7381 17.3707 14.3803 17.5908 13.7708C17.8142 13.1526 18.0317 12.3432 18.3372 11.2032L18.8548 9.2713C19.1603 8.13129 19.3766 7.32151 19.4923 6.67446C19.6064 6.03661 19.6087 5.62479 19.5277 5.27733C19.3817 4.65133 19.0534 4.08267 18.5843 3.64327C18.3239 3.39937 17.966 3.1955 17.3566 2.97535C16.7384 2.75203 15.9289 2.53448 14.7889 2.22902C13.6489 1.92355 12.8392 1.70723 12.1921 1.59152Z"
                  fill="currentColor"
                />
              </svg>
            </RouterLink>
            <button
              v-else
              type="button"
              class="admin-materials-category-section__icon-button"
              aria-label="Настройки"
            >
              <svg
                class="admin-materials-category-section__icon admin-materials-category-section__icon_gear"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M15.1439 0.771215L15.2104 0.789036C16.3098 1.08361 17.181 1.31704 17.8662 1.56458C18.5672 1.81779 19.1388 2.10744 19.6097 2.54847C20.2953 3.19068 20.7752 4.02179 20.9885 4.93671C21.135 5.56503 21.1001 6.20486 20.9689 6.93849C20.8406 7.65573 20.6072 8.52697 20.3126 9.62638L19.7771 11.6247C19.4826 12.724 19.2491 13.5952 19.0016 14.2805C18.7484 14.9814 18.4587 15.553 18.0177 16.0239C17.3959 16.6877 16.5971 17.1587 15.7165 17.3816C15.4593 17.9713 15.0836 18.5054 14.6097 18.9493C14.1388 19.3903 13.5672 19.6799 12.8662 19.9332C12.181 20.1807 11.3098 20.4141 10.2105 20.7087L10.144 20.7265C9.04461 21.0211 8.17337 21.2545 7.45613 21.3828C6.7225 21.514 6.08266 21.5489 5.45435 21.4024C4.53943 21.1891 3.70832 20.7092 3.06611 20.0236C2.62508 19.5527 2.33542 18.9811 2.08222 18.2802C1.83468 17.5949 1.60124 16.7237 1.30667 15.6243L0.771222 13.626C0.47664 12.5266 0.243195 11.6554 0.114945 10.9382C-0.0162408 10.2046 -0.0511895 9.56472 0.0953127 8.93641C0.308642 8.02149 0.788486 7.19038 1.47417 6.54817C1.94505 6.10714 2.51664 5.81749 3.21758 5.56428C3.90283 5.31674 4.77404 5.0833 5.87341 4.78873L5.90665 4.77983C6.17112 4.70896 6.42134 4.64203 6.65825 4.57944C7.04986 3.18031 7.39448 2.19126 8.06611 1.47417C8.70831 0.788486 9.53943 0.308642 10.4543 0.0953127C11.0827 -0.0511895 11.7225 -0.0162408 12.4561 0.114945C13.1733 0.243194 14.0445 0.476636 15.1439 0.771215ZM6.20502 6.2528C5.11214 6.54571 4.32905 6.75764 3.7272 6.97505C3.11778 7.1952 2.75995 7.39907 2.49955 7.64296C2.0304 8.08237 1.70209 8.65103 1.55613 9.27703C1.47511 9.62449 1.47747 10.0363 1.59152 10.6742C1.70723 11.3212 1.92355 12.131 2.22902 13.271L2.74666 15.2029C3.05212 16.3429 3.26967 17.1523 3.49299 17.7705C3.71314 18.38 3.91701 18.7378 4.1609 18.9982C4.60031 19.4673 5.16897 19.7956 5.79496 19.9416C6.14242 20.0226 6.55425 20.0203 7.1921 19.9062C7.83915 19.7905 8.64893 19.5742 9.78894 19.2687C10.9289 18.9632 11.7384 18.7457 12.3566 18.5224C12.966 18.3022 13.3239 18.0984 13.5843 17.8545C13.7219 17.7256 13.8473 17.5857 13.9596 17.4365C13.7806 17.4112 13.5963 17.379 13.4057 17.3411C12.7339 17.2075 11.9269 16.9913 10.9308 16.7244L10.8734 16.709C9.77404 16.4144 8.90283 16.181 8.21758 15.9335C7.51664 15.6802 6.94505 15.3906 6.47416 14.9496C5.78849 14.3074 5.30864 13.4762 5.09531 12.5613C4.94881 11.933 4.98376 11.2932 5.11494 10.5595C5.2432 9.84232 5.47664 8.97112 5.77122 7.87174L6.20502 6.2528ZM12.1921 1.59152C11.5542 1.47747 11.1424 1.47511 10.795 1.55613C10.169 1.70209 9.60031 2.0304 9.1609 2.49955C8.72479 2.96518 8.45642 3.68452 7.9897 5.39323C7.91384 5.67093 7.83365 5.97023 7.74665 6.29488L7.22902 8.22673C6.92355 9.36674 6.70723 10.1765 6.59152 10.8236C6.47747 11.4614 6.47511 11.8732 6.55613 12.2207C6.70209 12.8467 7.0304 13.4154 7.49955 13.8548C7.75995 14.0987 8.11778 14.3025 8.7272 14.5227C9.34542 14.746 10.1549 14.9636 11.2949 15.269C12.3203 15.5438 13.0803 15.747 13.6982 15.8699C14.3135 15.9922 14.731 16.0223 15.0732 15.98C15.1476 15.9709 15.2191 15.9582 15.2889 15.9419C15.9149 15.7959 16.4835 15.4676 16.9229 14.9985C17.1668 14.7381 17.3707 14.3803 17.5908 13.7708C17.8142 13.1526 18.0317 12.3432 18.3372 11.2032L18.8548 9.2713C19.1603 8.13129 19.3766 7.32151 19.4923 6.67446C19.6064 6.03661 19.6087 5.62479 19.5277 5.27733C19.3817 4.65133 19.0534 4.08267 18.5843 3.64327C18.3239 3.39937 17.966 3.1955 17.3566 2.97535C16.7384 2.75203 15.9289 2.53448 14.7889 2.22902C13.6489 1.92355 12.8392 1.70723 12.1921 1.59152Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <div class="admin-materials-category-section__stat">
            <button
              type="button"
              class="admin-materials-category-section__metric-link"
              aria-label="Пользователи"
              @click="emit('open-students')"
            >
              <img class="admin-materials-category-section__icon" :src="userIcon" alt="" aria-hidden="true" />
              <span class="admin-materials-category-section__stat-value">{{ usersCount }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="admin-materials-category-section__item-right">
        <div class="admin-materials-category-section__stat">
          <button type="button" class="admin-materials-category-section__icon-button" aria-label="Папки">
            <img class="admin-materials-category-section__icon" :src="folderIcon" alt="" aria-hidden="true" />
          </button>
          <span class="admin-materials-category-section__stat-value">{{ foldersCount }}</span>
        </div>

        <button
          type="button"
          class="admin-materials-category-section__accordion-toggle"
          :class="{ 'admin-materials-category-section__accordion-toggle_expanded': expanded }"
          :aria-expanded="expanded"
          :aria-controls="panelId"
          :aria-label="toggleLabel"
          @click="toggleExpanded"
        >
          <span class="admin-materials-category-section__accordion-toggle__glyph-wrap">
            <svg
              class="admin-materials-category-section__accordion-toggle__glyph"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>

    <div
      :id="panelId"
      class="admin-materials-category-section__panel-wrap"
      :class="{ 'admin-materials-category-section__panel-wrap_expanded': expanded }"
      role="region"
      :aria-label="`Материалы: ${title}`"
    >
      <div class="admin-materials-category-section__panel-inner" :inert="!expanded" :aria-hidden="!expanded">
        <div
          class="admin-materials-category-section__panel"
          :style="{ '--admin-panel-border': borderColor }"
        >
          <div class="admin-materials-category-section__grid">
            <AdminMaterialCourseCard
              v-for="card in cards"
              :key="card.id"
              :accent-key="accentKey"
              :title="card.title"
              :topics-count="card.topicsCount"
              :users-count="card.usersCount"
              :deadline-suffix="card.deadlineSuffix"
              @edit-click="emit('edit-card', card.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.admin-materials-category-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
}

.admin-materials-category-section__trigger {
  --admin-row-border: var(--black);
  border: var(--border-2) solid var(--admin-row-border);
  border-radius: var(--radius-10);
  padding: var(--sp-20) 30px;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-20);

  .admin-materials-category-section__stat-value {
    font-size: var(--size-20);
  }
}

.admin-materials-category-section__item-left {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
}

.admin-materials-category-section__item-title {
  margin: 0;
  min-width: var(--size-100);
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-25);
  color: var(--black);
}

.admin-materials-category-section__stats {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
}

.admin-materials-category-section__item-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.admin-materials-category-section__stat {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
}

.admin-materials-category-section__stat-value {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-25);
  color: var(--black);
}

.admin-materials-category-section__icon-button {
  width: var(--size-24);
  height: var(--size-24);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--black);
  text-decoration: none;
  transition: color 0.2s ease;
  background: none;
  border: none;
  padding: 0;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(var(--sp-6) * -1);
    height: var(--border-2);
    background-color: var(--admin-row-border);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.25s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}

.admin-materials-category-section__metric-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(var(--sp-6) * -1);
    height: var(--border-2);
    background-color: var(--admin-row-border);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.25s ease;
  }

  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: var(--radius-sm);
  }
}

.admin-materials-category-section__icon {
  width: var(--size-20);
  height: var(--size-20);
  display: block;
  flex-shrink: 0;
  color: #010307;
}

.admin-materials-category-section__icon_gear {
  width: 22px;
  height: 22px;
}

.admin-materials-category-section__accordion-toggle {
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: var(--border-2) solid var(--admin-row-border);
  border-radius: 16px;
  background-color: var(--white);
  color: #010307;
  cursor: pointer;
  transition:
    background-color 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    filter 0.22s ease;

  &:hover:not(.admin-materials-category-section__accordion-toggle_expanded) {
    background-color: var(--admin-row-border);
    border-color: var(--admin-row-border);
    color: var(--white);

    .admin-materials-category-section__accordion-toggle__glyph-wrap {
      transform: rotate(45deg);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &_expanded {
    background-color: var(--admin-row-border);
    border-color: var(--admin-row-border);
    color: var(--white);

    .admin-materials-category-section__accordion-toggle__glyph-wrap {
      transform: rotate(45deg);
    }

    &:hover {
      filter: brightness(0.92);

      .admin-materials-category-section__accordion-toggle__glyph-wrap {
        transform: rotate(52deg) scale(1.06);
      }
    }
  }

  &__glyph-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    transition: transform 0.22s ease;
  }

  &__glyph {
    display: block;
  }
}

.admin-materials-category-section__panel-wrap {
  display: grid;
  grid-template-rows: 0fr;
  margin-top: 0;
  transition:
    grid-template-rows 0.28s ease,
    margin-top 0.28s ease;
  contain: layout;

  &_expanded {
    grid-template-rows: 1fr;
    margin-top: var(--sp-20);
  }
}

.admin-materials-category-section__panel-inner {
  min-height: 0;
  overflow: hidden;
}

.admin-materials-category-section__panel {
  --admin-panel-border: var(--black);
  border: var(--border-2) solid var(--admin-panel-border);
  border-radius: var(--radius-10);
  background-color: var(--fon-bloka);
  padding: var(--sp-20);
  box-sizing: border-box;
}

.admin-materials-category-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--sp-20);
}

@media (max-width: 1023px) {
  .admin-materials-category-section__trigger {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-materials-category-section__item-right {
    width: 100%;
    justify-content: space-between;
  }

  .admin-materials-category-section__item-title,
  .admin-materials-category-section__stat-value {
    font-size: var(--size-25);
  }
}
</style>
