# EasyLearnn — Arsitektur, User Flow, ERD, CRUD

## 1. Arsitektur

```
┌──────────────────────────┐        HTTPS + Bearer token        ┌───────────────────────────────┐
│  EasyLearnn (Next.js 16) │ ─────────────────────────────────▶ │  easylearn-api (VPS, dreinst)  │
│  Vercel (frontend + API  │ ◀───────────────────────────────── │  187.53.129.205.sslip.io       │
│  routes tipis)           │        JSON (content, progress)    │  Menyimpan content.json,       │
└──────────────────────────┘                                    │  progress, jurnal, lampiran     │
        │            │                                          └───────────────────────────────┘
        │            │
        │            └──▶ Web Push (VAPID) ke perangkat pengguna
        │
        └──▶ Chatbot: diteruskan ke Hermes di VPS, atau langsung ke
             Anthropic API (Claude Haiku 4.5) bila ANTHROPIC_API_KEY diisi
```

- **Frontend + BFF**: Next.js App Router, di-deploy ke Vercel. Semua halaman `app/(app)/*` dirender server-side lalu memanggil `lib/data.ts` untuk mengambil `content` (kurikulum statis) dan `progress` (data pengguna) dari layanan data di VPS.
- **Layanan data**: proses terpisah di VPS (`/srv/easylearn`) yang menyimpan `content.json`, `progress.json`, folder jurnal (bukti kerja), dan melayani permintaan lewat token rahasia (`DATA_TOKEN`). Next.js tidak punya database sendiri, hanya proxy tipis (`lib/data.ts`) yang menempelkan header `Authorization: Bearer <DATA_TOKEN>`.
- **API routes Next.js** (`app/api/*`) meneruskan aksi pengguna (submit kuis, unggah bukti kerja, ubah pengaturan, ekspor PDF, chat) ke layanan data tadi, atau merender PDF langsung di Vercel memakai `pdf-lib` (`lib/pdf.ts`).
- **PWA**: `public/manifest.json` + `components/RegisterSW.tsx` + `public/sw.js` mendaftarkan service worker untuk notifikasi push pengingat harian.
- **Autentikasi saat ini**: tidak ada login/role. Siapa pun yang tahu URL deployment bisa mengakses semua halaman termasuk `/settings`. Satu `DATA_TOKEN` dipakai bersama oleh seluruh instance frontend untuk bicara ke layanan data (bukan token per pengguna).

## 2. User flow

```
Buka domain
   │
   ▼
Ada program_start di Settings? ──tidak──▶ Redirect ke /roadmap
   │ ya                                        │
   ▼                                           ▼
Dashboard (/)                         Pilih tanggal mulai, jam pengingat,
   │  - progres hari ini                zona waktu → Simpan → mulai program
   │  - modul yang harus diselesaikan            │
   │  - streak & progres program                 ▼
   ▼                                     kembali ke Dashboard
Buka topik (/topic/[slug])
   │  - baca materi inti + acuan (unit kompetensi, referensi kampus)
   │  - kerjakan kuis (lulus = syarat maju)
   │  - unggah bukti kerja (opsional per topik, dipakai untuk status "selesai")
   ▼
Topik berikutnya terbuka otomatis kalau kuis lulus + bukti kerja ada
   │
   ▼
Recap (/recap) ── lihat rangkuman seluruh modul, unduh PDF/teks untuk uji kompetensi BNSP
   │
   ▼
Pengaturan (/settings) ── ubah profil, jadwal, notifikasi push, atau reset progres
```

Elemen lintas-halaman:
- **Menu hover** (di header sidebar): Dashboard, Roadmap, Recap, Pengaturan — muncul saat kursor diarahkan ke tombol "Menu".
- **Sidebar rundown**: daftar 24 minggu/23 topik, menandai minggu aktif, topik terkunci, dan status kuis/bukti kerja.
- **Tanya AI** (`components/Chatbot.tsx`): widget mengambang di semua halaman dalam `AppShell`, memanggil `/api/chat` yang diteruskan ke Hermes atau Anthropic.

## 3. ERD (entitas logis, disimpan sebagai dokumen JSON di layanan data VPS — bukan tabel SQL relasional)

```
┌───────────────┐        ┌──────────────────┐        ┌───────────────┐
│    Content    │        │      Phase       │        │     Topic     │
│───────────────│ 1    N │──────────────────│ 1    N │───────────────│
│ version       ├───────▶│ id               │◀───────┤ slug (PK)     │
│ program_weeks │        │ name             │        │ title         │
│ phases[]      │        │ week_from/to     │        │ curriculum_ref│
│ topics[]      │        │ rationale        │        │ phase_id (FK) │
└───────────────┘        └──────────────────┘        │ week_from/to  │
                                                       │ summary       │
                                                       │ points[]      │
                                                       │ evidence_brief│
                                                       │ sort_order    │
                                                       └───────┬───────┘
                                            ┌────────────────┬─┴───────────────┬─────────────────┐
                                            ▼                ▼                 ▼                  ▼
                                     ┌─────────────┐  ┌──────────────┐  ┌─────────────┐   ┌──────────────┐
                                     │    Unit     │  │UniversityRef │  │   Source    │   │   Question   │
                                     │─────────────│  │──────────────│  │─────────────│   │──────────────│
                                     │ unit_code   │  │ institution  │  │ id          │   │ id           │
                                     │ unit_name   │  │ programme    │  │ title       │   │ stem         │
                                     │ is_core     │  │ module       │  │ url         │   │ options[]    │
                                     │ url         │  │ catalogue    │  │ kind        │   │ correct_index│
                                     └─────────────┘  └──────────────┘  │ publisher   │   │ explanation  │
                                                                        │ year        │   └──────────────┘
                                                                        │ accreditation│
                                                                        └─────────────┘

┌───────────────┐        ┌──────────────────┐        ┌───────────────────┐
│   Progress    │ 1    1 │     Settings     │        │    QuizAttempt    │
│───────────────│───────▶│──────────────────│        │────────────────────│
│ settings      │        │ display_name     │        │ id (PK)            │
│ quiz_attempts[]├──────────────────────────────────▶│ topic (FK Topic)   │
│ evidence[]    │        │ timezone         │        │ answers[]          │
│ study_days[]  │        │ program_start    │        │ score / total      │
│ push_subs[]   │        │ remind_time      │        │ passed             │
│ reminder_log[]│        │ remind_push      │        │ attempted_at       │
└───────┬───────┘        └──────────────────┘        └────────────────────┘
        │
        ├──────────────▶ ┌───────────────────┐   ┌───────────────┐   ┌────────────────────┐
        │                │     Evidence      │   │   StudyDay    │   │PushSubscriptionRec.│
        │                │───────────────────│   │───────────────│   │────────────────────│
        │                │ id (PK)           │   │ day (PK)      │   │ endpoint (PK)       │
        │                │ topic (FK Topic)  │   │ trigger       │   │ keys.p256dh/auth    │
        │                │ title / note      │   └───────────────┘   │ created_at          │
        │                │ link / file       │                       └────────────────────┘
        │                │ journal_file      │
        │                │ submitted_at      │
        │                └───────────────────┘
        │
        └──────────────▶ ┌───────────────────┐
                         │   ReminderLog     │
                         │───────────────────│
                         │ day               │
                         │ channel           │
                         │ status            │
                         │ detail            │
                         │ sent_at           │
                         └───────────────────┘
```

Catatan: relasi `Topic → QuizAttempt/Evidence` bersifat logis lewat field `topic` (menyimpan `slug`), bukan foreign key database sungguhan — semua data pengguna ada dalam satu dokumen `Progress` per instalasi (single-tenant, belum ada konsep multi-user/role).

## 4. CRUD (operasi yang tersedia hari ini)

| Entitas | Create | Read | Update | Delete |
|---|---|---|---|---|
| **Content** (kurikulum) | — (dikelola manual di `scripts/build-content.mjs` + `content/`) | `GET /content` via `getContent()` | — | — |
| **Settings** | dibuat implisit saat pertama kali diambil | `GET /progress` (embed di `settings`) | `PATCH /settings` via `patchSettings()` (form Roadmap & Settings) | `POST /progress/reset` (reset seluruh progres termasuk settings) |
| **QuizAttempt** | `POST /quiz-attempts` via `recordQuizAttempt()` (`app/api/quiz/submit`) | terbaca dari `GET /progress` | — (attempt bersifat immutable, riwayat ditambah terus) | ikut terhapus oleh `POST /progress/reset` |
| **Evidence** (bukti kerja) | `POST /evidence` via `addEvidence()` (`app/api/evidence`, termasuk unggah file base64) | `GET /progress` (list), `GET /files/[name]` untuk lampiran | — (tidak ada endpoint update, hanya hapus + buat baru) | `DELETE /evidence/[id]` via `deleteEvidence()` |
| **PushSubscription** | `POST /push/subscriptions` via `addPushSubscription()` (`app/api/push/subscribe`) | tersirat lewat `GET /push/public-key` (status enabled) | — | `DELETE /push/subscriptions` via `removePushSubscription()` |
| **ReminderLog** | dibuat otomatis oleh layanan data saat mengirim pengingat | tidak diekspos ke UI saat ini | — | ikut `POST /progress/reset` |
| **Chat (Tanya AI)** | `POST /chat` via `chatViaHermes()` (`app/api/chat`) — bukan entitas tersimpan, hanya request/response | — | — | — |
| **Ekspor Recap/Topik** | — | `GET /api/recap/pdf`, `GET /api/recap/export`, `GET /api/topic/[slug]/pdf`, `GET /api/topic/[slug]/export` (baca dari Content + Progress, render PDF/teks) | — | — |

### Yang belum ada (dicatat untuk rencana role-based access ke depan)
- Tidak ada tabel/entitas **User** atau **Role** (owner, superadmin, dst). Saat ini seluruh aplikasi bersifat single-tenant tanpa login.
- Tidak ada endpoint untuk membatasi akses per halaman (`/settings`) atau per fitur (Tanya AI) berdasarkan peran pengguna — perlu dirancang terpisah sebelum diimplementasikan (skema user/role, mekanisme login, middleware pengecekan sesi).
