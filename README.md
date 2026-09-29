# Selaras Life

Ruang refleksi harian dan pendampingan pernikahan muda terpandu untuk pasutri muslim — cukup 3 menit sehari.
Web app mobile-first (PWA) untuk **[selaras.life](https://selaras.life)**.

> **Status:** frontend selesai untuk seluruh layar desain. Backend belum ada — data masih contoh
> dan proses masuk/daftar masih simulasi (lihat [Status & batasan](#status--batasan)).

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, output `standalone`) + React 19
- TypeScript
- Tailwind CSS v4 (design tokens di `src/app/globals.css`)
- Font: Noto Serif + Plus Jakarta Sans (`next/font`), ikon Material Symbols
- Docker + Dokploy untuk deploy

## Halaman

| Route | Untuk | Isi |
|---|---|---|
| `/` | Publik | Beranda: hero, hadis harian, simulasi refleksi, cohort aktif, FAQ |
| `/program` | Publik | Katalog program dengan filter kategori, fasilitator |
| `/cerita` | Publik | Cerita alumni dengan filter, audio, renungan |
| `/masuk` | Auth | Masuk (email/WhatsApp + kata sandi), lupa kata sandi |
| `/daftar` | Auth | Buat akun, pilihan tahap, meter kekuatan sandi |
| `/home` | Member | Sapaan, hadis harian, refleksi tertunda, pita pekan, ekosistem |
| `/journal` | Member | Kalender bulanan, riwayat refleksi |
| `/journal/tulis` | Member | Form refleksi harian (lampiran, privasi, draf) |
| `/profil` | Member | Profil, kurikulum, evaluasi pre/post test, pengaturan PWA |
| `/admin` | Admin | Ikhtisar dashboard: perlu perhatian, kelas berjalan, prompt hari ini, insight singkat |
| `/admin/peserta` | Admin | Aktivasi & data peserta: filter, pencarian, panel audit, ekspor CSV, tambah manual |
| `/admin/prompt` | Admin | Kelola prompt & hadis harian: editor, simulator ponsel, jadwal, pustaka hadis |
| `/admin/kelas` | Admin | Manajemen kelas & sesi kurikulum, bank soal pre/post |
| `/admin/insight` | Admin | Agregat insight emosional & antrean catatan coach |
| `/admin/panduan` | Admin | Panduan & SOP pendampingan |

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
│   │   └── (focus)/   # /journal/tulis — halaman fokus tanpa tab
│   ├── globals.css    # design tokens "Serene Harmony"
│   ├── layout.tsx     # root layout, font, ToastProvider
│   └── manifest.ts    # manifest PWA
├── components/        # komponen UI; yang interaktif ditandai "use client"
│   ├── auth/          # field, form masuk/daftar, dialog lupa sandi
│   └── admin/         # shell admin, pengelola peserta/prompt/kelas/insight
├── data/              # konten statis sementara (programs, stories, member)
└── lib/
    ├── auth.ts        # SIMULASI signIn/register/reset — ganti dengan API
    ├── admin-actions.ts # SIMULASI aksi admin (aktivasi, nudge, publikasi, dll.) — ganti dengan API
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

## Status & batasan

Belum tersambung ke backend:

- **Autentikasi:** `src/lib/auth.ts` hanya menunggu sebentar lalu selalu sukses. Siapa pun bisa "masuk";
  halaman member **belum diproteksi**. Ganti `signIn`, `registerAccount`, dan `requestPasswordReset`
  dengan panggilan API, form sudah menangani hasil gagal dan keadaan loading.
- **Data member:** `src/data/member.ts` berisi data contoh (tanggal, streak, riwayat, dll.).
- **Konsol admin:** semua aksi (aktivasi, nudge WhatsApp, publikasi prompt, simpan kurikulum, dll.) lewat `src/lib/admin-actions.ts` dan hanya mengubah state di memori halaman; belum ada yang tersimpan atau terkirim. Data contoh ada di `src/data/admin-*.ts`. `/admin` **belum diproteksi** (tidak ada cek peran).
- **Kirim jurnal:** "Simpan & Kirim Jurnal" belum mengirim ke server. Draf teks tersimpan di
  `localStorage`.
- **Belum ada fiturnya:** Magic Link WhatsApp, masuk dengan Google, notifikasi, export PDF, tautan Zoom,
  dan pemutar audio menampilkan toast "akan hadir pada fase berikutnya".

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

- [ ] Backend: autentikasi, sesi, dan proteksi route untuk halaman member
- [ ] API jurnal, cohort, dan kurikulum (ganti `src/data/*`)
- [ ] Halaman Ketentuan Layanan dan Kebijakan Privasi
- [ ] Service worker / dukungan offline untuk PWA
- [ ] Notifikasi pengingat refleksi harian
