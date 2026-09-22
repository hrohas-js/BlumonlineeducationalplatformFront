<script setup lang="ts">
import { ref } from 'vue'

const title = defineModel<string>('title', { required: true })

const props = withDefaults(
  defineProps<{
    canMoveUp?: boolean
    canMoveDown?: boolean
    disabled?: boolean
    defaultOpen?: boolean
  }>(),
  {
    canMoveUp: false,
    canMoveDown: false,
    disabled: false,
    defaultOpen: false,
  },
)

const emit = defineEmits<{
  'title-commit': [title: string]
  'move-up': []
  'move-down': []
  delete: []
}>()

const open = ref(props.defaultOpen)
const titleAtFocus = ref(title.value)

const toggle = () => {
  if (props.disabled) return
  open.value = !open.value
}

function onTitleFocus() {
  titleAtFocus.value = title.value
}

function onTitleBlur() {
  const next = title.value.trim()
  if (!next || next === titleAtFocus.value.trim()) {
    if (!next) title.value = titleAtFocus.value
    return
  }
  emit('title-commit', next)
}
</script>

<template>
  <div class="admin-topic-subsection-block">
    <div class="admin-topic-subsection-block__toolbar">
      <div class="admin-topic-subsection-block__chip">
        <button
          type="button"
          class="admin-topic-subsection-block__toggle"
          :aria-expanded="open ? 'true' : 'false'"
          :disabled="disabled"
          @click="toggle"
        >
          <span class="admin-topic-subsection-block__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="#178EF0" stroke-width="1.5" />
              <path
                v-if="!open"
                d="M10 6V14M6 10H14"
                stroke="#178EF0"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path v-else d="M6 10H14" stroke="#178EF0" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
        </button>
        <input
          v-model="title"
          class="admin-topic-subsection-block__title"
          type="text"
          :disabled="disabled"
          autocomplete="off"
          aria-label="Название подраздела"
          @focus="onTitleFocus"
          @blur="onTitleBlur"
          @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
        />
      </div>
      <div class="admin-topic-subsection-block__actions">
        <button
          type="button"
          class="admin-topic-subsection-block__action"
          :disabled="disabled || !canMoveUp"
          aria-label="Переместить подраздел вверх"
          @click="emit('move-up')"
        >
          ↑
        </button>
        <button
          type="button"
          class="admin-topic-subsection-block__action"
          :disabled="disabled || !canMoveDown"
          aria-label="Переместить подраздел вниз"
          @click="emit('move-down')"
        >
          ↓
        </button>
        <button
          type="button"
          class="admin-topic-subsection-block__action admin-topic-subsection-block__action_danger"
          :disabled="disabled"
          aria-label="Удалить подраздел"
          @click="emit('delete')"
        >
          Удалить
        </button>
      </div>
    </div>
    <div v-if="open" class="admin-topic-subsection-block__body">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-topic-subsection-block {
  display: flex;
  flex-direction: column;
  gap: var(--sp-16);
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.admin-topic-subsection-block__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-10);
  min-width: 0;
}

.admin-topic-subsection-block__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-10);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  background: var(--osnovnoy-fon);
  border-radius: var(--radius-10);
  padding: var(--sp-8) var(--sp-16);
}

.admin-topic-subsection-block__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.admin-topic-subsection-block__title {
  min-width: 0;
  flex: 1;
  width: 180px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-15);
  color: var(--osnovnoy-tekst);
  outline: none;

  &:focus-visible {
    box-shadow: inset 0 -1px 0 var(--text-accent);
  }
}

.admin-topic-subsection-block__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-8);
}

.admin-topic-subsection-block__action {
  margin: 0;
  padding: var(--sp-4) var(--sp-10);
  border: var(--border-1) solid var(--dopolnitelnyy-tekst);
  border-radius: var(--radius-10);
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--size-13);
  color: var(--dopolnitelnyy-tekst);
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &_danger {
    color: var(--danger);
    border-color: var(--danger);
  }
}

.admin-topic-subsection-block__body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  min-width: 0;
}

@media (max-width: 1023px) {
  .admin-topic-subsection-block__title {
    font-size: var(--size-13);
  }

  .admin-topic-subsection-block__chip {
    width: 100%;
  }
}
</style>
