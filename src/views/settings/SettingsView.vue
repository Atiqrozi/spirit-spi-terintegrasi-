<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { Building2, LoaderCircle, Save, ShieldCheck, UserRound } from 'lucide-vue-next'
import PanelCard from '@/components/ui/PanelCard.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { Role } from '@/types/roles'
import { api } from '@/services/api'
import { getApiErrorMessage } from '@/services/api/http'
import { titleOf } from '@/utils/format'

const auth = useAuthStore()
const toast = useToastStore()
const qc = useQueryClient()
const query = useQuery({ queryKey: ['users', 1], queryFn: () => api.users({ page: 1, limit: 100 }), enabled: computed(() => auth.role === Role.ADMIN_SPI) })
const userRows = computed(() => query.data.value?.items || [])
const unitDrafts = ref<Record<string, string>>({})
const roleLabels: Record<string, string> = { ADMIN_SPI: 'Administrator SPI', PIMPINAN_SPI: 'Pimpinan SPI', ANGGOTA_SPI: 'Anggota SPI', UNIT_KERJA: 'Unit Kerja' }
const updateUnitMutation = useMutation({
  mutationFn: ({ id, unit }: { id: string; unit: string }) => api.updateUser(id, { unit }),
  onSuccess: async (_result, { id, unit }) => {
    unitDrafts.value[id] = unit
    await Promise.all([qc.invalidateQueries({ queryKey: ['users'] }), qc.invalidateQueries({ queryKey: ['organization-units'] }), qc.invalidateQueries({ queryKey: ['task-assignees'] })])
    toast.show({ kind: 'success', title: 'Unit kerja pengguna diperbarui' })
  },
  onError: (error) => toast.show({ kind: 'error', title: 'Unit kerja tidak tersimpan', description: getApiErrorMessage(error) }),
})

function saveUnit(user: Record<string, any>) {
  const id = user._id || user.id
  if (!id) return
  updateUnitMutation.mutate({ id, unit: unitDrafts.value[id] ?? user.unit ?? '' })
}
</script>

<template>
  <main class="space-y-5">
    <header><p class="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Preferensi aplikasi</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-navy-950">Pengaturan</h1><p class="mt-1 text-xs text-slate-500">Informasi akun dan batas pengaturan yang disediakan backend.</p></header>
    <PanelCard title="Akun aktif" description="Data identitas berasal dari sesi autentikasi."><div class="flex items-center gap-4"><span class="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><UserRound class="size-5" /></span><div class="min-w-0"><p class="truncate text-sm font-bold text-slate-900">{{ auth.user?.name || auth.user?.email || 'Pengguna SPI' }}</p><p class="mt-1 text-xs text-slate-500">{{ auth.user?.email || 'Email tidak tersedia' }}</p><span class="mt-2 inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800">{{ roleLabels[auth.role || ''] || auth.role }}</span></div></div></PanelCard>
    <PanelCard v-if="auth.role === Role.ADMIN_SPI" title="Pengguna sistem" description="Unit kerja di bawah ini menjadi sumber pilihan unit pada form penugasan.">
      <StatePanel v-if="query.isPending.value" state="loading" />
      <StatePanel v-else-if="query.isError.value" state="error" title="Daftar pengguna tidak dapat dimuat" @retry="query.refetch()" />
      <StatePanel v-else-if="!userRows.length" state="empty" title="Belum ada data pengguna" />
      <div v-else class="divide-y divide-slate-100">
        <div v-for="user in userRows" :key="user._id" class="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)_auto] sm:items-center">
          <div class="flex min-w-0 items-center gap-3"><span class="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-500"><UserRound class="size-4" /></span><div class="min-w-0"><p class="truncate text-xs font-semibold text-slate-800">{{ titleOf(user, user.email || 'Pengguna') }}</p><p class="truncate text-[10px] text-slate-500">{{ user.email || user.data?.email }} · {{ roleLabels[user.role || user.data?.role] || user.role || user.data?.role || '—' }}</p></div></div>
          <input class="field-input h-10 text-xs" :value="unitDrafts[user._id] ?? user.unit ?? ''" placeholder="Contoh: Keuangan" aria-label="Unit kerja pengguna" @input="unitDrafts[user._id] = ($event.target as HTMLInputElement).value" />
          <BaseButton size="sm" variant="secondary" :disabled="updateUnitMutation.isPending.value" @click="saveUnit(user)"><LoaderCircle v-if="updateUnitMutation.isPending.value" class="size-3.5 animate-spin" /><Save v-else class="size-3.5" />Simpan unit</BaseButton>
        </div>
      </div>
    </PanelCard>
    <div class="grid gap-4 md:grid-cols-2"><PanelCard title="Unit organisasi"><template #icon><Building2 class="size-4" /></template><p class="text-xs leading-5 text-slate-600">RS Korpri Pura Raharja</p></PanelCard><PanelCard title="Keamanan sesi"><template #icon><ShieldCheck class="size-4" /></template><p class="text-xs leading-5 text-slate-600">Sesi akses dikelola oleh backend. Token disimpan dalam memori aplikasi dan dibersihkan saat keluar.</p></PanelCard></div>
    <div class="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900">Profil mandiri, perubahan kata sandi, preferensi notifikasi, dan pengaturan organisasi mengikuti endpoint yang tersedia pada backend.</div>
  </main>
</template>
