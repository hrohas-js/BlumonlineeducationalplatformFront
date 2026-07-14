<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminTopicEditVideoRow from '@/components/molecules/AdminTopicEditVideoRow.vue'
import type { AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'

const videos = defineModel<AdminTopicEditVideoMock[]>('videos', { required: true })

interface Emits {
  (e: 'add-video'): void
  (e: 'video-file-selected', payload: { videoId: string; file: File }): void
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
        @file-selected="(file) => emit('video-file-selected', { videoId: v.id, file })"
      />
    </div>
    <div class="admin-topic-edit-videos-section__add-wrap">
      <BaseButton
        class="admin-topic-edit-videos-section__add-btn"
        variant="outline"
        size="medium"
        shape="rounded"
        text="Добавить видеофайл"
        @click="emit('add-video')"
      />
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

:deep(.admin-topic-edit-videos-section__add-btn.base-button) {
  height: auto;
  padding: 10px;
  border-color: #010307;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
  color: #010307;
}
</style>
