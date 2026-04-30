# Doktor Blum — Руководство разработчика

> Пошаговая инструкция по развёртыванию, разработке и поддержанию архитектурного единообразия проекта.
> Архитектура основана на анализе проекта mirror-frontend (см. `ARCHITECTURE_ANALYSIS.md`).

---

## Содержание

1. [Развёртывание проекта](#1-развёртывание-проекта)
2. [Добавление нового компонента](#2-добавление-нового-компонента)
3. [Создание нового сервиса и типов](#3-создание-нового-сервиса-и-типов)
4. [Использование SCSS-утилит в компонентах](#4-использование-scss-утилит-в-компонентах)
5. [Добавление новой страницы и маршрута](#5-добавление-новой-страницы-и-маршрута)
6. [Создание нового Pinia store](#6-создание-нового-pinia-store)
7. [Поддержание единообразия архитектуры](#7-поддержание-единообразия-архитектуры)

---

## 1. Развёртывание проекта

### Предварительные требования

- **Node.js** >= 18.x (рекомендуется LTS)
- **npm** >= 9.x или **pnpm** >= 8.x
- Работающий бэкенд (или mock-сервер)

### Шаги установки

```bash
# 1. Перейти в папку проекта
cd /path/to/doktor-blum

# 2. Установить зависимости
npm install

# 3. Создать файл переменных окружения
cp .env.example .env
```

### Настройка `.env`

Открой `.env` и укажи адрес бэкенда в `VITE_API_BASE_URL` (без слеша в конце).

**Локальный бэкенд** (по умолчанию в `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

**Прод / общий API** (`api.blumteam.ru`) — напрямую из браузера:

```env
VITE_API_BASE_URL=https://api.blumteam.ru
VITE_API_TIMEOUT=10000
```

**Локальная разработка против `api.blumteam.ru` без CORS-ошибок** (рекомендуется): в `vite.config.ts` настроен прокси: пути `/api` уход на `https://api.blumteam.ru`. В `.env` укажи тот же хост, что и Vite (порт 3000), чтобы запросы шли на `http://localhost:3000/api/...` и проксировались:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

Если при прямом `VITE_API_BASE_URL=https://api.blumteam.ru` из `npm run dev` запросы падают с сетевой ошибкой, проверь CORS на API или переключись на вариант с прокси выше.

### Запуск в режиме разработки

```bash
npm run dev
# Откроется http://localhost:3000
```

### Сборка для продакшена

```bash
npm run build
# Результат в папке dist/
npm run preview  # локальный просмотр сборки
```

### Проверка типов и линтинг

```bash
npm run type-check   # vue-tsc --noEmit
npm run lint         # eslint --fix
```

### Шрифты Inter

Папка `src/assets/fonts/Inter/` — **заглушка**. Скопируй TTF-файлы шрифта Inter (300–800) из исходного проекта:

```bash
cp -r /path/to/mirror-frontend-main/assets/fonts/Inter/* \
      src/assets/fonts/Inter/
```

Нужные файлы (из `variables.scss`):
- `Inter_18pt-Light.ttf` (300)
- `Inter_18pt-Regular.ttf` (400)
- `Inter_18pt-Medium.ttf` (500)
- `Inter_18pt-SemiBold.ttf` (600)
- `Inter_18pt-Bold.ttf` (700)
- `Inter_18pt-ExtraBold.ttf` (800)

---

## 2. Добавление нового компонента

### Определи уровень компонента

| Уровень | Папка | Критерий |
|---------|-------|----------|
| Атом | `src/components/atoms/` | Неделимый UI-элемент (кнопка, поле ввода, иконка) |
| Молекула | `src/components/molecules/` | 2–4 атома с простой логикой (карточка, поле с меткой) |
| Организм | `src/components/organisms/` | Сложный блок с бизнес-логикой (хедер, форма, список) |
| Layout | `src/components/layouts/` | Шаблон страницы (AppLayout, AuthLayout) |

### Шаблон компонента

Создай файл `src/components/atoms/MyComponent.vue`:

```vue
<script setup lang="ts">
/**
 * MyComponent — краткое описание назначения
 */
import { computed } from 'vue'

// 1. Объявляй типы Props и Emits как interface
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

// 2. withDefaults для значений по умолчанию
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})

const emit = defineEmits<Emits>()

// 3. Динамические классы через computed (BEM-adjacent)
const classes = computed(() => [
  'my-component',
  `my-component_${props.variant}`,
  { 'my-component_disabled': props.disabled },
])
</script>

<template>
  <div :class="classes" @click="emit('click', $event)">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
/* Переменные $main, $black и миксины @include inter-medium доступны
   без @import благодаря vite.config.ts → additionalData */
.my-component {
  @include inter-regular;
  color: $black;

  &_primary {
    background-color: $main;
  }

  &_disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

### Правила именования

- Файл: `PascalCase.vue` → `BaseButton.vue`, `DoctorCard.vue`
- CSS-классы: `kebab-case` + BEM-модификаторы через `_` → `.doctor-card`, `.doctor-card_featured`
- Props: `camelCase` в TypeScript, `kebab-case` в шаблоне → `modelValue` / `:model-value`

---

## 3. Создание нового сервиса и типов

### Шаг 1: Добавь DTO-типы в `src/services/api/types.ts`

```typescript
// src/services/api/types.ts — добавь в конец файла

// ===== DOCTORS =====
export interface Doctor {
  id: string
  name: string
  specialization: string
  experience_years: number
}

export interface DoctorListResponse {
  items: Doctor[]
  total: number
}

export interface CreateAppointmentRequest {
  doctor_id: string
  date: string
  time: string
  patient_notes?: string
}
```

### Шаг 2: Создай сервис `src/services/api/endpoints/doctors.ts`

```typescript
import { useApi } from '@/composables/useApi'
import type { Doctor, DoctorListResponse, CreateAppointmentRequest, ApiServiceResponse } from '../types'

export const doctorsService = {
  async getAll(): ApiServiceResponse<DoctorListResponse> {
    const api = useApi()
    return api.get<DoctorListResponse>('/api/v1/doctors')
  },

  async getById(id: string): ApiServiceResponse<Doctor> {
    const api = useApi()
    return api.get<Doctor>(`/api/v1/doctors/${id}`)
  },

  async createAppointment(data: CreateAppointmentRequest): ApiServiceResponse<{ id: string }> {
    const api = useApi()
    return api.post<{ id: string }>('/api/v1/appointments', data)
  },
}
```

### Шаг 3: Реэкспортируй из `src/services/api/index.ts`

```typescript
export * from './endpoints/auth'
export * from './endpoints/doctors'  // добавь
export * from './types'
```

### Шаг 4: Используй в компоненте или store

```typescript
// В компоненте:
import { useFetch } from '@/composables/useFetch'
import { doctorsService } from '@/services/api'

const { data: doctors, loading, error } = useFetch(() => doctorsService.getAll())
```

---

## 4. Использование SCSS-утилит в компонентах

Благодаря `vite.config.ts → css.preprocessorOptions.scss.additionalData`, в каждом `<style lang="scss">` автоматически доступны:

### SCSS-переменные

```scss
.my-element {
  color: $black;           // #111
  background: $main;       // #88C200
  background: $main-bg;    // #f2fff0
  border: 1px solid $divider;
  color: $gray;            // #888
  color: $error;           // #f00
  color: $success;         // #16c92b
}
```

### Миксины шрифтов

```scss
.my-element {
  @include inter-light;       // font-weight: 300
  @include inter-regular;     // font-weight: 400
  @include inter-medium;      // font-weight: 500
  @include inter-semi-bold;   // font-weight: 600
  @include inter-bold;        // font-weight: 700
  @include inter-extra-bold;  // font-weight: 800

  // Или напрямую с нужным весом:
  @include font-inter(500);
}
```

### CSS Custom Properties (fluid scale)

Используй в значениях CSS — они автоматически масштабируются от 1024px до 1920px:

```scss
.my-element {
  font-size: var(--fs-base);  // ~16–17.6px
  font-size: var(--fs-xl);    // ~16–22px
  padding: var(--sp-16);      // ~16–19.2px
  margin-top: var(--sp-24);   // ~24–28.8px
  gap: var(--sp-8);           // ~8–9.6px
}
```

Доступные токены: `--fs-xs, --fs-sm, --fs-base, --fs-lg, --fs-xl, --fs-2xl, --fs-3xl, --fs-4xl`
и `--sp-0, --sp-4, --sp-6, --sp-8, --sp-10, --sp-12, --sp-16, --sp-20, --sp-24, --sp-32, --sp-40, --sp-60`.

### Extend-плейсхолдеры (spacing/padding)

```scss
.my-element {
  @extend %u-mt-16;    // margin-top: var(--sp-16)
  @extend %u-px-24;   // padding-left/right: var(--sp-24)
  @extend %u-py-12;   // padding-top/bottom: var(--sp-12)
  @extend %u-mx-auto; // margin: 0 auto
}
```

### Глобальные utility-классы (в шаблоне)

```html
<!-- Типографика -->
<p class="text-sm font-medium">Текст</p>
<h2 class="h2 font-bold">Заголовок</h2>

<!-- Отступы (margin) -->
<div class="u-mt-16 u-mb-24 u-mx-auto"></div>

<!-- Отступы (padding) -->
<section class="u-p-24 u-px-32"></section>
```

---

## 5. Добавление новой страницы и маршрута

### Шаг 1: Создай страницу `src/pages/DoctorsPage.vue`

```vue
<script setup lang="ts">
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseCard from '@/components/molecules/BaseCard.vue'
</script>

<template>
  <AppLayout>
    <h1 class="h1 u-mb-24">Врачи</h1>
    <BaseCard>
      <!-- содержимое -->
    </BaseCard>
  </AppLayout>
</template>
```

### Шаг 2: Добавь маршрут в `src/router/index.ts`

```typescript
const routes: RouteRecordRaw[] = [
  // ...существующие маршруты...
  {
    path: '/doctors',
    name: 'doctors',
    component: () => import('@/pages/DoctorsPage.vue'),
    meta: { requiresAuth: true },
  },
]
```

### Шаг 3: Добавь ссылку в `AppHeader.vue`

```html
<RouterLink to="/doctors" class="app-header__nav-link">Врачи</RouterLink>
```

---

## 6. Создание нового Pinia store

Все stores используют **setup-стиль** (функция внутри `defineStore`):

```typescript
// src/stores/doctors.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doctorsService } from '@/services/api'
import type { Doctor } from '@/services/api/types'

export const useDoctorsStore = defineStore('doctors', () => {
  // State
  const doctors = ref<Doctor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalCount = computed(() => doctors.value.length)

  // Actions
  async function fetchDoctors() {
    loading.value = true
    error.value = null

    const result = await doctorsService.getAll()

    if (result.success && result.data) {
      doctors.value = result.data.items
    } else {
      error.value = result.error
    }

    loading.value = false
  }

  return { doctors, loading, error, totalCount, fetchDoctors }
})
```

---

## 7. Поддержание единообразия архитектуры

### Обязательные правила

| Правило | Почему |
|---------|--------|
| Все компоненты — `<script setup lang="ts">` | Единый стиль, TypeScript-first |
| Props/Emits через `interface` + `defineProps<Props>()` | Строгая типизация |
| Сервисы — plain objects, не классы | Паттерн из mirror-frontend |
| Возвращаемый тип сервисов — `ApiServiceResponse<T>` | Единообразная обработка ошибок |
| Stores — setup-стиль через `defineStore('name', () => {})` | Реактивность, совместимость с Composition API |
| SCSS — только `<style lang="scss" scoped>`, без CSS-модулей | Нет в исходном проекте |
| CSS-классы — kebab-case + BEM-модификаторы через `_` | `.base-button_primary`, `.doctor-card_featured` |
| Импорты через `@/` алиас | Абсолютные пути, нет `../../../` |

### Чек-лист для code review

- [ ] Нет `useNuxtApp()` — это plain Vue 3 (не Nuxt)
- [ ] SCSS-переменные и миксины используются без `@import` (auto-injected)
- [ ] Новый сервис реэкспортирован из `services/api/index.ts`
- [ ] Props имеют типы, `emits` объявлены явно
- [ ] `useApi()` вызывается внутри метода сервиса, а не на уровне модуля
- [ ] Обработка ошибок через `result.success` / `result.error`
- [ ] Новые DOM-типы добавлены в `types/index.ts`, DTO — в `services/api/types.ts`

### Структура импортов (порядок)

```typescript
// 1. Vue core
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. Pinia stores
import { useAuthStore } from '@/stores/auth'

// 3. Composables
import { useFetch } from '@/composables/useFetch'

// 4. Services
import { doctorsService } from '@/services/api'

// 5. Components
import BaseButton from '@/components/atoms/BaseButton.vue'

// 6. Types
import type { Doctor } from '@/services/api/types'
```
