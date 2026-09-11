import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { isDryRun, isOpendataIngestEnabled } from "@/lib/sasi/opendata/allowlist";
import { runOpendataIngestOnce } from "@/lib/sasi/opendata/run-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function identity() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** Status probe — no fetch. */
export async function GET() {
  const user = await identity();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  return NextResponse.json(
    {
      enabled: isOpendataIngestEnabled(),
      dryRun: isDryRun(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "ORIGIN_REJECTED" }, { status: 403 });
  }
  const user = await identity();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const report = await runOpendataIngestOnce({ userId: user.id });
  return NextResponse.json(report, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
