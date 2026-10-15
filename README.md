# Selaras Life

Ruang refleksi harian dan pendampingan pernikahan muda terpandu untuk pasutri muslim — cukup 3 menit sehari.
Web app mobile-first (PWA) untuk **[selaras.life](https://selaras.life)**.

> **Status:** aplikasi berjalan penuh dengan backend (PostgreSQL + Prisma), autentikasi, konsol admin, dan
> penyimpanan berkas di Cloudflare R2. Lihat [Fitur](#fitur) dan [Backend admin](#backend-admin-postgresql--prisma).

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, output `standalone`) + React 19
- TypeScript, Zod untuk validasi
- PostgreSQL + [Prisma](https://www.prisma.io) 7, penyimpanan berkas di Cloudflare R2
- Editor WYSIWYG [Tiptap](https://tiptap.dev) (artikel blog dan pesan Coachee Care)
- Tailwind CSS v4 (design tokens di `src/app/globals.css`)
- Font: Noto Serif + Plus Jakarta Sans (`next/font`), ikon Material Symbols
- Docker + Dokploy untuk deploy

## Fitur

- **Peserta:** jurnal refleksi harian (prompt admin atau jurnal bebas, lampiran foto/video/audio, opsi privat),
  streak, pre/post assessment, kelas dan sesi, notifikasi, serta **Coachee Care** dari coach.
  Detail jurnal dan Coachee Care bisa disimpan sebagai PDF (tombol *Save PDF*, footer Selaras Life di tiap halaman).
- **Admin:** kelola users (kartu profil, aktivasi, reset password), prompt jurnal, assessment, kelas (banyak rekaman
  per sesi, video maks 4 GB, dokumen maks 200 MB), blog, dan insight. Admin membaca jurnal peserta di
  `/admin/users/[id]/jurnal` (hanya yang dibagikan ke coach; jurnal privat tidak pernah dimuat) dan memberi
  **Coachee Care** di `/admin/users/[id]/coachee-care`: pilih coach, judul, pesan WYSIWYG, dan banyak lampiran
  (PDF, Word, Excel, PowerPoint, audio, video, gambar). Peserta otomatis mendapat notifikasi.

## Halaman

| Route | Untuk | Isi |
|---|---|---|
| `/`, `/program`, `/cerita`, `/blog` | Publik | Beranda, katalog program, cerita alumni, artikel blog |
| `/masuk`, `/daftar` | Auth | Masuk dan buat akun |
| `/home` | Member | Sapaan, kutipan, streak jurnal, Coachee Care terbaru, info kelas, artikel terbaru |
| `/journal`, `/journal/tulis`, `/journal/[id]` | Member | Kalender dan riwayat refleksi, form tulis, detail (bisa Save PDF) |
| `/coachee-care`, `/coachee-care/[id]` | Member | Daftar dan detail Coachee Care dari coach (bisa Save PDF) |
| `/kelas`, `/kelas/[id]` | Member | Kelas yang diikuti, sesi, rekaman, dan dokumen |
| `/notifikasi`, `/profil` | Member | Notifikasi, profil dan pengaturan |
| `/admin` | Admin | Dashboard ringkasan |
| `/admin/users` | Admin | Kartu pengguna, jurnal peserta, Coachee Care |
| `/admin/prompt`, `/admin/assessment/[kind]`, `/admin/insight` | Admin | Prompt jurnal, assessment pre/post, insight |
| `/admin/kelas`, `/admin/blog` | Admin | Kelas dan sesi, artikel blog |

Halaman member dan admin diberi `noindex`.

## Menjalankan

Butuh Node.js 20.9+ (project diuji dengan Node 24).

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build produksi
npm start        # jalankan hasil build
npm run lint
```

> `next/font/google` mengunduh font saat build, jadi build butuh koneksi internet.

## Struktur project

```
src/
├── app/
│   ├── (public)/      # /, /program, /cerita — header + tab bawah publik
│   ├── (auth)/        # /masuk, /daftar
│   ├── admin/         # konsol admin & coach (sidebar + header sendiri)
│   ├── (app)/
│   │   ├── (tabs)/    # /home, /journal, /profil — dengan tab bawah
│   │   └── (focus)/   # /journal/tulis, /coachee-care, /notifikasi — halaman fokus tanpa tab
│   ├── globals.css    # design tokens "Serene Harmony"
│   ├── layout.tsx     # root layout, font, ToastProvider
│   └── manifest.ts    # manifest PWA
├── components/        # komponen UI; yang interaktif ditandai "use client"
│   ├── auth/          # field, form masuk/daftar, dialog lupa sandi
│   └── admin/         # shell admin, pengelola peserta/prompt/kelas/insight
├── data/              # tipe dan konten statis (programs, team, courses, coachee-care, dll.)
├── server/            # lapisan data per fitur (admin/*, member/*) — dipakai halaman dan route handler
└── lib/
    ├── api-client.ts  # klien tipis untuk /api/admin/*
    ├── admin-actions.ts # aksi admin dari komponen client
    ├── server/        # sesi, route helper, R2, waktu (server-only)
    ├── validation.ts  # validasi email, WhatsApp, kekuatan sandi
    └── stored-value.ts# localStorage sebagai external store (draf, pengingat)
public/
├── images/            # gambar dari desain Stitch
└── icons/             # ikon PWA
```

### Design system

Token warna, spacing, dan tipografi mengikuti desain **Serene Harmony** dan didefinisikan di
`src/app/globals.css`:

- Warna dipakai lewat utilitas Tailwind, mis. `bg-canvas-ivory`, `text-primary`, `bg-sage-tint`.
- Tipografi memakai kelas `t-*` (font, ukuran, bobot, dan line-height sekaligus), mis. `t-headline-sm`,
  `t-body-md`, `t-label-sm`. Kelas ini ada di layer `components`, jadi utilitas seperti `font-semibold`
  tetap bisa menimpanya.
- Layout mobile-first: konten dibatasi lebar maksimal 480px di tengah layar.

## Deploy (Docker + Dokploy)

Repo menyertakan `Dockerfile` (multi-stage, output `standalone`, user non-root, healthcheck),
`docker-compose.yml`, dan `.dockerignore`.

Menjalankan lokal dengan Docker:

```bash
docker build -t selaras .
docker run --rm -p 3000:3000 selaras
```

Di Dokploy:

1. Buat service bertipe **Compose** (Compose Type: Docker Compose) dan hubungkan ke repo ini.
2. Di tab **Domains**: Service `web`, Port `3000`, Host `selaras.life`, aktifkan HTTPS (Let's Encrypt).
3. Arahkan DNS `selaras.life` ke IP server, lalu deploy.

Service `web` bergabung ke jaringan `dokploy-network` dan tidak mem-publish `ports:` supaya tidak
bentrok dengan Traefik. Variabel rahasia/konfigurasi diisi lewat tab **Environment** Dokploy lalu
didaftarkan di `environment:` pada `docker-compose.yml`. Variabel `NEXT_PUBLIC_*` tertanam saat build,
jadi perlu ditambahkan sebagai `build.args`.

## Rencana berikutnya

- [ ] Halaman Ketentuan Layanan dan Kebijakan Privasi
- [ ] Service worker / dukungan offline untuk PWA
- [ ] Penanda sudah dibaca untuk Coachee Care

## Kutipan personal dari jurnal (DeepSeek)

Kartu kutipan di `/home` memakai jurnal yang terakhir disimpan atau disunting oleh peserta,
termasuk Catatan Rasa dan jawaban prompt. Kutipan dibuat dengan DeepSeek dan disimpan per
peserta, tanggal WIB, serta revisi jurnal. Membuka ulang halaman tidak membuat permintaan AI
baru untuk kombinasi yang sudah tersimpan. Jurnal baru/suntingan baru bisa menghasilkan
kutipan baru pada hari yang sama. Background tetap bergilir harian.

Untuk mengaktifkan:

1. Terapkan migrasi dengan `npm run db:deploy`, lalu generate client untuk pengembangan dengan `npm run db:generate`.
2. Isi `DEEPSEEK_API_KEY` di `.env` lokal atau tab Environment Dokploy. Jangan memakai awalan `NEXT_PUBLIC_`.
3. `DEEPSEEK_MODEL` secara default adalah `deepseek-flash`; ubah bila model yang tersedia pada akun berbeda.
4. Restart server atau deploy ulang setelah konfigurasi berubah. Variabel sudah diteruskan ke service `web` di Compose.

Endpoint mengikuti [Chat Completions DeepSeek](https://api-docs.deepseek.com/api/create-chat-completion/)
dengan keluaran JSON dan mode thinking dimatikan. Hanya teks jurnal terakhir dan konteks
pertanyaannya yang dikirim; lampiran serta metadata identitas akun tidak ditambahkan.
Untuk jurnal panjang, konteks dibatasi sekitar 20.000 karakter dengan mempertahankan awal dan akhirnya.

Tanpa jurnal, tanpa isi yang dapat dipakai, tanpa API key, atau ketika API gagal/keluarannya
tidak valid, kartu memakai kutipan default. Ada batas waktu 12 detik dan jeda percobaan ulang
5 menit setelah gagal, serta maksimum 12 pembuatan kutipan per akun per jam per proses.
Bagian Home lainnya tidak menunggu pembuatan AI; kartu default tampil sementara.

Gambar Story mengambil snapshot kutipan yang tampil di kartu. Endpoint Story memerlukan
sesi peserta aktif dan hanya dapat membaca snapshot milik akun itu sendiri. Teks jurnal
tidak ditempatkan dalam URL maupun log, dan respons gambar tetap `no-store`.

## Backend admin (PostgreSQL + Prisma)

Backend memakai Route Handlers App Router (`src/app/api`), Prisma 7, dan PostgreSQL yang dijalankan lewat Podman.

```bash
npm run db:up        # PostgreSQL di localhost:5434 (podman)
cp .env.example .env # lalu sesuaikan DATABASE_URL / akun admin seed
npm run db:migrate   # terapkan migrasi
npm run db:seed      # data contoh + akun admin dari SEED_ADMIN_*
npm run dev          # masuk di /admin/masuk
```

- Skema & migrasi: `prisma/schema.prisma`, `prisma/migrations`. Produksi: `npm run db:deploy`.
- Lapisan data per fitur: `src/server/admin/*` (dipakai halaman server dan route handler).
- API: `/api/auth/*` dan `/api/admin/*` (users, prompts, assessment, insight, dashboard, courses, blog, coachee-care).
- Auth: email/WhatsApp + password (scrypt), sesi di database, cookie httpOnly terpisah untuk admin dan member.
- Setelah mengubah `prisma/schema.prisma`, jalankan `npm run db:migrate`, lalu restart `npm run dev` agar Prisma client baru terbaca.

## Lampiran jurnal (Cloudflare R2)

Foto/video/suara dari `/journal/tulis` diunggah peramban langsung ke bucket R2 privat lewat URL bertanda tangan,
dibaca kembali lewat URL bertanda tangan (1 jam). Isi `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET` di `.env`, lalu jalankan sekali `npm run r2:cors` agar bucket mengizinkan unggah dari peramban
(domain produksi lewat `R2_CORS_ORIGINS`).

## Deploy & admin pertama

Service `migrate` di `docker-compose.yml` menjalankan `prisma migrate deploy` sebelum `web` start (deploy gagal bila migrasi gagal).
Akun admin tidak dibuat otomatis; insert manual setelah migrasi pertama:

```bash
npm run hash-password -- 'passwordAdmin'   # cetak hash scrypt
```

```sql
INSERT INTO "User" ("name","email","whatsapp","passwordHash","role","status","skills","activatedAt","updatedAt")
VALUES ('Nama Admin','admin@domain.com','-','<hash dari langkah di atas>','ADMIN','ACTIVE','{}',NOW(),NOW());
```

## Commit & PR (rilis otomatis)

Versi dan `CHANGELOG.md` dibuat otomatis oleh [release-please](https://github.com/googleapis/release-please-action) dari pesan commit, jadi **judul PR dan pesan commit wajib berformat [Conventional Commits](https://www.conventionalcommits.org/)**. CI (`lint-commits`) menolak yang tidak sesuai.

```
<type>(<scope opsional>): <ringkasan singkat>
```

| type | efek | tampil di CHANGELOG |
| --- | --- | --- |
| `feat` | versi minor | Fitur Baru |
| `fix` | versi patch | Perbaikan Bug |
| `perf`, `refactor`, `docs` | patch | Performa / Perapian Kode / Dokumentasi |
| `build`, `ci`, `chore`, `style`, `test` | tidak menaikkan versi | disembunyikan |
| `feat!:` / `fix!:` atau footer `BREAKING CHANGE:` | versi major | ditandai breaking |

Contoh: `feat: tambah filter prompt jurnal`, `fix(auth): perbaiki redirect setelah login`.
Repo ini di-merge dengan merge commit, jadi **setiap commit di dalam PR** ikut dibaca; bila memakai squash merge, **judul PR** yang dibaca.

## Foto profil di R2

Foto profil disimpan di R2 (`avatars/<userId>/…`); kolom `User.avatarUrl` berisi key-nya. Foto lama yang masih berupa data URL di database tetap tampil, dan bisa dipindahkan per lingkungan:

```bash
npm run avatars:migrate            # dry-run: hanya melaporkan
npm run avatars:migrate -- --apply # unggah ke R2 dan perbarui database
```

## Blog

Admin menulis artikel di `/admin/blog` dengan editor WYSIWYG (Tiptap): format teks, judul, daftar, kutipan, tautan,
dan sisipan gambar, video, atau audio. Isi disimpan sebagai dokumen JSON dan dirender sebagai elemen React (bukan HTML
mentah); hanya node/mark dalam daftar putih di `src/lib/blog-content.ts` yang diterima server. Media diunggah langsung
ke R2 (`blog/<jenis>/…`) dan dibaca lewat URL bertanda tangan. Berkas yang diunggah tetapi tidak jadi dipakai belum
dibersihkan otomatis; berkas yang dilepas dari artikel yang disimpan ikut dihapus.

Halaman publik: `/blog` (daftar, filter `?tag=`) dan `/blog/<slug>`. Pengunjung bisa menyukai, membagikan, dan
berkomentar. Pengunjung yang belum masuk berkomentar sebagai "Anonim" dan harus menjawab captcha hitung; token captcha
ditandatangani dengan `CAPTCHA_SECRET`. Pembatas laju (komentar 5/menit, suka 30/menit per alamat) disimpan di memori
proses, jadi berlaku per instance.
