<script setup lang="ts">
import { LockKeyhole } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>
<template><section class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><span class="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><LockKeyhole class="size-6" /></span><p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-amber-600">403 · Akses ditolak</p><h1 class="mt-2 text-xl font-bold text-navy-950">Halaman ini memerlukan izin</h1><p class="mt-2 text-xs leading-5 text-slate-500">Peran akun Anda belum memiliki akses ke halaman atau aksi ini.</p><RouterLink to="/app/dashboard" class="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white">Kembali ke dashboard</RouterLink></section></template>
