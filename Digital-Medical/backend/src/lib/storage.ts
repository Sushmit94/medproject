import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function isConfigured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
}

/**
 * Upload a file buffer to Cloudflare R2.
 * @param buffer - file bytes
 * @param originalName - original filename (for extension)
 * @param folder - optional folder prefix, e.g. "businesses", "licenses"
 * @returns public URL of the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder = "uploads"
): Promise<string> {
  if (!isConfigured()) {
    throw new Error("Cloudflare R2 is not configured. Set R2_* env vars.");
  }

  const ext = path.extname(originalName).toLowerCase();
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeFromExt(ext),
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2 by its public URL.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!isConfigured() || !fileUrl.startsWith(R2_PUBLIC_URL)) return;

  const key = fileUrl.replace(`${R2_PUBLIC_URL}/`, "");

  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] || "application/octet-stream";
}
