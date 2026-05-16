<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminLabeledControlRow from '@/components/molecules/AdminLabeledControlRow.vue'
import AdminTopicEditMaterialsSection from '@/components/organisms/AdminTopicEditMaterialsSection.vue'
import AdminTopicEditVideosSection from '@/components/organisms/AdminTopicEditVideosSection.vue'
import type { AdminTopicEditMaterialFileMock, AdminTopicEditVideoMock } from '@/utils/adminMaterialCatalog'
import {
  getProductTopicsList,
  getTopicEditContent,
  resolveAdminMaterialProductTopic,
  setTopicEditContent,
} from '@/utils/adminMaterialCatalog'

const route = useRoute()
const router = useRouter()

const resolved = computed(() =>
  resolveAdminMaterialProductTopic(
    route.params.sectionId as string,
    route.params.productId as string,
    route.params.topicId as string,
  ),
)

const lessonTitle = ref('')
const materialFiles = ref<AdminTopicEditMaterialFileMock[]>([])
const videos = ref<AdminTopicEditVideoMock[]>([])

const breadcrumbItems = computed(() => {
  const r = resolved.value
  if (!r) return []
  return [
    { label: `Папка «${r.section.title}»`, to: { name: 'admin' as const } },
    {
      label: `Редактирование тем «${r.card.title}»`,
      to: {
        name: 'admin-material-product-edit' as const,
        params: { sectionId: r.section.sectionId, productId: r.card.id },
      },
      topicsMenu: {
        sectionId: r.section.sectionId,
        productId: r.card.id,
        topics: getProductTopicsList(r.card.id, r.card.edit.topics),
        activeTopicId: r.topic.id,
      },
    },
    { label: r.topic.title },
  ]
})

watch(
  resolved,
  (r) => {
    if (!r) {
      const sectionId = route.params.sectionId as string | undefined
      const productId = route.params.productId as string | undefined
      if (sectionId && productId) {
        void router.replace({
          name: 'admin-material-product-edit',
          params: { sectionId, productId },
        })
      } else {
        void router.replace({ name: 'admin' })
      }
      return
    }
    lessonTitle.value = r.topic.title
    const content = getTopicEditContent(r.card.id, r.topic.id, r.topic.title)
    materialFiles.value = content.materialFiles.map((f) => ({ ...f }))
    videos.value = content.videos.map((v) => ({ ...v }))
  },
  { immediate: true },
)

const goBackToProduct = () => {
  const r = resolved.value
  if (!r) return
  void router.push({
    name: 'admin-material-product-edit',
    params: { sectionId: r.section.sectionId, productId: r.card.id },
  })
}

const onSave = () => {
  const r = resolved.value
  if (!r) return
  setTopicEditContent(r.card.id, r.topic.id, {
    materialFiles: materialFiles.value.map((f) => ({ ...f })),
    videos: videos.value.map((v) => ({ ...v })),
  })
  /* до API */
}

const onAddVideo = () => {
  videos.value = [
    ...videos.value,
    { id: `v-${Date.now()}`, title: '', timecodeEnabled: false },
  ]
}
</script>

<template>
  <AppLayout>
    <section v-if="resolved" class="admin-material-product-topic-edit-page">
      <div class="admin-material-product-topic-edit-page__panel">
        <HomeProfileInfoTableItem
          class="admin-material-product-topic-edit-page__badge"
          label="Имя админа"
          tone="#178ef0"
          is-student-name
        />

        <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

        <hr class="admin-material-product-topic-edit-page__rule" />

        <div class="admin-material-product-topic-edit-page__lesson">
          <AdminLabeledControlRow label="Название урока" narrow-control>
            <input v-model="lessonTitle" class="admin-labeled-control-row__input" type="text" autocomplete="off" />
          </AdminLabeledControlRow>
        </div>

        <AdminTopicEditMaterialsSection v-model:files="materialFiles" />

        <AdminTopicEditVideosSection v-model:videos="videos" @add-video="onAddVideo" />

        <div class="admin-material-product-topic-edit-page__footer">
          <button type="button" class="admin-material-product-topic-edit-page__footer-btn" @click="onSave">
            Сохранить
          </button>
          <button type="button" class="admin-material-product-topic-edit-page__footer-btn" @click="goBackToProduct">
            Отмена
          </button>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-topic-edit-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    gap: var(--sp-40);
    max-width: 1084px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
  }

  &__badge {
    align-self: flex-start;
  }

  &__rule {
    width: 100%;
    max-width: 1084px;
    margin: 0;
    border: none;
    border-top: 1px solid rgba(1, 3, 7, 0.12);
  }

  &__lesson {
    width: 100%;
    max-width: 1084px;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--sp-20);
    width: 100%;
    max-width: 1084px;
    margin-left: auto;
    margin-right: auto;
  }

  &__footer-btn {
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

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }
  }
}
</style>
