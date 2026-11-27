<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, CheckCircle2, ClipboardList, Clock3, FileCheck2, FileText, FolderOpen, Sparkles, TrendingUp } from 'lucide-vue-next'
import { api } from '@/services/api'
import { getApiErrorMessage } from '@/services/api/http'
import { useAuthStore } from '@/stores/auth'
import { countStatuses, formatDate, statusOf, titleOf } from '@/utils/format'
import PanelCard from '@/components/ui/PanelCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()
const summaryQuery = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: api.dashboard })
const taskQuery = useQuery({ queryKey: ['tasks', 1], queryFn: () => api.tasks({ page: 1, limit: 5 }) })
const reportCount = computed(() => countStatuses(summaryQuery.data.value?.reports))
const taskCount = computed(() => countStatuses(summaryQuery.data.value?.tasks))
const reportsTotal = computed(() => Object.values(reportCount.value).reduce((sum, x) => sum + x, 0))
const tasksTotal = computed(() => Object.values(taskCount.value).reduce((sum, x) => sum + x, 0))
const taskRows = computed(() => taskQuery.data.value?.items || [])
const greetingName = computed(() => auth.user?.name?.split(' ')[0] || 'Pengguna')
const activeTask = computed(() => (taskCount.value.OPEN || 0) + (taskCount.value.ASSIGNED || 0) + (taskCount.value.IN_PROGRESS || 0))
const openReport = computed(() => (reportCount.value.UPLOADED || 0) + (reportCount.value.PROCESSING || 0) + (reportCount.value.UNDER_REVIEW || 0) + (reportCount.value.NEEDS_REVISION || 0))
</script>

<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-[#103c6a] to-[#1769d2] px-6 py-6 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-7">
      <div class="absolute -right-14 -top-36 size-80 rounded-full border border-white/10" /><div class="absolute -right-2 -top-24 size-60 rounded-full border border-white/[.08]" /><div class="absolute right-36 top-0 h-full w-px rotate-12 bg-white/[.06]" />
      <div class="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 text-[10px] font-semibold text-teal-100"><Sparkles class="size-3.5" />Satuan Pengawas Internal</div><h1 class="text-xl font-bold tracking-tight sm:text-2xl">Selamat datang, {{ greetingName }}</h1><p class="mt-1.5 max-w-xl text-xs leading-5 text-blue-100/70 sm:text-sm">Pantau dokumen, penugasan, dan evaluasi SPI dari satu tempat.</p></div><div class="relative flex gap-2"><RouterLink to="/app/reports"><BaseButton variant="secondary" size="sm"><FileCheck2 class="size-4 text-blue-600" />Lihat laporan</BaseButton></RouterLink><RouterLink to="/app/tasks"><BaseButton variant="ghost" size="sm" class="border border-white/15 text-white hover:bg-white/10 hover:text-white"><ClipboardList class="size-4" />Tugas saya</BaseButton></RouterLink></div></div>
    </section>

    <StatePanel v-if="summaryQuery.isPending.value" state="loading" title="Memuat ringkasan" description="Mengambil ringkasan terbaru dari backend SPI." />
    <StatePanel v-else-if="summaryQuery.isError.value" state="error" :description="getApiErrorMessage(summaryQuery.error.value)" />
    <template v-else>
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)]"><div class="flex items-center justify-between"><span class="text-xs font-medium text-slate-500">Dokumen acuan</span><span class="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><FolderOpen class="size-[17px]" /></span></div><p class="mt-4 text-3xl font-bold tracking-tight text-slate-900">{{ summaryQuery.data.value?.referenceDocuments ?? '—' }}</p><p class="mt-1.5 text-[11px] text-slate-400">Jumlah dokumen terdaftar</p></article>
        <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)]"><div class="flex items-center justify-between"><span class="text-xs font-medium text-slate-500">Penugasan aktif</span><span class="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700"><ClipboardList class="size-[17px]" /></span></div><p class="mt-4 text-3xl font-bold tracking-tight text-slate-900">{{ activeTask }}</p><div class="mt-1.5 flex gap-2 text-[11px] text-slate-400"><span>{{ taskCount.OPEN || 0 }} terbuka</span><span>·</span><span>{{ taskCount.IN_PROGRESS || 0 }} dikerjakan</span></div></article>
        <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)]"><div class="flex items-center justify-between"><span class="text-xs font-medium text-slate-500">Laporan</span><span class="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600"><FileText class="size-[17px]" /></span></div><p class="mt-4 text-3xl font-bold tracking-tight text-slate-900">{{ reportsTotal }}</p><p class="mt-1.5 text-[11px] text-slate-400">{{ openReport }} menunggu proses atau review</p></article>
        <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)]"><div class="flex items-center justify-between"><span class="text-xs font-medium text-slate-500">Tugas selesai</span><span class="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 class="size-[17px]" /></span></div><p class="mt-4 text-3xl font-bold tracking-tight text-slate-900">{{ taskCount.COMPLETED || 0 }}</p><p class="mt-1.5 text-[11px] text-slate-400">Agregasi status dari API</p></article>
      </section>

      <section class="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <PanelCard title="Status laporan" description="Distribusi status yang dikembalikan oleh backend." flush>
          <div v-if="reportsTotal" class="space-y-4 p-5"><div v-for="[key, count] in Object.entries(reportCount).filter(([, count]) => count > 0)" :key="key" class="flex items-center gap-4"><div class="w-32 shrink-0"><StatusBadge :status="key" /></div><div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-blue-600" :style="{ width: `${Math.max(5, count / Math.max(reportsTotal, 1) * 100)}%` }" /></div><span class="w-8 text-right text-xs font-semibold text-slate-700">{{ count }}</span></div><RouterLink to="/app/reports" class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">Buka laporan <ArrowRight class="size-3.5" /></RouterLink></div>
          <div v-else class="p-5"><StatePanel state="empty" title="Belum ada laporan" description="Ringkasan status laporan akan muncul setelah laporan tersedia." /></div>
        </PanelCard>
        <PanelCard title="Ringkasan penugasan" description="Jumlah status tugas dari endpoint dashboard." flush>
          <div v-if="tasksTotal" class="grid grid-cols-2 gap-3 p-5"><div v-for="[key, count] in Object.entries(taskCount).filter(([, count]) => count > 0)" :key="key" class="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div class="flex items-center justify-between"><StatusBadge :status="key" /><span class="text-lg font-bold text-slate-800">{{ count }}</span></div></div><div class="col-span-2 mt-1 rounded-xl bg-blue-50 p-3 text-[11px] leading-5 text-blue-800"><Activity class="mr-1 inline size-3.5 align-[-2px]" />Data mengikuti agregasi status task di backend. Statistik tenggat belum disediakan API.</div></div>
          <div v-else class="p-5"><StatePanel state="empty" title="Belum ada penugasan" description="Penugasan akan muncul di sini setelah tersedia di sistem." /></div>
        </PanelCard>
      </section>

      <PanelCard title="Penugasan terbaru" description="Daftar tugas yang dapat diakses akun ini." flush>
        <StatePanel v-if="taskQuery.isPending.value" state="loading" title="Memuat penugasan" />
        <StatePanel v-else-if="taskQuery.isError.value" state="error" :description="getApiErrorMessage(taskQuery.error.value)" />
        <StatePanel v-else-if="!taskRows.length" state="empty" title="Belum ada penugasan" description="Tugas yang ditugaskan atau dibuat akun ini akan muncul di sini." />
        <div v-else class="divide-y divide-slate-100"><RouterLink v-for="task in taskRows" :key="task._id" to="/app/tasks" class="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6"><div class="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClipboardList class="size-4" /></div><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold text-slate-800">{{ titleOf(task) }}</p><p class="mt-1 text-[10px] text-slate-400">{{ task.data?.dueDate ? `Tenggat ${formatDate(task.data.dueDate)}` : 'Tenggat belum ditentukan' }}</p></div><StatusBadge :status="statusOf(task)" /><ArrowRight class="hidden size-4 text-slate-300 sm:block" /></RouterLink></div>
      </PanelCard>
      <section class="grid gap-5 xl:grid-cols-2">
        <PanelCard title="Notifikasi terbaru" description="Pemberitahuan penugasan dan tenggat untuk akun Anda." flush>
          <StatePanel v-if="!summaryQuery.data.value?.notifications?.length" state="empty" title="Belum ada notifikasi" description="Notifikasi penugasan dan pengingat tenggat akan muncul di sini." />
          <div v-else class="divide-y divide-slate-100"><div v-for="item in summaryQuery.data.value.notifications" :key="item._id" class="flex items-center gap-3 px-5 py-3.5"><span class="grid size-8 place-items-center rounded-lg" :class="item.priority === 'IMPORTANT' && !item.readAt ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'"><BellRing class="size-4" /></span><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold text-slate-800">{{ item.title }}<span v-if="item.priority === 'IMPORTANT' && !item.readAt" class="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">Important</span></p><p class="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{{ item.message }}</p><p class="mt-1 text-[10px] text-slate-400">{{ formatDate(item.createdAt) }}</p></div><RouterLink v-if="item.resource?.route?.startsWith('/app/')" :to="item.resource.route" class="text-[10px] font-semibold text-blue-600">Buka</RouterLink></div></div>
        </PanelCard>
        <PanelCard title="Tenggat mendatang" description="Task aktif dengan tanggal tenggat terdekat." flush>
          <StatePanel v-if="!summaryQuery.data.value?.upcomingDeadlines?.length" state="empty" title="Tidak ada tenggat terdekat" description="Tidak ada tenggat yang dikembalikan backend untuk scope akun ini." />
          <div v-else class="divide-y divide-slate-100"><div v-for="deadline in summaryQuery.data.value.upcomingDeadlines" :key="deadline.taskId" class="flex items-center gap-3 px-5 py-3.5"><span class="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Clock3 class="size-4" /></span><div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold text-slate-800">{{ deadline.title }}</p><p class="mt-1 text-[10px] text-slate-400">Tenggat {{ formatDate(deadline.dueAt) }}</p></div><StatusBadge :status="deadline.status" /></div></div>
        </PanelCard>
      </section>
    </template>
    <p class="flex items-center gap-1.5 text-[10px] text-slate-400"><TrendingUp class="size-3.5" />Ringkasan diperbarui dari endpoint dashboard. <ArrowUpRight class="ml-auto hidden size-3.5" /><ArrowDownRight class="hidden size-3.5" /><Clock3 class="hidden size-3.5" /></p>
  </div>
</template>
