<script setup lang="ts">
defineProps<{ label: string; error?: string; hint?: string; forId?: string; required?: boolean }>()
</script>
<template><div><label v-if="label" :for="forId" class="mb-2 block text-xs font-semibold text-slate-700">{{ label }}<span v-if="required" class="ml-1 text-red-500">*</span></label><slot /><p v-if="error" class="mt-1.5 text-xs text-red-600">{{ error }}</p><p v-else-if="hint" class="mt-1.5 text-[11px] leading-5 text-slate-400">{{ hint }}</p></div></template>
