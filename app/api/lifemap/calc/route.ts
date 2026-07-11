import { NextResponse } from "next/server";
import { computeLifeMapFacts, computeMayaTzolkin, type BirthInput } from "@/lib/lifemap-calc";
import { computeZiWeiChart, type Gender } from "@/lib/ziwei-calc";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Partial<BirthInput> & { gender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { year, month, day, hour, minute, hasTime } = body;
  const gender: Gender = (body as { gender?: string }).gender === "male" ? "male" : "female";
  if (
    typeof year !== "number" || typeof month !== "number" || typeof day !== "number" ||
    year < 1900 || year > 2026 || month < 1 || month > 12 || day < 1 || day > 31
  ) {
    return NextResponse.json({ error: "出生日期无效。" }, { status: 400 });
  }

  try {
    const usedHour = typeof hour === "number" ? hour : 12;
    const facts = computeLifeMapFacts({
      year, month, day,
      hour: usedHour,
      minute: typeof minute === "number" ? minute : 0,
      hasTime: !!hasTime,
    });
    const maya = computeMayaTzolkin(year, month, day);
    // 24小时制转紫微斗数的13时辰序号：0=早子(00-01) 1=丑…6=午…12=晚子(23-00)
    const ziweiHourIndex = Math.floor((usedHour + 1) / 2) % 13;
    let ziwei = null;
    try {
      ziwei = computeZiWeiChart(year, month, day, ziweiHourIndex, gender);
    } catch {
      ziwei = null; // 紫微排盘偶发的极端日期边界问题，不应影响其余数据正常返回
    }
    return NextResponse.json({ ...facts, maya, ziwei });
  } catch (e) {
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
