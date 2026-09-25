import { NextResponse } from "next/server";
import { revokeMiniSession } from "@/lib/mini/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const revoked = await revokeMiniSession(req);
  if (!revoked) {
    return NextResponse.json({ error: "当前会话已结束或不可用" }, { status: 401 });
  }
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
