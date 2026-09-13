# DECISIONS.md

Catatan keputusan yang menyimpang dari `architecture.md` (versi 1.0, September 2026) beserta alasannya. Ditulis 13 September 2026.

## 1. Vercel untuk aplikasi, VPS hanya untuk data

Architecture.md meminta deploy ke VPS dengan PM2 dan Nginx, tanpa Vercel. Donny kemudian meminta repo di-push ke GitHub agar dideploy lewat Vercel, dan meminta progres serta jurnal disimpan sebagai berkas di satu folder di VPS. Aplikasi Next.js jalan di Vercel; layanan kecil di VPS (`vps/server.js`) menyimpan data.

## 2. Tanpa Supabase

Supabase tidak dipakai sama sekali. Progres (`progress.json`), konten yang bisa diedit admin (`content.json`), dan jurnal bukti kerja (`jurnal/*.md` plus lampiran) semuanya berkas biasa di `/srv/easylearn/data/` di VPS. Donny minta "satu folder dengan progress tracking untuk menyimpan jurnal", dan itu lebih mudah dibuka serta dicadangkan daripada tabel Postgres. Donny memutuskan (13 September 2026) aplikasi cukup satu pengguna dan tanpa halaman admin dulu. Halaman admin yang sempat dibuat dihapus; konten diubah lewat `content/src/*.mjs` lalu deploy ulang. Kalau nanti tim ikut belajar, bagian penyimpanan ini yang harus diganti.

## 3. Login kode akses, bukan magic link

Magic link butuh pengirim email (Supabase Auth atau layanan lain). Karena Supabase tidak dipakai dan layanan cloud baru dilarang, login memakai satu kode akses (`APP_ACCESS_CODE`) dan cookie bertanda tangan HMAC selama 30 hari.

## 4. Streak tetap dicatat server

Prinsip 5 dipertahankan: hari belajar dicatat oleh layanan VPS saat menerima kuis atau bukti kerja, dihitung di zona waktu profil. Browser tidak pernah bisa menulis `study_days`. Kunci jawaban dinilai di server Vercel dan tidak pernah dikirim ke browser sebelum submit.

## 5. Chatbot AI dengan Claude Haiku 4.5

Architecture.md melarang pemanggilan model AI saat runtime. Donny kemudian minta chatbot untuk bertanya saat bingung. Dipakai `@anthropic-ai/sdk` dengan model `claude-haiku-4-5`, hanya aktif kalau `ANTHROPIC_API_KEY` diisi. Langganan Claude Code tidak bisa dipakai oleh aplikasi web; kuncinya dari console.anthropic.com. Keluaran disaring `lib/humanize.ts` supaya tidak ada em dash, en dash, atau `--`, sesuai aturan humanizer.

## 6. Prototipe HTML tidak ditemukan

`Enter_Event_House_Learning.html` tidak ada di Mac ini. Isi 23 topik ditulis ulang dari gambar kurikulum Enter Event House (22 pokok bahasan) ditambah satu topik `legal` (Perizinan, hukum, dan kepatuhan) yang ada di acuan AQF SIT50322 tapi tidak ada di kurikulum asli. Kalau tidak diinginkan, hapus lewat halaman admin atau ubah di `content/src/topics-c.mjs` lalu jalankan `npm run build:content`.

## 7. Urutan minggu

Enam fase mengikuti nama di architecture.md. Penempatan topik per minggu adalah keputusan sendiri (lihat `content/src/phases.mjs` untuk alasannya). Creative Concept diletakkan di fase 5 supaya ide yang dijual selalu bisa diproduksi dan dibayar.

## 8. Pengingat dijadwalkan di VPS, bukan pg_cron

Tanpa Supabase tidak ada pg_cron. Layanan VPS mengecek tiap menit apakah jam pengingat sudah tiba dan hari itu belum ada hari belajar, lalu mengirim Web Push ke semua perangkat terdaftar. Log tersimpan di `progress.json`.

## 9. Offline

Service worker hanya menangani push dan cache ringan halaman yang pernah dibuka. Antrean submit kuis saat offline (Background Sync) tidak dibuat; kuis harus dikerjakan saat online.

## 10. WhatsApp

Belum dikerjakan, menunggu template pesan disetujui Meta. Halaman pengaturan hanya menampilkan catatannya.

## 11. Lampiran maksimal 3 MB

Vercel membatasi body permintaan sekitar 4,5 MB. Lampiran di atas 3 MB diminta diunggah ke Drive lalu ditempel tautannya.
