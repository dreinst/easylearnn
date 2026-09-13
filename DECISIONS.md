# DECISIONS.md

Catatan keputusan yang menyimpang dari `architecture.md` (versi 1.0, September 2026) beserta alasannya. Ditulis 13 September 2026.

## 1. Vercel untuk aplikasi, VPS hanya untuk data

Architecture.md meminta deploy ke VPS dengan PM2 dan Nginx, tanpa Vercel. Donny kemudian meminta repo di-push ke GitHub agar dideploy lewat Vercel, dan meminta progres serta jurnal disimpan sebagai berkas di satu folder di VPS. Aplikasi Next.js jalan di Vercel; layanan kecil di VPS (`vps/server.js`) menyimpan data.

## 2. Tanpa Supabase

Supabase tidak dipakai sama sekali. Progres (`progress.json`), konten yang bisa diedit admin (`content.json`), dan jurnal bukti kerja (`jurnal/*.md` plus lampiran) semuanya berkas biasa di `/srv/easylearn/data/` di VPS. Donny minta "satu folder dengan progress tracking untuk menyimpan jurnal", dan itu lebih mudah dibuka serta dicadangkan daripada tabel Postgres. Donny memutuskan (13 September 2026) aplikasi cukup satu pengguna dan tanpa halaman admin dulu. Halaman admin yang sempat dibuat dihapus; konten diubah lewat `content/src/*.mjs` lalu deploy ulang. Kalau nanti tim ikut belajar, bagian penyimpanan ini yang harus diganti.

## 3. Tanpa login

Magic link butuh pengirim email (Supabase Auth atau layanan lain), jadi awalnya dipakai satu kode akses dengan cookie bertanda tangan. Pada 13 September 2026 Donny minta kode akses dihapus. Aplikasi sekarang terbuka untuk siapa pun yang tahu alamatnya; layanan data di VPS tetap dilindungi token yang hanya ada di server Vercel. Kalau perlu ditutup lagi tanpa kode di aplikasi, pakai Deployment Protection di Vercel.

## 4. Streak tetap dicatat server

Prinsip 5 dipertahankan: hari belajar dicatat oleh layanan VPS saat menerima kuis atau bukti kerja, dihitung di zona waktu profil. Browser tidak pernah bisa menulis `study_days`. Kunci jawaban dinilai di server Vercel dan tidak pernah dikirim ke browser sebelum submit.

## 5. Chatbot lewat Hermes di VPS

Architecture.md melarang pemanggilan model AI saat runtime. Donny kemudian minta chatbot untuk bertanya saat bingung. Awalnya dibuat lewat `@anthropic-ai/sdk` (butuh kunci API). Pada 13 September 2026 Donny memutuskan chatbot memakai Hermes yang sudah terpasang di VPS beserta kredensial OAuth langganan Anthropic yang ada di sana, dan minta endpoint HTTPS untuk itu. Sudah disampaikan bahwa Anthropic melarang token OAuth langganan dipakai di alat pihak ketiga dan kredensialnya bisa diblokir sewaktu-waktu; keputusan diambil Donny dengan risiko itu. Jalur API langsung tetap ada sebagai pilihan (`ANTHROPIC_API_KEY`). Toolset Hermes dibatasi ke `clarify` karena aplikasi terbuka tanpa login. Keluaran disaring `lib/humanize.ts` supaya tidak ada em dash, en dash, atau `--`.

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

## 12. Pembatas modul dan pembatas baca

Permintaan Donny 13 September 2026 malam. Modul mingguan dibuka berurutan menurut `sort_order`; topik terkunci kalau ada topik mingguan sebelumnya yang belum selesai (kuis lulus dan bukti kerja). Pengecekan ada di halaman (pop-up dengan tombol ke modul yang belum selesai) dan di API kuis serta bukti kerja (403). Tiga topik sepanjang program tidak dikunci karena memang paralel. Kuis dibatasi waktu baca minimal di sisi client (`components/ReadingGate.tsx`, patokan 300 kata per menit supaya pembaca cepat tetap lolos, hanya dihitung saat halaman terlihat, kemajuan disimpan di localStorage). Ini pembatas disiplin diri, bukan keamanan: satu-satunya pengguna adalah pemilik sendiri. Rangkuman dan unduhan topik dipindah ke bagian paling bawah dan hanya muncul setelah kuis lulus.

## 13. Audit sumber belajar (13 September 2026)

Donny minta semua sumber terakreditasi, terbaru, dan mencantumkan asalnya. Kriteria akhir (ditegaskan Donny malam harinya): penerbit harus universitas terakreditasi, badan pemerintah, badan standar, atau asosiasi industri yang diakui; terbit atau diperbarui 2020 sampai 2026 dengan bukti tanggal (baris pembaruan di halaman, metadata halaman atau PDF, header Last-Modified, atau API katalog OpenStax) yang dicatat di kolom tahun. Pengecualian hanya untuk standar formal yang masih berlaku untuk industri event dan belum punya edisi baru, ditandai kolom `exempt`; saat ini hanya ISO 31000:2018 (dikonfirmasi ulang ISO 2023). Uji otomatis di tests/content.test.ts menjaga aturan ini. Halaman resmi tanpa tanggal yang bisa dibuktikan (glosarium EIC, British Council, eventIMPACTS, PRS for Music, Imperial College Union, Style Manual) diganti dengan sumber bertanggal, sebagian besar dari NSW Government Event Starter Guide (2024) dan OpenLearn (2020 sampai 2026); STAR Code 2017 diganti NSW Fair Trading (2024). Setiap sumber kini menyimpan `publisher`, `year`, dan `accreditation`, ditampilkan di halaman topik, PDF, dan rangkuman. Tujuh belas sumber diganti: Saylor Academy (3), HubSpot, Toastmasters, EMBOK, EventCanvas, Utah Shakespeare Festival, MIT OCW 2012, OpenLearn 2016, Sport NZ 2014, City of Seattle 2017, CISA 2006, EPA 2007, Cabinet Office 2009, Event Safety Alliance 2013, dan OpenLearn Starting your small business (ditandai usang oleh OU sendiri). Penggantinya antara lain CMP International Standards 2025 (Events Industry Council), PM² Guide 3.1 (Komisi Eropa, 2023), ISO 21502:2020, OpenStax (Rice University, revisi 2026), business.gov.au, Australian Government Style Manual, panduan statutori Martyn's Law (Home Office, 2026), strategi Crowded Places (Pemerintah Australia, 2023), dan buku pegangan stage management Theatre UCF 2021. Dua sumber lebih tua dari 2020 dipertahankan dengan catatan: STAR Code of Practice 2017 (kode industri tiket Inggris yang masih berlaku) dan buku teks teknis panggung Pacific University Press 2018 (belum ada pengganti gratis dari lembaga terakreditasi). Rujukan De Montfort University diganti karena programnya ditutup untuk penerimaan 2026. SIT50322 dicek ulang di training.gov.au: masih Current, Release 2 (September 2022), tidak ada rilis pengganti.
