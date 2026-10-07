import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Memindahkan foto profil lama (data URL base64 di kolom "User"."avatarUrl") ke R2 dan menyimpan
 * key-nya di kolom yang sama. Aman dijalankan ulang: yang sudah berupa key R2 dilewati.
 *
 *   npm run avatars:migrate            # uji saja (dry-run): hanya melaporkan, tidak mengubah apa pun
 *   npm run avatars:migrate -- --apply # unggah ke R2 dan perbarui database
 *
 * Jalankan di tiap lingkungan (lokal, staging, produksi) dengan DATABASE_URL dan R2_* miliknya.
 */
const apply = process.argv.includes("--apply");
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (apply && (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET)) {
  console.error("Isi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET di .env.");
  process.exit(1);
}

const EXT = { webp: "webp", png: "png", jpeg: "jpg" } as const;
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const s3 = apply
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  : null;

async function main() {
  const users = await db.user.findMany({
    where: { avatarUrl: { startsWith: "data:" } },
    select: { id: true, name: true, avatarUrl: true },
    orderBy: { id: "asc" },
  });
  console.log(`${apply ? "MIGRASI" : "DRY-RUN"}: ${users.length} foto profil berbentuk data URL.`);

  let moved = 0;
  let bytes = 0;
  for (const u of users) {
    const m = /^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(u.avatarUrl ?? "");
    if (!m) {
      console.warn(`  - #${u.id} ${u.name}: format tidak dikenali, dilewati.`);
      continue;
    }
    const type = m[1] as keyof typeof EXT;
    const body = Buffer.from(m[2], "base64");
    const key = `avatars/${u.id}/${randomUUID()}.${EXT[type]}`;
    bytes += body.length;
    if (!apply) {
      console.log(`  - #${u.id} ${u.name}: ${(body.length / 1024).toFixed(0)} KB image/${type} -> ${key}`);
      continue;
    }
    await s3!.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: `image/${type}` }));
    await db.user.update({ where: { id: u.id }, data: { avatarUrl: key } });
    moved += 1;
    console.log(`  ✓ #${u.id} ${u.name} -> ${key}`);
  }
  console.log(apply ? `Selesai: ${moved} foto dipindahkan (${(bytes / 1024).toFixed(0)} KB).` : `Total ${(bytes / 1024).toFixed(0)} KB akan dipindahkan. Jalankan dengan --apply untuk memproses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
