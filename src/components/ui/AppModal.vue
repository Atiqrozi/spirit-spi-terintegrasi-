<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
withDefaults(defineProps<{ open: boolean; title: string; description?: string; size?: 'md' | 'lg' }>(), { size: 'md' })
const emit = defineEmits<{ close: [] }>()
function onKey(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey)); onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
<template><Teleport to="body"><Transition><div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-navy-950/50 p-3 backdrop-blur-[2px] sm:p-6" @click.self="emit('close')"><section class="max-h-[92vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl" :class="size === 'lg' ? 'max-w-3xl' : 'max-w-xl'"><header class="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 class="text-base font-bold text-slate-900">{{ title }}</h2><p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">{{ description }}</p></div><button class="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800" aria-label="Tutup dialog" @click="emit('close')"><X class="size-4" /></button></header><div class="scrollbar-thin max-h-[calc(92vh-76px)] overflow-y-auto p-5 sm:p-6"><slot /></div></section></div></Transition></Teleport></template>
