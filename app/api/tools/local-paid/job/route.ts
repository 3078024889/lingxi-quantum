import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  claimPaidToolJob,
  completePaidToolJob,
  failPaidToolJob,
} from "@/lib/tools/paid-job-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "start") {
    const quoteId = String(body.quoteId || "");
    const toolId = String(body.toolId || "");
    const itemKey = String(body.itemKey || "");
    const units = Number(body.units);

    if (!quoteId || !toolId || !itemKey || !Number.isFinite(units) || units <= 0) {
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
        { status: 402 },
      );
    }

    return NextResponse.json(claim);
  }

  if (action === "complete") {
    const jobId = String(body.jobId || "");
    if (!jobId) return NextResponse.json({ error: "JOB_REQUIRED" }, { status: 400 });

    await completePaidToolJob(jobId, body.result || {});
    return NextResponse.json({ ok: true });
  }

  if (action === "fail") {
    const jobId = String(body.jobId || "");
    if (!jobId) return NextResponse.json({ error: "JOB_REQUIRED" }, { status: 400 });

    await failPaidToolJob(jobId, String(body.error || "LOCAL_PROCESSING_FAILED"));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
}
