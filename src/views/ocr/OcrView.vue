<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { CloudUpload, FileCheck2, FileImage, LoaderCircle, RotateCcw, ScanText, ShieldAlert, UploadCloud } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import FormField from '@/components/ui/FormField.vue'
import PanelCard from '@/components/ui/PanelCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { api } from '@/services/api'
import { getApiErrorMessage } from '@/services/api/http'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { formatDateTime } from '@/utils/format'
import type { EntityRecord } from '@/types/api'

const auth = useAuthStore(); const toast = useToastStore(); const queryClient = useQueryClient()
const file = ref<File | null>(null); const title = ref(''); const category = ref('SPO')
const activeDocId = ref(''); const activeJob = ref<EntityRecord | null>(null); const progress = ref(0); const error = ref(''); const busy = ref(false)
const adminCanUpload = computed(() => auth.role === 'ADMIN_SPI')
const processQuery = useQuery({
  queryKey: computed(() => ['documents', activeDocId.value, 'process-status']),
  queryFn: () => api.documentVersions(activeDocId.value),
  enabled: computed(() => Boolean(activeDocId.value)),
  refetchInterval: (query) => {
    const latest = query.state.data?.[0]
    const status = String(latest?.data?.processing?.status || latest?.status || '').toUpperCase()
    return ['ACTIVE', 'READY_FOR_REVIEW', 'NEEDS_MANUAL_REVIEW', 'FAILED', 'EXTRACTED'].includes(status) ? false : 4000
  },
})
const currentStatus = computed(() => processQuery.data.value?.[0]?.data?.processing?.status || processQuery.data.value?.[0]?.status || activeJob.value?.data?.processing?.status || activeJob.value?.status || 'PROCESSING')
const terminal = computed(() => ['ACTIVE', 'READY_FOR_REVIEW', 'NEEDS_MANUAL_REVIEW', 'FAILED', 'EXTRACTED'].includes(String(currentStatus.value).toUpperCase()))
watch([currentStatus, activeDocId], async ([status, documentId]) => {
  if (documentId && ['ACTIVE', 'READY_FOR_REVIEW', 'NEEDS_MANUAL_REVIEW', 'FAILED'].includes(String(status).toUpperCase())) {
    await queryClient.invalidateQueries({ queryKey: ['documents'] })
  }
})

function pickFile(event: Event) { const target = event.target as HTMLInputElement; file.value = target.files?.[0] || null; error.value = '' }
function dropFile(event: DragEvent) { const dropped = event.dataTransfer?.files?.[0]; if (dropped) { file.value = dropped; error.value = '' } }
async function submit() {
  error.value = ''; progress.value = 0
  if (!adminCanUpload.value) { error.value = 'Upload dokumen acuan hanya tersedia untuk Admin SPI.'; return }
  if (!file.value) { error.value = 'Pilih file PDF, JPG, atau PNG terlebih dahulu.'; return }
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.value.type)) { error.value = 'Format yang didukung: PDF, JPG, dan PNG.'; return }
  if (file.value.size > 20 * 1024 * 1024) { error.value = 'Ukuran file maksimal 20 MB.'; return }
  if (!title.value.trim()) { error.value = 'Nama dokumen harus diisi.'; return }
  busy.value = true
  try {
    const doc = await api.createDocument({ title: title.value.trim(), category: category.value })
    activeDocId.value = doc._id
    activeJob.value = await api.uploadDocumentVersion(doc._id, file.value, (value) => { progress.value = value })
    await queryClient.invalidateQueries({ queryKey: ['documents'] })
    toast.show({ kind: 'success', title: 'Dokumen dikirim untuk diproses', description: 'Status ekstraksi akan diperbarui otomatis.' })
    file.value = null
    if (activeJob.value.status !== 'PROCESSING') await processQuery.refetch()
  } catch (err) { error.value = getApiErrorMessage(err); toast.show({ kind: 'error', title: 'Upload tidak berhasil', description: error.value }) }
  finally { busy.value = false }
}
async function retry() { if (!activeDocId.value) return; try { activeJob.value = await api.reprocessDocument(activeDocId.value); await processQuery.refetch() } catch (err) { toast.show({ kind: 'error', title: 'Tidak dapat memulai ulang proses', description: getApiErrorMessage(err) }) } }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-blue-600"><ScanText class="size-4" />Ekstraksi dokumen</div><h1 class="text-2xl font-bold tracking-tight text-navy-950">OCR Dokumen</h1><p class="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">Unggah dokumen acuan untuk ekstraksi teks, pemeriksaan halaman, dan indexing sesuai proses backend.</p></div><StatusBadge v-if="activeDocId" :status="currentStatus" /></div>
    <div v-if="!adminCanUpload" class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldAlert class="mt-0.5 size-4 shrink-0" /><p>Endpoint upload dokumen acuan saat ini hanya mengizinkan <b>ADMIN_SPI</b>. Anggota dapat mengunggah laporan melalui halaman Laporan & Evaluasi.</p></div>
    <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <PanelCard title="Unggah dokumen" description="Backend menerima PDF, JPG, dan PNG hingga 20 MB.">
        <form class="space-y-5" @submit.prevent="submit">
          <div class="grid gap-4 sm:grid-cols-2"><FormField label="Nama dokumen" for-id="ocr-title" required><input id="ocr-title" v-model="title" class="field-input" placeholder="Contoh: SPO Pelayanan Rawat Inap" /></FormField><FormField label="Kategori" for-id="ocr-category" required><select id="ocr-category" v-model="category" class="field-input"><option value="SPO">SPO</option><option value="PERMENKES">Permenkes / Peraturan</option><option value="POLICY">Kebijakan</option><option value="OTHER">Lainnya</option></select></FormField></div>
          <label class="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50" @dragover.prevent @drop.prevent="dropFile"><input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="sr-only" @change="pickFile" /><span class="mb-3 grid size-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><CloudUpload class="size-6" /></span><span class="text-sm font-semibold text-slate-800">{{ file?.name || 'Tarik file ke area ini' }}</span><span class="mt-1.5 text-xs text-slate-500">atau pilih file dari perangkat · PDF, JPG, PNG · Maks. 20 MB</span><span v-if="file" class="mt-3 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-600">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</span></label>
          <div v-if="busy" class="space-y-2"><div class="flex justify-between text-[11px] text-slate-500"><span>Mengunggah ke penyimpanan</span><span>{{ progress }}%</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-blue-600 transition-all" :style="{ width: `${progress}%` }" /></div></div>
          <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700" role="alert">{{ error }}</div>
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p class="max-w-md text-[10px] leading-5 text-slate-400">OCR hanya mengekstrak teks. Pemeriksaan keaslian tanda tangan dan stempel tetap dilakukan manual.</p><BaseButton type="submit" :disabled="busy || !adminCanUpload"><LoaderCircle v-if="busy" class="size-4 animate-spin" /><UploadCloud v-else class="size-4" />{{ busy ? 'Mengunggah…' : 'Unggah & mulai proses' }}</BaseButton></div>
        </form>
      </PanelCard>
      <div class="space-y-5">
        <PanelCard title="Status proses" description="Status berasal dari endpoint process-status.">
          <StatePanel v-if="!activeDocId" state="empty" title="Belum ada proses aktif" description="Setelah file diunggah, progres pemrosesan akan ditampilkan di sini." />
          <StatePanel v-else-if="processQuery.isPending.value" state="loading" title="Memeriksa status" />
          <StatePanel v-else-if="processQuery.isError.value" state="error" :description="getApiErrorMessage(processQuery.error.value)" />
          <div v-else class="space-y-4"><div class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><FileCheck2 class="size-5" /></span><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold text-slate-800">{{ title }}</p><p class="mt-1 text-[10px] text-slate-400">ID {{ activeDocId }}</p></div></div><StatusBadge :status="currentStatus" /><div v-if="!terminal" class="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-[11px] leading-5 text-blue-800"><LoaderCircle class="size-4 animate-spin" />Ekstraksi dan indexing sedang berjalan.</div><div v-if="processQuery.data.value?.[0]?.data?.processing" class="space-y-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600"><p>Halaman: <b>{{ processQuery.data.value[0].data.processing.pageCount ?? '—' }}</b></p><p>Chunk terindeks: <b>{{ processQuery.data.value[0].data.processing.indexedCount ?? '—' }}</b></p><p v-if="processQuery.data.value[0].data.processing.manualReviewPages?.length" class="text-amber-700">Halaman perlu diperiksa: {{ processQuery.data.value[0].data.processing.manualReviewPages.join(', ') }}</p><p v-if="processQuery.data.value[0].data.processing.processedAt">Selesai: {{ formatDateTime(processQuery.data.value[0].data.processing.processedAt) }}</p></div><BaseButton v-if="currentStatus === 'FAILED'" variant="secondary" size="sm" @click="retry"><RotateCcw class="size-3.5" />Coba proses ulang</BaseButton></div>
        </PanelCard>
        <PanelCard title="Alur pemrosesan"><div class="space-y-4"><div v-for="(item, index) in ['Upload aman ke ImageKit', 'Ekstraksi teks PDF / OCR per halaman', 'Chunking dan indexing dokumen acuan']" :key="item" class="flex gap-3"><span class="grid size-6 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">{{ index + 1 }}</span><p class="pt-1 text-[11px] leading-5 text-slate-600">{{ item }}</p></div><div class="flex items-start gap-2 rounded-xl border border-slate-100 p-3 text-[10px] leading-5 text-slate-500"><FileImage class="mt-0.5 size-4 shrink-0 text-teal-600" />Halaman yang tidak terbaca dapat ditandai untuk pemeriksaan manual oleh Admin SPI.</div></div></PanelCard>
      </div>
    </section>
  </div>
</template>
