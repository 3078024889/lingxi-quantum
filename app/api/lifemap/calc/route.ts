import { NextResponse } from "next/server";
import { computeLifeMapFacts, computeMayaTzolkin, computeLifeCode, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { computeZiWeiChart, type Gender } from "@/lib/ziwei-calc";
import { computeHumanDesign } from "@/lib/human-design-calc";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Partial<BirthInput> & { gender?: string; calendarType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { year: inputYear, month: inputMonth, day: inputDay, hour, minute, hasTime } = body;
  const gender: Gender = (body as { gender?: string }).gender === "male" ? "male" : "female";
  // calendarType：'solar'（阳历/公历/西历，默认）| 'lunar'（中国农历，身份证上常见的另一种记法）——
  // 两者是完全不同的历法系统，必须先统一换算成阳历，才能进行后续的天文/命理计算。
  const calendarType = (body as { calendarType?: string }).calendarType === "lunar" ? "lunar" : "solar";
  if (
    typeof inputYear !== "number" || typeof inputMonth !== "number" || typeof inputDay !== "number" ||
    inputYear < 1 || inputYear > 2026 || inputMonth < 1 || inputMonth > 12 || inputDay < 1 || inputDay > 31
  ) {
    return NextResponse.json({ error: "出生日期无效。" }, { status: 400 });
  }

  let year = inputYear, month = inputMonth, day = inputDay;
  try {
    if (calendarType === "lunar") {
      const solar = lunarToSolar(inputYear, inputMonth, inputDay);
      year = solar.year; month = solar.month; day = solar.day;
    }
  } catch {
    return NextResponse.json({ error: "农历日期换算失败，请检查日期是否存在（比如农历没有的闰月/日期）。" }, { status: 400 });
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
    const lifeCode = computeLifeCode(year, month, day);
    // 24小时制转紫微斗数的13时辰序号：0=早子(00-01) 1=丑…6=午…12=晚子(23-00)
    const ziweiHourIndex = Math.floor((usedHour + 1) / 2) % 13;
    let ziwei = null;
    try {
      ziwei = computeZiWeiChart(year, month, day, ziweiHourIndex, gender);
    } catch {
      ziwei = null; // 紫微排盘偶发的极端日期边界问题，不应影响其余数据正常返回
    }
    // 人类图：只算到"门"这一层（真实天文计算，可复核）；能量中心/类型/权威
    // 需要另一套已验证的完整对照表才能算准，还没接入，先不给结论。
    let humanDesign = null;
    try {
      // 同 lib/lifemap-calc.ts 里那处一样的陷阱：Date.UTC() 对0-99之间的
      // 年份会自动当成19xx年，这里单独构造了一次Date，之前漏改了，
      // 顺手一起修掉，用setUTCFullYear()避免这个陷阱。
      const birthUTC = new Date(0);
      birthUTC.setUTCFullYear(year, month - 1, day);
      birthUTC.setUTCHours(usedHour, typeof minute === "number" ? minute : 0, 0, 0);
      humanDesign = computeHumanDesign(birthUTC);
    } catch {
      humanDesign = null;
    }
    // 把换算后的真实阳历日期也带回前端展示，让用户能确认换算结果无误
    return NextResponse.json({ ...facts, maya, ziwei, lifeCode, humanDesign, resolvedSolar: { year, month, day } });
  } catch (e) {
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
