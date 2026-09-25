import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import {
  claimPaidToolJob,
  completePaidToolJob,
  failPaidToolJob,
  getOwnedPaidJobById,
} from "@/lib/tools/paid-job-server";

export const runtime = "nodejs";

function resultTooLarge(result:unknown){
  try{return Buffer.byteLength(JSON.stringify(result??{}),"utf8")>64*1024}catch{return true}
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 128 * 1024) {
    return NextResponse.json({ error: "LOCAL_PAID_REQUEST_TOO_LARGE" }, { status: 413 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const admin = (await import("@/lib/supabase/admin")).createAdminClient();
  const limited = await admin.rpc("rate_limit_check", {
    p_key: `local-paid-job:${user.id}`,
    p_limit: 600,
    p_window_seconds: 3600,
  });
  if (limited.error) return NextResponse.json({ error: "LOCAL_PAID_RATE_GUARD_UNAVAILABLE" }, { status: 503 });
  if (limited.data !== true) return NextResponse.json({ error: "LOCAL_PAID_RATE_LIMITED" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "start") {
    const quoteId = String(body.quoteId || "");
    const toolId = String(body.toolId || "");
    const itemKey = String(body.itemKey || "");
    const units = Number(body.units);

    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (
      !uuid.test(quoteId) ||
      !toolId || toolId.length > 96 ||
      !itemKey || itemKey.length > 160 ||
      !Number.isFinite(units) || units <= 0 || units > 10000
    ) {
      return NextResponse.json({ error: "INVALID_LOCAL_PAID_JOB" }, { status: 400 });
    }

    const claim = await claimPaidToolJob({
      quoteId,
      userId: user.id,
      toolId,
      itemKey,
      units,
    });

    if (!claim.ok) {
      return NextResponse.json(
        { error: claim.error || "PAYMENT_REQUIRED" },
        { status: claim.error === "JOB_ALREADY_PROCESSING" ? 409 : 402 },
      );
    }

    return NextResponse.json(claim);
  }

  if (action === "complete" || action === "fail") {
    const jobId = String(body.jobId || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId)) {
      return NextResponse.json({ error: "INVALID_JOB_ID" }, { status: 400 });
    }

    // Critical IDOR boundary: complete/fail are executed with service-role RPCs, so the
    // public route must prove the authenticated user owns this exact job first.
    const owned = await getOwnedPaidJobById({ userId: user.id, jobId });
    if (!owned) return NextResponse.json({ error: "JOB_NOT_OWNED" }, { status: 404 });

    if (action === "complete") {
      if (owned.status === "completed") return NextResponse.json({ ok: true, existing: true });
      if (resultTooLarge(body.result)) return NextResponse.json({ error: "RESULT_METADATA_TOO_LARGE" }, { status: 413 });
      const completed = await completePaidToolJob(jobId, body.result || {});
      if (!completed.ok) return NextResponse.json({ error: completed.error || "JOB_COMPLETE_FAILED" }, { status: 503 });
      return NextResponse.json({ ok: true });
    }

    if (owned.status === "completed") {
      return NextResponse.json({ error: "COMPLETED_JOB_CANNOT_FAIL" }, { status: 409 });
    }
    const failureMessage = String(body.error || "LOCAL_PROCESSING_FAILED").slice(0, 2000);
    const failed = await failPaidToolJob(jobId, failureMessage);
    if (!failed.ok) return NextResponse.json({ error: failed.error || "JOB_FAIL_STATE_UPDATE_FAILED" }, { status: 503 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
