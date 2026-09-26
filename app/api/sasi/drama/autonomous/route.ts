import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { buildAutonomousDrama } from "@/lib/sasi/autonomous-drama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const script = String(body.script || "").trim().slice(0, 60_000);
  if (!script) return NextResponse.json({ error: "请先输入剧本或故事。" }, { status: 400 });

  try {
    return NextResponse.json(buildAutonomousDrama(script, { secondsPerShot: Number(body.secondsPerShot || 4) }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "短剧整理失败，请调整内容后重试。" },
      { status: 400 },
    );
  }
}
