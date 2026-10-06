import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Dikosongkan (bukan env()) agar `prisma generate` di build Docker tidak butuh database;
  // perintah migrate tetap gagal dengan pesan jelas bila DATABASE_URL belum diisi.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
