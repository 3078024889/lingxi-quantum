import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeMapFacts, lunarToSolar, type BirthInput } from "@/lib/lifemap-calc";
import { drawThreeSigns } from "@/lib/qian-draw";

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
    const birthInput = {
      year, month, day, hour: usedHour, minute: typeof minute === "number" ? minute : 0, hasTime: !!hasTime,
    };
    const facts = computeLifeMapFacts(birthInput);
    const signs = drawThreeSigns({
      yearPillar: facts.yearPillar, monthPillar: facts.monthPillar,
      dayPillar: facts.dayPillar, hourPillar: facts.hourPillar,
    });

    const admin = createAdminClient();
    const { data: submission, error: insertErr } = await admin
      .from("qian_submissions")
      .insert({
        user_id: user.id,
        name: typeof name === "string" ? name.trim().slice(0, 40) : null,
        birth_input: birthInput,
        facts,
        sign_indexes: signs.map((s) => s.index),
      })
      .select("id, sign_indexes")
      .single();

    if (insertErr || !submission) {
      console.error("[qian save] 写入失败，Supabase 原始错误:", insertErr);
      if (insertErr?.code === "42P01") {
        // Postgres错误码 42P01 = relation does not exist——最可能的原因：
        // qian_submissions 这张新表还没在 Supabase 项目里建出来，需要
        // 重新跑一次 supabase/schema.sql（跟之前修炼心得记录踩的是
        // 同一个坑）。
        return NextResponse.json(
          { error: "保存失败：数据库里还没有这张表。需要在 Supabase 后台的 SQL Editor 里，重新运行一次 schema.sql 这个文件（不会影响已有数据），建出 qian_submissions 这张表。" },
          { status: 500 }
        );
      }
      // 除了上面这个最常见的原因，这里不再猜第二种可能——直接把
      // Supabase返回的原始错误信息（code+message）暴露出来，用户
      // 截图发过来，就能一次性看到真实原因，不用一轮一轮来回猜。
      const rawDetail = insertErr
        ? `${insertErr.code ?? "无错误码"}: ${insertErr.message ?? "无错误信息"}`
        : "写入后没有返回记录（原因未知）";
      return NextResponse.json({ error: `保存失败，请稍后再试。（技术细节：${rawDetail}）` }, { status: 500 });
    }

    return NextResponse.json({ id: submission.id, signIndexes: submission.sign_indexes });
  } catch (e) {
    console.error("[qian save] 计算失败:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `计算失败，请检查出生信息。（技术细节：${msg}）` }, { status: 500 });
  }
}
