<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { Archive, ArrowDownToLine, ArrowLeft, ArrowRight, ExternalLink, Eye, FilePlus2, FileText, Filter, LoaderCircle, Plus, RefreshCw, Search } from 'lucide-vue-next'
import AppModal from '@/components/ui/AppModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FormField from '@/components/ui/FormField.vue'
import PanelCard from '@/components/ui/PanelCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { api } from '@/services/api'
import { getApiErrorMessage } from '@/services/api/http'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { formatDate, titleOf, typeOf } from '@/utils/format'
import type { EntityRecord } from '@/types/api'

const auth = useAuthStore(); const toast = useToastStore(); const qc = useQueryClient()
const search = ref(''); const category = ref(''); const status = ref(''); const page = ref(1)
const modalOpen = ref(false); const selected = ref<EntityRecord | null>(null); const uploadFile = ref<File | null>(null)
const openingDocumentId = ref<string | null>(null)
const form = ref({ title: '', number: '', category: 'SPO', description: '' })
const isAdmin = computed(() => auth.role === 'ADMIN_SPI')
const docsQuery = useQuery({ queryKey: computed(() => ['documents', search.value, category.value, status.value, page.value]), queryFn: () => api.documents({ page: page.value, limit: 20, ...(search.value ? { search: search.value } : {}), ...(category.value ? { category: category.value } : {}), ...(status.value ? { status: status.value } : {}) }) })
const versionsQuery = useQuery({ queryKey: computed(() => ['documents', selected.value?._id, 'versions']), queryFn: () => api.documentVersions(selected.value!._id), enabled: computed(() => Boolean(selected.value)) })
const latestFileId = computed(() => versionsQuery.data.value?.[0]?.data?.file?.fileId as string | undefined)
const secureFileQuery = useQuery({ queryKey: computed(() => ['file-access', latestFileId.value, 'inline']), queryFn: () => api.documentAccess(latestFileId.value!, 'inline'), enabled: computed(() => Boolean(latestFileId.value)) })
const createMutation = useMutation({ mutationFn: api.createDocument, onSuccess: async (doc) => { if (uploadFile.value) await api.uploadDocumentVersion(doc._id, uploadFile.value); await qc.invalidateQueries({ queryKey: ['documents'] }); toast.show({ kind: 'success', title: 'Dokumen tersimpan', description: uploadFile.value ? 'Versi dokumen dikirim untuk diproses.' : 'Dokumen acuan berhasil dibuat.' }); modalOpen.value = false; form.value = { title: '', number: '', category: 'SPO', description: '' }; uploadFile.value = null }, onError: (err) => toast.show({ kind: 'error', title: 'Dokumen tidak tersimpan', description: getApiErrorMessage(err) }) })
const publishMutation = useMutation({ mutationFn: api.publishDocument, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['documents'] }); if (selected.value) await versionsQuery.refetch(); toast.show({ kind: 'success', title: 'Dokumen diterbitkan' }) }, onError: (err) => toast.show({ kind: 'error', title: 'Tidak dapat menerbitkan dokumen', description: getApiErrorMessage(err) }) })
const rows = computed(() => docsQuery.data.value?.items || [])
watch([search, category, status], () => { page.value = 1 })
function save() { if (!form.value.title.trim()) return; createMutation.mutate({ title: form.value.title.trim(), number: form.value.number.trim() || undefined, category: form.value.category, description: form.value.description.trim() || undefined }) }
function chooseFile(event: Event) { uploadFile.value = (event.target as HTMLInputElement).files?.[0] || null }
function hasFile(version: EntityRecord) { return Boolean(version.data?.file?.fileId) }
async function openOriginal(row: EntityRecord) {
  const popup = window.open('about:blank', '_blank')
  if (!popup) {
    toast.show({ kind: 'error', title: 'Tab baru diblokir', description: 'Izinkan pop-up untuk situs ini, lalu coba lagi.' })
    return
  }
  popup.opener = null
  openingDocumentId.value = row._id
  try {
    const versions = await api.documentVersions(row._id)
    const fileId = versions[0]?.data?.file?.fileId as string | undefined
    if (!fileId) throw new Error('Dokumen ini belum memiliki file yang dapat dibuka.')
    const access = await api.documentAccess(fileId, 'inline')
    popup.location.replace(access.url)
  } catch (err) {
    popup.close()
    toast.show({ kind: 'error', title: 'Dokumen tidak dapat dibuka', description: getApiErrorMessage(err) })
  } finally {
    openingDocumentId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-blue-600"><FileText class="size-4" />Dokumen acuan</div><h1 class="text-2xl font-bold tracking-tight text-navy-950">Manajemen Dokumen</h1><p class="mt-1.5 text-sm leading-6 text-slate-500">Kelola dokumen SPO, peraturan, dan versi yang menjadi sumber evaluasi kepatuhan.</p></div><BaseButton v-if="isAdmin" @click="modalOpen = true"><Plus class="size-4" />Tambah dokumen</BaseButton></div>
    <PanelCard>
      <div class="mb-5 grid grid-cols-1 items-center gap-3 xl:grid-cols-[minmax(280px,1fr)_220px_190px_auto]"><div class="relative min-w-0"><Search class="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input v-model="search" class="field-input field-input-icon" placeholder="Cari nama atau nomor dokumen…" /></div><div class="relative min-w-0"><Filter class="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><select v-model="category" class="field-select field-select-icon w-full"><option value="">Semua kategori</option><option value="SPO">SPO</option><option value="REGULATION">Peraturan</option><option value="TEMPLATE">Template</option><option value="OTHER">Lainnya</option><option value="PERMENKES">Permenkes (lama)</option><option value="POLICY">Kebijakan (lama)</option></select></div><select v-model="status" class="field-select w-full"><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Diarsipkan</option></select><BaseButton class="justify-center whitespace-nowrap" variant="secondary" @click="docsQuery.refetch()"><RefreshCw class="size-3.5" />Segarkan</BaseButton></div>
      <StatePanel v-if="docsQuery.isPending.value" state="loading" title="Memuat daftar dokumen" />
      <StatePanel v-else-if="docsQuery.isError.value" state="error" :description="getApiErrorMessage(docsQuery.error.value)" />
      <StatePanel v-else-if="!rows.length" state="empty" title="Belum ada dokumen yang cocok" description="Coba ubah pencarian atau filter. Dokumen baru dapat ditambahkan oleh Admin SPI." />
      <div v-else class="-mx-5 overflow-x-auto sm:mx-0"><table class="w-full min-w-[720px] text-left"><thead><tr class="border-y border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><th class="px-5 py-3 sm:px-3">Nama dokumen</th><th class="px-3 py-3">Kategori / nomor</th><th class="px-3 py-3">Versi</th><th class="px-3 py-3">Diperbarui</th><th class="px-3 py-3">Status</th><th class="px-5 py-3 text-right sm:px-3">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="row in rows" :key="row._id" class="transition hover:bg-slate-50/70"><td class="px-5 py-3.5 sm:px-3"><div class="flex items-center gap-3"><span class="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><FileText class="size-4" /></span><div class="min-w-0"><button class="group inline-flex max-w-[320px] items-center gap-1.5 truncate text-left text-xs font-semibold text-slate-800 hover:text-blue-700" :disabled="openingDocumentId === row._id" :title="`Buka PDF: ${titleOf(row)}`" @click="openOriginal(row)">{{ titleOf(row) }}<ExternalLink class="size-3 shrink-0 text-slate-400 group-hover:text-blue-600" /></button><p class="mt-1 text-[10px] text-slate-400">Diperbarui {{ formatDate(row.updatedAt || row.createdAt) }}</p></div></div></td><td class="px-3 py-3.5"><p class="text-xs font-medium text-slate-700">{{ typeOf(row) }}</p><p class="mt-1 text-[10px] text-slate-400">{{ row.data?.number || 'Nomor tidak dicantumkan' }}</p></td><td class="px-3 py-3.5 text-xs text-slate-600">v{{ row.version || 'â€”' }}</td><td class="px-3 py-3.5 text-xs text-slate-600">{{ formatDate(row.updatedAt || row.createdAt) }}</td><td class="px-3 py-3.5"><StatusBadge :status="row.status" /></td><td class="px-5 py-3.5 text-right sm:px-3"><button class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50" @click="selected = row"><Eye class="size-3.5" />Detail / versi</button></td></tr></tbody></table></div>
      <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p class="text-[10px] text-slate-400">Halaman {{ page }} Â· {{ docsQuery.data.value?.total || 0 }} dokumen.</p><div class="flex gap-2"><BaseButton variant="secondary" size="sm" :disabled="page <= 1" @click="page--"><ArrowLeft class="size-3.5" />Sebelumnya</BaseButton><BaseButton variant="secondary" size="sm" :disabled="!docsQuery.data.value || page * docsQuery.data.value.limit >= docsQuery.data.value.total" @click="page++">Berikutnya<ArrowRight class="size-3.5" /></BaseButton></div></div>
    </PanelCard>

    <AppModal :open="Boolean(selected)" title="Detail dan versi dokumen" description="Metadata dan status pemrosesan dari backend." size="lg" @close="selected = null"><template v-if="selected"><div class="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p class="text-base font-bold text-slate-900">{{ titleOf(selected) }}</p><p class="mt-1 text-xs text-slate-500">{{ selected.data?.number || 'Nomor tidak tersedia' }} Â· {{ typeOf(selected) }}</p></div><StatusBadge :status="selected.status" /></div><div class="mb-5 flex flex-wrap gap-2"><BaseButton v-if="isAdmin" variant="secondary" size="sm" @click="publishMutation.mutate(selected._id)" :disabled="publishMutation.isPending.value"><LoaderCircle v-if="publishMutation.isPending.value" class="size-3.5 animate-spin" /><Archive v-else class="size-3.5" />Terbitkan versi terbaru</BaseButton><a v-if="secureFileQuery.data.value?.url" :href="secureFileQuery.data.value.url" target="_blank" rel="noopener noreferrer"><BaseButton variant="secondary" size="sm"><ArrowDownToLine class="size-3.5" />Buka file</BaseButton></a></div><div v-if="versionsQuery.isPending.value" class="py-8 text-center text-xs text-slate-400">Memuat versiâ€¦</div><StatePanel v-else-if="versionsQuery.isError.value" state="error" :description="getApiErrorMessage(versionsQuery.error.value)" /><StatePanel v-else-if="!versionsQuery.data.value?.length" state="empty" title="Belum ada versi file" description="Unggah versi melalui OCR Dokumen untuk memulai ekstraksi." /><div v-else class="space-y-3"><article v-for="version in versionsQuery.data.value" :key="version._id" class="rounded-xl border border-slate-200 p-4"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><FileText class="size-4" /></span><div><p class="text-xs font-semibold text-slate-800">{{ version.data?.file?.fileName || `Versi ${version.version}` }}</p><p class="mt-1 text-[10px] text-slate-400">v{{ version.version }} Â· {{ formatDate(version.createdAt) }}</p></div></div><StatusBadge :status="version.status" /></div><div v-if="version.data?.processing" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500"><span>{{ version.data.processing.pageCount ?? 0 }} halaman</span><span>{{ version.data.processing.indexedCount ?? 0 }} chunk di-index</span><span v-if="version.data.processing.manualReviewPages?.length" class="text-amber-700">Perlu pemeriksaan: {{ version.data.processing.manualReviewPages.join(', ') }}</span></div><details v-if="version._id === versionsQuery.data.value?.[0]?._id && hasFile(version)" class="mt-3"><summary class="cursor-pointer text-[11px] font-semibold text-blue-600">Pratinjau dokumen</summary><iframe v-if="secureFileQuery.data.value?.url" :src="secureFileQuery.data.value.url" class="mt-3 h-[400px] w-full rounded-xl border border-slate-200" title="Pratinjau dokumen acuan" /></details></article></div></template></AppModal>

    <AppModal :open="modalOpen" title="Tambah dokumen acuan" description="Identitas dokumen disimpan di MongoDB; file diproses melalui ImageKit dan antrean OCR." @close="modalOpen=false"><form class="space-y-4" @submit.prevent="save"><FormField label="Nama dokumen" for-id="doc-title" required><input id="doc-title" v-model="form.title" class="field-input" required placeholder="Judul dokumen" /></FormField><FormField label="Nomor dokumen" for-id="doc-number"><input id="doc-number" v-model="form.number" class="field-input" placeholder="Nomor / kode" /></FormField><FormField label="Kategori" for-id="doc-category"><select id="doc-category" v-model="form.category" class="field-input"><option value="SPO">SPO</option><option value="PERMENKES">Permenkes / Peraturan</option><option value="POLICY">Kebijakan</option><option value="OTHER">Lainnya</option></select></FormField><FormField label="Deskripsi" for-id="doc-description"><textarea id="doc-description" v-model="form.description" class="field-input min-h-20 resize-y" placeholder="Deskripsi singkat" /></FormField><FormField label="File versi pertama" for-id="doc-file" hint="Opsional. Jika belum diunggah, buat versi lewat halaman OCR Dokumen."><input id="doc-file" type="file" accept=".pdf,.jpg,.jpeg,.png" class="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700" @change="chooseFile" /></FormField><p v-if="uploadFile" class="text-[11px] text-slate-500">{{ uploadFile.name }}</p><div class="flex justify-end gap-2 pt-2"><BaseButton variant="secondary" @click="modalOpen=false">Batal</BaseButton><BaseButton type="submit" :disabled="createMutation.isPending.value"><LoaderCircle v-if="createMutation.isPending.value" class="size-4 animate-spin" /><FilePlus2 v-else class="size-4" />{{ createMutation.isPending.value ? 'Menyimpanâ€¦' : 'Simpan dokumen' }}</BaseButton></div></form></AppModal>
  </div>
</template>
