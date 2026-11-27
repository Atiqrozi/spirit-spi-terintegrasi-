<script setup lang="ts">
import { computed } from 'vue'
import { twMerge } from 'tailwind-merge'
const props = withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit' }>(), { variant: 'primary', size: 'md', type: 'button' })
const classes = computed(() => twMerge(['inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:pointer-events-none disabled:opacity-50',
  props.variant === 'primary' && 'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
  props.variant === 'secondary' && 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
  props.variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  props.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
  props.size === 'sm' && 'h-8 px-3 text-xs', props.size === 'md' && 'h-10 px-4 text-sm', props.size === 'lg' && 'h-12 px-5 text-sm',
].filter(Boolean).join(' ')))
</script>
<template><button :type="type" :disabled="disabled" :class="classes"><slot /></button></template>
