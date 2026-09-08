import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { assetExtension, inspectText, isDirectlyIndexable, SASI_TEXT_INDEX_LIMIT, sha256 } from "@/lib/sasi/assets";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: "INVALID_ASSET_ID" }, { status: 400 });

  const admin = createAdminClient();
  const { data: asset } = await admin.from("sasi_assets").select("id,bucket_id,object_path,original_name,declared_size,status").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!asset) return NextResponse.json({ error: "ASSET_NOT_FOUND" }, { status: 404 });
  if (asset.status === "ready" || asset.status === "external_scan_required") return NextResponse.json({ assetId: asset.id, status: asset.status });

  await admin.from("sasi_assets").update({ status: "inspecting", updated_at: new Date().toISOString() }).eq("id", asset.id).eq("user_id", user.id);
  const pathParts = asset.object_path.split("/");
  const objectName = pathParts.pop() ?? "";
  const folder = pathParts.join("/");
  const { data: objects, error: listError } = await admin.storage.from(asset.bucket_id).list(folder, { search: objectName, limit: 2 });
  const storedObject = objects?.find((item) => item.name === objectName);
  const storedSize = Number(storedObject?.metadata?.size);
  if (listError || !storedObject || !Number.isFinite(storedSize) || storedSize !== Number(asset.declared_size)) {
    await admin.from("sasi_assets").update({ status: "rejected", rejection_reason: "STORED_OBJECT_MISMATCH", updated_at: new Date().toISOString() }).eq("id", asset.id);
    return NextResponse.json({ assetId: asset.id, status: "rejected" }, { status: 422 });
  }
  const extension = assetExtension(asset.original_name);
  if (!isDirectlyIndexable(extension) || storedSize > SASI_TEXT_INDEX_LIMIT) {
    await admin.from("sasi_assets").update({ status: "external_scan_required", verified_size: storedSize, rejection_reason: null, updated_at: new Date().toISOString() }).eq("id", asset.id);
    return NextResponse.json({ assetId: asset.id, status: "external_scan_required", indexed: false });
  }

  const { data: blob, error: downloadError } = await admin.storage.from(asset.bucket_id).download(asset.object_path);
  if (downloadError || !blob) {
    await admin.from("sasi_assets").update({ status: "failed", rejection_reason: "OBJECT_NOT_FOUND", updated_at: new Date().toISOString() }).eq("id", asset.id);
    return NextResponse.json({ error: "ASSET_DOWNLOAD_FAILED" }, { status: 422 });
  }
  const bytes = await blob.arrayBuffer();
  if (bytes.byteLength < 1 || bytes.byteLength !== storedSize) {
    await admin.from("sasi_assets").update({ status: "rejected", rejection_reason: "CONTENT_VERIFICATION_FAILED", verified_size: bytes.byteLength, updated_at: new Date().toISOString() }).eq("id", asset.id);
    return NextResponse.json({ assetId: asset.id, status: "rejected" }, { status: 422 });
  }

  const digest = sha256(bytes);
  const inspection = inspectText(bytes);
  if (!inspection.safe) {
    await admin.from("sasi_assets").update({ status: "rejected", rejection_reason: inspection.reason, verified_size: bytes.byteLength, sha256: digest, updated_at: new Date().toISOString() }).eq("id", asset.id);
    return NextResponse.json({ assetId: asset.id, status: "rejected" }, { status: 422 });
  }
  await admin.from("sasi_assets").update({ status: "ready", verified_size: bytes.byteLength, sha256: digest, extracted_text: inspection.text, rejection_reason: null, updated_at: new Date().toISOString() }).eq("id", asset.id);
  return NextResponse.json({ assetId: asset.id, status: "ready", indexed: true });
}
