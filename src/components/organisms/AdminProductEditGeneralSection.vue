<script setup lang="ts">
import { computed } from 'vue'
import HomeProfileInfoTableItem from '@/components/atoms/HomeProfileInfoTableItem.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AdminProductEditBreadcrumbs from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import type { AdminProductEditBreadcrumbItem } from '@/components/molecules/AdminProductEditBreadcrumbs.vue'
import AdminLabeledControlRow from '@/components/molecules/AdminLabeledControlRow.vue'
import AdminDateField from '@/components/molecules/AdminDateField.vue'
import {
  deadlineRuLabelToIso,
  isoDateToRuLabel,
  isRuDeadlineFormat,
} from '@/utils/adminDateInput'

interface Props {
  adminBadgeLabel: string
  folderLabel: string
  editingBreadcrumbLabel: string
  breadcrumbItems?: AdminProductEditBreadcrumbItem[]
}

const props = defineProps<Props>()

const title = defineModel<string>('title', { required: true })
const description = defineModel<string>('description', { required: true })
const deadline = defineModel<string>('deadline', { required: true })

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const deadlineIso = computed({
  get() {
    const raw = deadline.value.trim()
    if (!raw) return ''
    if (isRuDeadlineFormat(raw)) return deadlineRuLabelToIso(raw) || ''
    if (ISO_DATE.test(raw)) return raw
    return ''
  },
  set(v: string) {
    const t = v.trim()
    if (!t) {
      deadline.value = ''
      return
    }
    const ru = isoDateToRuLabel(t)
    deadline.value = ru || t
  },
})

interface Emits {
  (e: 'save'): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <section class="admin-product-edit-general-section">
    <HomeProfileInfoTableItem
      class="admin-product-edit-general-section__badge"
      :label="adminBadgeLabel"
      tone="#178ef0"
      is-student-name
    />

    <AdminProductEditBreadcrumbs
      v-if="props.breadcrumbItems?.length"
      :items="props.breadcrumbItems"
    />
    <AdminProductEditBreadcrumbs
      v-else
      :folder-label="props.folderLabel"
      :editing-label="props.editingBreadcrumbLabel"
    />

    <hr class="admin-product-edit-general-section__rule" />

    <div class="admin-product-edit-general-section__fields">
      <AdminLabeledControlRow label="Название" narrow-control>
        <input v-model="title" class="admin-labeled-control-row__input" type="text" autocomplete="off" />
      </AdminLabeledControlRow>

      <AdminLabeledControlRow label="Описание" multiline>
        <textarea v-model="description" class="admin-labeled-control-row__textarea" rows="6" />
      </AdminLabeledControlRow>

      <AdminLabeledControlRow
        label="Дедлайн (общий)"
        narrow-control
        class="admin-product-edit-general-section__deadline-row"
      >
        <AdminDateField
          v-model="deadlineIso"
          fluid
          input-id="admin-product-edit-deadline-input"
        />
      </AdminLabeledControlRow>
    </div>

    <div class="admin-product-edit-general-section__actions">
      <BaseButton variant="outline" size="small" text="Сохранить" @click="emit('save')" />
      <BaseButton variant="outline" size="small" text="Отмена" @click="emit('cancel')" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-product-edit-general-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-20);
  width: 100%;
}

.admin-product-edit-general-section__badge {
  align-self: flex-start;
}

.admin-product-edit-general-section__rule {
  width: 100%;
  max-width: 1084px;
  margin: var(--sp-10) 0 0;
  border: none;
  border-top: 1px solid rgba(1, 3, 7, 0.12);
}

.admin-product-edit-general-section__fields {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  max-width: 1084px;
  align-items: flex-start;
}

:deep(.admin-product-edit-general-section__fields > .admin-labeled-control-row:nth-child(2)) {
  margin-top: 24px;
}

:deep(.admin-product-edit-general-section__fields > .admin-labeled-control-row:nth-child(3)) {
  margin-top: 20px;
}

.admin-product-edit-general-section__deadline-row {
  :deep(.admin-date-field__field) {
    border: none;
    background-color: transparent;
  }

  :deep(.admin-date-field__input) {
    padding: 0;
    min-height: 0;
    font: inherit;
    font-weight: inherit;
    font-size: inherit;
    text-align: left;
  }
}

.admin-product-edit-general-section__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--sp-20);
  width: 100%;
  max-width: 1084px;
  margin-left: auto;
  margin-right: auto;
}

:deep(.admin-product-edit-general-section__actions .base-button_primary) {
  border-radius: var(--radius-10);
  border: 1px solid var(--text-accent);
  background-color: var(--text-accent);
  color: var(--white);
  padding: 10px;
  height: auto;
  min-height: 0;
  font-family: var(--font-family);
  font-weight: var(--font-semi-bold);
  font-size: var(--size-20);
  line-height: normal;
}

:deep(
  .admin-product-edit-general-section__actions
    .base-button_primary:hover:not(.base-button_disabled)
) {
  background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
}

:deep(
  .admin-product-edit-general-section__actions
    .base-button_primary:active:not(.base-button_disabled)
) {
  background-color: color-mix(in srgb, var(--text-accent) 78%, #000);
  border-color: color-mix(in srgb, var(--text-accent) 78%, #000);
}

:deep(.admin-product-edit-general-section__actions .base-button_outline) {
  border-radius: var(--radius-10);
  border-color: #010307;
}

:deep(
  .admin-product-edit-general-section__actions
    .base-button_outline:hover:not(.base-button_disabled)
) {
  background-color: var(--text-accent);
  border-color: var(--text-accent);
  color: var(--white);
}

:deep(
  .admin-product-edit-general-section__actions
    .base-button_outline:active:not(.base-button_disabled)
) {
  background-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  border-color: color-mix(in srgb, var(--text-accent) 88%, #000);
  color: var(--white);
}

@media (max-width: 1023px) {
  :deep(.admin-product-edit-general-section__actions .base-button_primary) {
    font-size: var(--size-15);
  }
}
</style>
