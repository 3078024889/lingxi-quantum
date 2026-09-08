import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSasiVideo } from "@/lib/sasi/provider";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const admin = createAdminClient();
  const { data: job } = await admin.from("sasi_jobs").select("id,status,provider,provider_job_id").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (!new Set(["confirmed", "queued"]).has(job.status)) return NextResponse.json({ error: "JOB_NOT_CANCELLABLE" }, { status: 409 });
  try {
    if (job.provider_job_id) await cancelSasiVideo(job.provider, job.provider_job_id);
  } catch (error) {
    console.error("[sasi job cancel] provider rejection", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "PROVIDER_CANCEL_FAILED" }, { status: 502 });
  }
  const released = await admin.rpc("release_sasi_job", { p_job_id: job.id, p_status: "cancelled", p_error_code: "USER_CANCELLED" });
  if (released.error || !(released.data as { ok?: boolean } | null)?.ok) return NextResponse.json({ error: "JOB_RELEASE_FAILED" }, { status: 503 });
  return NextResponse.json({ ok: true, status: "cancelled" });
}
