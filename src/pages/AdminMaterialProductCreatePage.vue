<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import AdminTopicNotificationCheckbox from '@/components/atoms/AdminTopicNotificationCheckbox.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import {
  deadlineRuLabelToIso,
  isoDateToRuLabel,
  isRuDeadlineFormat,
} from '@/utils/adminDateInput'
import {
  getAdminMaterialSectionTitle,
  isAdminMaterialSectionId,
  type AdminMaterialSectionId,
} from '@/constants/adminMaterials'
import { useAdminStore } from '@/stores/admin'
import { sectionIdToProductType } from '@/utils/adminProductType'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const { notify } = useNotification()
const submitting = ref(false)

const sectionId = computed(() => route.params.sectionId as string)

const isAllowedSection = computed(
  () => isAdminMaterialSectionId(sectionId.value) && sectionId.value !== 'archive',
)

watch(
  isAllowedSection,
  (ok) => {
    if (!ok) {
      void router.replace({ name: 'admin-materials' })
    }
  },
  { immediate: true },
)

const folderBreadcrumbLabel = computed(() => {
  if (!isAdminMaterialSectionId(sectionId.value)) return ''
  const title = getAdminMaterialSectionTitle(sectionId.value)
  return title ? `Папка «${title}»` : ''
})

const breadcrumbItems = computed(() => [
  { label: folderBreadcrumbLabel.value, to: { name: 'admin-materials' as const } },
  { label: 'Создание нового продукта' },
])

const formTitle = ref('')
const formDescription = ref('')
const formDeadlineRu = ref('')

interface TopicFieldRow {
  id: string
  title: string
}

const topicRows = ref<TopicFieldRow[]>([{ id: crypto.randomUUID(), title: '' }])
const notifyAllStudents = ref(false)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const deadlineIso = computed({
  get() {
    const raw = formDeadlineRu.value.trim()
    if (!raw) return ''
    if (isRuDeadlineFormat(raw)) return deadlineRuLabelToIso(raw) || ''
    if (ISO_DATE.test(raw)) return raw
    return ''
  },
  set(v: string) {
    const t = v.trim()
    if (!t) {
      formDeadlineRu.value = ''
      return
    }
    const ru = isoDateToRuLabel(t)
    formDeadlineRu.value = ru || t
  },
})

const notifyCheckboxId = 'admin-material-product-create-notify-all'

const onAddTopic = () => {
  topicRows.value.push({ id: crypto.randomUUID(), title: '' })
}

const onSubmit = async () => {
  if (!isAdminMaterialSectionId(sectionId.value)) return
  const title = formTitle.value.trim()
  if (!title) {
    notify({ type: 'warning', message: 'Укажите название продукта' })
    return
  }
  submitting.value = true
  const productType = sectionIdToProductType(sectionId.value as AdminMaterialSectionId)
  const created = await adminStore.createProduct({
    product_type: productType,
    title,
    description: formDescription.value.trim(),
    price: 0,
    is_published: false,
  })
  if (!created.success || !created.data) {
    submitting.value = false
    notify({ type: 'error', message: created.error || 'Не удалось создать продукт' })
    return
  }
  const newProductId = created.data.id
  for (const row of topicRows.value) {
    const topicTitle = row.title.trim()
    if (!topicTitle) continue
    await adminStore.createModule(newProductId, { title: topicTitle, description: '' })
  }
  submitting.value = false
  notify({ type: 'success', message: 'Продукт создан' })
  void router.push({
    name: 'admin-material-product-edit',
    params: { sectionId: sectionId.value, productId: newProductId },
  })
}

const onTopicTitleInput = (id: string, value: string) => {
  topicRows.value = topicRows.value.map((row) => (row.id === id ? { ...row, title: value } : row))
}
</script>

<template>
  <AppLayout>
    <section v-if="isAllowedSection" class="admin-material-product-create-page">
      <div class="admin-material-product-create-page__panel">
        <HomeProfileInfoTableItem
          class="admin-material-product-create-page__badge"
          label="Имя админа"
          tone="#178ef0"
          is-student-name
        />

        <AdminProductEditBreadcrumbs :items="breadcrumbItems" />

        <hr class="admin-material-product-create-page__rule" />

        <div class="admin-material-product-create-page__form">
          <div class="admin-material-product-create-page__field-row">
            <label class="admin-material-product-create-page__label" for="admin-material-product-create-title">
              Название:
            </label>
            <input
              id="admin-material-product-create-title"
              v-model="formTitle"
              class="admin-material-product-create-page__control admin-material-product-create-page__control_text"
              type="text"
              autocomplete="off"
            />
          </div>

          <div
            class="admin-material-product-create-page__field-row admin-material-product-create-page__field-row_multiline"
          >
            <label
              class="admin-material-product-create-page__label"
              for="admin-material-product-create-description"
            >
              Краткое описание:
            </label>
            <textarea
              id="admin-material-product-create-description"
              v-model="formDescription"
              class="admin-material-product-create-page__control admin-material-product-create-page__control_area"
              rows="3"
              autocomplete="off"
            />
          </div>

          <div
            v-for="topicRow in topicRows"
            :key="topicRow.id"
            class="admin-material-product-create-page__field-row"
          >
            <label class="admin-material-product-create-page__label" :for="`topic-${topicRow.id}`">
              Тема:
            </label>
            <input
              :id="`topic-${topicRow.id}`"
              :value="topicRow.title"
              class="admin-material-product-create-page__control admin-material-product-create-page__control_text"
              type="text"
              autocomplete="off"
              @input="onTopicTitleInput(topicRow.id, ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="admin-material-product-create-page__add-topic-row">
            <BaseButton
              class="admin-material-product-create-page__add-topic"
              variant="ghost"
              size="medium"
              text="Добавить тему"
              @click="onAddTopic"
            />
          </div>

          <div class="admin-material-product-create-page__field-row">
            <label class="admin-material-product-create-page__label" for="admin-material-product-create-deadline-input">
              Срок доступа (общий):
            </label>
            <AdminDateField
              v-model="deadlineIso"
              fluid
              input-id="admin-material-product-create-deadline-input"
            />
          </div>

          <div
            class="admin-material-product-create-page__field-row admin-material-product-create-page__field-row_notify"
          >
            <div class="admin-material-product-create-page__notify-group">
              <AdminTopicNotificationCheckbox
                v-model="notifyAllStudents"
                :input-id="notifyCheckboxId"
              />
              <span class="admin-material-product-create-page__notify-text">Уведомить всех учеников</span>
            </div>
          </div>
        </div>

        <div class="admin-material-product-create-page__submit-wrap">
          <BaseButton variant="outline" size="medium" text="Создать" @click="onSubmit" />
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<style lang="scss" scoped>
.admin-material-product-create-page {
  margin-top: var(--sp-40);

  &__panel {
    border-radius: var(--radius-20);
    background-color: var(--fon-bloka);
    padding: var(--sp-40) var(--sp-50);
    display: flex;
    flex-direction: column;
    gap: var(--sp-20);
    max-width: 100%;
    box-sizing: border-box;
  }

  &__badge {
    align-self: flex-start;
  }

  &__rule {
    margin: var(--sp-10) 0 0;
    border: none;
    border-top: var(--border-2) solid var(--black);
    width: 100%;
    height: 0;
  }

  &__form {
    display: grid;
    grid-template-columns: max-content 250px;
    column-gap: var(--sp-20);
    row-gap: var(--sp-20);
    width: fit-content;
    max-width: 100%;
    margin-inline: auto;
    box-sizing: border-box;
    margin-top: var(--sp-10);
    align-items: center;
    justify-items: stretch;
  }

  &__field-row {
    display: contents;
    box-sizing: border-box;

    &_notify {
      margin-top: var(--sp-6);
    }
  }

  &__field-row_multiline > &__label {
    align-self: start;
    padding-top: 8px;
  }

  &__add-topic-row {
    display: contents;
    box-sizing: border-box;
  }

  &__label {
    @include font-main(600);
    grid-column: 1;
    justify-self: end;
    font-size: var(--size-25);
    line-height: normal;
    color: var(--black);
    text-align: right;
    white-space: nowrap;
  }

  &__control {
    grid-column: 2;
    box-sizing: border-box;
    width: 250px;
    max-width: 100%;
    border: var(--border-2) solid rgb(1 3 7 / 0.2);
    border-radius: var(--radius-10);
    background-color: var(--white);
    font-family: var(--font-family);
    font-size: var(--size-18);
    color: var(--black);
    padding: 8px var(--sp-10);

    &:focus {
      outline: none;
      box-shadow: var(--focus-ring-main);
    }

    &_text {
      min-height: 40px;
    }

    &_area {
      min-height: 90px;
      resize: vertical;
    }
  }

  &__add-topic {
    grid-column: 2;
    justify-self: start;
    width: auto;
    max-width: 100%;
  }

  :deep(.admin-material-product-create-page__add-topic.base-button_ghost) {
    @include font-main(600);
    font-size: var(--size-25);
    line-height: normal;
    color: var(--black);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-align: left;
    justify-content: flex-start;

    &:hover:not(.base-button_disabled) {
      color: var(--black);
      opacity: 0.85;
      text-decoration: underline;
    }
  }

  &__notify-group {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--sp-10);
  }

  &__notify-text {
    @include font-main(600);
    font-size: var(--size-25);
    line-height: normal;
    color: var(--black);
    user-select: none;
    white-space: nowrap;
  }

  &__submit-wrap {
    margin-top: var(--sp-20);
    align-self: center;
    width: auto;
    display: flex;
    justify-content: center;

    :deep(.base-button_outline) {
      border-radius: var(--radius-10);
      border-color: #010307;
      height: auto;
      min-height: 0;
      font-family: var(--font-family);
      font-size: var(--size-25);
    }
  }

  @media (max-width: 1023px) {
    &__panel {
      padding: var(--sp-24);
    }

    &__form {
      grid-template-columns: 1fr;
      width: 100%;
    }

    &__field-row {
      display: grid;
      grid-template-columns: 1fr;
      row-gap: var(--sp-8);
    }

    &__add-topic-row {
      display: block;
    }

    &__label {
      grid-column: 1;
      justify-self: start;
      text-align: left;
      white-space: normal;
    }

    &__control {
      grid-column: 1;
      width: 100%;
    }

    &__add-topic {
      grid-column: 1;
      width: 100%;
      text-align: left;
    }

    &__notify-group {
      grid-column: 1;
      justify-content: flex-start;
    }
  }

  /* AdminDateField во 2-й колонке общей сетки */
  &__field-row :deep(.admin-date-field.fluid),
  &__field-row :deep(.admin-date-field) {
    grid-column: 2;
    width: 250px;
    max-width: 100%;
  }
}
</style>
