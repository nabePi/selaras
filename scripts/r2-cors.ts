import "dotenv/config";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Mengatur CORS bucket R2 agar peramban boleh mengunggah (PUT) langsung lewat URL bertanda tangan.
 * Jalankan sekali: `npm run r2:cors`. Origin tambahan (domain produksi) lewat R2_CORS_ORIGINS,
 * dipisah koma.
 */
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error("Isi R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_BUCKET di .env.");
  process.exit(1);
}

const origins = [
  "http://localhost:3000",
  ...(process.env.R2_CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
];

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

s3.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["PUT", "GET", "HEAD"],
          AllowedHeaders: ["content-type"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
)
  .then(() => console.log(`CORS bucket "${R2_BUCKET}" diatur untuk: ${origins.join(", ")}`))
  .catch((e) => {
    console.error("Gagal mengatur CORS:", e.message);
    process.exitCode = 1;
  });
