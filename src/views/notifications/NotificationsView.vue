<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { Bell, CheckCheck, RefreshCw } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import PanelCard from '@/components/ui/PanelCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { api } from '@/services/api'
import { getApiErrorMessage } from '@/services/api/http'
import { useToastStore } from '@/stores/toast'
import { formatDateTime } from '@/utils/format'

const qc = useQueryClient(); const toast = useToastStore(); const page = ref(1); const status = ref(''); const category = ref('')
const query = useQuery({ queryKey: computed(() => ['notifications', page.value, status.value, category.value]), queryFn: () => api.notifications({ page: page.value, limit: 20, ...(status.value ? { status: status.value } : {}), ...(category.value ? { category: category.value } : {}) }) })
const items = computed(() => query.data.value?.items || [])
const readMutation = useMutation({ mutationFn: api.markNotificationRead, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['notifications'] }); await qc.invalidateQueries({ queryKey: ['notification-unread-count'] }) }, onError: (err) => toast.show({ kind: 'error', title: 'Notifikasi gagal diperbarui', description: getApiErrorMessage(err) }) })
const allReadMutation = useMutation({ mutationFn: api.markAllNotificationsRead, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['notifications'] }); await qc.invalidateQueries({ queryKey: ['notification-unread-count'] }); toast.show({ kind: 'success', title: 'Semua notifikasi ditandai dibaca' }) }, onError: (err) => toast.show({ kind: 'error', title: 'Notifikasi gagal diperbarui', description: getApiErrorMessage(err) }) })
function resourceRoute(route?: string) { return route?.startsWith('/app/') ? route : '/app/notifications' }
</script>

<template>
  <main class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Pusat komunikasi</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-navy-950">Notifikasi</h1><p class="mt-1 text-xs text-slate-500">{{ query.data.value?.unreadCount ?? 0 }} notifikasi belum dibaca.</p></div><div class="flex gap-2"><BaseButton variant="secondary" size="sm" :disabled="allReadMutation.isPending.value || !query.data.value?.unreadCount" @click="allReadMutation.mutate()"><CheckCheck class="size-3.5" />Tandai semua dibaca</BaseButton><BaseButton variant="secondary" size="sm" :disabled="query.isFetching.value" @click="query.refetch()"><RefreshCw class="size-3.5" :class="query.isFetching.value && 'animate-spin'" />Muat ulang</BaseButton></div></header>
    <PanelCard title="Kotak masuk" description="Notifikasi terkait penugasan, laporan, dokumen, dan tindak lanjut.">
      <div class="mb-4 flex flex-wrap gap-2"><select v-model="status" class="field-select" @change="page=1"><option value="">Semua status baca</option><option value="UNREAD">Belum dibaca</option><option value="READ">Sudah dibaca</option></select><input v-model="category" class="field-input max-w-56" placeholder="Kategori (opsional)" @change="page=1" /></div>
      <StatePanel v-if="query.isPending.value" state="loading" title="Memuat notifikasi" />
      <StatePanel v-else-if="query.isError.value" state="error" title="Inbox notifikasi belum dapat dimuat" :description="getApiErrorMessage(query.error.value)" @retry="query.refetch()" />
      <StatePanel v-else-if="!items.length" state="empty" title="Belum ada notifikasi" description="Notifikasi baru akan tampil di sini." />
      <div v-else class="divide-y divide-slate-100"><article v-for="item in items" :key="item._id" class="flex gap-3 py-4 first:pt-1 last:pb-1" :class="!item.readAt ? (item.priority === 'IMPORTANT' ? 'rounded-xl bg-red-50/60 px-3' : 'rounded-xl bg-blue-50/50 px-3') : ''"><span class="grid size-9 shrink-0 place-items-center rounded-xl" :class="item.priority === 'IMPORTANT' && !item.readAt ? 'bg-red-100 text-red-600' : !item.readAt ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'"><Bell class="size-4" /></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="text-xs font-semibold text-slate-800">{{ item.title }}</h3><span v-if="item.priority === 'IMPORTANT'" class="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-200"><span class="size-1.5 rounded-full bg-current" />Important</span><StatusBadge v-else :status="item.priority" /><span v-if="!item.readAt" class="rounded-full px-2 py-0.5 text-[9px] font-semibold" :class="item.priority === 'IMPORTANT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">Baru</span></div><p class="mt-1 text-[11px] leading-5 text-slate-600">{{ item.message }}</p><div class="mt-2 flex gap-3"><RouterLink v-if="item.resource?.route" :to="resourceRoute(item.resource.route)" class="text-[10px] font-semibold text-blue-700">Buka terkait</RouterLink><button v-if="!item.readAt" class="text-[10px] font-semibold text-slate-600 hover:text-blue-700" :disabled="readMutation.isPending.value" @click="readMutation.mutate(item._id)">Tandai dibaca</button></div></div><time class="shrink-0 text-[10px] text-slate-400">{{ formatDateTime(item.createdAt) }}</time></article></div>
      <div class="mt-4 flex justify-between border-t border-slate-100 pt-4"><BaseButton variant="secondary" size="sm" :disabled="page<=1" @click="page--">Sebelumnya</BaseButton><span class="self-center text-[10px] text-slate-400">Halaman {{ page }} / {{ Math.max(1, Math.ceil((query.data.value?.total || 0) / 20)) }}</span><BaseButton variant="secondary" size="sm" :disabled="!query.data.value || page * query.data.value.limit >= query.data.value.total" @click="page++">Berikutnya</BaseButton></div>
    </PanelCard>
  </main>
</template>
