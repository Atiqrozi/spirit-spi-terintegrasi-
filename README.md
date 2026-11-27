# SPI RS Korpri Pura Raharja — Frontend

Aplikasi web SPA untuk alur pengelolaan dokumen, OCR, laporan, evaluasi AI dan manusia, rekomendasi, serta tindak lanjut SPI. Seluruh source frontend berada di folder ini.

## Menjalankan aplikasi

Kebutuhan: Node.js 22.22.2+, 24.15+, atau 26+ dan npm.

```powershell
cd "E:\spi project\frontend"
npm install
Copy-Item .env.example .env
npm run dev
```

Jika memakai Command Prompt (CMD), salin file env dengan:

```bat
cd /d "E:\spi project\frontend"
npm install
copy .env.example .env
npm run dev
```

Atur `VITE_API_BASE_URL` dalam `.env` agar menunjuk ke base API backend, misalnya `http://localhost:3000/api/v1`. Restart Vite setelah mengubah `.env`. Jangan menaruh API key NVIDIA, MongoDB, Redis, atau secret backend di variabel `VITE_*`; nilai Vite dapat terbaca oleh browser.

## Perintah pengembangan

```powershell
npm run dev
npm run lint
npm run type-check
npm test
npm run build
npm run preview
```

## Halaman

- Login dan sesi, dashboard, OCR dan status pemrosesan dokumen.
- Manajemen dokumen dan versi, template laporan, penugasan SPI.
- Daftar laporan, detail laporan, analisis AI, sumber/regulasi, rekomendasi, keputusan evaluator, bukti dan tindak lanjut.
- Log notifikasi khusus Admin SPI, pengaturan akun, panduan, serta halaman akses ditolak/tidak ditemukan.

Antarmuka menggunakan data API backend, menampilkan state memuat/kosong/gagal, dan membatasi aksi berdasarkan role. Token sesi berada di memori aplikasi. Dengan kontrak saat ini, refresh halaman akan meminta pengguna login kembali.

## Catatan kontrak API

Backend saat ini belum menyediakan endpoint untuk hitungan notifikasi belum dibaca, mark-as-read, preferensi notifikasi, profil pengguna, pengubahan kata sandi, pengaturan integrasi, maupun editor skema field template. UI menjelaskan keterbatasan ini dan tidak mengarang data atau endpoint. Daftar pengguna hanya dapat dibaca Admin SPI melalui endpoint yang tersedia.
