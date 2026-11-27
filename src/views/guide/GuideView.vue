<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, ClipboardCheck, FileSearch, FileText, ListTodo, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const roleName = computed(() => ({ ADMIN_SPI: 'Administrator SPI', PIMPINAN_SPI: 'Pimpinan SPI', ANGGOTA_SPI: 'Anggota SPI', UNIT_KERJA: 'Unit Kerja' }[auth.role as 'ADMIN_SPI' | 'PIMPINAN_SPI' | 'ANGGOTA_SPI' | 'UNIT_KERJA'] || 'Pengguna SPI'))
const steps = [
  { icon: FileSearch, title: '1. Unggah dokumen referensi', text: 'Administrator mengunggah PDF atau gambar pada menu OCR. Tunggu status pemrosesan selesai sebelum dokumen dipublikasikan sebagai referensi.' },
  { icon: FileText, title: '2. Buat laporan', text: 'Buat laporan baru, pilih unit dan jenis laporan, lalu unggah versi PDF. Setiap unggahan membentuk versi yang dapat dilacak.' },
  { icon: Sparkles, title: '3. Jalankan analisis AI', text: 'Mulai AI review setelah versi laporan tersedia. Hasil AI menampilkan temuan, pemetaan regulasi, rekomendasi, sumber, dan kutipan dokumen.' },
  { icon: ClipboardCheck, title: '4. Tinjau dan putuskan', text: 'Evaluator SPI memeriksa temuan dan rekomendasi. Keputusan manusia disimpan terpisah dari snapshot AI untuk jejak audit.' },
  { icon: ListTodo, title: '5. Pantau tindak lanjut', text: 'Rekomendasi yang disetujui dapat menjadi tindak lanjut. Penanggung jawab mengirim bukti, kemudian evaluator memverifikasi hasilnya.' },
]
</script>

<template>
  <main class="space-y-5">
    <header><p class="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Pusat bantuan</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-navy-950">Panduan penggunaan</h1><p class="mt-1 text-xs text-slate-500">Alur kerja SPI untuk {{ roleName }}.</p></header>
    <section class="rounded-2xl bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white"><span class="grid size-10 place-items-center rounded-xl bg-white/10"><BookOpen class="size-5" /></span><h2 class="mt-4 text-lg font-bold">Alur pemeriksaan yang tercatat</h2><p class="mt-2 max-w-2xl text-xs leading-6 text-blue-100">Gunakan dashboard untuk memantau ringkasan, dan buka detail laporan untuk meninjau analisis AI, bukti, evaluasi manusia, serta riwayat tindak lanjut.</p></section>
    <div class="space-y-3"><article v-for="step in steps" :key="step.title" class="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(12,39,75,.035)]"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><component :is="step.icon" class="size-5" /></span><div><h3 class="text-xs font-bold text-slate-900">{{ step.title }}</h3><p class="mt-1 text-xs leading-5 text-slate-600">{{ step.text }}</p></div></article></div>
    <section class="rounded-2xl border border-teal-100 bg-teal-50/70 p-5"><div class="flex gap-3"><ShieldCheck class="size-4 shrink-0 text-teal-700" /><div><h2 class="text-xs font-bold text-teal-950">Akses berbasis peran</h2><p class="mt-1 text-xs leading-5 text-teal-900">Menu dan aksi dibatasi sesuai izin backend. Jika akses ditolak, hubungi Administrator SPI untuk meninjau penetapan peran akun.</p></div></div></section>
  </main>
</template>
