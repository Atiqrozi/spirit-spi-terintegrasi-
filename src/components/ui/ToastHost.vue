<script setup lang="ts">
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
</script>
<template><div class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2.5" aria-live="polite"><div v-for="item in toast.items" :key="item.id" class="pointer-events-auto flex gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/10" :class="item.kind === 'error' ? 'border-red-200' : 'border-slate-200'"><CheckCircle2 v-if="item.kind==='success'" class="mt-0.5 size-5 shrink-0 text-emerald-600" /><CircleAlert v-else-if="item.kind==='error'" class="mt-0.5 size-5 shrink-0 text-red-600" /><Info v-else class="mt-0.5 size-5 shrink-0 text-blue-600" /><div class="min-w-0 flex-1"><p class="text-sm font-semibold text-slate-900">{{ item.title }}</p><p v-if="item.description" class="mt-1 text-xs leading-5 text-slate-500">{{ item.description }}</p></div><button class="text-slate-400 hover:text-slate-700" aria-label="Tutup" @click="toast.items = toast.items.filter(x => x.id !== item.id)"><X class="size-4" /></button></div></div></template>
