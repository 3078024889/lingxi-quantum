import { NextResponse } from "next/server";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { computeLifeVector, calculateWealthDetail } from "@/lib/life-vector";

export const runtime = "nodejs";

// 跟 /api/resilience/calc、/api/romance/calc 是同一个设计原则：不调用
// AI、不需要登录、不写入数据库，纯函数计算，即开即用——搜索引流入口。
export async function POST(req: Request) {
  let body: Partial<BirthInput> & { calendarType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { year: inputYear, month: inputMonth, day: inputDay, hour, minute, hasTime } = body;
  const calendarType = (body as { calendarType?: string }).calendarType === "lunar" ? "lunar" : "solar";
  if (
    typeof inputYear !== "number" || typeof inputMonth !== "number" || typeof inputDay !== "number" ||
    inputYear < 1 || inputYear > 2100 || inputMonth < 1 || inputMonth > 12 || inputDay < 1 || inputDay > 31
  ) {
    return NextResponse.json({ error: "出生日期无效，请检查年月日是否都填写了完整的数字。" }, { status: 400 });
  }

  let year = inputYear, month = inputMonth, day = inputDay;
  try {
    if (calendarType === "lunar") {
      const solar = lunarToSolar(inputYear, inputMonth, inputDay);
      year = solar.year; month = solar.month; day = solar.day;
    }
  } catch {
    return NextResponse.json({ error: "农历日期换算失败，请检查日期是否存在。" }, { status: 400 });
  }

  try {
    const usedHour = typeof hour === "number" ? hour : 12;
    const facts = computeLifeMapFacts({
      year, month, day, hour: usedHour,
      minute: typeof minute === "number" ? minute : 0, hasTime: !!hasTime,
    });
    const vector = computeLifeVector({
      sunElement: facts.sunElement, moonElement: facts.moonElement,
      mercury: facts.mercury, venus: facts.venus, mars: facts.mars,
      jupiter: facts.jupiter, saturn: facts.saturn,
      dayMasterElement: facts.dayMasterElement, wuXingCount: facts.wuXingCount,
      yearShiShen: facts.yearShiShen, monthShiShen: facts.monthShiShen, hourShiShen: facts.hourShiShen,
    });
    const wealth = calculateWealthDetail(vector);
    return NextResponse.json({
      score: wealth.score,
      typeZh: wealth.typeLabelZh, typeEn: wealth.typeLabelEn,
      breakdown: wealth.breakdown,
      sunSignZh: facts.sunSignZh, sunSignEn: facts.sunSignEn,
      resolvedSolar: { year, month, day },
    });
  } catch {
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
