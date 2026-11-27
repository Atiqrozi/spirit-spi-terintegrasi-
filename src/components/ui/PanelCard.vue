<script setup lang="ts">
defineProps<{ title?: string; description?: string; flush?: boolean }>()
</script>
<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(12,39,75,.035)]">
    <header v-if="title || $slots.actions" class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div><h2 v-if="title" class="text-sm font-bold text-slate-900">{{ title }}</h2><p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">{{ description }}</p></div><slot name="actions" />
    </header>
    <div :class="flush ? '' : 'p-5'"><slot /></div>
  </section>
</template>
