<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowRight, CalendarDays, FileText, Filter, LoaderCircle, Plus, Search, ShieldCheck, Upload } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import AppModal from "@/components/ui/AppModal.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import FormField from "@/components/ui/FormField.vue";
import PanelCard from "@/components/ui/PanelCard.vue";
import StatePanel from "@/components/ui/StatePanel.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/services/api/http";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { formatDate, titleOf, typeOf, unitOf } from "@/utils/format";

const auth = useAuthStore();
const toast = useToastStore();
const qc = useQueryClient();
const page = ref(1);
const search = ref("");
const status = ref("");
const open = ref(false);
const file = ref<File | null>(null);
const uploadError = ref("");
const form = ref({ taskId: "" });
const canUpload = computed(() => auth.role === "ADMIN_SPI" || auth.role === "PIMPINAN_SPI" || auth.role === "ANGGOTA_SPI");
const tasksQuery = useQuery({ queryKey: ["report-source-tasks"], queryFn: () => api.tasks({ page: 1, limit: 100 }), enabled: canUpload });
const availableTasks = computed(() => (tasksQuery.data.value?.items || []).filter((task) => !task.data?.reportId && !task.data?.followUp?.followUpId));
const selectedTask = computed(() => availableTasks.value.find((task) => task._id === form.value.taskId));
const query = useQuery({
  queryKey: computed(() => ["reports", page.value, search.value, status.value]),
  queryFn: () => api.reports({ page: page.value, limit: 20, ...(search.value ? { search: search.value } : {}), ...(status.value ? { status: status.value } : {}) }),
});
const rows = computed(() => query.data.value?.items || []);
watch([search, status], () => {
  page.value = 1;
});
const createMutation = useMutation({
  mutationFn: async () => {
    if (!file.value) throw new Error("PDF hasil penugasan wajib dipilih.");
    return api.createReport({ taskId: form.value.taskId, file: file.value });
  },
  onSuccess: async (report) => {
    await qc.invalidateQueries({ queryKey: ["reports"] });
    await qc.invalidateQueries({ queryKey: ["tasks"] });
    await qc.invalidateQueries({ queryKey: ["dashboard"] });
    toast.show({ kind: "success", title: "Laporan tugas dibuat", description: "Nama laporan mengikuti nama tugas dan PDF dikirim ke proses ekstraksi." });
    open.value = false;
    form.value = { taskId: "" };
    file.value = null;
    uploadError.value = "";
    await qc.invalidateQueries({ queryKey: ["report", report._id] });
  },
  onError: (err) => {
    uploadError.value = getApiErrorMessage(err);
    toast.show({ kind: "error", title: "Laporan belum dapat dibuat", description: uploadError.value });
  },
});
function chooseFile(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0] || null;
}
function create() {
  if (!form.value.taskId) {
    uploadError.value = "Pilih penugasan yang akan dilaporkan.";
    return;
  }
  if (!file.value) {
    uploadError.value = "PDF hasil penugasan wajib dipilih.";
    return;
  }
  if (file.value.type !== "application/pdf" || file.value.size > 20 * 1024 * 1024) {
    uploadError.value = "Pilih PDF dengan ukuran maksimal 20 MB.";
    return;
  }
  uploadError.value = "";
  createMutation.mutate();
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-blue-600"><ShieldCheck class="size-4" />Pelaporan dan evaluasi</div>
        <h1 class="text-2xl font-bold tracking-tight text-navy-950">Laporan & Evaluasi</h1>
        <p class="mt-1.5 text-sm leading-6 text-slate-500">Laporan, versi, proses review AI, keputusan evaluator, serta tindak lanjut.</p>
      </div>
      <BaseButton v-if="canUpload" @click="open = true"><Plus class="size-4" />Unggah laporan</BaseButton>
    </div>
    <PanelCard
      ><div class="mb-5 flex flex-col gap-3 md:flex-row">
        <div class="relative flex-1"><Search class="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input v-model="search" class="field-input field-input-icon" placeholder="Cari judul laporan" /></div>
        <div class="relative">
          <Filter class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><select v-model="status" class="field-select field-select-icon">
            <option value="">Semua status</option>
            <option value="UPLOADED">Diunggah</option>
            <option value="PROCESSING">Diproses</option>
            <option value="UNDER_REVIEW">Dalam review</option>
            <option value="NEEDS_REVISION">Perlu revisi</option>
            <option value="APPROVED">Disetujui</option>
            <option value="FOLLOW_UP">Tindak lanjut</option>
            <option value="CLOSED">Ditutup</option>
            <option value="FAILED">Gagal</option>
          </select>
        </div>
        <BaseButton variant="secondary" @click="query.refetch()"><CalendarDays class="size-3.5" />Segarkan</BaseButton>
      </div>
      <StatePanel v-if="query.isPending.value" state="loading" title="Memuat laporan" /><StatePanel v-else-if="query.isError.value" state="error" :description="getApiErrorMessage(query.error.value)" /><StatePanel
        v-else-if="!rows.length"
        state="empty"
        title="Belum ada laporan"
        description="Laporan yang dapat diakses akun Anda akan muncul di sini."
      />
      <div v-else class="-mx-5 overflow-x-auto sm:mx-0">
        <table class="w-full min-w-[780px] text-left">
          <thead>
            <tr class="border-y border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th class="px-5 py-3 sm:px-3">Nama Tugas</th>
              <th class="px-3 py-3">Jenis / auditee</th>
              <th class="px-3 py-3">Pengirim</th>
              <th class="px-3 py-3">Diperbarui</th>
              <th class="px-3 py-3">Status</th>
              <th class="px-5 py-3 text-right sm:px-3">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in rows" :key="row._id" class="transition hover:bg-slate-50/70">
              <td class="px-5 py-4 sm:px-3">
                <div class="flex items-center gap-3">
                  <span class="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><FileText class="size-4" /></span>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">{{ titleOf(row) }}</p>
                    <p class="mt-1 text-[10px] text-slate-400">Versi {{ row.version || 0 }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-4">
                <p class="text-xs text-slate-700">{{ typeOf(row) }}</p>
                <p class="mt-1 text-[10px] text-slate-400">{{ unitOf(row) }}</p>
              </td>
              <td class="px-3 py-4 text-xs text-slate-600">{{ row.createdBy || "â€”" }}</td>
              <td class="px-3 py-4 text-xs text-slate-600">{{ formatDate(row.updatedAt || row.createdAt) }}</td>
              <td class="px-3 py-4"><StatusBadge :status="row.status" /></td>
              <td class="px-5 py-4 text-right sm:px-3">
                <RouterLink :to="`/app/reports/${row._id}`" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                  >Detail evaluasi <ArrowRight class="size-3.5"
                /></RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p class="text-[10px] text-slate-400">Halaman {{ page }} Â· {{ query.data.value?.total || 0 }} laporan.</p>
        <div class="flex gap-2">
          <BaseButton variant="secondary" size="sm" :disabled="page <= 1" @click="page--">Sebelumnya</BaseButton
          ><BaseButton variant="secondary" size="sm" :disabled="!query.data.value || page * query.data.value.limit >= query.data.value.total" @click="page++">Berikutnya</BaseButton>
        </div>
      </div>
    </PanelCard>
    <AppModal :open="open" title="Kirim hasil penugasan" description="Laporan harus berasal dari penugasan SPI. Nama laporan akan mengikuti nama tugas." @close="open = false"
      ><form class="space-y-4" @submit.prevent="create">
        <FormField label="Penugasan" for-id="report-task" required hint="Tugas yang sudah memiliki laporan tidak ditampilkan."><select id="report-task" v-model="form.taskId" class="field-input" required><option value="">Pilih penugasan</option><option v-for="task in availableTasks" :key="task._id" :value="task._id">{{ titleOf(task) }}</option></select></FormField>
        <div v-if="selectedTask" class="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p class="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Nama Tugas</p><p class="mt-1 text-xs font-semibold text-slate-800">{{ titleOf(selectedTask) }}</p><p class="mt-1 text-[10px] text-slate-500">Auditee: {{ selectedTask.data?.auditee || selectedTask.data?.unitId || selectedTask.data?.unit || 'Belum ditentukan' }}</p></div>
        <StatePanel v-if="tasksQuery.isPending.value" state="loading" title="Memuat penugasan" />
        <p v-else-if="tasksQuery.isError.value" class="rounded-xl bg-red-50 p-3 text-xs text-red-700">Daftar penugasan gagal dimuat: {{ getApiErrorMessage(tasksQuery.error.value) }}</p>
        <p v-else-if="!availableTasks.length" class="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">Belum ada penugasan yang dapat dilaporkan. Pastikan tugas sudah dibuat dan belum memiliki laporan.</p>
        <FormField label="PDF hasil penugasan" for-id="report-file" required hint="Wajib; maksimal 20 MB."
          ><input
            id="report-file"
            type="file"
            accept="application/pdf,.pdf"
            class="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
            @change="chooseFile"
        /></FormField>
        <p v-if="file" class="text-[11px] text-slate-500">File: {{ file.name }}</p>
        <p v-if="uploadError" class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{{ uploadError }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <BaseButton variant="secondary" @click="open = false">Batal</BaseButton
          ><BaseButton type="submit" :disabled="createMutation.isPending.value || !form.taskId || !file"><LoaderCircle v-if="createMutation.isPending.value" class="size-4 animate-spin" /><Upload v-else class="size-4" />Kirim laporan tugas</BaseButton>
        </div>
      </form></AppModal
      >
  </div>
</template>
