<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const MIN_INTERVAL_MS = 8000
const MAX_INTERVAL_MS = 12000
const POSITION_MIN_PCT = 12
const POSITION_MAX_PCT = 75

const props = withDefaults(
  defineProps<{
    text: string
    active?: boolean
  }>(),
  {
    active: true,
  },
)

const topPct = ref(randomPosition())
const leftPct = ref(randomPosition())

let scheduleTimer: ReturnType<typeof setTimeout> | null = null

function randomPosition(): number {
  return POSITION_MIN_PCT + Math.random() * (POSITION_MAX_PCT - POSITION_MIN_PCT)
}

function randomInterval(): number {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
}

function moveWatermark() {
  topPct.value = randomPosition()
  leftPct.value = randomPosition()
}

function clearSchedule() {
  if (scheduleTimer) {
    clearTimeout(scheduleTimer)
    scheduleTimer = null
  }
}

function scheduleNextMove() {
  clearSchedule()
  if (!props.active) return
  scheduleTimer = setTimeout(() => {
    moveWatermark()
    scheduleNextMove()
  }, randomInterval())
}

function startMovement() {
  moveWatermark()
  scheduleNextMove()
}

function stopMovement() {
  clearSchedule()
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      startMovement()
    } else {
      stopMovement()
    }
  },
)

onMounted(() => {
  if (props.active) {
    startMovement()
  }
})

onUnmounted(() => {
  stopMovement()
})
</script>

<template>
  <span
    v-show="active"
    class="lesson-video-watermark"
    :style="{ top: `${topPct}%`, left: `${leftPct}%` }"
    aria-hidden="true"
  >
    {{ text }}
  </span>
</template>

<style lang="scss" scoped>
.lesson-video-watermark {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  font-family: var(--second-family);
  font-weight: var(--font-semi-bold);
  font-size: clamp(11px, 1.4vw, 14px);
  color: var(--white);
  opacity: 0.18;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  transform: rotate(-12deg);
  transition:
    top 1.2s ease,
    left 1.2s ease,
    opacity 0.4s ease;
}
</style>
