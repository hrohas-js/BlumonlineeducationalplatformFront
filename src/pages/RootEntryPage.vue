<script setup lang="ts">
/** Placeholder для `/`; фактический редирект выполняет router guard (resolveRootRoute). */
</script>

<template>
  <div class="root-entry" aria-hidden="true" />
</template>

<style scoped>
.root-entry {
  min-height: 0;
}
</style>
