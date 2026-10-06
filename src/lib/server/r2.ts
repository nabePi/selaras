import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ApiError } from "./errors";

/** Cloudflare R2 lewat API S3. Bucket bersifat privat: berkas dibaca lewat URL bertanda tangan. */
const env = () => ({
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
});

export function r2Configured() {
  const e = env();
  return Boolean(e.accountId && e.accessKeyId && e.secretAccessKey && e.bucket);
}

let cached: S3Client | undefined;

function client() {
  const e = env();
  if (!e.accountId || !e.accessKeyId || !e.secretAccessKey || !e.bucket)
    throw new ApiError(503, "Penyimpanan lampiran belum dikonfigurasi.");
  cached ??= new S3Client({
    region: "auto",
    endpoint: `https://${e.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: e.accessKeyId, secretAccessKey: e.secretAccessKey },
    // R2 tidak mendukung checksum otomatis SDK terbaru pada presigned URL.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return { s3: cached, bucket: e.bucket };
}

const UPLOAD_TTL_S = 15 * 60;
const READ_TTL_S = 60 * 60;

export async function presignUpload(key: string, contentType: string) {
  const { s3, bucket } = client();
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn: UPLOAD_TTL_S,
  });
}

export async function presignRead(key: string) {
  const { s3, bucket } = client();
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: READ_TTL_S });
}

/** Metadata objek, atau null bila belum ada. */
export async function headObject(key: string): Promise<{ size: number; contentType: string } | null> {
  const { s3, bucket } = client();
  try {
    const res = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { size: res.ContentLength ?? 0, contentType: res.ContentType ?? "" };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw error;
  }
}

/** Menghapus objek; kegagalan hanya dicatat (berkas yatim tidak boleh menggagalkan permintaan). */
export async function deleteObjects(keys: string[]) {
  if (!keys.length || !r2Configured()) return;
  const { s3, bucket } = client();
  await Promise.all(
    keys.map((Key) =>
      s3.send(new DeleteObjectCommand({ Bucket: bucket, Key })).catch((e) => console.error("[r2] gagal hapus", Key, e)),
    ),
  );
}
