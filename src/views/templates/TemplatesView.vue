<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { Archive, FileStack, Layers3, LoaderCircle, Plus, Send, ShieldAlert } from 'lucide-vue-next'
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
import { formatDate, titleOf } from '@/utils/format'
import type { EntityRecord } from '@/types/api'

const auth = useAuthStore(); const toast = useToastStore(); const qc = useQueryClient(); const open = ref(false); const name = ref(''); const parent = ref<EntityRecord | null>(null)
const isAdmin = computed(() => auth.role === 'ADMIN_SPI')
const page = ref(1)
const query = useQuery({ queryKey: computed(() => ['templates', page.value]), queryFn: () => api.templates({ page: page.value, limit: 20 }) })
const items = computed(() => query.data.value?.items || [])
const saveMutation = useMutation({ mutationFn: (input: { id?: string; name: string }) => input.id ? api.createTemplateVersion(input.id, { name: input.name }) : api.createTemplate({ name: input.name }), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['templates'] }); toast.show({ kind: 'success', title: 'Template tersimpan' }); open.value = false; name.value = ''; parent.value = null }, onError: (err) => toast.show({ kind: 'error', title: 'Template tidak tersimpan', description: getApiErrorMessage(err) }) })
const publishMutation = useMutation({ mutationFn: api.publishTemplate, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['templates'] }); toast.show({ kind: 'success', title: 'Template diterbitkan' }) }, onError: (err) => toast.show({ kind: 'error', title: 'Tidak dapat menerbitkan template', description: getApiErrorMessage(err) }) })
function submit() { if (name.value.trim()) saveMutation.mutate({ id: parent.value?._id, name: name.value.trim() }) }
</script>
<template>
  <div class="space-y-6"><div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-blue-600"><Layers3 class="size-4" />Standar laporan</div><h1 class="text-2xl font-bold tracking-tight text-navy-950">Template Laporan</h1><p class="mt-1.5 text-sm leading-6 text-slate-500">Template membantu menjaga konsistensi dokumen laporan yang digunakan tim SPI.</p></div><BaseButton v-if="isAdmin" @click="open=true"><Plus class="size-4" />Buat template</BaseButton></div>
    <div class="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900"><ShieldAlert class="mt-0.5 size-4 shrink-0" /><p>Daftar template memakai pagination kontrak baru. Struktur field, versi immutable, dan endpoint preview tersedia di kontrak target; jika route preview belum aktif, backend akan menampilkan error API secara eksplisit.</p></div>
    <PanelCard title="Daftar template" description="Status dan nomor versi dari API."><StatePanel v-if="query.isPending.value" state="loading" title="Memuat template" /><StatePanel v-else-if="query.isError.value" state="error" :description="getApiErrorMessage(query.error.value)" /><StatePanel v-else-if="!items.length" state="empty" title="Belum ada template" description="Template organisasi akan ditampilkan setelah didaftarkan oleh Admin SPI." /><div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><article v-for="item in items" :key="item._id" class="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-md"><div class="flex items-start justify-between"><span class="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><FileStack class="size-5" /></span><StatusBadge :status="item.status" /></div><h2 class="mt-4 text-sm font-bold text-slate-900">{{ titleOf(item) }}</h2><p class="mt-1.5 text-[11px] text-slate-500">Versi {{ item.version || 1 }} · diperbarui {{ formatDate(item.updatedAt || item.createdAt) }}</p><pre v-if="item.data?.fields?.length" class="mt-3 max-h-24 overflow-auto rounded-lg bg-slate-50 p-2 text-[10px] text-slate-500">{{ JSON.stringify(item.data.fields, null, 2) }}</pre><div v-if="isAdmin" class="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><BaseButton variant="secondary" size="sm" @click="parent=item; name=titleOf(item); open=true"><Plus class="size-3.5" />Versi baru</BaseButton><BaseButton size="sm" :disabled="publishMutation.isPending.value || item.status==='ACTIVE'" @click="publishMutation.mutate(item._id)"><Archive class="size-3.5" />Terbitkan</BaseButton></div></article></div><div class="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4"><BaseButton variant="secondary" size="sm" :disabled="page<=1" @click="page--">Sebelumnya</BaseButton><BaseButton variant="secondary" size="sm" :disabled="!query.data.value || page*query.data.value.limit>=query.data.value.total" @click="page++">Berikutnya</BaseButton></div></PanelCard>
    <AppModal :open="open" :title="parent ? 'Buat versi template' : 'Buat template'" description="Hanya nama template yang digunakan karena bentuk field belum tersedia pada kontrak backend." @close="open=false"><form class="space-y-4" @submit.prevent="submit"><FormField label="Nama template" for-id="template-name" required><input id="template-name" v-model="name" class="field-input" required placeholder="Contoh: Laporan Inspeksi Bulanan" /></FormField><div class="flex justify-end gap-2 pt-2"><BaseButton variant="secondary" @click="open=false">Batal</BaseButton><BaseButton type="submit" :disabled="saveMutation.isPending.value"><LoaderCircle v-if="saveMutation.isPending.value" class="size-4 animate-spin" /><Send v-else class="size-4" />Simpan</BaseButton></div></form></AppModal>
  </div>
</template>
