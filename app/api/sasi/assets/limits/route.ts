import { NextResponse } from "next/server";
import { sasiStorageUploadLimit } from "@/lib/sasi/storage-limits";
import { SASI_MAX_UPLOAD_BYTES } from "@/lib/sasi/upload-policy";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ maxFileBytes: sasiStorageUploadLimit(), supportedMaxFileBytes: SASI_MAX_UPLOAD_BYTES }, { headers: { "Cache-Control": "no-store" } });
}
