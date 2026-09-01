import { NextResponse } from "next/server";
import { calculateStellarTrace, type StellarTraceInput } from "@/lib/stellar-trace";
import { getAccess, hasUnlock } from "@/lib/access";
import { validContactAt, validCoordinates, validIsoDate } from "@/lib/stellar-trace-intake";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function POST(req: Request) {
  try {
    const access = await getAccess();
    if (!access.user) return NextResponse.json({ error: "请先登录并开启星迹研究权益" }, { status: 401 });
    if (!access.manifestActive && !hasUnlock(access.unlocks, "stellar-trace")) return NextResponse.json({ error: "星迹研究权益尚未开启" }, { status: 403 });
    const body = await req.json() as Partial<StellarTraceInput> & { consent?: boolean; qaNow?: string };
    const input: StellarTraceInput = {
      name: text(body.name, 40), relationship: text(body.relationship, 20), birthDate: text(body.birthDate, 10), birthTime: text(body.birthTime, 5), birthPlace: text(body.birthPlace, 80),
      lastContactAt: text(body.lastContactAt, 40), lastKnownLat: text(body.lastKnownLat, 20) ? Number(body.lastKnownLat) : null, lastKnownLon: text(body.lastKnownLon, 20) ? Number(body.lastKnownLon) : null,
      lastKnownPlace: text(body.lastKnownPlace, 120), movementDirection: text(body.movementDirection, 60), context: text(body.context, 500),
    };
    if (!body.consent) return NextResponse.json({ error: "请先确认资料使用边界与现实安全说明" }, { status: 400 });
    if (!input.name || !validIsoDate(input.birthDate) || !validContactAt(input.lastContactAt) || !input.lastKnownPlace) return NextResponse.json({ error: "请完整填写寻踪对象、有效出生日期、最后有效联系日期与时间、最后已知位置说明" }, { status: 400 });
    if (!validCoordinates({ lastKnownLat: input.lastKnownLat == null ? "" : String(input.lastKnownLat), lastKnownLon: input.lastKnownLon == null ? "" : String(input.lastKnownLon) })) return NextResponse.json({ error: "请先在精准地图中确认最后可证位置" }, { status: 400 });
    const qaNow = REVIEW_MODE && body.qaNow ? new Date(body.qaNow) : null;
    return NextResponse.json(await calculateStellarTrace(input, qaNow && Number.isFinite(qaNow.getTime()) ? qaNow : new Date()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[stellar trace] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "星迹推演暂未完成，请核对日期与时间格式" }, { status: 400 });
  }
}
