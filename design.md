# DESIGN.md
# Sistem Pengelolaan Pemantauan Kepatuhan SPI
## RS Korpri Pura Raharja

- Versi: 1.0
- Jenis dokumen: Panduan desain UI/UX frontend
- Bahasa antarmuka: Bahasa Indonesia
- Referensi visual: dua gambar desain yang diberikan pengguna, yaitu overview seluruh halaman dan halaman Detail Laporan & Evaluasi.

## 1. Tujuan dan ruang lingkup

Aplikasi web internal ini membantu SPI RS Korpri Pura Raharja mengelola dokumen acuan, OCR, penugasan inspeksi, laporan, evaluasi kepatuhan, rekomendasi perbaikan, dan tindak lanjut.

Desain mengikuti dua referensi visual:
1. **Overview aplikasi:** login, dashboard, manajemen dokumen, penugasan SPI, laporan & evaluasi, notifikasi, pengaturan, panduan, dan modal detail/preview dokumen.
2. **Detail Laporan & Evaluasi:** ringkasan laporan, hasil evaluasi kepatuhan, analisis AI, rekomendasi AI, catatan evaluator, dokumen terkait, serta navigasi riwayat.

AI merupakan alat bantu analisis dan rekomendasi. AI tidak menggantikan keputusan evaluator atau pimpinan SPI.

## 2. Prinsip desain

- Profesional, bersih, formal, dan sesuai konteks rumah sakit.
- Konsisten dengan referensi visual: sidebar navy, konten terang, kartu putih, aksen biru dan teal.
- Menampilkan informasi secara hierarkis dan mudah dipindai.
- Menyediakan keterlacakan dari temuan ke bukti laporan dan dokumen aturan.
- Memisahkan hasil AI dari keputusan manusia.
- Responsif untuk desktop, tablet, dan mobile.
- Status selalu ditulis sebagai teks, bukan hanya dibedakan dengan warna.

## 3. Identitas visual

### 3.1 Logo dan identitas rumah sakit

- Gunakan file logo resmi RS Korpri Pura Raharja yang diberikan pengguna.
- Pada halaman setelah login, tempatkan logo di pojok kiri atas sidebar, sebagaimana referensi.
- Pada halaman login, tampilkan logo pada panel branding.
- Jangan mengubah proporsi, warna, atau bentuk logo.
- Gunakan `object-contain`; jangan memotong logo.
- Simpan aset di folder publik frontend, misalnya `public/assets/rs-korpri-logo.png`. Sesuaikan nama file dengan aset yang benar-benar tersedia.
- Jika logo belum tersedia di repository, minta aset resmi; jangan membuat logo pengganti.

### 3.2 Palet warna

| Token | Hex | Penggunaan |
|---|---|---|
| Navy 950 | `#071D3A` | Sidebar |
| Navy 900 | `#0B2B52` | Branding dan elemen gelap |
| Blue 600 | `#1769D2` | Tombol utama, tautan, menu aktif |
| Blue 100 | `#EAF2FF` | Latar informasi |
| Teal 500 | `#20B7B0` | Aksen |
| Green 600 | `#159A62` | Sesuai, berhasil, selesai |
| Amber 500 | `#E99A22` | Perhatian, menunggu |
| Red 600 | `#DC4545` | Tidak sesuai, gagal, terlambat |
| Slate 900 | `#17243A` | Teks utama |
| Slate 600 | `#607086` | Teks sekunder |
| Slate 200 | `#E2E8F0` | Border |
| Slate 50 | `#F5F8FC` | Latar halaman |

Warna dan label status harus konsisten di seluruh modul.

### 3.3 Tipografi dan komponen

- Gunakan Inter atau sans-serif modern yang tersedia.
- Judul halaman 24–28 px; judul bagian 16–18 px; isi 14–16 px; metadata 12–13 px.
- Kartu putih, border tipis, radius 10–14 px, shadow lembut.
- Tombol utama biru; tombol sekunder putih dengan border.
- Gunakan satu set ikon yang konsisten, misalnya Lucide.
- Sediakan skeleton, empty state, error state, dan feedback aksi.

## 4. Kerangka layout

### 4.1 Sidebar

Sidebar desktop berada di kiri, lebar sekitar 230–250 px, berwarna navy. Logo RS Korpri Pura Raharja di bagian paling atas.

Urutan menu:
1. Dashboard
2. OCR Dokumen
3. Manajemen Dokumen
4. Penugasan SPI
5. Laporan & Evaluasi
6. Notifikasi
7. Pengaturan
8. Panduan

Menu dapat memiliki submenu sesuai modul. Bagian bawah sidebar memuat mode/role pengguna dan tombol Keluar.

### 4.2 Header dan konten

Header menampilkan judul halaman, deskripsi singkat, breadcrumb, ikon notifikasi, avatar, nama, dan role. Konten menggunakan latar Slate 50, grid responsif, serta kartu putih.

### 4.3 Responsivitas

- Desktop: sidebar penuh dan tabel lengkap.
- Tablet: sidebar dapat diciutkan.
- Mobile: sidebar menjadi drawer; tabel menjadi kartu atau scroll horizontal yang terkontrol.
- Form panjang dibagi ke beberapa bagian.
- Aksi utama mudah dijangkau.

## 5. Role dan navigasi

Role aplikasi:
- `ADMIN_SPI`
- `ANGGOTA_SPI`
- `PIMPINAN_SPI`

Tampilkan menu dan aksi berdasarkan izin role yang diberikan backend:
- **ADMIN_SPI:** administrasi pengguna, dokumen, template, penugasan, pengaturan, serta pemantauan sesuai izin.
- **ANGGOTA_SPI:** penugasan miliknya, progres inspeksi, laporan, revisi, dan tindak lanjut yang ditugaskan.
- **PIMPINAN_SPI:** pemantauan, evaluasi laporan, keputusan, persetujuan rekomendasi, dan verifikasi tindak lanjut.

Frontend hanya mengatur pengalaman UI. Otorisasi wajib tetap ditegakkan backend.

## 6. Spesifikasi halaman

### 6.1 Login

Layout dua panel:
- Panel branding menampilkan logo, nama rumah sakit, tagline/teks sambutan, dan foto gedung rumah sakit bila aset resmi tersedia.
- Panel form berisi email/username, password, toggle tampilkan password, opsi ingat sesi jika kebijakan mengizinkan, tombol Masuk, dan tautan Lupa Password bila API tersedia.
- Tampilkan pesan bantuan untuk menghubungi administrator.
- Validasi form, loading, dan error state.
- Setelah login, arahkan ke dashboard sesuai role.
- Jangan menaruh kredensial atau token di UI/log.

### 6.2 Dashboard

Tampilkan:
- Sapaan pengguna dan konteks role.
- Kartu metrik dokumen, tugas aktif, laporan, evaluasi, dan tindak lanjut.
- Grafik tren/progres kepatuhan jika tersedia dari API.
- Ringkasan tugas berdasarkan status.
- Aktivitas terbaru.
- Laporan yang menunggu evaluasi.
- Tenggat terdekat dan tindak lanjut yang belum selesai.

Angka contoh pada gambar hanya referensi tata letak; data produksi harus berasal dari API. Jangan mengasumsikan rumus skor kepatuhan.

### 6.3 OCR Dokumen

Tampilkan:
- Area drag-and-drop dan tombol pilih file.
- Persyaratan format dan ukuran file sesuai backend.
- Daftar file dan progress upload.
- Status job: menunggu, diunggah, diproses, berhasil, perlu pemeriksaan manual, atau gagal.
- Preview dokumen dan hasil ekstraksi per halaman jika tersedia.
- Penanda halaman yang gagal/tidak terbaca.
- Riwayat proses OCR.

OCR mengekstrak teks; jangan mengklaim dapat membuktikan keaslian tanda tangan atau stempel.

### 6.4 Manajemen Dokumen

Halaman daftar:
- Tab kategori: Semua, SPO, Permenkes/Peraturan, Template, Lainnya.
- Pencarian nama/nomor dokumen.
- Filter kategori, status, dan tanggal.
- Tabel nama, jenis, versi, tanggal update/berlaku, status, dan aksi.
- Tombol tambah/unggah dokumen.

Halaman detail/modal:
- Preview PDF.
- Informasi dokumen: jenis, nomor, versi, tanggal update/berlaku, status.
- Aksi download, lihat, unggah versi baru, atau arsipkan sesuai izin.
- Riwayat versi dan perubahan.

Versi dokumen yang dipakai dalam evaluasi historis harus tetap dapat ditelusuri.

### 6.5 Penugasan SPI

Halaman daftar:
- Tab Semua, Aktif, Selesai, Ditunda.
- Filter penanggung jawab, unit, prioritas, status, dan tenggat.
- Kolom judul, jenis, deadline, status, penanggung jawab, dan aksi.
- Tombol Buat Penugasan.

Form penugasan:
- Judul, deskripsi, jenis kegiatan, unit, penanggung jawab/tim, prioritas, tanggal mulai, tenggat, instruksi, dokumen acuan, dan pengingat.
- Jadwal berulang hanya ditampilkan bila backend mendukung.

Detail penugasan:
- Ringkasan tugas, progres/checklist, timeline, lampiran, laporan terkait, catatan, dan riwayat status.

### 6.6 Laporan & Evaluasi

Halaman daftar:
- Tab Laporan Masuk, Dalam Review, Perlu Revisi, Disetujui, dan Ditutup (ikuti enum backend).
- Pencarian dan filter.
- Kolom nama laporan, penugasan, pengirim, tanggal, status, dan aksi.

### 6.7 Detail Laporan & Evaluasi

Halaman ini mengikuti referensi visual kedua dan merupakan salah satu halaman inti.

**Header detail**
- Judul “Detail Laporan & Evaluasi” dan deskripsi.
- Breadcrumb.
- Kartu identitas laporan: judul, jenis inspeksi, unit, periode, tim, status evaluasi.
- Tombol Unduh Laporan dan Lihat Dokumen.
- Badge status evaluasi dan waktu evaluasi.

**Kolom ringkasan**
- Penanggung jawab.
- Tanggal pengumpulan.
- Tanggal evaluasi.
- Status akhir.
- Progress/tingkat kepatuhan bila backend menyediakan skor terdefinisi.
- Dokumen terkait dan lampiran.

**Tab utama**
1. Hasil Evaluasi
2. Analisis AI
3. Rekomendasi
4. Riwayat

#### A. Hasil Evaluasi / Compliance Overview

Tampilkan:
- Status: Sesuai, Sebagian Sesuai, Tidak Sesuai, atau Belum Dapat Dinilai (gunakan nilai yang benar-benar disediakan backend).
- Penjelasan ringkas.
- Rincian per dokumen acuan/SPO/Permenkes.
- Catatan evaluator.
- Skor atau progress hanya jika backend menyediakan definisi dan nilainya.

Jangan menyamakan confidence model dengan persentase kepatuhan.

#### B. Evidence & Regulation Mapping

Untuk setiap temuan tampilkan:
- Uraian temuan.
- Status kesesuaian.
- Dokumen aturan dan versi.
- Pasal/bagian/klausul bila tersedia.
- Nomor halaman dan kutipan sumber.
- Referensi chunk/retrieval bila tersedia.
- Bagian/halaman laporan yang menjadi bukti.
- Penjelasan keterkaitan bukti dengan aturan.
- Status verifikasi sumber dan tombol buka sumber.

Jika rujukan pasal, halaman, atau kutipan tidak tersedia, tampilkan “Perlu verifikasi sumber”. Jangan membuat referensi hukum secara otomatis di frontend.

#### C. Analisis AI

Tampilkan:
- Ringkasan hasil analisis.
- Hal yang sudah sesuai.
- Potensi ketidaksesuaian.
- Bukti yang belum lengkap.
- Temuan penting dan prioritas.
- Batasan analisis.
- Waktu dan versi model bila disediakan backend.

#### D. Rekomendasi AI

Pisahkan secara jelas menjadi dua kelompok:

**Rekomendasi untuk Laporan**
- Kelengkapan isi dan struktur.
- Analisis risiko.
- Kelengkapan bukti.
- Kejelasan kesimpulan.
- Rencana tindak lanjut dan target waktu.

**Rekomendasi untuk Pelaksanaan Kegiatan Inspeksi**
- Metode pemeriksaan.
- Monitoring dan evaluasi berkala.
- Koordinasi antarunit.
- Pelatihan/edukasi petugas.
- Penguatan bukti pelaksanaan.
- Pemeriksaan ulang dan verifikasi.

Setiap rekomendasi menampilkan alasan, sumber/bukti, prioritas, langkah yang disarankan, dan status. Rekomendasi AI tidak otomatis menjadi tugas sebelum disetujui evaluator.

#### E. Evaluasi manusia

- Catatan evaluator dan identitas evaluator.
- Keputusan: setujui, minta revisi, atau opsi lain sesuai backend.
- Alasan wajib untuk revisi/penolakan.
- Dialog konfirmasi.
- Riwayat keputusan dan waktu.

#### F. Monitoring tindak lanjut

- Daftar rekomendasi yang telah disetujui menjadi tindakan.
- Penanggung jawab, tenggat, prioritas, status.
- Bukti penyelesaian dan catatan pelaksana.
- Verifikasi evaluator/pimpinan.
- Aksi verifikasi atau minta perbaikan sesuai izin.

#### G. Riwayat

- Versi laporan.
- Riwayat analisis AI.
- Riwayat evaluasi manusia.
- Perubahan status.
- Riwayat tindak lanjut.

Hasil evaluasi lama harus tetap menjadi snapshot yang dapat dibuka dan tidak ditimpa oleh analisis baru.

### 6.8 Notifikasi

- Tab Semua, Belum Dibaca, dan Penting bila didukung.
- Kategori penugasan, tenggat, laporan, revisi, evaluasi, dan tindak lanjut.
- Waktu notifikasi.
- Tautan menuju objek terkait.
- Aksi tandai dibaca dan tandai semua dibaca bila API tersedia.
- Badge jumlah belum dibaca.

### 6.9 Pengaturan

Submenu sesuai API:
- Profil.
- Pengguna dan role.
- Profil organisasi.
- Jadwal penugasan/pengingat.
- Preferensi notifikasi.
- Integrasi.
- Keamanan.
- Sistem.

Batasi menu administratif berdasarkan role. Jangan pernah menampilkan secret secara utuh.

### 6.10 Panduan

- Pengenalan sistem.
- Panduan berdasarkan role.
- OCR dokumen.
- Manajemen dokumen.
- Penugasan SPI.
- Penyusunan laporan.
- Membaca evaluasi dan rekomendasi AI.
- Tindak lanjut.
- FAQ dan kontak administrator.

### 6.11 Modal preview dokumen

Gunakan modal lebar dengan:
- PDF viewer dan navigasi halaman.
- Panel metadata dokumen.
- Versi, jenis, tanggal, dan status.
- Tombol download dan tutup.
- Loading/error state jika preview gagal.

## 7. Status dan feedback

Gunakan label teks dan warna konsisten:
- Draft: abu-abu.
- Processing: biru.
- Menunggu review: amber.
- Approved/Completed/Compliant: hijau.
- Revision Required/Non-compliant/Failed: merah.
- Needs Verification/Not Assessable: abu-abu atau amber.

Tampilkan toast untuk aksi singkat, dialog untuk keputusan penting, dan halaman error untuk kegagalan fatal.

## 8. Aturan penting desain dan data

1. Data, status, angka, dan grafik berasal dari API.
2. Jangan menanam angka contoh dari gambar ke data produksi.
3. Jangan membuat skor kepatuhan sendiri.
4. Jangan mengarang pasal, halaman, kutipan, atau sumber aturan.
5. Bedakan analisis AI dan keputusan evaluator.
6. Simpan keterlacakan dokumen dan versi sumber.
7. Jangan mengubah laporan/evaluasi historis secara retroaktif.
8. Fitur yang belum didukung API harus diberi status belum tersedia, bukan disimulasikan sebagai fitur nyata.
9. Semua tindakan sensitif memerlukan izin backend.

## 9. Catatan implementasi

Dokumen ini adalah spesifikasi tampilan dan perilaku UI, bukan kontrak API. Nama endpoint, field, enum, dan payload harus mengikuti kontrak backend aktual. `requirements.md` menjadi pasangan dokumen ini untuk kebutuhan teknis frontend.
