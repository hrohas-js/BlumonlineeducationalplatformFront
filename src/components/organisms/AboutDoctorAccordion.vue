<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type AboutDoctorTextNode =
  | {
      type: 'paragraph'
      text: string
      strong?: boolean
    }
  | {
      type: 'list'
      items: string[]
    }

export interface AboutDoctorAccordionItem {
  title: string
  imageSrc: string
  imageAlt: string
  content: AboutDoctorTextNode[]
}

const props = defineProps<{
  items: AboutDoctorAccordionItem[]
}>()

const activeIndex = ref<number | null>(null)
const displayImageIndex = ref(0)

const visibleItem = computed(() => {
  if (!props.items.length) return null
  return props.items[displayImageIndex.value] ?? props.items[0]
})

const toggleItem = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index
}

watch(
  activeIndex,
  (nextIndex) => {
    if (nextIndex !== null) {
      displayImageIndex.value = nextIndex
    }
  },
)
</script>

<template>
  <section class="about-doctor-accordion">
    <Transition name="about-doctor-accordion__image-transition" mode="out-in">
      <img
        v-if="visibleItem"
        :key="visibleItem.imageSrc"
        class="about-doctor-accordion__image"
        :src="visibleItem.imageSrc"
        :alt="visibleItem.imageAlt"
      />
    </Transition>

    <div class="about-doctor-accordion__items">
      <article
        v-for="(item, index) in items"
        :key="item.title"
        class="about-doctor-accordion__item"
      >
        <button
          type="button"
          class="about-doctor-accordion__trigger"
          :class="{ 'about-doctor-accordion__trigger_active': activeIndex === index }"
          @click="toggleItem(index)"
        >
          <span class="about-doctor-accordion__icon" aria-hidden="true">
            <svg v-if="activeIndex === index" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="1" y="1" width="30" height="30" rx="15" fill="var(--knopka)" />
              <rect x="1" y="1" width="30" height="30" rx="15" stroke="var(--knopka)" stroke-width="2" />
              <path d="M11.7573 11.7573L20.2426 20.2426" stroke="var(--white)" stroke-width="2" stroke-linecap="round" />
              <path d="M20.4547 11.9695L11.9694 20.4548" stroke="var(--white)" stroke-width="2" stroke-linecap="round" />
            </svg>

            <svg v-else width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect
                class="about-doctor-accordion__icon-rect-fill"
                x="1"
                y="1"
                width="30"
                height="30"
                rx="15"
              />
              <rect x="1" y="1" width="30" height="30" rx="15" stroke="var(--knopka)" stroke-width="2" />
              <path
                class="about-doctor-accordion__icon-mark"
                d="M16 10V22"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                class="about-doctor-accordion__icon-mark"
                d="M21.9999 16.3H9.99994"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>

          <span class="about-doctor-accordion__title">{{ item.title }}</span>
        </button>

        <Transition name="about-doctor-accordion__cloud-transition">
          <div
            v-if="activeIndex === index"
            class="about-doctor-accordion__cloud"
          >
            <template v-for="(node, nodeIndex) in item.content" :key="`${item.title}-${nodeIndex}`">
              <p
                v-if="node.type === 'paragraph'"
                class="about-doctor-accordion__paragraph"
                :class="{ 'about-doctor-accordion__paragraph_strong': node.strong }"
              >
                {{ node.text }}
              </p>

              <ul v-else class="about-doctor-accordion__list">
                <li
                  v-for="(listItem, listIndex) in node.items"
                  :key="`${item.title}-list-${listIndex}`"
                  class="about-doctor-accordion__list-item"
                >
                  {{ listItem }}
                </li>
              </ul>
            </template>
          </div>
        </Transition>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.about-doctor-accordion {
  margin-top: var(--sp-40);
  display: flex;
  align-items: flex-start;
  gap: var(--sp-40);

  &__image {
    width: var(--size-403);
    height: var(--size-410);
    border-radius: var(--radius-20);
    object-fit: cover;
    flex-shrink: 0;
    will-change: opacity, transform;
  }

  &__items {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--sp-10);
  }

  &__trigger {
    width: 100%;
    min-height: var(--size-52);
    border: 0;
    border-radius: var(--radius-10);
    background: var(--osnovnoy-fon);
    padding: var(--sp-10) var(--sp-20);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  &__title {
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-25);
    text-align: right;
    color: var(--osnovnoy-tekst);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  &__icon-rect-fill {
    fill: transparent;
    transition: fill 0.2s ease;
  }

  &__icon-mark {
    stroke: var(--osnovnoy-tekst);
    transition: stroke 0.2s ease;
  }

  &__icon rect[stroke] {
    transition: stroke 0.2s ease;
  }

  &__trigger:hover {
    .about-doctor-accordion__icon-rect-fill {
      fill: var(--knopka);
    }

    .about-doctor-accordion__icon-mark {
      stroke: var(--white);
    }
  }

  &__trigger:hover &__icon rect[stroke] {
    stroke: var(--knopka);
  }

  &__cloud {
    margin-top: var(--sp-10);
    border-radius: var(--radius-10);
    background: var(--osnovnoy-fon);
    padding: var(--sp-10) var(--sp-20);
    transform-origin: top;
    will-change: transform, opacity;
  }

  &__cloud-transition-enter-active,
  &__cloud-transition-leave-active {
    transition: opacity 0.24s ease, transform 0.24s ease;
    pointer-events: none;
  }

  &__cloud-transition-enter-from,
  &__cloud-transition-leave-to {
    opacity: 0;
    transform: translateY(-6px) scaleY(0.96);
  }

  &__cloud-transition-enter-to,
  &__cloud-transition-leave-from {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }

  &__image-transition-enter-active,
  &__image-transition-leave-active {
    transition: opacity 0.28s ease, transform 0.28s ease;
  }

  &__image-transition-enter-from,
  &__image-transition-leave-to {
    opacity: 0;
    transform: translateY(4px) scale(0.985);
  }

  &__image-transition-enter-to,
  &__image-transition-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  &__paragraph {
    margin: 0;
    font-family: var(--font-family);
    font-style: italic;
    font-weight: var(--font-medium);
    font-size: var(--fs-15);
    color: var(--osnovnoy-tekst);

    &_strong {
      font-weight: var(--font-semi-bold);
    }
  }

  &__paragraph + &__paragraph,
  &__paragraph + &__list,
  &__list + &__paragraph {
    margin-top: var(--sp-15);
  }

  &__list {
    margin: 0;
    padding-inline-start: var(--sp-20);
  }

  &__list-item {
    margin-left: var(--size-5);
    font-family: var(--font-family);
    font-style: italic;
    font-weight: var(--font-medium);
    font-size: var(--fs-15);
    color: var(--osnovnoy-tekst);
  }

  @media (max-width: 1024px) {
    flex-direction: column;

    &__image {
      width: 100%;
      max-width: 403px;
      height: auto;
      aspect-ratio: 403 / 410;
    }
  }
}
</style>
