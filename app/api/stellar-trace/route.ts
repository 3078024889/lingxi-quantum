import { NextResponse } from "next/server";
import { calculateStellarTrace, type StellarTraceInput } from "@/lib/stellar-trace";

export const runtime = "nodejs";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<StellarTraceInput> & { consent?: boolean };
    const input: StellarTraceInput = {
      name: text(body.name, 40), birthDate: text(body.birthDate, 10), birthTime: text(body.birthTime, 5),
      lastContactAt: text(body.lastContactAt, 40), lastKnownLat: Number(body.lastKnownLat), lastKnownLon: Number(body.lastKnownLon),
      context: text(body.context, 500),
    };
    if (!body.consent) return NextResponse.json({ error: "请先确认资料使用边界与现实安全说明" }, { status: 400 });
    if (!input.name || !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) || !input.lastContactAt) return NextResponse.json({ error: "请完整填写寻踪对象、出生日期与最后有效联系时间" }, { status: 400 });
    if (!Number.isFinite(input.lastKnownLat) || input.lastKnownLat < -90 || input.lastKnownLat > 90 || !Number.isFinite(input.lastKnownLon) || input.lastKnownLon < -180 || input.lastKnownLon > 180) return NextResponse.json({ error: "最后已知坐标不在有效经纬度范围" }, { status: 400 });
    return NextResponse.json(calculateStellarTrace(input), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[stellar trace] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "星迹推演暂未完成，请核对时间与坐标" }, { status: 400 });
  }
}
