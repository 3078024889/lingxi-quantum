import { NextResponse } from "next/server";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { computeLifeVector, calculateResilience } from "@/lib/life-vector";

export const runtime = "nodejs";

// 这个接口专门给独立的"生命韧性指数"测试用——跟 /api/lifemap/calc
// 共用同一套底层计算（computeLifeMapFacts），但只取韧性指数需要的
// 那几项数据就返回，不算紫微/玛雅/人类图这些用不上的部分，响应更快；
// 全程不调用AI、不需要登录、不写入数据库，纯函数计算，即开即用——
// 这是特意的设计：这个页面是给搜索引流用的轻量入口，访问量可能远
// 大于付费产品，每次都调AI或者都要求登录，会直接拦掉大部分流量。
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
    inputYear < 1 || inputYear > new Date().getFullYear() || inputMonth < 1 || inputMonth > 12 || inputDay < 1 || inputDay > 31
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
      year, month, day,
      hour: usedHour,
      minute: typeof minute === "number" ? minute : 0,
      hasTime: !!hasTime,
    });
    const vector = computeLifeVector({
      sunElement: facts.sunElement, moonElement: facts.moonElement,
      mercury: facts.mercury, venus: facts.venus, mars: facts.mars,
      jupiter: facts.jupiter, saturn: facts.saturn,
      dayMasterElement: facts.dayMasterElement, wuXingCount: facts.wuXingCount,
      yearShiShen: facts.yearShiShen, monthShiShen: facts.monthShiShen, hourShiShen: facts.hourShiShen,
    });
    const resilience = calculateResilience(vector);
    return NextResponse.json({
      score: resilience.score,
      breakdown: resilience.breakdown,
      // 顺手把太阳星座和日主五行也带回去——结果页用得上，能让用户觉得
      // "这确实是算了我的东西"，不是凭空生成的一个分数。
      sunSignZh: facts.sunSignZh, sunSignEn: facts.sunSignEn,
      dayMasterElement: facts.dayMasterElement,
      resolvedSolar: { year, month, day },
    });
  } catch {
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
