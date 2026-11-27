<script setup lang="ts">
import { AlertCircle, FileSearch, LoaderCircle } from 'lucide-vue-next'
defineProps<{ state: 'loading' | 'error' | 'empty'; title?: string; description?: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>
<template>
  <div class="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
    <div class="mb-3 grid size-11 place-items-center rounded-2xl" :class="state === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'">
      <LoaderCircle v-if="state === 'loading'" class="size-5 animate-spin" />
      <AlertCircle v-else-if="state === 'error'" class="size-5" />
      <FileSearch v-else class="size-5" />
    </div>
    <p class="text-sm font-semibold text-slate-800">{{ title || (state === 'loading' ? 'Memuat data…' : state === 'error' ? 'Data belum dapat dimuat' : 'Belum ada data') }}</p>
    <p v-if="description" class="mt-1 max-w-md text-sm leading-6 text-slate-500">{{ description }}</p>
    <button v-if="state === 'error'" class="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white" @click="emit('retry')">Coba lagi</button>
    <slot />
  </div>
</template>
