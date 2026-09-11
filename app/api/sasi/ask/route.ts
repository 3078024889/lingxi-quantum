import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { runSasiAsk, validateAskQuestion } from "@/lib/sasi/ask/run-ask";

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

/** Readiness ping — no DB / LLM side effects. */
export async function GET() {
  return NextResponse.json(
    { ok: true, capability: "ask+foundry-retrieve" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "ORIGIN_REJECTED" }, { status: 403 });
  }

  const user = await identity();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

  const validated = validateAskQuestion(body.question);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const result = await runSasiAsk({
      userId: user.id,
      question: validated.question,
      admin,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "SUPABASE_ADMIN_CONFIG_MISSING") {
      return NextResponse.json({ error: "ADMIN_CONFIG_MISSING" }, { status: 503 });
    }
    console.error("[sasi ask] failed", message);
    return NextResponse.json({ error: "ASK_FAILED" }, { status: 503 });
  }
}
