import "server-only";
import { SASI_MAX_UPLOAD_BYTES } from "@/lib/sasi/upload-policy";

// Hosted project's current plan limit is 50 MiB. Increase this deployment
// setting only after upgrading and verifying the global Storage limit.
export function sasiStorageUploadLimit() {
  const configured = Number(process.env.SASI_STORAGE_MAX_FILE_BYTES || 50 * 1024 * 1024);
  return Number.isSafeInteger(configured) && configured > 0
    ? Math.min(configured, SASI_MAX_UPLOAD_BYTES)
    : 50 * 1024 * 1024;
}
