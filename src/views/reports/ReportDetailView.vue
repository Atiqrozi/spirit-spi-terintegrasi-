<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { AlertTriangle, ArrowDownToLine, ArrowLeft, BookOpen, Check, CheckCircle2, Copy, FileCheck2, FileText, GitBranch, History, Lightbulb, LoaderCircle, MessageSquareText, Plus, RefreshCw, Sparkles, Upload, XCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
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
import { formatDate, formatDateTime, titleOf, typeOf, unitOf } from '@/utils/format'
import type { EntityRecord, FollowUpRecord, RecommendationRecord, ReviewRecord } from '@/types/api'

const route = useRoute(); const id = computed(() => String(route.params.id)); const auth = useAuthStore(); const toast = useToastStore(); const qc = useQueryClient()
void AppModal
const canDecide = computed(() => auth.role === 'ADMIN_SPI' || auth.role === 'PIMPINAN_SPI')
const canUpload = computed(() => auth.role === 'ADMIN_SPI' || auth.role === 'ANGGOTA_SPI')
const tab = ref('summary'); const uploadFile = ref<File | null>(null); const saving = ref(false); const actionError = ref('')
const promptText = ref('')
const recommendationNote = ref(''); const taskModal = ref(false); const selectedRecommendation = ref<RecommendationRecord | null>(null); const taskDueDate = ref('')
const evidenceFiles = ref<Record<string, File | null>>({}); const evidenceDescriptions = ref<Record<string, string>>({}); const verification = ref<{ followUp: FollowUpRecord; decision: 'COMPLETED' | 'REVISION_REQUIRED' | 'REJECTED' } | null>(null); const verificationNote = ref('')
const reviewIdOverride = ref('')

const reportQuery = useQuery({ queryKey: computed(() => ['report', id.value]), queryFn: () => api.report(id.value), enabled: computed(() => Boolean(id.value)) })
const versionsQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'versions']), queryFn: () => api.reportVersions(id.value), enabled: computed(() => Boolean(id.value)), refetchInterval: (query) => query.state.data?.[0]?.status === 'PROCESSING' ? 4000 : false })
const reviewsQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'reviews']), queryFn: () => api.reviews(id.value), enabled: computed(() => Boolean(id.value)), refetchInterval: (query) => { const latest = query.state.data?.[0]; return latest?.status === 'PROCESSING' ? 4000 : false } })
const comparisonBeforeId = ref(''); const comparisonAfterId = ref('')
const completedVersionReviews = computed(() => {
  const byVersion = new Map<string, ReviewRecord>()
  for (const item of reviewsQuery.data.value || []) {
    if (item.status !== 'COMPLETED' || item.data?.reviewPurpose === 'DIRECTOR_DISPOSITION' || byVersion.has(item.reportVersionId)) continue
    byVersion.set(item.reportVersionId, item)
  }
  return [...byVersion.values()].sort((a, b) => Number(versionsQuery.data.value?.find((v) => v._id === a.reportVersionId)?.version || 0) - Number(versionsQuery.data.value?.find((v) => v._id === b.reportVersionId)?.version || 0))
})
watch(completedVersionReviews, (items) => {
  if (items.length < 2) return
  if (!items.some((item) => item._id === comparisonBeforeId.value)) comparisonBeforeId.value = items[items.length - 2]._id
  if (!items.some((item) => item._id === comparisonAfterId.value)) comparisonAfterId.value = items[items.length - 1]._id
}, { immediate: true })
const comparisonBeforeQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'compare-review', comparisonBeforeId.value]), queryFn: () => api.review(id.value, comparisonBeforeId.value), enabled: computed(() => Boolean(id.value && comparisonBeforeId.value)) })
const comparisonAfterQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'compare-review', comparisonAfterId.value]), queryFn: () => api.review(id.value, comparisonAfterId.value), enabled: computed(() => Boolean(id.value && comparisonAfterId.value)) })
const comparisonFindingDiff = computed(() => {
  const before = comparisonBeforeQuery.data.value?.findings || []
  const after = comparisonAfterQuery.data.value?.findings || []
  const key = (item: any) => [item.title, item.description, item.complianceStatus, item.reasoning, item.suggestion].map((part) => String(part || '').trim().toLocaleLowerCase()).join('|')
  const beforeKeys = new Set(before.map(key)); const afterKeys = new Set(after.map(key))
  return { added: after.filter((item: any) => !beforeKeys.has(key(item))), removed: before.filter((item: any) => !afterKeys.has(key(item))) }
})
const comparisonRecommendationDiff = computed(() => {
  const before = comparisonBeforeQuery.data.value?.recommendations || []
  const after = comparisonAfterQuery.data.value?.recommendations || []
  const key = (item: any) => [item.title, item.description, item.action, item.rationale, item.priority].map((part) => String(part || '').trim().toLocaleLowerCase()).join('|')
  const beforeKeys = new Set(before.map(key)); const afterKeys = new Set(after.map(key))
  return { added: after.filter((item: any) => !beforeKeys.has(key(item))), removed: before.filter((item: any) => !afterKeys.has(key(item))) }
})
const latestReviewId = computed(() => reviewIdOverride.value || reviewsQuery.data.value?.[0]?._id || '')
const reviewQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'review', latestReviewId.value]), queryFn: () => api.review(id.value, latestReviewId.value), enabled: computed(() => Boolean(latestReviewId.value)), refetchInterval: (query) => query.state.data?.status === 'PROCESSING' ? 4000 : false })
const recommendationQuery = useQuery({ queryKey: computed(() => ['report', id.value, latestReviewId.value, 'recommendations']), queryFn: () => api.recommendations(id.value, latestReviewId.value), enabled: computed(() => Boolean(latestReviewId.value && reviewQuery.data.value?.status === 'COMPLETED')) })
const mappingQuery = useQuery({ queryKey: computed(() => ['report', id.value, latestReviewId.value, 'mapping']), queryFn: () => api.regulationMapping(id.value, latestReviewId.value), enabled: computed(() => Boolean(latestReviewId.value && reviewQuery.data.value?.status === 'COMPLETED')) })
const followUpQuery = useQuery({ queryKey: computed(() => ['report', id.value, 'follow-ups']), queryFn: () => api.followUps(id.value), enabled: computed(() => Boolean(id.value)) })

const report = computed(() => reportQuery.data.value)
const versions = computed(() => versionsQuery.data.value || [])
const latestVersion = computed(() => versions.value[0])
const currentReview = computed<ReviewRecord | undefined>(() => reviewQuery.data.value)
const promptHistory = computed(() => currentReview.value?.data?.promptHistory || [])
const findings = computed(() => currentReview.value?.findings || [])
const recommendations = computed(() => {
  const snapshot = currentReview.value?.recommendations || []
  const currentPage = recommendationQuery.data.value?.items || []
  if (!snapshot.length) return currentPage
  const currentById = new Map(currentPage.map((item) => [item._id, item]))
  return snapshot.map((item) => ({ ...item, ...(currentById.get(item._id) || {}) }))
})
const sources = computed(() => currentReview.value?.sources || mappingQuery.data.value || [])
const followUps = computed(() => followUpQuery.data.value?.items || [])
const isAiProcessing = computed(() => currentReview.value?.status === 'PROCESSING' || currentReview.value?.data?.status === 'AI_REVIEW_PROCESSING')
const reportTitle = computed(() => report.value ? titleOf(report.value) : 'Detail laporan')
const fileOfVersion = (version?: EntityRecord) => version?.data?.file?.url as string | undefined
const groupedRecommendations = computed(() => ({ report: recommendations.value.filter((item) => item.type === 'REPORT_IMPROVEMENT'), inspection: recommendations.value.filter((item) => item.type === 'INSPECTION_IMPROVEMENT') }))
const openFollowUps = computed(() => followUps.value.filter((item) => item.status !== 'COMPLETED').length)
const extractionError = computed(() => latestVersion.value?.data?.processing?.error as string | undefined)
const processingSteps = computed(() => {
  const extraction = latestVersion.value?.status
  const review = currentReview.value?.status
  const extractionDone = extraction === 'EXTRACTED'
  const extractionFailed = extraction === 'FAILED'
  const reviewDone = review === 'COMPLETED'
  return [
    { title: 'File laporan', detail: latestVersion.value ? `Versi ${latestVersion.value.version || 1} diterima` : 'Belum ada file', state: latestVersion.value ? 'done' : 'waiting' },
    { title: 'Ekstraksi PDF / OCR', detail: extraction === 'PROCESSING' ? 'Sedang berjalan' : extractionDone ? 'Teks berhasil diekstrak' : extraction === 'NEEDS_MANUAL_REVIEW' ? 'Perlu pemeriksaan manual' : extractionFailed ? 'Gagal · dapat dicoba ulang' : 'Menunggu file diproses', state: extractionDone ? 'done' : extraction === 'PROCESSING' ? 'active' : extractionFailed || extraction === 'NEEDS_MANUAL_REVIEW' ? 'failed' : 'waiting' },
    { title: 'Analisis AI', detail: reviewDone ? 'Analisis selesai' : isAiProcessing.value ? 'AI sedang menganalisis' : currentReview.value?.status === 'FAILED' ? 'Analisis gagal · dapat dicoba ulang' : extractionDone ? 'Menunggu AI review dimulai' : 'Menunggu ekstraksi selesai', state: reviewDone ? 'done' : isAiProcessing.value ? 'active' : currentReview.value?.status === 'FAILED' ? 'failed' : 'waiting' },
  ]
})
const statusText: Record<string, string> = { COMPLIANT: 'Sesuai', NON_COMPLIANT: 'Tidak sesuai', PARTIALLY_COMPLIANT: 'Sebagian sesuai', NOT_ASSESSABLE: 'Belum dapat dinilai' }
const reviewTabs = computed(() => [
  { id: 'summary', label: 'Ringkasan', icon: FileCheck2 }, { id: 'evidence', label: 'Evidence & Regulation Mapping', icon: BookOpen },
  { id: 'ai', label: 'Analisis AI', icon: Sparkles }, { id: 'recommendations', label: 'Rekomendasi', icon: Lightbulb },
  { id: 'compare', label: 'Bandingkan versi', icon: GitBranch },
  ...(canDecide.value ? [{ id: 'prompt', label: 'Prompt AI', icon: MessageSquareText }] : []),
  { id: 'followups', label: 'Tindak lanjut', icon: GitBranch }, { id: 'history', label: 'Riwayat', icon: History },
])
watch(() => latestVersion.value?.status, async (status, previousStatus) => {
  if (status && previousStatus === 'PROCESSING' && status !== 'PROCESSING') {
    await qc.invalidateQueries({ queryKey: ['reports'] })
    await qc.invalidateQueries({ queryKey: ['dashboard'] })
  }
})

async function refreshReportData() {
  await Promise.all([reportQuery.refetch(), versionsQuery.refetch(), reviewsQuery.refetch(), followUpQuery.refetch()])
  if (latestReviewId.value) { await reviewQuery.refetch(); await recommendationQuery.refetch(); await mappingQuery.refetch() }
}
async function safeAction(action: () => Promise<any>, success: string) {
  actionError.value = ''; saving.value = true
  try { await action(); toast.show({ kind: 'success', title: success }); await refreshReportData(); await qc.invalidateQueries({ queryKey: ['reports'] }); await qc.invalidateQueries({ queryKey: ['dashboard'] }) }
  catch (err) { actionError.value = getApiErrorMessage(err); toast.show({ kind: 'error', title: 'Aksi tidak berhasil', description: actionError.value }) }
  finally { saving.value = false }
}
async function uploadRevision() {
  if (!uploadFile.value) return
  await safeAction(async () => { await api.uploadReportVersion(id.value, uploadFile.value!); uploadFile.value = null }, 'Versi laporan dikirim untuk diproses')
}
async function startAiReview() {
  await safeAction(async () => { const result = await api.startReview(id.value); reviewIdOverride.value = result.reviewId }, 'AI review masuk antrean')
}
async function retryReportExtraction() {
  if (!latestVersion.value) return
  await safeAction(() => api.reprocessReportVersion(id.value, latestVersion.value!._id), 'Ekstraksi laporan dimulai ulang')
}
async function retryReview() { if (currentReview.value) await safeAction(async () => { const result = await api.retryReview(id.value, currentReview.value!._id); reviewIdOverride.value = result.reviewId }, 'AI review dicoba ulang') }
async function submitReviewPrompt() {
  const prompt = promptText.value.trim()
  if (!latestReviewId.value || !currentReview.value || currentReview.value.status !== 'COMPLETED') return
  if (prompt.length < 5) { actionError.value = 'Tuliskan prompt minimal 5 karakter.'; return }
  await safeAction(async () => { await api.promptReview(id.value, latestReviewId.value, prompt); promptText.value = '' }, 'Respons AI ditambahkan ke diskusi')
}
async function copyAiBundle() {
  if (!currentReview.value) return
  const review = currentReview.value
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : 'Tidak tersedia'
  const findingText = findings.value.map((finding, index) => [
    `### ${index + 1}. ${text(finding.title)}`,
    `- Status: ${statusText[finding.complianceStatus] || text(finding.complianceStatus)}`,
    `- Prioritas: ${text(finding.priority)}`,
    `- Uraian: ${text(finding.description)}`,
    `- Alasan: ${text(finding.reasoning)}`,
    `- Saran AI: ${text(finding.suggestion)}`,
    `- Bukti laporan: ${(finding.reportEvidence || []).map((item) => `halaman ${item.pageNumber}: “${item.quote}”`).join('; ') || 'Tidak tersedia'}`,
    `- ID sumber: ${(finding.sourceChunkIds || []).join(', ') || 'Tidak tersedia'}`,
  ].join('\n')).join('\n\n') || 'Tidak ada temuan tersimpan.'
  const recommendationText = recommendations.value.map((item, index) => [
    `### ${index + 1}. ${text(item.title)}`,
    `- Jenis: ${item.type === 'REPORT_IMPROVEMENT' ? 'Perbaikan laporan' : 'Peningkatan inspeksi'}`,
    `- Status: ${text(item.status)} · prioritas ${text(item.priority)}`,
    `- Uraian: ${text(item.description)}`,
    `- Alasan: ${text(item.rationale)}`,
    `- Tindakan yang disarankan: ${text(item.action)}`,
    `- Bukti laporan: ${(item.reportEvidence || []).map((evidence) => `halaman ${evidence.pageNumber}: “${evidence.quote}”`).join('; ') || 'Tidak tersedia'}`,
    `- ID sumber: ${(item.sourceChunkIds || []).join(', ') || 'Tidak tersedia'}`,
  ].join('\n')).join('\n\n') || 'Tidak ada rekomendasi tersimpan.'
  const regulationText = (review.data?.regulationAssessments || []).map((item, index) => `### ${index + 1}. ${item.documentId || 'Dokumen'} (versi ${item.documentVersionId || '—'})\n- Status: ${text(item.status)}\n- Ringkasan: ${text(item.summary)}\n- ID sumber: ${(item.sourceChunkIds || []).join(', ') || 'Tidak tersedia'}`).join('\n\n') || 'Tidak ada assessment peraturan tersimpan.'
  const sourceText = sources.value.map((source) => `### ${source.section || 'Sumber'} · ${source.chunkId}\n- Dokumen/versi: ${source.documentId} / ${source.documentVersionId}\n- Halaman: ${source.pageStart}${source.pageEnd !== source.pageStart ? `–${source.pageEnd}` : ''}\n- Teks sumber:\n${source.text}`).join('\n\n') || 'Tidak ada teks sumber retrieval tersimpan.'
  const conversationText = promptHistory.value.map((message) => `### ${message.role === 'user' ? 'Prompt pengguna' : 'Respons AI'} (${formatDateTime(message.createdAt)})\n${message.content}`).join('\n\n') || 'Belum ada diskusi prompt sebelumnya.'
  const bundle = [
    '# Paket Analisis AI Laporan SPI',
    `- Judul laporan: ${reportTitle.value}`,
    `- Jenis laporan: ${report.value ? typeOf(report.value) : 'Tidak tersedia'}`,
    `- Unit: ${report.value ? unitOf(report.value) : 'Tidak tersedia'}`,
    `- Versi laporan: ${versions.value.find((version) => version._id === review.reportVersionId)?.version || 'Tidak tersedia'}`,
    `- Model pembuat analisis: ${text(review.data?.model)}`,
    `- Analisis dibuat: ${review.data?.completedAt ? formatDateTime(review.data.completedAt) : formatDateTime(review.createdAt)}`,
    '',
    '## Instruksi untuk model AI lanjutan',
    'Tinjau kembali analisis dan rekomendasi di bawah berdasarkan bukti serta sumber yang disertakan. Periksa kekeliruan faktual dan logika; jika perlu, berikan analisis dan rekomendasi versi koreksi. Jangan mengarang kutipan, halaman, peraturan, atau fakta. Bedakan hal yang didukung bukti dan yang belum pasti. Pertahankan ID sumber saat mengutipnya, dan jelaskan jika konteks tidak cukup. Jawab dalam Bahasa Indonesia.',
    '', '## Ringkasan analisis AI', text(review.data?.summary),
    '', '## Batasan analisis', (review.data?.limitations || []).map((item) => `- ${item}`).join('\n') || 'Tidak dicatat.',
    '', '## Assessment peraturan', regulationText,
    '', '## Semua temuan AI', findingText,
    '', '## Semua rekomendasi AI', recommendationText,
    '', '## Semua sumber retrieval yang tersimpan', sourceText,
    '', '## Riwayat prompt dan respons sebelumnya', conversationText,
  ].join('\n')
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(bundle)
    else {
      const field = document.createElement('textarea'); field.value = bundle; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field); field.select()
      const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Clipboard tidak tersedia')
    }
    toast.show({ kind: 'success', title: 'Paket analisis disalin', description: 'Tempelkan isi clipboard ke ChatGPT, Claude, atau model AI lain.' })
  } catch {
    toast.show({ kind: 'error', title: 'Tidak dapat menyalin paket analisis', description: 'Izinkan akses clipboard di browser, lalu coba kembali.' })
  }
}
async function decideRecommendation(item: RecommendationRecord, decision: 'approve' | 'reject') {
  if (decision === 'reject' && !recommendationNote.value.trim()) { actionError.value = 'Isi catatan sebelum menolak rekomendasi.'; return }
  await safeAction(() => api.decideRecommendation(id.value, latestReviewId.value, item._id, decision, recommendationNote.value), decision === 'approve' ? 'Rekomendasi disetujui' : 'Rekomendasi ditolak')
}
async function approveSource(item: RecommendationRecord) { selectedRecommendation.value = item; taskDueDate.value = ''; taskModal.value = true }
async function createFollowUp() {
  if (!selectedRecommendation.value) return
  await safeAction(async () => { await api.createFollowUp(id.value, selectedRecommendation.value!._id, undefined, taskDueDate.value ? new Date(taskDueDate.value).toISOString() : undefined); taskModal.value = false }, 'Tugas tindak lanjut dibuat')
}
function selectEvidence(idValue: string, event: Event) { evidenceFiles.value[idValue] = (event.target as HTMLInputElement).files?.[0] || null }
async function submitEvidence(item: FollowUpRecord) {
  const file = evidenceFiles.value[item._id]
  if (!file) { toast.show({ kind: 'error', title: 'Pilih bukti terlebih dahulu' }); return }
  await safeAction(() => api.submitFollowUpEvidence(id.value, item._id, file, evidenceDescriptions.value[item._id] || ''), 'Bukti tindak lanjut dikirim')
  evidenceFiles.value[item._id] = null
}
async function verifyFollowUp() {
  if (!verification.value) return
  if (verification.value.decision !== 'COMPLETED' && !verificationNote.value.trim()) { actionError.value = 'Catatan wajib diisi untuk meminta perbaikan atau menolak.'; return }
  const selected = verification.value
  await safeAction(() => api.verifyFollowUp(id.value, selected.followUp._id, selected.decision, verificationNote.value), selected.decision === 'COMPLETED' ? 'Tindak lanjut diverifikasi selesai' : 'Keputusan verifikasi tersimpan')
  verification.value = null; verificationNote.value = ''
}
async function closeReport() {
  if (!window.confirm('Tutup laporan setelah verifikasi seluruh tindak lanjut?')) return
  await safeAction(() => api.closeReport(id.value, 'Ditutup setelah evaluasi dan tindak lanjut.'), 'Laporan ditutup')
}
void createFollowUp
void verifyFollowUp
function chooseRevision(event: Event) { uploadFile.value = (event.target as HTMLInputElement).files?.[0] || null }
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between"><RouterLink to="/app/reports" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"><ArrowLeft class="size-4" />Kembali ke laporan</RouterLink><BaseButton variant="ghost" size="sm" @click="refreshReportData"><RefreshCw class="size-3.5" />Segarkan</BaseButton></div>
    <StatePanel v-if="reportQuery.isPending.value" state="loading" title="Memuat laporan" /><StatePanel v-else-if="reportQuery.isError.value" state="error" :description="getApiErrorMessage(reportQuery.error.value)" />
    <template v-else-if="report">
      <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)] sm:p-6"><div class="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"><div class="flex items-start gap-4"><span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><FileText class="size-7" /></span><div><div class="mb-2 flex flex-wrap items-center gap-2"><StatusBadge :status="report?.status" /><span class="text-[10px] text-slate-400">{{ formatDateTime(report.updatedAt || report.createdAt) }}</span></div><h1 class="text-lg font-bold tracking-tight text-navy-950 sm:text-xl">{{ reportTitle }}</h1><p class="mt-1 text-xs text-slate-500">Evaluasi laporan dan rekomendasi perbaikan sesuai dokumen yang terindeks.</p><div class="mt-3 flex flex-wrap gap-2"><span class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">{{ typeOf(report) }}</span><span class="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{{ unitOf(report) }}</span><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">{{ versions.length }} versi</span></div></div></div><div class="flex flex-wrap gap-2"><a v-if="fileOfVersion(latestVersion)" :href="fileOfVersion(latestVersion)" target="_blank" rel="noopener noreferrer"><BaseButton variant="secondary"><ArrowDownToLine class="size-4" />Unduh laporan</BaseButton></a><BaseButton v-if="canDecide && latestVersion?.status === 'EXTRACTED'" :disabled="saving || isAiProcessing" @click="startAiReview"><LoaderCircle v-if="saving && !isAiProcessing" class="size-4 animate-spin" /><Sparkles v-else class="size-4" />Mulai AI review</BaseButton></div></div>
        <div v-if="canUpload" class="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4"><label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"><Upload class="size-3.5 text-blue-600" />{{ uploadFile?.name || 'Pilih PDF revisi' }}<input type="file" accept="application/pdf,.pdf" class="sr-only" @change="chooseRevision" /></label><BaseButton size="sm" :disabled="!uploadFile || saving" @click="uploadRevision"><LoaderCircle v-if="saving" class="size-3.5 animate-spin" /><Upload v-else class="size-3.5" />Unggah versi baru</BaseButton><span class="text-[10px] text-slate-400">PDF maks. 20 MB Â· versi lama tetap tersimpan</span></div>
      </section>
      <div v-if="actionError" class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><AlertTriangle class="size-4 shrink-0" />{{ actionError }}<button class="ml-auto" aria-label="Tutup" @click="actionError=''">Ã—</button></div>
      <div v-if="currentReview" class="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3"><span class="grid size-8 place-items-center rounded-lg bg-white text-blue-600"><Sparkles class="size-4" /></span><div class="min-w-0 flex-1"><p class="text-xs font-semibold text-blue-950">Snapshot AI Â· versi {{ versions.find(v => v._id === currentReview?.reportVersionId)?.version || 'â€”' }}</p><p class="mt-1 text-[10px] text-blue-700">{{ currentReview.data?.model || 'Model AI' }} Â· {{ currentReview.data?.completedAt ? formatDateTime(currentReview.data.completedAt) : currentReview.data?.status || currentReview.status }}</p></div><StatusBadge :status="currentReview.data?.status || currentReview.status" /><BaseButton v-if="canDecide && (currentReview.status==='FAILED' || currentReview.data?.status==='FAILED')" variant="secondary" size="sm" :disabled="saving" @click="retryReview"><RefreshCw class="size-3.5" />Ulangi</BaseButton></div>
      <div v-else-if="reviewsQuery.isPending.value" class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Memuat riwayat AI reviewâ€¦</div>
      <div v-else-if="!versions.length" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Belum ada file versi laporan. Unggah PDF untuk memulai ekstraksi teks.</div>
      <div v-else-if="latestVersion?.status === 'PROCESSING'" class="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900"><LoaderCircle class="mt-0.5 size-4 shrink-0 animate-spin" /><div>PDF sedang diekstrak. Halaman ini memeriksa status secara otomatis; tombol AI review akan tersedia setelah ekstraksi selesai.</div></div>
      <div v-else-if="latestVersion?.status === 'FAILED'" class="flex flex-wrap items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800"><AlertTriangle class="mt-0.5 size-4 shrink-0" /><div class="min-w-0 flex-1"><b>Ekstraksi PDF gagal.</b><p class="mt-1 break-words">{{ extractionError || 'Periksa koneksi file dan konfigurasi worker OCR.' }}</p></div><BaseButton v-if="canDecide" variant="secondary" size="sm" :disabled="saving" @click="retryReportExtraction"><LoaderCircle v-if="saving" class="size-3.5 animate-spin" /><RefreshCw v-else class="size-3.5" />Coba ekstraksi lagi</BaseButton></div>
      <div v-else-if="latestVersion?.status === 'NEEDS_MANUAL_REVIEW'" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Sebagian halaman perlu pemeriksaan manual sebelum analisis AI dapat dimulai.</div>
      <div v-else-if="latestVersion?.status === 'EXTRACTED' && !currentReview" class="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-950"><b>Ekstraksi selesai.</b> <span v-if="canDecide">Tekan tombol <b>Mulai AI review</b> di bagian atas untuk membuat analisis.</span><span v-else>Menunggu Admin atau Pimpinan SPI memulai AI review.</span></div>
      <div v-else-if="latestVersion && latestVersion.status !== 'EXTRACTED' && !currentReview" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Ekstraksi laporan belum siap untuk AI review. Status versi terbaru: <b>{{ latestVersion.status }}</b>.</div>

      <section v-if="versions.length" class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(12,39,75,.025)] sm:grid-cols-3" aria-label="Tahap pemrosesan laporan">
        <div v-for="(step, index) in processingSteps" :key="step.title" class="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3">
          <span class="grid size-8 shrink-0 place-items-center rounded-full" :class="step.state === 'done' ? 'bg-emerald-100 text-emerald-700' : step.state === 'active' ? 'bg-blue-100 text-blue-700' : step.state === 'failed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'">
            <CheckCircle2 v-if="step.state === 'done'" class="size-4" /><LoaderCircle v-else-if="step.state === 'active'" class="size-4 animate-spin" /><AlertTriangle v-else-if="step.state === 'failed'" class="size-4" /><span v-else class="text-xs font-bold">{{ index + 1 }}</span>
          </span>
          <div><p class="text-[11px] font-semibold text-slate-800">{{ step.title }}</p><p class="mt-1 text-[10px] leading-4 text-slate-500">{{ step.detail }}</p></div>
        </div>
      </section>

      <section class="grid items-start gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside class="space-y-4"><PanelCard title="Ringkasan laporan"><dl class="space-y-4"><div><dt class="text-[10px] text-slate-400">Pengirim laporan</dt><dd class="mt-1 text-xs font-medium text-slate-700">{{ report.createdByName || 'â€”' }}</dd></div><div><dt class="text-[10px] text-slate-400">Tanggal pengumpulan</dt><dd class="mt-1 text-xs font-medium text-slate-700">{{ formatDate(report.createdAt) }}</dd></div><div><dt class="text-[10px] text-slate-400">Unit</dt><dd class="mt-1 text-xs font-medium text-slate-700">{{ unitOf(report) }}</dd></div><div><dt class="text-[10px] text-slate-400">Versi laporan</dt><dd class="mt-1 text-xs font-medium text-slate-700">v{{ report.version || 'â€”' }}</dd></div><div><dt class="text-[10px] text-slate-400">Status akhir</dt><dd class="mt-1"><StatusBadge :status="report?.status" /></dd></div></dl></PanelCard>
          <PanelCard title="Dokumen terkait" description="File berasal dari versi ImageKit."><StatePanel v-if="!versions.length" state="empty" title="File belum tersedia" /><div v-else class="space-y-2"><div v-for="version in versions" :key="version._id" class="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3"><FileText class="size-4 shrink-0 text-red-500" /><div class="min-w-0 flex-1"><p class="truncate text-[10px] font-semibold text-slate-700">{{ version.data?.file?.fileName || `Versi ${version.version}` }}</p><p class="mt-1 text-[9px] text-slate-400">v{{ version.version }} Â· {{ formatDate(version.createdAt) }}</p></div><a v-if="fileOfVersion(version)" :href="fileOfVersion(version)" target="_blank" rel="noopener noreferrer" class="text-blue-600"><ArrowDownToLine class="size-3.5" /></a></div></div></PanelCard>
          <PanelCard v-if="latestVersion && latestVersion.status === 'NEEDS_MANUAL_REVIEW'" title="Pemeriksaan manual"><div class="flex items-start gap-2 text-[11px] leading-5 text-amber-800"><AlertTriangle class="mt-0.5 size-4 shrink-0" />Ada halaman yang memerlukan pemeriksaan manual sebelum review AI dapat dijalankan.</div></PanelCard>
        </aside>

        <div class="min-w-0 space-y-4">
          <div class="scrollbar-thin flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><button v-for="item in reviewTabs" :key="item.id" class="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition" :class="tab===item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'" @click="tab=item.id"><component :is="item.icon" class="size-3.5" />{{ item.label }}</button></div>
          <StatePanel v-if="reviewQuery.isPending.value && latestReviewId" state="loading" title="Memuat snapshot evaluasi" />
          <div v-else-if="!currentReview && ['evidence','ai','recommendations','prompt','history','compare'].includes(tab)" class="space-y-4"><StatePanel state="empty" title="Belum ada hasil AI review" description="Setelah versi laporan selesai diekstrak, Admin atau Pimpinan SPI dapat memulai AI review." /></div>
          <template v-else>
            <div v-if="tab==='summary'" class="space-y-4">
              <div v-if="currentReview" class="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,.7fr)]"><PanelCard title="Compliance overview" description="Status temuan berdasarkan analisis AI."><StatePanel v-if="isAiProcessing" state="loading" title="AI sedang menganalisis" description="Sumber aturan, temuan, dan rekomendasi akan tersedia setelah proses selesai." /><div v-else class="space-y-4"><p class="text-sm leading-6 text-slate-600">{{ currentReview.data?.summary || 'Ringkasan belum tersedia.' }}</p><div class="grid grid-cols-2 gap-3 sm:grid-cols-4"><div v-for="item in ['COMPLIANT','PARTIALLY_COMPLIANT','NON_COMPLIANT','NOT_ASSESSABLE']" :key="item" class="rounded-xl border border-slate-100 bg-slate-50 p-3"><p class="text-[10px] leading-4 text-slate-500">{{ statusText[item] }}</p><p class="mt-1 text-xl font-bold text-slate-800">{{ findings.filter(f => f.complianceStatus === item).length }}</p></div></div></div></PanelCard><PanelCard title="Rincian peraturan" description="Dokumen/versi hanya berasal dari retrieval."><StatePanel v-if="!currentReview.data?.regulationAssessments?.length" state="empty" title="Rincian peraturan belum tersedia" description="Belum ada hasil assessment per dokumen pada snapshot ini." /><div v-else class="space-y-2"><article v-for="(item, index) in currentReview.data.regulationAssessments" :key="`${item.documentId}-${item.documentVersionId}-${index}`" class="rounded-xl border border-slate-100 p-3"><div class="flex items-start justify-between gap-2"><div><p class="text-[11px] font-semibold text-slate-800">Dokumen {{ item.documentId }}</p><p class="mt-1 text-[9px] text-slate-400">Versi {{ item.documentVersionId }}</p></div><StatusBadge :status="item.status" /></div><p class="mt-2 text-[10px] leading-5 text-slate-600">{{ item.summary }}</p></article></div></PanelCard></div>
              <div v-else class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Belum ada evaluasi AI untuk ditampilkan.</div>
              <PanelCard title="Temuan penting" description="Temuan dan prioritas dari snapshot AI."><StatePanel v-if="!findings.length" state="empty" title="Belum ada temuan" /><div v-else class="space-y-3"><article v-for="item in findings.slice(0,5)" :key="item._id" class="flex gap-3 rounded-xl border border-slate-100 p-3.5"><span class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg" :class="item.priority==='CRITICAL'||item.priority==='HIGH'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'"><AlertTriangle class="size-3.5" /></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><p class="text-xs font-semibold text-slate-800">{{ item.title }}</p><StatusBadge :status="item.priority" /></div><p class="mt-1 text-[11px] leading-5 text-slate-600">{{ item.description }}</p><div class="mt-2 flex flex-wrap gap-2"><StatusBadge :status="item.complianceStatus" /><span v-if="item.reportEvidence?.length" class="text-[10px] text-slate-400">Bukti laporan hlm. {{ item.reportEvidence.map(e=>e.pageNumber).join(', ') }}</span><span v-else class="text-[10px] text-amber-700">Bukti laporan belum tersedia</span></div></div></article></div></PanelCard>
            </div>

            <div v-else-if="tab==='evidence'" class="space-y-4"><PanelCard title="Evidence & Regulation Mapping" description="Teks sumber ditampilkan persis dari retrieval Atlas; nomor pasal tidak dibuat oleh frontend."><StatePanel v-if="mappingQuery.isPending.value" state="loading" title="Memuat referensi sumber" /><StatePanel v-else-if="mappingQuery.isError.value" state="error" :description="getApiErrorMessage(mappingQuery.error.value)" /><StatePanel v-else-if="!sources.length" state="empty" title="Referensi belum tersedia" description="Sumber retrieval belum dikembalikan untuk snapshot ini. Gunakan tab Prompt AI untuk meninjau kembali temuan bersama sumber yang tersedia." /><div v-else class="space-y-4"><article v-for="source in sources" :key="source._id || source.chunkId" class="rounded-2xl border border-slate-200 p-4 sm:p-5"><div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-xs font-bold text-slate-900">{{ source.section || 'Bagian tidak dicantumkan' }}</p><p class="mt-1 text-[10px] leading-5 text-slate-500">Dokumen {{ source.documentId }} Â· versi {{ source.documentVersionId }} Â· halaman {{ source.pageStart }}<span v-if="source.pageEnd !== source.pageStart">â€“{{ source.pageEnd }}</span></p></div><span class="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[9px] text-slate-500">{{ source.chunkId }}</span></div><blockquote class="mt-4 border-l-2 border-blue-300 bg-blue-50/60 px-4 py-3 text-xs leading-6 text-slate-700">{{ source.text }}</blockquote><div class="mt-4 grid gap-3 sm:grid-cols-2"><div class="rounded-xl bg-slate-50 p-3"><p class="mb-2 text-[10px] font-semibold text-slate-700">Temuan yang memakai sumber</p><template v-for="finding in findings.filter(f=>f.sourceChunkIds?.includes(source.chunkId))" :key="finding._id"><p class="text-[10px] leading-5 text-slate-600">{{ finding.title }} Â· <span>{{ statusText[finding.complianceStatus] || 'Perlu verifikasi' }}</span></p></template><p v-if="!findings.some(f=>f.sourceChunkIds?.includes(source.chunkId))" class="text-[10px] text-slate-400">Belum ditautkan ke temuan.</p></div><div class="rounded-xl bg-slate-50 p-3"><p class="mb-2 text-[10px] font-semibold text-slate-700">Bukti dari laporan</p><template v-for="finding in findings.filter(f=>f.sourceChunkIds?.includes(source.chunkId))" :key="finding._id"><p v-for="(evidence,index) in finding.reportEvidence || []" :key="index" class="mb-1 text-[10px] leading-5 text-slate-600">Halaman {{ evidence.pageNumber }}: â€œ{{ evidence.quote }}â€”</p><p v-if="!finding.reportEvidence?.length" class="text-[10px] text-amber-700">Bukti laporan belum terverifikasi; perlu pemeriksaan manual.</p></template><p v-if="!findings.some(f=>f.sourceChunkIds?.includes(source.chunkId))" class="text-[10px] text-slate-400">Belum ada bukti laporan yang ditautkan.</p></div></div></article></div></PanelCard></div>

            <div v-else-if="tab==='ai'" class="space-y-4"><PanelCard title="Analisis AI" description="Analisis adalah rekomendasi, bukan keputusan hukum atau persetujuan resmi."><template #actions><BaseButton class="shrink-0 whitespace-nowrap" variant="secondary" size="sm" :disabled="currentReview?.status !== 'COMPLETED'" @click="copyAiBundle"><Copy class="size-3.5 shrink-0" />Salin semua hasil AI</BaseButton></template><StatePanel v-if="isAiProcessing" state="loading" title="Analisis sedang berjalan" /><div v-else class="space-y-4"><div class="rounded-xl border border-violet-100 bg-violet-50/60 p-4"><div class="mb-2 flex items-center gap-2 text-xs font-bold text-violet-900"><Sparkles class="size-4" />Ringkasan AI</div><p class="text-xs leading-6 text-slate-700">{{ currentReview?.data?.summary || 'Ringkasan belum tersedia.' }}</p></div><div class="grid gap-4 md:grid-cols-2"><div><h3 class="mb-2 text-xs font-bold text-slate-800">Temuan dan penjelasan</h3><div v-if="findings.length" class="space-y-2"><article v-for="finding in findings" :key="finding._id" class="rounded-xl border border-slate-100 p-3"><div class="flex flex-wrap items-center gap-2"><p class="text-xs font-semibold text-slate-800">{{ finding.title }}</p><StatusBadge :status="finding.priority" /><StatusBadge :status="finding.complianceStatus" /></div><p class="mt-2 text-[11px] leading-5 text-slate-600">{{ finding.description }}</p><p v-if="finding.reasoning" class="mt-2 text-[10px] leading-5 text-slate-500">Alasan: {{ finding.reasoning }}</p><p v-if="finding.suggestion" class="mt-2 text-[10px] leading-5 text-blue-700">Saran: {{ finding.suggestion }}</p><p class="mt-2 text-[9px] text-slate-400">Confidence model: {{ finding.confidence == null ? 'tidak disediakan' : finding.confidence }}</p></article></div><StatePanel v-else state="empty" title="Belum ada temuan" /></div><div><h3 class="mb-2 text-xs font-bold text-slate-800">Batasan analisis</h3><div v-if="currentReview?.data?.limitations?.length" class="space-y-2"><p v-for="(item,index) in currentReview.data.limitations" :key="index" class="rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900"><AlertTriangle class="mr-1.5 inline size-3.5 align-[-2px]" />{{ item }}</p></div><p v-else class="rounded-xl border border-slate-100 p-3 text-[11px] text-slate-500">Tidak ada keterbatasan tambahan yang diberikan pada respons AI.</p><div class="mt-4 rounded-xl border border-slate-100 p-3 text-[10px] leading-5 text-slate-500">Model: {{ currentReview?.data?.model || 'Tidak tersedia' }}<br />Waktu: {{ formatDateTime(currentReview?.data?.completedAt) }}<br />Versi laporan: {{ versions.find(v=>v._id===currentReview?.reportVersionId)?.version || 'â€”' }}</div></div></div></div></PanelCard></div>

            <div v-else-if="tab==='recommendations'" class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-sm font-bold text-slate-900">Rekomendasi AI</h2><p class="mt-1 text-[11px] text-slate-500">Rekomendasi memerlukan tinjauan manusia sebelum menjadi task.</p></div><input v-model="recommendationNote" class="field-input max-w-xs" placeholder="Catatan keputusan (opsional)" /></div><StatePanel v-if="recommendationQuery.isPending.value" state="loading" title="Memuat rekomendasi" /><StatePanel v-else-if="!recommendations.length" state="empty" title="Belum ada rekomendasi" description="Rekomendasi akan muncul setelah snapshot AI review selesai." /><template v-else><PanelCard title="Perbaikan laporan" description="Kelengkapan, konsistensi, analisis, dan bukti dalam laporan."><StatePanel v-if="!groupedRecommendations.report.length" state="empty" title="Belum ada rekomendasi perbaikan laporan" /><div v-else class="space-y-3"><article v-for="item in groupedRecommendations.report" :key="item._id" class="rounded-xl border border-slate-100 p-4"><div class="flex flex-wrap items-start justify-between gap-2"><div><h3 class="text-xs font-bold text-slate-800">{{ item.title }}</h3><p class="mt-1.5 text-[11px] leading-5 text-slate-600">{{ item.description }}</p></div><StatusBadge :status="item.status" /></div><p v-if="item.rationale" class="mt-2 text-[10px] leading-5 text-slate-500"><b>Alasan:</b> {{ item.rationale }}</p><p v-if="item.action" class="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-5 text-blue-800"><b>Langkah:</b> {{ item.action }}</p><div class="mt-3 flex flex-wrap items-center justify-between gap-2"><div class="flex items-center gap-2"><StatusBadge :status="item.priority" /><span v-if="item.sourceChunkIds?.length" class="text-[10px] text-slate-400">{{ item.sourceChunkIds.length }} referensi</span><span v-else class="text-[10px] text-amber-700">Sumber perlu diverifikasi</span></div><div v-if="canDecide && ['PENDING_REVIEW','NEEDS_VERIFICATION'].includes(item.status)" class="flex gap-2"><BaseButton size="sm" :disabled="saving || item.status==='NEEDS_VERIFICATION'" @click="decideRecommendation(item,'approve')"><Check class="size-3.5" />Setujui</BaseButton><BaseButton variant="secondary" size="sm" :disabled="saving" @click="decideRecommendation(item,'reject')"><XCircle class="size-3.5" />Tolak</BaseButton></div><BaseButton v-if="canDecide && item.status==='APPROVED'" variant="secondary" size="sm" @click="approveSource(item)"><Plus class="size-3.5" />Buat tindak lanjut</BaseButton></div></article></div></PanelCard>
              <PanelCard title="Peningkatan pelaksanaan inspeksi" description="Saran metode inspeksi, monitoring, koordinasi, atau pemeriksaan ulang."><StatePanel v-if="!groupedRecommendations.inspection.length" state="empty" title="Belum ada rekomendasi inspeksi" /><div v-else class="space-y-3"><article v-for="item in groupedRecommendations.inspection" :key="item._id" class="rounded-xl border border-slate-100 p-4"><div class="flex flex-wrap items-start justify-between gap-2"><div><h3 class="text-xs font-bold text-slate-800">{{ item.title }}</h3><p class="mt-1.5 text-[11px] leading-5 text-slate-600">{{ item.description }}</p></div><StatusBadge :status="item.status" /></div><p v-if="item.rationale" class="mt-2 text-[10px] leading-5 text-slate-500"><b>Alasan:</b> {{ item.rationale }}</p><p v-if="item.action" class="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-[10px] leading-5 text-teal-900"><b>Langkah:</b> {{ item.action }}</p><p v-if="item.verificationStatus==='NEEDS_VERIFICATION'" class="mt-2 text-[10px] text-amber-700">Perlu verifikasi manual sebelum disetujui.</p><div class="mt-3 flex flex-wrap items-center justify-between gap-2"><div class="flex items-center gap-2"><StatusBadge :status="item.priority" /><span v-if="item.sourceChunkIds?.length" class="text-[10px] text-slate-400">{{ item.sourceChunkIds.length }} referensi</span><span v-else class="text-[10px] text-amber-700">Sumber belum tersedia</span></div><div v-if="canDecide && ['PENDING_REVIEW','NEEDS_VERIFICATION'].includes(item.status)" class="flex gap-2"><BaseButton size="sm" :disabled="saving || item.status==='NEEDS_VERIFICATION'" @click="decideRecommendation(item,'approve')"><Check class="size-3.5" />Setujui</BaseButton><BaseButton variant="secondary" size="sm" :disabled="saving" @click="decideRecommendation(item,'reject')"><XCircle class="size-3.5" />Tolak</BaseButton></div><BaseButton v-if="canDecide && item.status==='APPROVED'" variant="secondary" size="sm" @click="approveSource(item)"><Plus class="size-3.5" />Buat tindak lanjut</BaseButton></div></article></div></PanelCard></template></div>

            <div v-else-if="tab==='compare'" class="space-y-4">
              <PanelCard title="Bandingkan hasil review AI" description="Snapshot setiap versi tersimpan terpisah. Pilih review sebelum dan sesudah laporan diperbaiki.">
                <StatePanel v-if="completedVersionReviews.length < 2" state="empty" title="Belum cukup versi untuk dibandingkan" description="Dibutuhkan hasil AI review selesai pada minimal dua versi laporan." />
                <template v-else>
                  <div class="grid gap-3 md:grid-cols-2">
                    <FormField label="Sebelum diperbaiki" for-id="compare-before"><select id="compare-before" v-model="comparisonBeforeId" class="field-input"><option v-for="item in completedVersionReviews" :key="item._id" :value="item._id">Versi {{ versions.find((version) => version._id === item.reportVersionId)?.version || '—' }} · {{ formatDateTime(item.createdAt) }}</option></select></FormField>
                    <FormField label="Sesudah diperbaiki" for-id="compare-after"><select id="compare-after" v-model="comparisonAfterId" class="field-input"><option v-for="item in completedVersionReviews" :key="item._id" :value="item._id">Versi {{ versions.find((version) => version._id === item.reportVersionId)?.version || '—' }} · {{ formatDateTime(item.createdAt) }}</option></select></FormField>
                  </div>
                  <StatePanel v-if="comparisonBeforeQuery.isPending.value || comparisonAfterQuery.isPending.value" state="loading" title="Memuat snapshot perbandingan" />
                  <div v-else class="mt-4 grid gap-4 xl:grid-cols-2">
                    <article v-for="(snapshot, side) in [comparisonBeforeQuery.data.value, comparisonAfterQuery.data.value]" :key="side" class="min-w-0 rounded-2xl border border-slate-200 p-4">
                      <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-bold text-slate-900">{{ side === 0 ? 'Sebelum diperbaiki' : 'Sesudah diperbaiki' }} · Versi {{ versions.find((version) => version._id === snapshot?.reportVersionId)?.version || '—' }}</h3><StatusBadge :status="snapshot?.status || 'UNKNOWN'" /></div>
                      <p class="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-600">{{ snapshot?.data?.summary || 'Ringkasan tidak tersedia.' }}</p>
                      <div class="mt-4"><p class="mb-2 text-[11px] font-bold text-slate-800">Temuan ({{ snapshot?.findings?.length || 0 }})</p><div v-if="snapshot?.findings?.length" class="space-y-2"><div v-for="finding in snapshot.findings" :key="finding._id" class="rounded-xl bg-slate-50 p-3"><div class="flex flex-wrap items-center gap-2"><p class="text-xs font-semibold text-slate-800">{{ finding.title }}</p><StatusBadge :status="finding.complianceStatus" /><span v-if="side === 1 && comparisonFindingDiff.added.some((item) => item._id === finding._id)" class="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">Temuan baru / berubah</span></div><p class="mt-1 text-[10px] leading-5 text-slate-600">{{ finding.description }}</p></div></div><p v-else class="text-[10px] text-slate-400">Tidak ada temuan tersimpan.</p></div>
                      <div class="mt-4"><p class="mb-2 text-[11px] font-bold text-slate-800">Rekomendasi ({{ snapshot?.recommendations?.length || 0 }})</p><div v-if="snapshot?.recommendations?.length" class="space-y-2"><div v-for="recommendation in snapshot.recommendations" :key="recommendation._id" class="rounded-xl border border-slate-100 p-3"><p class="text-xs font-semibold text-slate-800">{{ recommendation.title }}</p><p class="mt-1 text-[10px] leading-5 text-slate-600">{{ recommendation.action || recommendation.description }}</p><span v-if="side === 1 && comparisonRecommendationDiff.added.some((item) => item._id === recommendation._id)" class="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">Rekomendasi baru / berubah</span></div></div><p v-else class="text-[10px] text-slate-400">Tidak ada rekomendasi tersimpan.</p></div>
                    </article>
                  </div>
                  <div v-if="comparisonBeforeQuery.data.value && comparisonAfterQuery.data.value" class="mt-4 grid gap-3 sm:grid-cols-2"><div class="rounded-xl bg-blue-50 p-3 text-[11px] text-blue-900"><b>Perubahan temuan:</b> {{ comparisonFindingDiff.added.length }} baru/berubah, {{ comparisonFindingDiff.removed.length }} tidak muncul lagi.</div><div class="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-900"><b>Perubahan rekomendasi:</b> {{ comparisonRecommendationDiff.added.length }} baru/berubah, {{ comparisonRecommendationDiff.removed.length }} tidak muncul lagi.</div></div>
                </template>
              </PanelCard>
            </div>

            <div v-else-if="tab==='prompt'" class="space-y-4">
              <PanelCard title="Diskusikan hasil analisis AI" description="Berikan koreksi atau konteks tambahan. AI akan meninjau ulang temuan dan rekomendasi berdasarkan sumber yang tersedia.">
                
                <div class="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-[11px] leading-5 text-blue-900">Diskusi ini tersimpan pada snapshot review. Hasil AI awal tetap tersedia sebagai riwayat; jawaban prompt merupakan saran analisis dan tidak otomatis menjadi keputusan resmi.</div>
                <div v-if="!promptHistory.length" class="mb-4 rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">Belum ada diskusi. Contoh: “Tinjau ulang temuan penyimpanan barang; laporan menyebut FIFO pada halaman 3.”</div>
                <div v-else class="mb-4 max-h-[480px] space-y-3 overflow-y-auto pr-1" aria-live="polite">
                  <article v-for="(message, index) in promptHistory" :key="`${message.createdAt}-${index}`" class="max-w-[95%] rounded-2xl p-4" :class="message.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'mr-auto border border-slate-200 bg-white text-slate-700 shadow-sm'">
                    <p class="mb-1.5 text-[10px] font-bold uppercase tracking-wide opacity-70">{{ message.role === 'user' ? 'Prompt Anda' : 'Tinjauan AI' }}</p>
                    <p class="whitespace-pre-wrap text-xs leading-5">{{ message.content }}</p>
                    <p class="mt-2 text-right text-[9px] opacity-60">{{ formatDateTime(message.createdAt) }}</p>
                  </article>
                </div>
                <form class="space-y-3 border-t border-slate-100 pt-4" @submit.prevent="submitReviewPrompt">
                  <label for="review-prompt" class="block text-xs font-semibold text-slate-700">Apa yang perlu ditinjau ulang?</label>
                  <textarea id="review-prompt" v-model="promptText" class="field-input min-h-28 resize-y" maxlength="3000" :disabled="saving || currentReview?.status !== 'COMPLETED'" placeholder="Jelaskan bagian yang keliru, konteks tambahan, atau rekomendasi yang ingin ditinjau…" />
                  <div class="flex flex-wrap items-center justify-between gap-3"><p class="text-[10px] text-slate-400">{{ promptText.length }}/3000 karakter · Gunakan bukti halaman atau sumber bila tersedia.</p><BaseButton type="submit" :disabled="saving || currentReview?.status !== 'COMPLETED' || promptText.trim().length < 5"><LoaderCircle v-if="saving" class="size-3.5 animate-spin" /><MessageSquareText v-else class="size-3.5" />Kirim prompt</BaseButton></div>
                </form>
              </PanelCard>
            </div>

            <div v-else-if="tab==='followups'" class="space-y-4"><PanelCard title="Monitoring tindak lanjut" description="Tugas dibuat dari rekomendasi yang disetujui; bukti tetap terkait ke laporan dan versi. "><template #actions><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{{ openFollowUps }} belum selesai</span></template><StatePanel v-if="followUpQuery.isPending.value" state="loading" title="Memuat tindak lanjut" /><StatePanel v-else-if="followUpQuery.isError.value" state="error" :description="getApiErrorMessage(followUpQuery.error.value)" /><StatePanel v-else-if="!followUps.length" state="empty" title="Belum ada tindak lanjut" description="Setujui rekomendasi, lalu ubah menjadi task untuk memulai monitoring." /><div v-else class="space-y-3"><article v-for="item in followUps" :key="item._id" class="rounded-2xl border border-slate-200 p-4 sm:p-5"><div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-xs font-bold text-slate-900">{{ item.task?.data?.title || 'Tindak lanjut rekomendasi' }}</p><p class="mt-1 text-[10px] text-slate-500">Penanggung jawab: {{ item.assigneeId || 'Belum ditentukan' }} Â· Tenggat: {{ formatDate(item.dueDate) }}</p></div><StatusBadge :status="item.status" /></div><div v-if="item.evidence?.length" class="mt-3 space-y-1 rounded-xl bg-slate-50 p-3"><p class="text-[10px] font-semibold text-slate-600">Bukti yang dikirim</p><a v-for="evidence in item.evidence" :key="evidence._id" :href="evidence.file?.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-[10px] text-blue-700 hover:underline"><FileText class="size-3.5" />{{ evidence.file?.fileName || 'Buka bukti' }} Â· {{ evidence.status }}</a></div><div v-if="['OPEN','ASSIGNED','REVISION_REQUIRED'].includes(item.status) && (item.assigneeId===auth.user?.id || auth.role==='ADMIN_SPI')" class="mt-3"><BaseButton size="sm" :disabled="saving" @click="safeAction(()=>api.startFollowUp(id,item._id),'Tindak lanjut dimulai')"><Check class="size-3.5" />Mulai pengerjaan</BaseButton></div><div v-if="['ASSIGNED','IN_PROGRESS','REVISION_REQUIRED'].includes(item.status) && (item.assigneeId===auth.user?.id || auth.role==='ADMIN_SPI')" class="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_1.4fr_auto]"><input type="file" accept=".pdf,.jpg,.jpeg,.png" class="field-input text-[10px] file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-blue-700" @change="selectEvidence(item._id,$event)" /><input v-model="evidenceDescriptions[item._id]" class="field-input text-[10px]" placeholder="Catatan bukti (opsional)" /><BaseButton size="sm" :disabled="saving || !evidenceFiles[item._id]" @click="submitEvidence(item)"><Upload class="size-3.5" />Kirim bukti</BaseButton></div><div v-if="item.status==='SUBMITTED' && canDecide" class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><BaseButton size="sm" @click="verification={followUp:item,decision:'COMPLETED'}"><Check class="size-3.5" />Verifikasi selesai</BaseButton><BaseButton variant="secondary" size="sm" @click="verification={followUp:item,decision:'REVISION_REQUIRED'}"><RefreshCw class="size-3.5" />Minta perbaikan</BaseButton><BaseButton variant="danger" size="sm" @click="verification={followUp:item,decision:'REJECTED'}"><XCircle class="size-3.5" />Tolak bukti</BaseButton></div></article></div><div v-if="canDecide && report?.status==='FOLLOW_UP' && followUps.length && followUps.every(f=>f.status==='COMPLETED')" class="mt-5 flex justify-end border-t border-slate-100 pt-4"><BaseButton @click="closeReport"><CheckCircle2 class="size-4" />Tutup laporan</BaseButton></div></PanelCard></div>

            <div v-else-if="tab==='history'" class="space-y-4"><PanelCard title="Riwayat versi laporan"><StatePanel v-if="!versions.length" state="empty" title="Belum ada versi" /><div v-else class="space-y-3"><div v-for="version in versions" :key="version._id" class="relative flex gap-3"><span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><FileText class="size-4" /></span><div class="min-w-0 flex-1 rounded-xl border border-slate-100 p-3"><div class="flex flex-wrap items-center justify-between gap-2"><p class="text-xs font-semibold text-slate-800">Versi {{ version.version }}</p><StatusBadge :status="version.status" /></div><p class="mt-1 text-[10px] text-slate-500">{{ formatDateTime(version.createdAt) }}</p><a v-if="fileOfVersion(version)" :href="fileOfVersion(version)" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600">Buka file <ArrowDownToLine class="size-3" /></a></div></div></div></PanelCard><PanelCard title="Riwayat AI review"><StatePanel v-if="reviewsQuery.isPending.value" state="loading" /><StatePanel v-else-if="!reviewsQuery.data.value?.length" state="empty" title="Belum ada AI review" /><div v-else class="space-y-2"><button v-for="review in reviewsQuery.data.value" :key="review._id" class="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50" @click="reviewIdOverride=review._id"><span class="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600"><Sparkles class="size-4" /></span><div class="min-w-0 flex-1"><p class="text-xs font-semibold text-slate-800">Review versi {{ versions.find(v=>v._id===review.reportVersionId)?.version || 'â€”' }}</p><p class="mt-1 text-[10px] text-slate-500">{{ formatDateTime(review.createdAt) }}</p></div><StatusBadge :status="review.data?.status || review.status" /></button></div></PanelCard><PanelCard title="Riwayat tindak lanjut"><StatePanel v-if="!followUps.length" state="empty" title="Belum ada tindakan" /><div v-else class="space-y-2"><div v-for="item in followUps" :key="item._id" class="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p class="text-[11px] font-semibold text-slate-800">{{ item.task?.data?.title || 'Tindak lanjut' }}</p><p class="mt-1 text-[10px] text-slate-400">Dibuat {{ formatDate(item.createdAt) }}</p></div><StatusBadge :status="item.status" /></div></div></PanelCard></div>
          </template>
        </div>
      </section>
    </template>

    <AppModal :open="taskModal" title="Buat tindak lanjut" description="Rekomendasi yang disetujui akan menjadi task SPI." @close="taskModal=false"><div v-if="selectedRecommendation" class="space-y-4"><div class="rounded-xl bg-blue-50 p-3"><p class="text-xs font-semibold text-blue-950">{{ selectedRecommendation.title }}</p><p class="mt-1 text-[10px] leading-5 text-blue-800">{{ selectedRecommendation.action || selectedRecommendation.description }}</p></div><FormField label="Tenggat waktu" for-id="followup-due" hint="Opsional; backend belum menyediakan daftar penanggung jawab bagi Pimpinan SPI."><input id="followup-due" v-model="taskDueDate" type="date" class="field-input" /></FormField><div class="flex justify-end gap-2"><BaseButton variant="secondary" @click="taskModal=false">Batal</BaseButton><BaseButton :disabled="saving" @click="createFollowUp"><LoaderCircle v-if="saving" class="size-4 animate-spin" /><Plus v-else class="size-4" />Buat task</BaseButton></div></div></AppModal>
    <AppModal :open="Boolean(verification)" title="Verifikasi bukti tindak lanjut" description="Keputusan dan catatan dicatat sebagai riwayat." @close="verification=null"><div class="space-y-4"><div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{{ verification?.followUp.task?.data?.title || 'Tindak lanjut' }} Â· keputusan <b>{{ verification?.decision }}</b></div><FormField label="Catatan verifikasi" for-id="verify-note" :required="verification?.decision !== 'COMPLETED'"><textarea id="verify-note" v-model="verificationNote" class="field-input min-h-20 resize-y" placeholder="Catatan untuk anggota SPI" /></FormField><div class="flex justify-end gap-2"><BaseButton variant="secondary" @click="verification=null">Batal</BaseButton><BaseButton :disabled="saving" @click="verifyFollowUp"><Check class="size-4" />Simpan verifikasi</BaseButton></div></div></AppModal>
  </div>
</template>






