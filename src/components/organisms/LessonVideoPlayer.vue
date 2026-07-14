<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  faCompress,
  faExpand,
  faGear,
  faPause,
  faPlay,
  faRotateLeft,
  faRotateRight,
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons'
import LessonVideoWatermarkOverlay from '@/components/molecules/LessonVideoWatermarkOverlay.vue'

export interface LessonVideoQuality {
  label: string
  src: string
}

interface Props {
  src: string
  poster?: string
  qualities?: LessonVideoQuality[]
  watermarkText?: string
}

const props = withDefaults(defineProps<Props>(), {
  poster: undefined,
  qualities: undefined,
  watermarkText: undefined,
})

const rootRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const progressTrackRef = ref<HTMLElement | null>(null)
const volumeTrackRef = ref<HTMLElement | null>(null)
const speedTriggerRef = ref<HTMLElement | null>(null)
const qualityTriggerRef = ref<HTMLElement | null>(null)
const speedMenuRef = ref<HTMLElement | null>(null)
const qualityMenuRef = ref<HTMLElement | null>(null)
const volumeWrapRef = ref<HTMLElement | null>(null)

type OverlayFeedback = 'play' | 'pause' | 'rewind' | 'forward' | null

const VOLUME_CURVE_EXP = 3
const DOUBLE_TAP_MS = 300
const TAP_ZONE_LEFT = 0.4
const TAP_ZONE_RIGHT = 0.6
const TAP_X_TOLERANCE = 0.15
const OVERLAY_HIDE_MS = 800

const paused = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const volumeBeforeMute = ref(1)
const muted = ref(false)
const playbackRate = ref(1)
const overlayFeedback = ref<OverlayFeedback>(null)
const openMenu = ref<'speed' | 'quality' | null>(null)
const volumePopoverOpen = ref(false)
const closeVolumeAfterDrag = ref(false)
const fullscreenHint = ref(false)
const isFullscreen = ref(false)
const draggingProgress = ref(false)
const draggingVolume = ref(false)

const activeQualityIndex = ref(0)

const qualitiesList = computed(() => props.qualities ?? [])

const hasQualityMenu = computed(() => qualitiesList.value.length >= 2)

const currentSrc = computed(() => {
  if (hasQualityMenu.value && qualitiesList.value[activeQualityIndex.value]) {
    return qualitiesList.value[activeQualityIndex.value].src
  }
  return props.src
})

const SPEED_OPTIONS: { label: string; value: number }[] = [
  { label: '0.5', value: 0.5 },
  { label: 'Стандарт', value: 1 },
  { label: '1.25', value: 1.25 },
  { label: '1.5', value: 1.5 },
  { label: '2.0', value: 2 },
]

const progressPct = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
})

const speedLabel = computed(() => {
  const r = playbackRate.value
  if (r === 1) return '1х'
  return `${String(r).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}х`
})

const volumeSliderPct = computed(() => {
  if (muted.value) return 0
  return volumeToSliderRatio(volume.value) * 100
})

let hintTimer: ReturnType<typeof setTimeout> | null = null
let overlayTimer: ReturnType<typeof setTimeout> | null = null
let singleTapTimer: ReturnType<typeof setTimeout> | null = null
let lastTapAt = 0
let lastTapX = 0

function sliderRatioToVolume(ratio: number): number {
  return Math.pow(ratio, VOLUME_CURVE_EXP)
}

function volumeToSliderRatio(vol: number): number {
  return Math.pow(vol, 1 / VOLUME_CURVE_EXP)
}

function clearOverlayTimers() {
  if (overlayTimer) {
    clearTimeout(overlayTimer)
    overlayTimer = null
  }
  if (singleTapTimer) {
    clearTimeout(singleTapTimer)
    singleTapTimer = null
  }
}

function showOverlayFeedback(type: OverlayFeedback) {
  overlayFeedback.value = type
  if (overlayTimer) clearTimeout(overlayTimer)
  overlayTimer = setTimeout(() => {
    overlayFeedback.value = null
    overlayTimer = null
  }, OVERLAY_HIDE_MS)
}

function handleSingleTap() {
  const v = videoRef.value
  const wasPaused = v?.paused ?? true
  togglePlay()
  showOverlayFeedback(wasPaused ? 'play' : 'pause')
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function syncFromVideo() {
  const v = videoRef.value
  if (!v) return
  paused.value = v.paused
  currentTime.value = v.currentTime
  duration.value = Number.isFinite(v.duration) ? v.duration : 0
  volume.value = v.volume
  muted.value = v.muted
  playbackRate.value = v.playbackRate
  if (!v.muted && v.volume > 0) {
    volumeBeforeMute.value = v.volume
  }
}

function togglePlay() {
  const v = videoRef.value
  if (!v) return
  if (v.paused) {
    void v.play().catch(() => {
      /* autoplay / decode */
    })
  } else {
    v.pause()
  }
}

function seekBy(delta: number) {
  const v = videoRef.value
  if (!v || !duration.value) return
  v.currentTime = Math.min(duration.value, Math.max(0, v.currentTime + delta))
}

function seekFromRatio(ratio: number) {
  const v = videoRef.value
  if (!v || !duration.value) return
  v.currentTime = Math.min(duration.value, Math.max(0, ratio * duration.value))
}

function onProgressPointerDown(e: PointerEvent) {
  if (!progressTrackRef.value || !duration.value) return
  draggingProgress.value = true
  progressTrackRef.value.setPointerCapture(e.pointerId)
  updateProgressFromEvent(e)
}

function onProgressPointerMove(e: PointerEvent) {
  if (!draggingProgress.value) return
  updateProgressFromEvent(e)
}

function onProgressPointerUp(e: PointerEvent) {
  if (!draggingProgress.value) return
  draggingProgress.value = false
  try {
    progressTrackRef.value?.releasePointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

function updateProgressFromEvent(e: PointerEvent) {
  const el = progressTrackRef.value
  if (!el || !duration.value) return
  const rect = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  seekFromRatio(ratio)
}

function setVolumeFromClientY(clientY: number) {
  const el = volumeTrackRef.value
  const v = videoRef.value
  if (!el || !v) return
  const rect = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height))
  if (ratio === 0) {
    v.muted = true
    v.volume = 0
  } else {
    const vol = sliderRatioToVolume(ratio)
    v.volume = vol
    v.muted = false
    volumeBeforeMute.value = vol
  }
  volume.value = v.volume
  muted.value = v.muted
}

function onVolumeTrackPointerDown(e: PointerEvent) {
  draggingVolume.value = true
  volumeTrackRef.value?.setPointerCapture(e.pointerId)
  setVolumeFromClientY(e.clientY)
}

function onVolumeTrackPointerMove(e: PointerEvent) {
  if (!draggingVolume.value) return
  setVolumeFromClientY(e.clientY)
}

function onVolumeTrackPointerUp(e: PointerEvent) {
  if (!draggingVolume.value) return
  draggingVolume.value = false
  try {
    volumeTrackRef.value?.releasePointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
  if (closeVolumeAfterDrag.value) {
    closeVolumeAfterDrag.value = false
    volumePopoverOpen.value = false
  }
}

function toggleMute() {
  const v = videoRef.value
  if (!v) return
  if (v.muted) {
    v.muted = false
    v.volume = Math.max(volumeBeforeMute.value, 0.05)
  } else {
    if (v.volume > 0) volumeBeforeMute.value = v.volume
    v.muted = true
  }
  volume.value = v.volume
  muted.value = v.muted
}

function toggleVolumePopover() {
  volumePopoverOpen.value = !volumePopoverOpen.value
}

function onVolumeWrapMouseEnter() {
  closeVolumeAfterDrag.value = false
  if (window.matchMedia('(hover: hover)').matches) {
    volumePopoverOpen.value = true
  }
}

function onVolumeWrapMouseLeave() {
  if (!window.matchMedia('(hover: hover)').matches) return
  if (draggingVolume.value) {
    closeVolumeAfterDrag.value = true
    return
  }
  volumePopoverOpen.value = false
}

function onVideoAreaPointerUp(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return

  const root = rootRef.value
  if (!root) return

  const rect = root.getBoundingClientRect()
  const xRatio = (e.clientX - rect.left) / rect.width
  const now = Date.now()

  const isDoubleTap =
    now - lastTapAt < DOUBLE_TAP_MS && Math.abs(xRatio - lastTapX) < TAP_X_TOLERANCE

  if (isDoubleTap) {
    if (singleTapTimer) {
      clearTimeout(singleTapTimer)
      singleTapTimer = null
    }
    lastTapAt = 0

    if (xRatio < TAP_ZONE_LEFT) {
      seekBy(-15)
      showOverlayFeedback('rewind')
    } else if (xRatio > TAP_ZONE_RIGHT) {
      seekBy(15)
      showOverlayFeedback('forward')
    } else {
      handleSingleTap()
    }
    return
  }

  lastTapAt = now
  lastTapX = xRatio

  if (singleTapTimer) clearTimeout(singleTapTimer)
  singleTapTimer = setTimeout(() => {
    singleTapTimer = null
    handleSingleTap()
  }, DOUBLE_TAP_MS)
}

function setPlaybackRate(rate: number) {
  const v = videoRef.value
  if (!v) return
  v.playbackRate = rate
  playbackRate.value = rate
  openMenu.value = null
}

async function selectQuality(index: number) {
  if (!qualitiesList.value[index]) return
  const v = videoRef.value
  const t = v?.currentTime ?? 0
  activeQualityIndex.value = index
  openMenu.value = null
  await nextTick()
  const el = videoRef.value
  if (!el) return
  const restore = () => {
    el.currentTime = Math.min(t, Number.isFinite(el.duration) ? el.duration : t)
  }
  el.addEventListener('loadedmetadata', restore, { once: true })
}

function toggleSpeedMenu() {
  openMenu.value = openMenu.value === 'speed' ? null : 'speed'
}

function toggleQualityMenu() {
  if (!hasQualityMenu.value) return
  openMenu.value = openMenu.value === 'quality' ? null : 'quality'
}

async function toggleFullscreen() {
  const el = rootRef.value
  if (!el) return
  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    /* ignore */
  }
}

function onFullscreenChange() {
  const fs = Boolean(document.fullscreenElement && rootRef.value === document.fullscreenElement)
  isFullscreen.value = fs
  if (fs) {
    fullscreenHint.value = true
    if (hintTimer) clearTimeout(hintTimer)
    hintTimer = setTimeout(() => {
      fullscreenHint.value = false
      hintTimer = null
    }, 4500)
  } else {
    fullscreenHint.value = false
    if (hintTimer) {
      clearTimeout(hintTimer)
      hintTimer = null
    }
  }
}

function onDocumentPointerDown(e: PointerEvent) {
  const node = e.target as Node
  if (
    speedMenuRef.value?.contains(node) ||
    qualityMenuRef.value?.contains(node) ||
    speedTriggerRef.value?.contains(node) ||
    qualityTriggerRef.value?.contains(node)
  ) {
    return
  }
  openMenu.value = null
}

function onDocumentClick(e: MouseEvent) {
  const node = e.target as Node
  if (volumeWrapRef.value?.contains(node)) return
  volumePopoverOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'KeyK') {
    e.preventDefault()
    handleSingleTap()
    return
  }
  if (e.code === 'ArrowLeft') {
    e.preventDefault()
    seekBy(-5)
    return
  }
  if (e.code === 'ArrowRight') {
    e.preventDefault()
    seekBy(5)
    return
  }
  if (e.code === 'KeyF') {
    e.preventDefault()
    void toggleFullscreen()
    return
  }
  if (e.code === 'Escape') {
    openMenu.value = null
    volumePopoverOpen.value = false
  }
}

watch(
  () => props.src,
  () => {
    activeQualityIndex.value = 0
    openMenu.value = null
    volumePopoverOpen.value = false
    paused.value = true
    currentTime.value = 0
    duration.value = 0
    overlayFeedback.value = null
  }
)

watch(
  qualitiesList,
  (list) => {
    if (activeQualityIndex.value >= list.length) activeQualityIndex.value = 0
  },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('click', onDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('click', onDocumentClick, true)
  if (hintTimer) clearTimeout(hintTimer)
  clearOverlayTimers()
})
</script>

<template>
  <div
    ref="rootRef"
    class="lesson-video-player"
    tabindex="0"
    role="region"
    aria-label="Видеоплеер урока"
    @keydown="onKeydown"
  >
    <video
      ref="videoRef"
      class="lesson-video-player__video"
      :key="currentSrc"
      :src="currentSrc"
      :poster="poster"
      playsinline
      preload="metadata"
      disablepictureinpicture
      controlslist="nodownload noremoteplayback"
      @play="syncFromVideo"
      @pause="syncFromVideo"
      @timeupdate="syncFromVideo"
      @loadedmetadata="syncFromVideo"
      @volumechange="syncFromVideo"
    />

    <LessonVideoWatermarkOverlay
      v-if="watermarkText"
      :text="watermarkText"
      :active="!paused"
    />

    <div
      v-if="fullscreenHint"
      class="lesson-video-player__fs-hint"
      role="status"
    >
      Для выхода из полноэкранного режима нажмите
      <kbd class="lesson-video-player__kbd">Esc</kbd>
    </div>

    <div
      class="lesson-video-player__overlay"
      aria-hidden="true"
      @pointerup="onVideoAreaPointerUp"
    >
      <div class="lesson-video-player__center">
        <button
          type="button"
          class="lesson-video-player__skip lesson-video-player__skip_back"
          :class="{ 'lesson-video-player__skip_visible': overlayFeedback === 'rewind' }"
          aria-label="Назад на 15 секунд"
          tabindex="-1"
        >
          <font-awesome-icon :icon="faRotateLeft" class="lesson-video-player__skip-icon" />
          <span class="lesson-video-player__skip-num">15</span>
        </button>

        <button
          type="button"
          class="lesson-video-player__play-big"
          :class="{
            'lesson-video-player__play-big_visible':
              overlayFeedback === 'play' || overlayFeedback === 'pause',
          }"
          :aria-label="paused ? 'Воспроизвести' : 'Пауза'"
          tabindex="-1"
        >
          <font-awesome-icon :icon="overlayFeedback === 'play' ? faPlay : faPause" />
        </button>

        <button
          type="button"
          class="lesson-video-player__skip lesson-video-player__skip_forward"
          :class="{ 'lesson-video-player__skip_visible': overlayFeedback === 'forward' }"
          aria-label="Вперёд на 15 секунд"
          tabindex="-1"
        >
          <font-awesome-icon :icon="faRotateRight" class="lesson-video-player__skip-icon" />
          <span class="lesson-video-player__skip-num">15</span>
        </button>
      </div>
    </div>

    <div class="lesson-video-player__chrome" @click.stop>
      <div
        ref="progressTrackRef"
        class="lesson-video-player__progress"
        role="slider"
        :aria-valuenow="Math.round(currentTime)"
        :aria-valuemin="0"
        :aria-valuemax="Math.max(0, Math.round(duration))"
        aria-label="Прогресс воспроизведения"
        tabindex="0"
        @pointerdown="onProgressPointerDown"
        @pointermove="onProgressPointerMove"
        @pointerup="onProgressPointerUp"
        @pointercancel="onProgressPointerUp"
        @keydown.left.prevent="seekBy(-5)"
        @keydown.right.prevent="seekBy(5)"
      >
        <div
          class="lesson-video-player__progress-fill"
          :style="{ width: `${progressPct}%` }"
        />
      </div>

      <div class="lesson-video-player__bar">
        <div class="lesson-video-player__bar-left">
          <button
            type="button"
            class="lesson-video-player__icon-btn"
            :aria-label="paused ? 'Воспроизвести' : 'Пауза'"
            @click="togglePlay"
          >
            <font-awesome-icon :icon="paused ? faPlay : faPause" />
          </button>

          <div
            ref="volumeWrapRef"
            class="lesson-video-player__volume-wrap"
            @mouseenter="onVolumeWrapMouseEnter"
            @mouseleave="onVolumeWrapMouseLeave"
          >
            <div class="lesson-video-player__volume-anchor">
              <div
                v-show="volumePopoverOpen"
                class="lesson-video-player__volume-pop"
                aria-hidden="true"
              >
                <div
                  ref="volumeTrackRef"
                  class="lesson-video-player__volume-track"
                  @pointerdown="onVolumeTrackPointerDown"
                  @pointermove="onVolumeTrackPointerMove"
                  @pointerup="onVolumeTrackPointerUp"
                  @pointercancel="onVolumeTrackPointerUp"
                >
                  <div
                    class="lesson-video-player__volume-fill"
                    :style="{ height: `${volumeSliderPct}%` }"
                  />
                </div>
              </div>
              <button
                type="button"
                class="lesson-video-player__icon-btn lesson-video-player__icon-btn_volume"
                aria-label="Громкость"
                :aria-expanded="volumePopoverOpen"
                @click.stop="toggleVolumePopover"
              >
                <font-awesome-icon :icon="faVolumeHigh" />
              </button>
            </div>
            <button
              type="button"
              class="lesson-video-player__icon-btn lesson-video-player__icon-btn_mute"
              :class="{ 'lesson-video-player__icon-btn_mute_active': muted }"
              :aria-label="muted ? 'Включить звук' : 'Выключить звук'"
              :aria-pressed="muted"
              @click.stop="toggleMute"
            >
              <font-awesome-icon :icon="faVolumeXmark" />
            </button>
          </div>
        </div>

        <p class="lesson-video-player__time" aria-live="polite">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </p>

        <div class="lesson-video-player__bar-right">
          <div ref="speedTriggerRef" class="lesson-video-player__menu-anchor">
            <button
              type="button"
              class="lesson-video-player__speed-trigger"
              aria-haspopup="true"
              :aria-expanded="openMenu === 'speed'"
              aria-label="Скорость воспроизведения"
              @click="toggleSpeedMenu"
            >
              {{ speedLabel }}
            </button>
            <div
              v-show="openMenu === 'speed'"
              ref="speedMenuRef"
              class="lesson-video-player__menu"
              role="menu"
            >
              <p class="lesson-video-player__menu-title">Скорость воспроизведения</p>
              <ul class="lesson-video-player__menu-list">
                <li v-for="opt in SPEED_OPTIONS" :key="opt.value">
                  <button
                    type="button"
                    class="lesson-video-player__menu-item"
                    role="menuitemradio"
                    :aria-checked="playbackRate === opt.value"
                    @click="setPlaybackRate(opt.value)"
                  >
                    <span>{{ opt.label }}</span>
                    <span
                      v-if="playbackRate === opt.value"
                      class="lesson-video-player__check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="hasQualityMenu" ref="qualityTriggerRef" class="lesson-video-player__menu-anchor">
            <button
              type="button"
              class="lesson-video-player__icon-btn lesson-video-player__icon-btn_gear"
              aria-haspopup="true"
              :aria-expanded="openMenu === 'quality'"
              aria-label="Качество видео"
              @click="toggleQualityMenu"
            >
              <font-awesome-icon :icon="faGear" />
            </button>
            <div
              v-show="openMenu === 'quality'"
              ref="qualityMenuRef"
              class="lesson-video-player__menu lesson-video-player__menu_quality"
              role="menu"
            >
              <p class="lesson-video-player__menu-title">Качество</p>
              <ul class="lesson-video-player__menu-list">
                <li v-for="(q, idx) in qualitiesList" :key="q.src + q.label">
                  <button
                    type="button"
                    class="lesson-video-player__menu-item"
                    role="menuitemradio"
                    :aria-checked="activeQualityIndex === idx"
                    @click="selectQuality(idx)"
                  >
                    <span>{{ q.label }}</span>
                    <span
                      v-if="activeQualityIndex === idx"
                      class="lesson-video-player__check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            class="lesson-video-player__icon-btn"
            :aria-label="isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'"
            @click="toggleFullscreen"
          >
            <font-awesome-icon :icon="isFullscreen ? faCompress : faExpand" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$lesson-player-chrome-bg: #010307;

.lesson-video-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-10);
  overflow: hidden;
  background: var(--black);
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--white), 0 0 0 4px var(--text-accent);
  }

  &__video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: var(--black);
  }

  &__fs-hint {
    position: absolute;
    top: var(--sp-16);
    left: 50%;
    transform: translateX(-50%);
    z-index: 6;
    display: flex;
    align-items: center;
    gap: var(--sp-8);
    padding: var(--sp-10) var(--sp-16);
    border-radius: var(--radius-10);
    background: rgba(1, 3, 7, 0.85);
    color: var(--white);
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 13px;
    white-space: nowrap;
    pointer-events: none;
  }

  &__kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2em;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.12);
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: var(--font-semi-bold);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    bottom: 49px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 2;
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(var(--sp-16), 4vw, var(--sp-40));
  }

  &__skip {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    padding: 0;
    border: 2px solid rgba(255, 255, 255, 0.85);
    border-radius: 50%;
    background: transparent;
    color: var(--white);
    cursor: default;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease,
      background 0.15s ease,
      border-color 0.15s ease;

    &_visible {
      opacity: 1;
      visibility: visible;
    }
  }

  &__skip-icon {
    font-size: 22px;
    opacity: 0.95;
  }

  &__skip-num {
    position: absolute;
    margin-top: 2px;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 11px;
    line-height: 1;
    color: var(--white);
  }

  &__play-big {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    padding: 0;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    color: var(--white);
    font-size: 28px;
    cursor: default;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease,
      background 0.15s ease;

    &_visible {
      opacity: 1;
      visibility: visible;
    }
  }

  &__chrome {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
  }

  &__progress {
    width: 100%;
    height: 5px;
    background: var(--white);
    cursor: pointer;
    touch-action: none;

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: 2px;
    }
  }

  &__progress-fill {
    height: 100%;
    width: 0;
    background: var(--text-accent);
    pointer-events: none;
  }

  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-12);
    min-height: 44px;
    padding: 10px 15px;
    background: $lesson-player-chrome-bg;
  }

  &__bar-left,
  &__bar-right {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
  }

  &__bar-right {
    justify-content: flex-end;
  }

  &__time {
    margin: 0;
    flex: 1;
    text-align: center;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 13px;
    color: var(--white);
    white-space: nowrap;
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--white);
    font-size: 16px;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: 2px;
    }

    &_volume {
      width: 26px;
      height: 26px;
      font-size: 17px;
    }

    &_mute {
      width: 20px;
      height: 20px;
      font-size: 14px;
      opacity: 0.55;

      &_active {
        opacity: 1;
        color: var(--text-accent);
      }
    }

    &_gear {
      border-radius: 5px;
    }
  }

  &__speed-trigger {
    padding: 0;
    border: none;
    background: transparent;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 13px;
    color: var(--white);
    cursor: pointer;
    min-width: 28px;
    text-align: center;

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  &__volume-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__volume-anchor {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__volume-pop {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px 12px;
  }

  &__volume-track {
    width: 6px;
    height: 88px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.25);
    touch-action: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  &__volume-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: var(--white);
    pointer-events: none;
  }

  &__menu-anchor {
    position: relative;
  }

  &__menu {
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    min-width: 220px;
    padding: 12px 0 8px;
    border-radius: 8px;
    background: $lesson-player-chrome-bg;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    z-index: 8;
  }

  &__menu_quality {
    right: 0;
  }

  &__menu-title {
    margin: 0 16px 8px;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
  }

  &__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: var(--sp-12);
    padding: 10px 16px;
    border: none;
    background: transparent;
    font-family: var(--font-family);
    font-weight: var(--font-semi-bold);
    font-size: 13px;
    color: var(--white);
    text-align: left;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    &:focus-visible {
      outline: 2px solid var(--text-accent);
      outline-offset: -2px;
    }
  }

  &__check {
    flex-shrink: 0;
    font-size: 12px;
    opacity: 0.9;
  }
}

:fullscreen .lesson-video-player__video {
  object-fit: contain;
}

@media (max-width: 1023px) {
  .lesson-video-player {
    &__overlay {
      bottom: 41px;
    }

    &__bar {
      min-height: 36px;
      padding: 6px 12px;
      gap: var(--sp-8);
    }

    &__bar-left,
    &__bar-right {
      gap: 10px;
    }

    &__time {
      font-size: 11px;
    }

    &__speed-trigger {
      font-size: 11px;
      min-width: 24px;
    }
  }
}
</style>
