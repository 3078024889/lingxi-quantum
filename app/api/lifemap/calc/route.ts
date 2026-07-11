import { NextResponse } from "next/server";
import { computeLifeMapFacts, computeMayaTzolkin, type BirthInput } from "@/lib/lifemap-calc";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Partial<BirthInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { year, month, day, hour, minute, hasTime } = body;
  if (
    typeof year !== "number" || typeof month !== "number" || typeof day !== "number" ||
    year < 1900 || year > 2026 || month < 1 || month > 12 || day < 1 || day > 31
  ) {
    return NextResponse.json({ error: "出生日期无效。" }, { status: 400 });
  }

  try {
    const facts = computeLifeMapFacts({
      year, month, day,
      hour: typeof hour === "number" ? hour : 12,
      minute: typeof minute === "number" ? minute : 0,
      hasTime: !!hasTime,
    });
    const maya = computeMayaTzolkin(year, month, day);
    return NextResponse.json({ ...facts, maya });
  } catch (e) {
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
