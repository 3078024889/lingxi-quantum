import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { drawTarotSpread } from "@/lib/tarot-spread";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: Partial<BirthInput> & { name?: string; calendarType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { year: inputYear, month: inputMonth, day: inputDay, hour, minute, hasTime, name } = body;
  const calendarType = (body as { calendarType?: string }).calendarType === "lunar" ? "lunar" : "solar";
  if (
    typeof inputYear !== "number" || typeof inputMonth !== "number" || typeof inputDay !== "number" ||
    inputYear < 1 || inputYear > 2026 || inputMonth < 1 || inputMonth > 12 || inputDay < 1 || inputDay > 31
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
    const birthInput = {
      year, month, day, hour: usedHour, minute: typeof minute === "number" ? minute : 0, hasTime: !!hasTime,
    };
    const facts = computeLifeMapFacts(birthInput);
    const spread = drawTarotSpread({
      yearPillar: facts.yearPillar, monthPillar: facts.monthPillar,
      dayPillar: facts.dayPillar, hourPillar: facts.hourPillar,
      sunSignZh: facts.sunSignZh, moonSignZh: facts.moonSignZh,
      wuXingCount: facts.wuXingCount,
    });

    const admin = createAdminClient();
    const { data: submission, error: insertErr } = await admin
      .from("tarot_submissions")
      .insert({
        user_id: user.id,
        name: typeof name === "string" ? name.trim().slice(0, 40) : null,
        birth_input: birthInput,
        facts,
        past_index: spread.past.index,
        present_index: spread.present.index,
        future_index: spread.future.index,
      })
      .select("id")
      .single();

    if (insertErr || !submission) {
      console.error("[tarot save] 写入失败:", insertErr);
      return NextResponse.json({ error: "保存失败，请稍后再试。" }, { status: 500 });
    }

    return NextResponse.json({ id: submission.id });
  } catch (e) {
    console.error("[tarot save] 计算失败:", e);
    return NextResponse.json({ error: "计算失败，请检查出生信息。" }, { status: 500 });
  }
}
