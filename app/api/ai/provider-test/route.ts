import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { providerCandidates, runText } from "@/lib/ai/provider-router";
import type { Intelligence } from "@/lib/ai/provider-router";

export const runtime = "nodejs";
export const maxDuration = 45;

function allowed(email: string | null | undefined) {
  const raw = process.env.AI_PROVIDER_TEST_EMAILS || process.env.TOOL_ADMIN_EMAILS || "";
  const allow = raw.split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allow.includes(email.toLowerCase()));
}

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!allowed(user.email)) return NextResponse.json({ error: "仅管理员可执行供应商测试" }, { status: 403 });

  const url = new URL(req.url);
  const raw = url.searchParams.get("tier");
  const tier: Intelligence = raw === "high" ? "high" : raw === "standard" ? "standard" : "light";

  try {
    const route = providerCandidates(tier).map(x => ({ provider: x.provider, model: x.model }));
    const r = await runText("只回复 LINGXIFIELD_OK", "simple_text", tier, 64);
    return NextResponse.json({
      ok: true,
      tier,
      route,
      provider: r.provider,
      model: r.model,
      answer: r.text,
      usage: r.usage,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      tier,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 502 });
  }
}
