<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

export interface AdminProductExtensionTopicOption {
  id: string
  label: string
}

export interface AdminProductExtensionDurationOption {
  id: string
  label: string
}

interface Props {
  topicOptions: AdminProductExtensionTopicOption[]
  durationOptions?: AdminProductExtensionDurationOption[]
}

const props = withDefaults(defineProps<Props>(), {
  durationOptions: () => [
    { id: '1m', label: 'Продление на 1 месяц (с момента оплаты)' },
    { id: '2m', label: 'Продление на 2 месяца (с момента оплаты)' },
    { id: '6m', label: 'Продление на 6 месяцев (с момента оплаты)' },
  ],
})

const paymentLink = defineModel<string>('paymentLink', { required: true })

interface Emits {
  (e: 'select-topic', payload: { topicId: string }): void
  (e: 'select-duration', payload: { durationId: string }): void
  (e: 'create'): void
}

const emit = defineEmits<Emits>()

const topicOpen = ref(false)
const durationOpen = ref(false)
const selectedTopicId = ref<string | null>(null)
const selectedDurationId = ref<string | null>(null)

const topicSelectorEl = ref<HTMLElement | null>(null)
const durationSelectorEl = ref<HTMLElement | null>(null)

const topicPillPlaceholder = 'Выбрать тему (модуль)'
const durationPillPlaceholder = 'Выбрать количество времени'

const topicPillLabel = computed(() => {
  const id = selectedTopicId.value
  if (!id) return topicPillPlaceholder
  const opt = props.topicOptions.find((o) => o.id === id)
  return opt?.label ?? topicPillPlaceholder
})

const durationPillLabel = computed(() => {
  const id = selectedDurationId.value
  if (!id) return durationPillPlaceholder
  const opt = props.durationOptions.find((o) => o.id === id)
  return opt?.label ?? durationPillPlaceholder
})

const toggleTopic = () => {
  durationOpen.value = false
  topicOpen.value = !topicOpen.value
}

const toggleDuration = () => {
  topicOpen.value = false
  durationOpen.value = !durationOpen.value
}

const selectTopic = (opt: AdminProductExtensionTopicOption) => {
  selectedTopicId.value = opt.id
  emit('select-topic', { topicId: opt.id })
  topicOpen.value = false
}

const selectDuration = (opt: AdminProductExtensionDurationOption) => {
  selectedDurationId.value = opt.id
  emit('select-duration', { durationId: opt.id })
  durationOpen.value = false
}

const onDocumentPointerDown = (e: MouseEvent) => {
  if (!topicOpen.value && !durationOpen.value) return
  const n = e.target as Node
  if (topicSelectorEl.value?.contains(n)) return
  if (durationSelectorEl.value?.contains(n)) return
  topicOpen.value = false
  durationOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
</script>

<template>
  <section class="admin-product-extension-section">
    <hr class="admin-product-extension-section__rule" />
    <h2 class="admin-product-extension-section__title">Продление тем (модулей)</h2>

    <div class="admin-product-extension-section__selectors">
      <div ref="topicSelectorEl" class="admin-product-extension-section__selector">
        <button
          type="button"
          class="admin-product-extension-section__pill"
          :aria-expanded="topicOpen"
          aria-haspopup="listbox"
          :aria-controls="topicOpen ? 'admin-product-extension-topic-listbox' : undefined"
          @click.stop="toggleTopic"
        >
          <span class="admin-product-extension-section__pill-handle" aria-hidden="true">
            <svg class="admin-product-extension-section__pill-handle-svg" viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="#178ef0" />
              <path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <span
            class="admin-product-extension-section__pill-label"
            :title="topicPillLabel"
          >{{ topicPillLabel }}</span>
        </button>
        <div
          v-show="topicOpen"
          id="admin-product-extension-topic-listbox"
          class="admin-product-extension-section__dropdown admin-product-extension-section__dropdown_topics"
          role="listbox"
        >
          <button
            v-for="opt in props.topicOptions"
            :key="opt.id"
            type="button"
            class="admin-product-extension-section__dropdown-row"
            :class="{ 'admin-product-extension-section__dropdown-row_active': opt.id === selectedTopicId }"
            role="option"
            :aria-selected="opt.id === selectedTopicId"
            @click.stop="selectTopic(opt)"
          >
            <span class="admin-product-extension-section__dropdown-row-icon" aria-hidden="true">
              <svg class="admin-product-extension-section__topic-arrow" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 17 17 7M17 7H11M17 7v6"
                />
              </svg>
            </span>
            <span class="admin-product-extension-section__dropdown-row-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <div ref="durationSelectorEl" class="admin-product-extension-section__selector">
        <button
          type="button"
          class="admin-product-extension-section__pill"
          :aria-expanded="durationOpen"
          aria-haspopup="listbox"
          :aria-controls="durationOpen ? 'admin-product-extension-duration-listbox' : undefined"
          @click.stop="toggleDuration"
        >
          <span class="admin-product-extension-section__pill-handle" aria-hidden="true">
            <svg class="admin-product-extension-section__pill-handle-svg" viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="#178ef0" />
              <path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <span
            class="admin-product-extension-section__pill-label"
            :title="durationPillLabel"
          >{{ durationPillLabel }}</span>
        </button>
        <div
          v-show="durationOpen"
          id="admin-product-extension-duration-listbox"
          class="admin-product-extension-section__dropdown admin-product-extension-section__dropdown_duration"
          role="listbox"
        >
          <button
            v-for="opt in props.durationOptions"
            :key="opt.id"
            type="button"
            class="admin-product-extension-section__dropdown-row"
            :class="{ 'admin-product-extension-section__dropdown-row_active': opt.id === selectedDurationId }"
            role="option"
            :aria-selected="opt.id === selectedDurationId"
            @click.stop="selectDuration(opt)"
          >
            <span class="admin-product-extension-section__dropdown-row-icon" aria-hidden="true">
              <svg class="admin-product-extension-section__duration-clock" viewBox="0 0 25 25" width="25" height="25">
                <circle cx="12.5" cy="12.5" r="9" fill="none" stroke="currentColor" stroke-width="1.5" />
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  d="M12.5 12.5V7.5M12.5 12.5l4 2.5"
                />
              </svg>
            </span>
            <span class="admin-product-extension-section__dropdown-row-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="admin-product-extension-section__payment">
      <span class="admin-product-extension-section__payment-label">Ссылка на оплату</span>
      <div class="admin-product-extension-section__payment-field">
        <input
          v-model="paymentLink"
          class="admin-product-extension-section__payment-input"
          type="url"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="admin-product-extension-section__create-wrap">
      <BaseButton
        class="admin-product-extension-section__create"
        variant="outline"
        size="medium"
        text="Создать"
        @click="emit('create')"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-product-extension-section {
  /* Поверх следующих секций панели, когда выпадающий список absolute выходит за высоту блока */
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-extension-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-extension-section__title {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-25);
  line-height: normal;
  color: var(--black);
}

.admin-product-extension-section__selectors {
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
  width: 100%;
  max-width: 520px;
}

.admin-product-extension-section__selector {
  position: relative;
  align-self: flex-start;
  width: 100%;
}

.admin-product-extension-section__pill {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-20);
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  padding: var(--sp-10) var(--sp-20);
  border: none;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }
}

.admin-product-extension-section__pill-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.admin-product-extension-section__pill-handle {
  display: inline-flex;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
}

.admin-product-extension-section__pill-handle-svg {
  display: block;
}

.admin-product-extension-section__dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: var(--sp-20);
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  min-width: 100%;
  width: max-content;
  max-width: min(520px, calc(100vw - 48px));
}

.admin-product-extension-section__dropdown-row {
  display: flex;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  text-align: left;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
    border-radius: 4px;
  }
}

.admin-product-extension-section__dropdown-row-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #010307;
}

.admin-product-extension-section__dropdown_topics {
  background-color: var(--white);

  .admin-product-extension-section__dropdown-row:hover,
  .admin-product-extension-section__dropdown-row:focus-visible {
    color: var(--text-accent);

    .admin-product-extension-section__dropdown-row-icon {
      color: var(--text-accent);
    }
  }

  .admin-product-extension-section__dropdown-row_active {
    color: var(--text-accent);

    .admin-product-extension-section__dropdown-row-icon {
      color: var(--text-accent);
    }
  }
}

.admin-product-extension-section__dropdown_duration {
  background-color: var(--white);

  .admin-product-extension-section__dropdown-row {
    align-items: flex-start;
  }

  .admin-product-extension-section__dropdown-row-label {
    white-space: normal;
    overflow-wrap: break-word;
    min-width: 0;
  }

  .admin-product-extension-section__dropdown-row:hover,
  .admin-product-extension-section__dropdown-row:focus-visible {
    color: var(--text-accent);

    .admin-product-extension-section__dropdown-row-icon {
      color: var(--text-accent);
    }
  }

  .admin-product-extension-section__dropdown-row_active {
    color: var(--text-accent);

    .admin-product-extension-section__dropdown-row-icon {
      color: var(--text-accent);
    }
  }
}

.admin-product-extension-section__dropdown-row-label {
  white-space: nowrap;
}

@media (max-width: 639px) {
  .admin-product-extension-section__dropdown-row-label {
    white-space: normal;
  }
}

.admin-product-extension-section__payment {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-extension-section__payment-label {
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
  white-space: nowrap;
}

.admin-product-extension-section__payment-field {
  flex: 1 1 280px;
  max-width: 399px;
  min-height: 44px;
  border-radius: var(--radius-10);
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 0 var(--sp-10);
  display: flex;
  align-items: center;
}

.admin-product-extension-section__payment-input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
  outline: none;
  padding: var(--sp-10) 0;
}

.admin-product-extension-section__create-wrap {
  width: 100%;
}

:deep(.admin-product-extension-section__create.base-button) {
  border-radius: var(--radius-10);
  border: 2px solid #178ef0;
  min-width: 106px;
}

:deep(.admin-product-extension-section__create.base-button_outline:hover:not(.base-button_disabled)) {
  background-color: #178ef0;
  border-color: #178ef0;
  color: var(--white);
}

@media (max-width: 1023px) {
  .admin-product-extension-section__title {
    font-size: var(--size-15);
  }

  .admin-product-extension-section__pill {
    font-size: var(--size-15);
  }

  .admin-product-extension-section__dropdown-row {
    font-size: var(--size-15);
  }

  .admin-product-extension-section__payment-label {
    font-size: var(--size-15);
  }

  .admin-product-extension-section__payment-input {
    font-size: var(--size-15);
  }
}
</style>
