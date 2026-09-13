# Production Book

Web app belajar event management untuk Enter Event House: 6 fase, 24 minggu, 23 topik, dengan acuan unit kompetensi AQF SIT50322 Diploma of Event Management dan modul kampus luar negeri. Aplikasi jalan di Vercel, data (progres dan jurnal bukti kerja) tersimpan sebagai berkas di satu folder di VPS.

## Cara kerja singkat

- Sebelum mulai, halaman roadmap menampilkan 6 fase dengan tanggal terhitung dari tanggal mulai yang dipilih.
- Hari belajar hanya tercatat kalau kuis dikerjakan atau bukti kerja diunggah. Tombol "sudah baca" tidak ada.
- Topik selesai kalau kuis lulus (minimal 2 dari 3 benar) dan bukti kerja ada.
- Pengingat push dikirim pada jam yang diatur kalau hari itu belum ada hari belajar.
- Halaman portfolio mengumpulkan semua bukti kerja untuk uji kompetensi BNSP.
- Tombol "Tanya AI" (Claude Haiku 4.5) menjawab pertanyaan seputar topik yang sedang dibuka.

## Struktur

```
app/                 halaman dan API (Next.js 16, App Router)
components/          komponen client (kuis, bukti kerja, chatbot, dll.)
lib/                 logika murni: timeline, streak, kuis, tanggal; klien ke layanan data
content/src/         sumber konten (topik, unit AQF, modul kampus, sumber belajar)
content/topics.json  hasil build konten, dipakai sebagai seed di VPS
vps/                 layanan data untuk VPS (Node, tanpa database)
tests/               unit test (Vitest)
```

## Menjalankan lokal

```bash
npm install
npm test                 # unit test timeline, streak, kuis, integritas konten
npm run build:content    # kalau mengubah content/src/*

# layanan data lokal (folder /tmp/el-data)
DATA_DIR=/tmp/el-data SEED_FILE=$PWD/content/topics.json DATA_TOKEN=testtoken PORT=3210 node vps/server.js

# aplikasi (terminal lain)
cp .env.example .env.local   # isi DATA_API_URL=http://127.0.0.1:3210, DATA_TOKEN=testtoken, kode akses, secret
npm run dev
```

## Deploy layanan data ke VPS

Layanan jalan sebagai container Docker di network `coolify`, Traefik memberi HTTPS otomatis lewat Let's Encrypt di domain `easylearn-api.187.53.129.205.sslip.io`. Data ada di `/srv/easylearn/data/`:

```
/srv/easylearn/
├── .env                 token, kunci VAPID, alamat aplikasi (dari vps/.env.example)
├── app/                 server.js, package.json, Dockerfile
├── seed/topics.json     konten awal
└── data/
    ├── content.json     salinan konten dari seed (disegarkan tiap deploy)
    ├── progress.json    pengaturan, hasil kuis, hari belajar, perangkat push, log pengingat
    └── jurnal/
        ├── 2026-09-14-bud-1a2b3c4d.md    satu berkas markdown per bukti kerja
        └── lampiran/                     berkas yang diunggah
```

Langkah:

```bash
# sekali: buat .env di VPS
ssh root@187.53.129.205 'mkdir -p /srv/easylearn && cat > /srv/easylearn/.env' < vps/.env.example   # lalu isi nilainya
# kunci VAPID: npx web-push generate-vapid-keys

# setiap ada perubahan di vps/ atau content/topics.json
bash vps/deploy.sh
```

Cadangan: cukup salin folder `/srv/easylearn/data/`.

## Deploy aplikasi ke Vercel

1. Import repo ini di Vercel (framework Next.js, root repo).
2. Isi environment variables sesuai `.env.example`: `DATA_API_URL`, `DATA_TOKEN`, `APP_ACCESS_CODE`, `APP_SESSION_SECRET`, dan `ANTHROPIC_API_KEY` (opsional, untuk chatbot).
3. Deploy. Setiap push ke `main` otomatis dideploy.
4. Buka alamat Vercel, masuk dengan kode akses, pilih tanggal mulai di roadmap.

Setelah alamat Vercel diketahui, samakan `APP_URL` di `/srv/easylearn/.env` (dipakai untuk tautan di notifikasi) lalu jalankan `bash vps/deploy.sh` lagi.

## Notifikasi push

Buka Pengaturan, tekan "Aktifkan notifikasi di perangkat ini", lalu "Kirim notifikasi uji". Di iPhone, pasang dulu app ke layar utama (Share, Add to Home Screen) dan buka dari sana. Pengingat dikirim sekali sehari pada jam yang diatur, hanya kalau hari itu belum ada kuis atau bukti kerja.

## Mengubah konten

Ubah `content/src/*.mjs` (topik, soal, sumber), jalankan `npm run build:content` lalu `npm test`, commit, dan `bash vps/deploy.sh`. Container di VPS menyalin ulang seed ke `content.json` setiap kali mulai, hasil pengecekan preview sumber tetap dipertahankan.

## Keputusan desain

Lihat `DECISIONS.md` untuk semua penyimpangan dari `architecture.md` dan alasannya.
