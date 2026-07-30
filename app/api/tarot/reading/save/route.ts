import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { drawTarotSpread } from "@/lib/tarot-spread";

// v261：之前这里没有设置maxDuration——不显式配置的话，Vercel默认的
// 函数运行时长上限，比这个接口真实需要的计算+数据库写入时间更容易
// 不够用，一旦稍微跑得慢一点，就会被平台直接杀死，前端表现为"点了
// 按钮但没反应"，不会报出任何看得懂的错误。这里统一补上，跟支付
// 相关接口用的是同一个思路。
export const runtime = "nodejs";
export const maxDuration = 30;


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
      .from("tarot_reading_submissions")
      .insert({
        user_id: user.id,
        name: typeof name === "string" ? name.trim().slice(0, 40) : null,
        birth_input: birthInput,
        facts,
        hidden_index: spread.hidden.index,
        present_index: spread.present.index,
        future_index: spread.future.index,
      })
      .select("id, hidden_index, present_index, future_index")
      .single();

    if (insertErr || !submission) {
      console.error("[tarot reading save] 写入失败，Supabase 原始错误:", insertErr);
      if (insertErr?.code === "42P01") {
        return NextResponse.json(
          { error: "保存失败：数据库里还没有这张表。需要在 Supabase 后台的 SQL Editor 里，重新运行一次 schema.sql 这个文件（不会影响已有数据），建出 tarot_reading_submissions 这张表。" },
          { status: 500 }
        );
      }
      const rawDetail = insertErr
        ? `${insertErr.code ?? "无错误码"}: ${insertErr.message ?? "无错误信息"}`
        : "写入后没有返回记录（原因未知）";
      return NextResponse.json({ error: `保存失败，请稍后再试。（技术细节：${rawDetail}）` }, { status: 500 });
    }

    return NextResponse.json({
      id: submission.id,
      cardIndexes: [submission.hidden_index, submission.present_index, submission.future_index],
    });
  } catch (e) {
    console.error("[tarot reading save] 计算失败:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `计算失败，请检查出生信息。（技术细节：${msg}）` }, { status: 500 });
  }
}
