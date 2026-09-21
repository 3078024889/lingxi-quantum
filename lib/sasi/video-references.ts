import "server-only";
import sharp from "sharp";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type VideoReference = { assetId: string; sha256: string; name: string };
export async function loadVideoReferences(db: SupabaseClient, userId: string, projectId: string, ids: string[]) {
  if (!ids.length) return [];
  if (ids.length > 9 || new Set(ids).size !== ids.length || ids.some(id => !/^[0-9a-f-]{36}$/i.test(id))) throw new Error("INVALID_REFERENCE_SELECTION");
  const { data, error } = await db.from("sasi_assets").select("id,original_name,bucket_id,object_path,status,declared_size,verified_size")
    .eq("user_id", userId).eq("project_id", projectId).in("id", ids);
  if (error || data?.length !== ids.length) throw new Error("REFERENCE_NOT_FOUND");
  const output = [];
  for (const id of ids) {
    const asset = data.find(row => row.id === id)!;
    if (!["ready", "external_scan_required"].includes(asset.status) || !/\.(png|jpe?g|webp)$/i.test(asset.original_name)
      || Number(asset.verified_size) <= 0 || Number(asset.verified_size) > 10 * 1024 * 1024) throw new Error("REFERENCE_IMAGE_REQUIRES_REVIEW");
    const { data: blob, error: readError } = await db.storage.from(asset.bucket_id).download(asset.object_path);
    if (readError || !blob || blob.size !== Number(asset.verified_size)) throw new Error("REFERENCE_CONTENT_CHANGED");
    const bytes = Buffer.from(await blob.arrayBuffer());
    // Decode under a pixel limit and re-encode a still JPEG. Quarantined source
    // bytes, metadata and arbitrary URLs are never sent to the supplier.
    const decoder = sharp(bytes, { limitInputPixels: 25_000_000, failOn: "warning" });
    const meta = await decoder.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format ?? "") || (meta.pages ?? 1) > 1) throw new Error("REFERENCE_FORMAT_UNSUPPORTED");
    const jpeg = await decoder.rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 88 }).toBuffer();
    if (jpeg.length > 2 * 1024 * 1024) throw new Error("REFERENCE_DERIVATIVE_TOO_LARGE");
    output.push({ assetId: id, name: asset.original_name, sha256: createHash("sha256").update(bytes).digest("hex"), url: `data:image/jpeg;base64,${jpeg.toString("base64")}` });
  }
  return output;
}
