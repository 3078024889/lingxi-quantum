import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "星迹已停止开放，不再生成新的寻人、寻物或寻动物推演。" },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
