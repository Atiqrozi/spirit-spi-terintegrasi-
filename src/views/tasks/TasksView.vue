<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { ArrowRight, CalendarClock, Check, ClipboardList, FilePlus2, LoaderCircle, Plus, Search, ShieldAlert, UserRound } from 'lucide-vue-next'
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
import { formatDate, statusOf, titleOf } from '@/utils/format'
import type { EntityRecord } from '@/types/api'

const auth = useAuthStore(); const toast = useToastStore(); const qc = useQueryClient(); const page = ref(1); const search = ref(''); const statusFilter = ref(''); const modalOpen = ref(false)
const taskForm = ref({ title: '', description: '', assigneeId: '', auditee: '', startDate: '', dueDate: '' })
const auditeeOptions = [
  'Unit Pengadaan & Aset',
  'Unit Keuangan & Mobilitas Dana',
  'Unit Prasarana dan Sarana (jika terkait dengan pemeliharaan)',
  'Unit Sumber Daya Manusia & Pendidikan Pelatihan',
  'Unit Akuntansi & Perpajakan',
  'Unit Pemasaran & Layanan Pelanggan',
  'Unit Verifikasi BPJS & Asuransi',
  'Unit Gawat Darurat & Ruang Perawatan',
  'Unit Kamar Operasi, Ruang Pulih Sadar, Sterilisasi, dan Kaber',
  'Unit Penunjang Medis (Farmasi, Laborat, Radiologi & Gizi Klinis)',
  'Unit Rekam Medis & Informasi',
]
const canManage = computed(() => auth.role === 'ADMIN_SPI' || auth.role === 'PIMPINAN_SPI'); const canCreate = canManage
const tasksQuery = useQuery({ queryKey: computed(() => ['tasks', page.value, search.value, statusFilter.value]), queryFn: () => api.tasks({ page: page.value, limit: 20, ...(search.value ? { search: search.value } : {}), ...(statusFilter.value ? { status: statusFilter.value } : {}) }) })
const usersQuery = useQuery({ queryKey: ['task-assignees'], queryFn: () => api.taskAssignees({ page: 1, limit: 100 }), enabled: computed(() => canManage.value) })
const rows = computed(() => tasksQuery.data.value?.items || [])
const visibleRows = computed(() => rows.value)
const roleLabel = (role?: string) => ({ ADMIN_SPI: 'Admin SPI', PIMPINAN_SPI: 'Pimpinan SPI', ANGGOTA_SPI: 'Anggota SPI' }[String(role || '')] || 'Pengguna SPI')
const createMutation = useMutation({ mutationFn: api.createTask, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['tasks'] }); await qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.show({ kind: 'success', title: 'Penugasan dibuat' }); modalOpen.value = false; taskForm.value = { title: '', description: '', assigneeId: '', auditee: '', startDate: '', dueDate: '' } }, onError: (err) => toast.show({ kind: 'error', title: 'Penugasan tidak dibuat', description: getApiErrorMessage(err) }) })
const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.updateTask(id, data), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['tasks'] }); toast.show({ kind: 'success', title: 'Perubahan disimpan' }) }, onError: (err) => toast.show({ kind: 'error', title: 'Tugas tidak dapat diubah', description: getApiErrorMessage(err) }) })
function create() { if (!taskForm.value.title.trim()) return; createMutation.mutate({ title: taskForm.value.title.trim(), description: taskForm.value.description.trim() || undefined, auditee: taskForm.value.auditee || undefined, assigneeId: taskForm.value.assigneeId || undefined, startDate: taskForm.value.startDate ? new Date(taskForm.value.startDate).toISOString() : undefined, dueDate: taskForm.value.dueDate ? new Date(taskForm.value.dueDate).toISOString() : undefined }) }
function updateStatus(task: EntityRecord, value: string) { updateMutation.mutate({ id: task._id, data: { status: value } }) }
function statusChanged(task: EntityRecord, event: Event) { updateStatus(task, (event.target as HTMLSelectElement).value) }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-blue-600"><ClipboardList class="size-4" />Operasional SPI</div><h1 class="text-2xl font-bold tracking-tight text-navy-950">Penugasan SPI</h1><p class="mt-1.5 text-sm leading-6 text-slate-500">Pantau penanggung jawab, progres, dan tenggat tugas yang tersedia untuk akun Anda.</p></div><BaseButton v-if="canCreate" @click="modalOpen=true"><Plus class="size-4" />Buat penugasan</BaseButton></div>
    <div class="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900"><ShieldAlert class="mt-0.5 size-4 shrink-0" /><p>Anggota SPI dapat melihat tugas yang terkait dengan akunnya. Pembuatan dan perubahan tugas hanya tersedia bagi Admin SPI dan Pimpinan SPI.</p></div>
    <PanelCard>
      <div class="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2"><div class="relative min-w-0"><Search class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input v-model="search" class="field-input field-input-icon" placeholder="Cari penugasan…" /></div><select v-model="statusFilter" class="field-select w-full"><option value="">Semua status</option><option value="OPEN">Terbuka</option><option value="ASSIGNED">Ditugaskan</option><option value="IN_PROGRESS">Sedang dikerjakan</option><option value="COMPLETED">Selesai</option></select></div>
      <StatePanel v-if="tasksQuery.isPending.value" state="loading" title="Memuat penugasan" /><StatePanel v-else-if="tasksQuery.isError.value" state="error" :description="getApiErrorMessage(tasksQuery.error.value)" /><StatePanel v-else-if="!rows.length" state="empty" title="Tidak ada penugasan" description="Tugas yang dapat dilihat akun Anda akan muncul di sini." />
      <div v-else class="grid gap-3 lg:grid-cols-2"><article v-for="task in visibleRows" :key="task._id" class="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"><div class="flex items-start gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClipboardList class="size-[18px]" /></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-start justify-between gap-2"><h2 class="text-sm font-bold text-slate-900">{{ titleOf(task) }}</h2><StatusBadge :status="statusOf(task)" /></div><p v-if="task.data?.description" class="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{{ task.data.description }}</p></div></div><div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500"><span class="inline-flex items-center gap-1.5"><UserRound class="size-3.5" />{{ task.data?.assigneeName || (task.data?.assigneeId ? `Penanggung jawab ${task.data.assigneeId}` : 'Belum ditugaskan') }}<span v-if="task.data?.assigneeRole">· {{ roleLabel(task.data.assigneeRole) }}</span></span><span v-if="task.data?.auditee || task.data?.unitId">Auditee {{ task.data?.auditee || task.data.unitId }}</span><span class="inline-flex items-center gap-1.5"><CalendarClock class="size-3.5" />{{ task.data?.dueDate ? formatDate(task.data.dueDate) : 'Tanpa tenggat' }}</span></div><div class="mt-4 flex items-center justify-between"><RouterLink v-if="task.data?.followUp?.reportId || task.data?.reportId" :to="`/app/reports/${task.data?.followUp?.reportId || task.data?.reportId}`" class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">Lihat laporan <ArrowRight class="size-3.5" /></RouterLink><span v-else class="text-[10px] text-slate-400">Dibuat {{ formatDate(task.createdAt) }}</span><select v-if="canManage && !task.data?.followUp?.followUpId" class="field-select h-8 min-w-32 py-1 text-[10px]" :value="statusOf(task)" :disabled="updateMutation.isPending.value" @change="statusChanged(task, $event)"><option value="OPEN">Terbuka</option><option value="ASSIGNED">Ditugaskan</option><option value="IN_PROGRESS">Dikerjakan</option><option value="COMPLETED">Selesai</option><option value="CANCELLED">Dibatalkan</option></select><span v-else-if="task.data?.followUp?.followUpId" class="inline-flex items-center gap-1 text-[10px] text-slate-400"><Check class="size-3.5" />Kelola di tindak lanjut laporan</span></div></article></div>
      <div class="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4"><BaseButton variant="secondary" size="sm" :disabled="page<=1" @click="page--">Sebelumnya</BaseButton><BaseButton variant="secondary" size="sm" :disabled="!tasksQuery.data.value || page * tasksQuery.data.value.limit >= tasksQuery.data.value.total" @click="page++">Berikutnya</BaseButton></div>
    </PanelCard>
    <AppModal :open="modalOpen" title="Buat penugasan" description="Penugasan akan disimpan melalui modul task backend." @close="modalOpen=false"><form class="space-y-4" @submit.prevent="create"><FormField label="Judul" for-id="task-title" required><input id="task-title" v-model="taskForm.title" class="field-input" required placeholder="Nama kegiatan inspeksi" /></FormField><FormField label="Instruksi" for-id="task-description"><textarea id="task-description" v-model="taskForm.description" class="field-input min-h-24 resize-y" placeholder="Tujuan dan instruksi penugasan" /></FormField><FormField v-if="canManage" label="Penanggung jawab" for-id="task-assignee" hint="Daftar semua pengguna SPI aktif (Admin, Pimpinan, dan Anggota)."><select id="task-assignee" v-model="taskForm.assigneeId" class="field-input"><option value="">Belum ditentukan</option><option v-for="user in usersQuery.data.value?.items || []" :key="user._id || user.id" :value="user._id || user.id">{{ user.name || user.data?.name }} · {{ roleLabel(user.role) }} · {{ user.unit || 'Unit belum diatur' }}</option></select></FormField><FormField label="Auditee" for-id="task-unit" hint="Pilih unit auditee yang menjadi sasaran penugasan."><select id="task-unit" v-model="taskForm.auditee" class="field-input"><option value="">Pilih auditee</option><option v-for="unit in auditeeOptions" :key="unit" :value="unit">{{ unit }}</option></select></FormField><FormField label="Tanggal mulai" for-id="task-start"><input id="task-start" v-model="taskForm.startDate" type="date" class="field-input" /></FormField><FormField label="Tenggat" for-id="task-due"><input id="task-due" v-model="taskForm.dueDate" type="date" class="field-input" /></FormField><div class="flex justify-end gap-2 pt-2"><BaseButton variant="secondary" @click="modalOpen=false">Batal</BaseButton><BaseButton type="submit" :disabled="createMutation.isPending.value"><LoaderCircle v-if="createMutation.isPending.value" class="size-4 animate-spin" /><FilePlus2 v-else class="size-4" />Simpan penugasan</BaseButton></div></form></AppModal>
  </div>
</template>
