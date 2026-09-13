# Production Book

Web app belajar event management untuk Enter Event House: 6 fase, 24 minggu, 23 topik, dengan acuan unit kompetensi AQF SIT50322 Diploma of Event Management dan modul kampus luar negeri. Aplikasi jalan di Vercel, data (progres dan jurnal bukti kerja) tersimpan sebagai berkas di satu folder di VPS.

## Cara kerja singkat

- Sebelum mulai, halaman roadmap menampilkan 6 fase dengan tanggal terhitung dari tanggal mulai yang dipilih.
- Hari belajar hanya tercatat kalau kuis dikerjakan atau bukti kerja diunggah. Tombol "sudah baca" tidak ada.
- Topik selesai kalau kuis lulus (minimal 2 dari 3 benar) dan bukti kerja ada.
- Pengingat push dikirim pada jam yang diatur kalau hari itu belum ada hari belajar.
- Halaman portfolio mengumpulkan semua bukti kerja untuk uji kompetensi BNSP.
- Tiap topik dan portfolio bisa diunduh sebagai PDF (materi plus jurnal bukti kerja) atau rangkuman teks biasa (.txt, berpoin, tanpa simbol Markdown). Tombol "Lihat rangkuman" menampilkan rangkuman di pop-up yang bisa di-scroll.
- Tombol "Tanya AI" menjawab pertanyaan seputar topik yang sedang dibuka. Pertanyaan diteruskan ke Hermes yang terpasang di VPS (`hermes -z`, tanpa alat), jadi memakai kredensial Anthropic yang sudah ada di sana.

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
cp .env.example .env.local   # isi DATA_API_URL=http://127.0.0.1:3211 dan DATA_TOKEN=testtoken
npm run dev
```

## Deploy layanan data ke VPS

Layanan jalan sebagai systemd service di host (`easylearn-data`, supaya bisa memanggil `hermes`), Traefik milik Coolify meneruskan HTTPS lewat file provider (`/data/coolify/proxy/dynamic/easylearn.yaml`) dengan Let's Encrypt di domain `easylearn-api.187.53.129.205.sslip.io`. Data ada di `/srv/easylearn/data/`:

```
/srv/easylearn/
├── .env                 token, kunci VAPID, alamat aplikasi (dari vps/.env.example)
├── app/                 server.js, package.json, node_modules
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
2. Isi environment variables sesuai `.env.example`: `DATA_API_URL` dan `DATA_TOKEN`. `ANTHROPIC_API_KEY` hanya kalau ingin chatbot memakai API langsung, bukan Hermes.
3. Deploy. Setiap push ke `main` otomatis dideploy.
4. Buka alamat Vercel, pilih tanggal mulai di roadmap.

Aplikasi tidak punya halaman login. Siapa pun yang tahu alamatnya bisa membuka dan mengubah progres, jadi jangan sebarkan alamatnya. Kalau ingin ditutup tanpa menambah login, pakai Deployment Protection di pengaturan proyek Vercel.

Setelah alamat Vercel diketahui, samakan `APP_URL` di `/srv/easylearn/.env` (dipakai untuk tautan di notifikasi) lalu jalankan `bash vps/deploy.sh` lagi.

## Notifikasi push

Buka Pengaturan, tekan "Aktifkan notifikasi di perangkat ini", lalu "Kirim notifikasi uji". Di iPhone, pasang dulu app ke layar utama (Share, Add to Home Screen) dan buka dari sana. Pengingat dikirim sekali sehari pada jam yang diatur, hanya kalau hari itu belum ada kuis atau bukti kerja.

## Chatbot lewat Hermes

Endpoint `POST /chat` di layanan data menjalankan `hermes -z "<prompt>" -t clarify --safe-mode --ignore-rules -m claude-haiku-4-5 --provider anthropic` di VPS. Toolset dibatasi ke `clarify` supaya percakapan dari web tidak bisa memakai terminal, memori, atau web. Ada batas 40 pertanyaan per 10 menit (`CHAT_MAX_PER_10MIN`). Kalau kredensial di `~/.hermes` diblokir atau kedaluwarsa, chatbot menampilkan pesan gagal; jalankan `hermes login` di VPS untuk memperbarui.

## Mengubah konten

Ubah `content/src/*.mjs` (topik, soal, sumber), jalankan `npm run build:content` lalu `npm test`, commit, dan `bash vps/deploy.sh`. Container di VPS menyalin ulang seed ke `content.json` setiap kali mulai, hasil pengecekan preview sumber tetap dipertahankan.

## Keputusan desain

Lihat `DECISIONS.md` untuk semua penyimpangan dari `architecture.md` dan alasannya.
