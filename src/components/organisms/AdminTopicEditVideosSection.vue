<script setup lang="ts">
import AdminTopicEditVideoRow from '@/components/molecules/AdminTopicEditVideoRow.vue'
import type { AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'

const videos = defineModel<AdminTopicEditVideoMock[]>('videos', { required: true })

interface Emits {
  (e: 'add-video'): void
}

const emit = defineEmits<Emits>()

function revokeBlobUrl(url: string | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const onDelete = (videoId: string) => {
  const item = videos.value.find((v) => v.id === videoId)
  revokeBlobUrl(item?.videoSrc)
  videos.value = videos.value.filter((v) => v.id !== videoId)
}
</script>

<template>
  <section class="admin-topic-edit-videos-section">
    <h2 class="admin-topic-edit-videos-section__heading">Видеофайлы</h2>
    <div class="admin-topic-edit-videos-section__list">
      <AdminTopicEditVideoRow
        v-for="v in videos"
        :key="v.id"
        v-model:title="v.title"
        v-model:timecode-enabled="v.timecodeEnabled"
        v-model:video-src="v.videoSrc"
        @delete-video="onDelete(v.id)"
      />
    </div>
    <div class="admin-topic-edit-videos-section__add-wrap">
      <button type="button" class="admin-topic-edit-videos-section__add-btn" @click="emit('add-video')">
        Добавить видеофайл
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-topic-edit-videos-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-20);
  width: 100%;
  max-width: 1084px;
  align-items: flex-start;
}

.admin-topic-edit-videos-section__heading {
  margin: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: var(--black);
}

.admin-topic-edit-videos-section__list {
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 100%;
}

.admin-topic-edit-videos-section__add-wrap {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.admin-topic-edit-videos-section__add-btn {
  margin: 0;
  padding: 10px;
  border: 1px solid #010307;
  border-radius: var(--radius-10);
  background-color: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
  cursor: pointer;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-main);
  }

  &:hover {
    filter: brightness(0.98);
  }
}
</style>
