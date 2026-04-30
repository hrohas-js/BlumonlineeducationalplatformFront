<script setup lang="ts">
import { computed } from 'vue'

type InfoTableTone = '#f07917' | '#178ef0' | '#0098a3' | '#b842ef'

const props = withDefaults(
  defineProps<{
    label: string
    tone: InfoTableTone
    isStudentName?: boolean
    isActive?: boolean
  }>(),
  {
    isStudentName: false,
    isActive: false,
  },
)

const emit = defineEmits<{
  click: []
}>()

const toneStyle = computed<Record<string, string>>(() => ({
  '--home-profile-info-table-item-tone': props.isStudentName ? '#f07917' : props.tone,
}))
</script>

<template>
  <div
    v-if="props.isStudentName"
    class="home-profile-info-table-item home-profile-info-table-item_student-name"
    :style="toneStyle"
  >
    {{ props.label }}
  </div>

  <button
    v-else
    type="button"
    class="home-profile-info-table-item home-profile-info-table-item_interactive"
    :class="{ 'home-profile-info-table-item_active': props.isActive }"
    :style="toneStyle"
    @click="emit('click')"
  >
    {{ props.label }}
  </button>
</template>

<style lang="scss" scoped>
.home-profile-info-table-item {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--border-2) solid var(--home-profile-info-table-item-tone);
  border-radius: var(--radius-10);
  padding: var(--sp-10);
  background-color: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-medium);
  font-size: var(--size-20);
  text-align: center;
  color: var(--black);
  transition: background-color 0.2s ease, color 0.2s ease;

  &_interactive {
    cursor: pointer;
  }

  &_interactive:hover,
  &_interactive#{&}_active {
    background-color: var(--home-profile-info-table-item-tone);
    color: var(--white);
  }

  &_student-name {
    font-weight: var(--font-semi-bold);
    cursor: default;
  }

  @media (max-width: 539px) {
    display: flex;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
