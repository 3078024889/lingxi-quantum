import { NextRequest, NextResponse } from "next/server";
import { sasiStorageUploadLimit } from "@/lib/sasi/storage-limits";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { mediaKindForExtension, safeAssetPath, SASI_ASSET_BUCKET, validateAsset } from "@/lib/sasi/assets";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "ORIGIN_REJECTED" }, { status: 403 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const abuse = await enforceAbuseGuard(request,{scope:"sasi-asset-prepare",userId:user.id,accountLimit:120,ipLimit:300});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const contentLength=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>64*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const asset = validateAsset(body.name, body.size, body.mime);
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || !asset) return NextResponse.json({ error: "INVALID_ASSET" }, { status: 400 });
  if (asset.declaredSize > sasiStorageUploadLimit()) return NextResponse.json({ error: "STORAGE_PLAN_LIMIT", maxFileBytes: sasiStorageUploadLimit() }, { status: 413 });

  const admin = createAdminClient();
  const { data: project } = await admin.from("sasi_projects").select("id").eq("id", projectId).eq("user_id", user.id).maybeSingle();
  if (!project) return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });

  const objectPath = safeAssetPath(user.id, projectId, asset.extension);
  const { data: record, error: insertError } = await admin.from("sasi_assets").insert({
    project_id: projectId, user_id: user.id, bucket_id: SASI_ASSET_BUCKET, object_path: objectPath,
    original_name: asset.originalName, media_kind: mediaKindForExtension(asset.extension), declared_mime: asset.declaredMime, declared_size: asset.declaredSize,
  }).select("id").single();
  if (insertError || !record) return NextResponse.json({ error: insertError?.code === "42P01" ? "SASI_FOUNDATION_NOT_APPLIED" : "ASSET_PREPARE_FAILED" }, { status: 503 });

  const { data: signed, error: signError } = await admin.storage.from(SASI_ASSET_BUCKET).createSignedUploadUrl(objectPath);
  if (signError || !signed) {
    await admin.from("sasi_assets").delete().eq("id", record.id).eq("user_id", user.id);
    return NextResponse.json({ error: "UPLOAD_TICKET_FAILED" }, { status: 503 });
  }
  return NextResponse.json({ assetId: record.id, bucket: SASI_ASSET_BUCKET, path: objectPath, token: signed.token, contentType: asset.declaredMime }, { status: 201 });
}
