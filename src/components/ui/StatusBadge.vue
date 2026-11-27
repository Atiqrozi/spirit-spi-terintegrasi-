<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ status?: string | null }>()
const normalized = computed(() => String(props.status || 'UNKNOWN').toUpperCase())
const label = computed(() => ({
  ACTIVE: 'Aktif', DRAFT: 'Draft', PROCESSING: 'Diproses', PENDING: 'Menunggu', PENDING_REVIEW: 'Menunggu review',
  UNDER_REVIEW: 'Dalam review', HUMAN_REVIEW: 'Review manusia', AI_REVIEW_COMPLETED: 'AI selesai', COMPLETED: 'Selesai',
  APPROVED: 'Disetujui', APPROVE: 'Disetujui', NEEDS_REVISION: 'Perlu revisi', REVISION_REQUIRED: 'Perlu perbaikan',
  FAILED: 'Gagal', REJECTED: 'Ditolak', UPLOADED: 'Diunggah', EXTRACTED: 'Teks diekstrak', READY_FOR_REVIEW: 'Siap direview',
  NEEDS_MANUAL_REVIEW: 'Perlu pemeriksaan', ASSIGNED: 'Ditugaskan', IN_PROGRESS: 'Sedang dikerjakan', SUBMITTED: 'Dikirim',
  UNDER_VERIFICATION: 'Menunggu verifikasi', OPEN: 'Terbuka', CLOSED: 'Ditutup', FOLLOW_UP: 'Tindak lanjut',
  COMPLIANT: 'Sesuai', NON_COMPLIANT: 'Tidak sesuai', PARTIALLY_COMPLIANT: 'Sebagian sesuai', NOT_ASSESSABLE: 'Belum dapat dinilai',
  PUBLISHED: 'Terbit', ARCHIVED: 'Diarsipkan', NEEDS_VERIFICATION: 'Perlu verifikasi',
} as Record<string, string>)[normalized.value] || normalized.value.replaceAll('_', ' ').toLowerCase())
const color = computed(() => {
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'COMPLIANT', 'PUBLISHED', 'CLOSED'].includes(normalized.value)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (['FAILED', 'REJECTED', 'NON_COMPLIANT', 'NEEDS_REVISION'].includes(normalized.value)) return 'bg-red-50 text-red-700 ring-red-200'
  if (['PROCESSING', 'UNDER_REVIEW', 'IN_PROGRESS', 'AI_REVIEW_COMPLETED'].includes(normalized.value)) return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (['NEEDS_MANUAL_REVIEW', 'NEEDS_VERIFICATION', 'PENDING_REVIEW', 'REVISION_REQUIRED', 'UNDER_VERIFICATION'].includes(normalized.value)) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
})
</script>
<template><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset" :class="color"><span class="size-1.5 rounded-full bg-current" />{{ label }}</span></template>
