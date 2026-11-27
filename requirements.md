# REQUIREMENTS.md
# Frontend Sistem Pengelolaan Pemantauan Kepatuhan SPI
## RS Korpri Pura Raharja

- Versi: 1.1
- Jenis dokumen: Kebutuhan fungsional dan teknis frontend
- Bahasa antarmuka: Bahasa Indonesia
- Dokumen desain pasangan: `design.md`

## 1. Tujuan

Membangun frontend web untuk mendukung seluruh proses SPI RS Korpri Pura Raharja: login, dashboard, OCR, manajemen dokumen, penugasan, laporan, evaluasi kepatuhan, analisis dan rekomendasi AI, tindak lanjut, notifikasi, pengaturan, dan panduan.

Frontend harus mengikuti `design.md` dan kontrak API backend yang benar-benar tersedia. Jangan mengarang endpoint, field, enum, atau payload.

## 2. Teknologi utama

- Vue 3 dengan Composition API dan Single File Components (`.vue`).
- TypeScript.
- Vite sebagai build tool dan development server.
- Vue Router untuk routing.
- Pinia untuk state management global.
- Tailwind CSS untuk styling dan design tokens.
- shadcn-vue sebagai basis komponen UI yang kompatibel dengan Vue.
- vee-validate dan Zod untuk form serta validasi.
- lucide-vue-next untuk ikon.
- TanStack Table untuk Vue bila dibutuhkan pada tabel kompleks.
- TanStack Vue Query (`@tanstack/vue-query`) untuk server state, caching, dan sinkronisasi data API.
- Library chart yang kompatibel dengan Vue bila endpoint menyediakan data grafik.
- PDF viewer yang kompatibel dengan Vue untuk preview PDF.
- Axios atau Fetch API melalui satu HTTP client/service layer terpusat untuk API.

Gunakan versi dependency yang kompatibel satu sama lain. Periksa `package.json` sebelum memasang atau memperbarui dependency. Jangan memasang library React atau Next.js pada proyek Vue.

## 3. Arsitektur frontend

Pisahkan tanggung jawab menjadi:
- `src/router`: konfigurasi Vue Router dan route guards.
- `src/views`: halaman/route-level components.
- `src/components`: komponen UI reusable.
- `src/layouts`: layout autentikasi dan dashboard.
- `src/features`: logika per domain/modul.
- `src/services/api`: HTTP client dan API service.
- `src/stores`: Pinia stores untuk state global.
- `src/composables`: composables reusable.
- `src/validators`: schema validasi.
- `src/types`: tipe TypeScript berdasarkan kontrak API.
- `src/assets`: aset lokal.
- `public`: aset statis seperti logo rumah sakit.

Struktur contoh:

```text
src/
  assets/
  components/
    ui/
    layout/
    navigation/
    forms/
    data-display/
    feedback/
    documents/
    reports/
    evaluations/
  layouts/
    AuthLayout.vue
    DashboardLayout.vue
  router/
    index.ts
    guards.ts
  views/
    auth/
      LoginView.vue
    dashboard/
      DashboardView.vue
    ocr/
    documents/
    templates/
    assignments/
    reports/
    notifications/
    settings/
    guide/
    errors/
      ForbiddenView.vue
      NotFoundView.vue
  features/
    auth/
    dashboard/
    ocr/
    documents/
    templates/
    assignments/
    reports/
    evaluations/
    follow-ups/
    notifications/
    settings/
  services/
    api/
      http.ts
  stores/
  composables/
  validators/
  types/
  utils/
```

Gunakan Vue 3 Composition API dengan `<script setup lang="ts">`. Struktur aktual boleh disesuaikan dengan repository yang sudah ada; hindari refactor besar yang tidak diperlukan.

### 3.1 Standar implementasi Vue

- Gunakan Vue 3 Composition API dengan `<script setup lang="ts">`.
- Gunakan `ref`, `computed`, dan `watch` secara terukur; hindari state global untuk state UI lokal.
- Gunakan Vue Router untuk routing, nested layout, dan navigation guards.
- Gunakan Pinia untuk state lintas halaman seperti session, profil pengguna, dan preferensi global.
- Gunakan TanStack Vue Query untuk data server, caching, invalidation, dan refetch.
- Sesuaikan komponen shadcn-vue dengan design tokens pada `design.md`.
- Jangan mencampur pola React seperti JSX hooks, React Router, atau React Hook Form ke dalam implementasi Vue.

## 4. Role dan akses

Role:
- `ADMIN_SPI`
- `ANGGOTA_SPI`
- `PIMPINAN_SPI`

Frontend harus:
- Mendapatkan identitas dan role dari session/API yang tervalidasi.
- Menampilkan menu dan aksi berdasarkan role/permission.
- Melindungi route dari akses pengguna yang belum login.
- Menampilkan halaman 403/akses ditolak.
- Menangani session kedaluwarsa.

Frontend bukan lapisan keamanan utama. Backend harus memvalidasi izin untuk setiap endpoint dan objek.

## 5. Authentication

Halaman:
- Login.
- Lupa/reset password jika didukung backend.
- Akses ditolak.
- Session berakhir.

Fungsi:
- Form username/email dan password sesuai kontrak auth.
- Validasi field.
- Toggle tampil/sembunyikan password.
- Loading dan error state.
- Login, logout, dan refresh session sesuai mekanisme backend.
- Redirect sesuai role/izin.
- Jangan mengungkap apakah akun tertentu terdaftar jika berisiko terhadap keamanan.

Prioritaskan cookie `httpOnly`, `secure`, dan `sameSite` yang dikonfigurasi backend/BFF. Jangan menyimpan refresh token atau secret di localStorage. Ikuti rancangan autentikasi aktual backend.

## 6. Layout dan aset

- Implementasikan sidebar navy, header, breadcrumb, dan konten terang sesuai `design.md`.
- Logo resmi RS Korpri Pura Raharja harus tampil di pojok kiri atas sidebar dan panel branding login.
- Gunakan aset logo asli yang diberikan; jangan menggambar ulang.
- Gunakan foto gedung rumah sakit atau ilustrasi hanya jika aset resmi tersedia.
- Sidebar responsif: penuh pada desktop, collapsible pada tablet, drawer pada mobile.
- Semua halaman memiliki loading, empty, error, dan success state.

## 7. Kebutuhan fungsional modul

### 7.1 Dashboard

- Memuat ringkasan metrik sesuai role.
- Menampilkan dokumen, penugasan, laporan, evaluasi, dan tindak lanjut.
- Menampilkan grafik tren jika API menyediakan agregasi yang diperlukan.
- Menampilkan aktivitas terbaru dan tenggat terdekat.
- Menyediakan tautan ke detail objek.

Jangan memakai angka contoh desain sebagai data produksi. Jika endpoint dashboard belum tersedia, catat sebagai gap kontrak backend.

### 7.2 OCR Dokumen

- Pemilihan file dan drag-and-drop.
- Validasi ekstensi, MIME, dan ukuran di sisi UI untuk kenyamanan; validasi keamanan tetap di backend.
- Upload file sesuai alur backend.
- Progress upload.
- Menyimpan ID job yang dikembalikan API.
- Memantau status job melalui polling atau realtime sesuai dukungan backend.
- Menampilkan hasil ekstraksi per halaman bila tersedia.
- Menandai halaman gagal/tidak terbaca dan kebutuhan pemeriksaan manual.
- Menampilkan preview/download melalui URL yang diotorisasi backend.

OCR adalah ekstraksi teks, bukan verifikasi keaslian tanda tangan atau stempel.

### 7.3 Manajemen Dokumen

- Daftar, pencarian, filter, sorting, dan pagination sesuai dukungan API.
- Kategori dokumen: SPO, Permenkes/Peraturan, Template, Lainnya, atau enum backend.
- Detail metadata.
- Upload dokumen.
- Upload versi baru.
- Preview/download.
- Arsipkan jika diizinkan.
- Riwayat versi.

Pastikan detail evaluasi menyimpan referensi versi dokumen acuan yang benar-benar digunakan saat evaluasi.

### 7.4 Template Laporan

- Daftar dan detail template.
- Membuat/mengubah template bila API mendukung.
- Menampilkan status dan versi.
- Preview template.
- Publikasi/arsip dengan konfirmasi.
- Tidak mengubah isi template historis yang telah dipakai laporan lama.

### 7.5 Penugasan SPI

- Daftar penugasan dengan tab/filter/pagination.
- Form buat/edit sesuai permission.
- Pemilihan unit, penanggung jawab, dan anggota berdasarkan data API.
- Prioritas, tanggal mulai, deadline, instruksi, dokumen acuan, dan pengingat.
- Detail tugas, progres, checklist, lampiran, timeline, dan riwayat.
- Recurrence/jadwal berulang hanya bila backend menyediakan kontraknya.

### 7.6 Laporan

- Daftar laporan dan filter status.
- Detail metadata laporan.
- Preview/download laporan dan lampiran.
- Upload laporan baru dan revisi sesuai alur backend.
- Menampilkan versi laporan.
- Memisahkan status pemrosesan OCR, AI review, human review, dan tindak lanjut jika backend membedakannya.

### 7.7 Detail Laporan & Evaluasi

Halaman prioritas tinggi. Implementasikan tab/section:
1. Ringkasan.
2. Hasil Evaluasi.
3. Evidence & Regulation Mapping.
4. Analisis AI.
5. Rekomendasi.
6. Evaluasi Manusia.
7. Tindak Lanjut.
8. Riwayat.

**Ringkasan**
- Judul, jenis inspeksi, unit, periode, tim, penanggung jawab, tanggal pengumpulan, status, file dan lampiran.

**Hasil evaluasi kepatuhan**
- Status sesuai/sebagian sesuai/tidak sesuai/belum dapat dinilai sesuai enum backend.
- Rincian per dokumen acuan.
- Skor hanya jika backend menyediakan nilai beserta definisi perhitungan yang jelas.
- Jangan menghitung skor baru di frontend.

**Evidence & Regulation Mapping**
- Temuan.
- Status kesesuaian.
- Nama dan versi dokumen acuan.
- Pasal/bagian/klausul jika tersedia.
- Halaman dan kutipan sumber.
- Chunk/retrieval reference jika tersedia.
- Bagian/halaman laporan yang menjadi bukti.
- Penjelasan hubungan bukti dengan ketentuan.
- Status verifikasi.
- Tautan untuk membuka dokumen/sumber.

Jika referensi tidak ditemukan atau tidak lengkap, tampilkan “Referensi belum tersedia” atau “Perlu verifikasi manual”. Dilarang mengarang pasal, nomor halaman, atau kutipan.

**Analisis AI**
- Ringkasan.
- Aspek yang sesuai.
- Potensi ketidaksesuaian.
- Kekurangan bukti.
- Temuan penting dan prioritas.
- Batasan analisis.
- Waktu analisis/model jika response menyediakan.

**Rekomendasi AI**
Kelompokkan terpisah:
- Rekomendasi perbaikan laporan.
- Rekomendasi peningkatan pelaksanaan inspeksi.

Setiap rekomendasi menampilkan alasan, sumber/bukti, prioritas, langkah yang disarankan, dan status. Rekomendasi tidak otomatis menjadi tugas; harus melalui persetujuan manusia dan endpoint yang sesuai.

**Evaluasi manusia**
- Catatan evaluator.
- Keputusan yang diizinkan.
- Alasan wajib saat meminta revisi/menolak.
- Dialog konfirmasi.
- Riwayat keputusan.
- Tampilkan hasil hanya setelah API mengonfirmasi sukses.

**Tindak lanjut**
- Daftar tindakan yang disetujui.
- Penanggung jawab, tenggat, prioritas, status.
- Upload bukti.
- Catatan pelaksana.
- Verifikasi atau permintaan perbaikan oleh evaluator.
- Riwayat tindakan.

**Riwayat**
- Snapshot versi laporan.
- Riwayat analisis AI.
- Riwayat keputusan manusia.
- Perubahan status.
- Riwayat tindak lanjut.
- Riwayat lama tidak boleh ditimpa oleh analisis baru.

### 7.8 Notifikasi

- Daftar notifikasi.
- Jumlah belum dibaca.
- Filter kategori dan status baca.
- Tandai dibaca/tandai semua dibaca bila API mendukung.
- Deep link menuju penugasan/laporan/dokumen terkait.
- Format tanggal/waktu konsisten dengan zona waktu aplikasi.

### 7.9 Pengaturan

Tampilkan berdasarkan role dan endpoint yang tersedia:
- Profil pengguna.
- Pengguna dan role.
- Profil organisasi.
- Jadwal/pengingat.
- Preferensi notifikasi.
- Integrasi.
- Keamanan.
- Sistem.

Secret tidak boleh ditampilkan utuh. Pengaturan integrasi sensitif harus melalui backend.

### 7.10 Panduan

- Pengenalan.
- Panduan per role.
- OCR.
- Manajemen dokumen.
- Penugasan.
- Penyusunan laporan.
- Membaca evaluasi dan rekomendasi AI.
- Tindak lanjut.
- FAQ/kontak administrator.

Panduan boleh berupa konten statis frontend jika belum ada API/CMS.

### 7.11 Preview dokumen

- PDF viewer dengan navigasi halaman.
- Panel metadata: jenis, versi, tanggal, status.
- Download melalui URL aman dari backend.
- Loading dan error state.
- Jangan mengasumsikan seluruh URL file bersifat publik.

## 8. Integrasi API

1. Semua request melalui API client/service terpusat.
2. Base URL berasal dari environment variable.
3. Definisikan TypeScript type dari Swagger/kontrak backend aktual.
4. Pisahkan request DTO dan response type.
5. Tangani error HTTP, timeout, dan session expired.
6. Gunakan pagination/filter sesuai kontrak.
7. Jangan memanggil endpoint yang belum diverifikasi.
8. Jangan membuat mock data seolah-olah data produksi.

Sebelum implementasi modul, periksa dokumentasi Swagger atau kontrak API backend terbaru. Catat gap endpoint/field dan minta konfirmasi backend sebelum mengasumsikan struktur.

### Proses asinkron

Untuk OCR, indexing, dan AI review:
- Mulai proses melalui API.
- Simpan job/review ID dari response.
- Tampilkan status processing.
- Perbarui status dengan polling atau realtime sesuai mekanisme backend.
- Tampilkan error dan opsi retry hanya bila API mendukung.
- Hindari polling terlalu sering; gunakan interval dan penghentian polling yang wajar.

## 9. File upload dan penyimpanan

- Upload dokumen melalui alur aman yang ditentukan backend.
- Jika menggunakan ImageKit, frontend hanya memakai public configuration/URL yang memang aman.
- Jangan pernah memasukkan ImageKit private key ke browser.
- Jangan mengekspos MongoDB URI, NVIDIA API key, JWT secret, SMTP password, atau secret layanan chunking/retrieval.
- Validasi file di frontend untuk UX, tetapi backend tetap memvalidasi MIME, ukuran, akses, dan keamanan file.
- Preview/download harus mengikuti otorisasi backend.

## 10. State management dan data fetching

- Gunakan state lokal untuk interaksi sederhana.
- Gunakan satu pola konsisten untuk server state/cache.
- Hindari duplikasi state.
- Refetch/invalidate data setelah mutasi berhasil.
- Simpan filter/pagination di URL jika sesuai.
- Setiap halaman wajib menangani loading, empty, error, dan success state.

## 11. Environment variables

Contoh variabel publik:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

Hanya nilai yang aman untuk browser boleh menggunakan prefix `NEXT_PUBLIC_`.

Dilarang menaruh di frontend:
- `NVIDIA_API_KEY`
- `MONGODB_URI` / `DATABASE_URL`
- ImageKit private key
- JWT signing secret
- SMTP password
- API key chunking/retrieval
- kredensial service account

## 12. Keamanan dan privasi

- Terapkan route guard dan role-aware UI.
- Backend tetap melakukan otorisasi semua aksi.
- Jangan log token, password, secret, atau isi dokumen sensitif.
- Jangan mengirim dokumen rumah sakit langsung ke layanan pihak ketiga dari browser tanpa alur backend yang disetujui.
- Tampilkan error yang aman tanpa stack trace.
- Batasi data yang diminta dan ditampilkan sesuai kebutuhan role.
- Gunakan URL file yang aman dan masa berlaku sesuai kebijakan backend.

## 13. Validasi dan penanganan error

Tangani sekurangnya status:
- 400: input tidak valid.
- 401: belum login/session berakhir.
- 403: tidak memiliki izin.
- 404: data tidak ditemukan.
- 409: konflik status/versi.
- 413: file terlalu besar.
- 422: validasi bisnis.
- 429: rate limit.
- 5xx: gangguan server.

Tampilkan pesan yang mudah dipahami. Untuk keputusan sensitif, tampilkan konfirmasi. Jangan menampilkan toast sukses sebelum response sukses diterima.

## 14. Pengujian

Minimal:
- Unit test komponen dan utility penting.
- Form validation test.
- Login/logout/session test.
- Role-based navigation test.
- OCR upload dan job-status test.
- Dokumen dan versioning test.
- Penugasan CRUD sesuai izin.
- Detail evaluasi dan regulation mapping test.
- Rekomendasi AI dan human approval test.
- Follow-up upload dan verification test.
- Notification read-state test.
- Responsive test.
- Loading/empty/error test.
- Lint, type-check, dan production build.

## 15. Kriteria penerimaan

Frontend siap UAT jika:
1. Login/logout sesuai kontrak backend.
2. Logo resmi tampil di kiri atas sidebar dan panel login.
3. Navigasi menyesuaikan role.
4. Dashboard menampilkan data API.
5. OCR upload dan status proses dapat dipantau.
6. Dokumen dapat dicari, difilter, dilihat detail, dan di-preview sesuai API.
7. Versi dokumen terjaga.
8. Penugasan dapat dikelola sesuai izin.
9. Laporan dan lampiran dapat dibuka.
10. Detail laporan menampilkan hasil evaluasi kepatuhan.
11. Temuan dapat ditelusuri ke dokumen aturan dan bukti laporan.
12. Analisis AI dan rekomendasi ditampilkan terpisah dari keputusan manusia.
13. Rekomendasi laporan dan rekomendasi pelaksanaan inspeksi ditampilkan sebagai dua kelompok.
14. Evaluator dapat menyetujui atau meminta revisi sesuai izin.
15. Rekomendasi yang disetujui dapat dibuat menjadi tindak lanjut jika API mendukung.
16. Bukti tindak lanjut dapat diunggah dan diverifikasi.
17. Riwayat laporan/evaluasi dapat ditelusuri.
18. Notifikasi, pengaturan, dan panduan dapat digunakan.
19. Seluruh halaman memiliki loading, empty, error, dan success state.
20. Tampilan responsif.
21. Tidak ada secret di bundle frontend.
22. Tidak ada endpoint/field yang dibuat berdasarkan asumsi.
23. Lint, type-check, test, dan build berhasil.

## 16. Tahapan implementasi

**Tahap 1 — Fondasi**
- Setup Next.js, TypeScript, Tailwind, shadcn/ui.
- Design tokens, layout, sidebar, header, logo.
- Auth, session, dan role-aware navigation.

**Tahap 2 — Operasional**
- Dashboard.
- OCR.
- Manajemen dokumen dan preview.
- Template.
- Penugasan.

**Tahap 3 — Laporan dan evaluasi**
- Daftar laporan.
- Detail laporan.
- Hasil kepatuhan.
- Evidence & Regulation Mapping.
- Analisis AI.
- Rekomendasi AI.
- Evaluasi manusia.

**Tahap 4 — Tindak lanjut**
- Daftar tindak lanjut.
- Penanggung jawab dan tenggat.
- Upload bukti.
- Verifikasi dan riwayat.

**Tahap 5 — Pelengkap dan QA**
- Notifikasi.
- Pengaturan.
- Panduan.
- Responsive/accessibility/security review.
- UAT dan deployment.

## 17. Instruksi untuk AI coding agent

1. Baca `design.md` dan `requirements.md` sebelum mengubah kode.
2. Pastikan proyek menggunakan Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS, dan shadcn-vue; periksa struktur repository dan dependency yang sudah ada.
3. Periksa Swagger/kontrak API backend terbaru.
4. Jangan membangun backend baru atau mengubah kontrak API sepihak.
5. Jangan mengarang endpoint, field, enum, status, atau response.
6. Catat gap API secara eksplisit.
7. Gunakan mock hanya untuk development dan beri penanda yang jelas; jangan campurkan dengan production.
8. Implementasikan seluruh UI menggunakan Vue 3, bukan React/Next.js. Pertahankan desain visual referensi, terutama sidebar navy, logo RS Korpri Pura Raharja di kiri atas, dan halaman Detail Laporan & Evaluasi.
9. Kerjakan bertahap dan jalankan lint, type-check, test, serta build setelah setiap tahap.
10. Laporkan halaman selesai, endpoint yang dipakai, file yang diubah, dan gap integrasi yang tersisa.

**Prioritas:** konsistensi dengan desain yang disetujui, keamanan dokumen rumah sakit, kesesuaian dengan kontrak API aktual, dan keterlacakan seluruh temuan evaluasi ke bukti laporan serta dokumen aturan.
