<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { glossaryService } from '@/services/api/endpoints/glossary'

const content = ref('')
const loading = ref(true)
const loadError = ref<string | null>(null)

const isEmpty = computed(() => !loading.value && !loadError.value && content.value.trim().length === 0)

const loadGlossary = async () => {
  loading.value = true
  loadError.value = null
  const result = await glossaryService.getGlossary()
  loading.value = false

  if (!result.success || !result.data) {
    loadError.value = result.error || 'Не удалось загрузить глоссарий'
    content.value = ''
    return
  }

  content.value = result.data.content ?? ''
}

onMounted(() => {
  void loadGlossary()
})
</script>

<template>
  <div class="home-glossary">
    <h2 class="home-glossary__title">
      Глоссарий (список сокращений, который используется в обучении):
    </h2>

    <p v-if="loading" class="home-glossary__status">Загружаем…</p>
    <p v-else-if="loadError" class="home-glossary__status home-glossary__status_error">
      {{ loadError }}
    </p>
    <p v-else-if="isEmpty" class="home-glossary__status">Глоссарий пока пуст</p>
    <div v-else class="home-glossary__content">{{ content }}</div>
  </div>
</template>

<style lang="scss" scoped>
.home-glossary {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);

  &__title {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-bold);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }

  &__status {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--black-300);

    &_error {
      color: var(--error);
    }

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }

  &__content {
    margin: 0;
    font-family: var(--font-family);
    font-weight: var(--font-medium);
    font-size: var(--size-15);
    color: var(--osnovnoy-tekst);
    white-space: pre-wrap;
    word-break: break-word;

    @media (max-width: 1023px) {
      font-size: var(--size-13);
    }
  }
}
</style>
