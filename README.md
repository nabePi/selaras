# Selaras Life — web

Next.js (App Router) + TypeScript + Tailwind CSS v4. Domain: selaras.life.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Struktur

- `src/app/(public)` — halaman untuk pengunjung yang belum login: `/`, `/program`, `/cerita`
- `src/app/(auth)` — `/masuk` dan `/daftar`. Logika kirim ada di `src/lib/auth.ts` (masih simulasi, ganti dengan API)
- `src/app/(app)` — halaman member (sudah login, noindex): `/home`, `/journal`, `/profil` (dengan tab bawah) dan `/journal/tulis` (tanpa tab)
- `src/components` — komponen UI (yang interaktif ditandai `"use client"`)
- `src/data` — konten statis sementara (`member.ts` = data contoh member); nanti diganti dari backend
- `src/app/globals.css` — design tokens "Serene Harmony" (warna, tipografi `t-*`)
- `public/images` — gambar dari desain Stitch
