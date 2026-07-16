import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeHumanDesign } from "@/lib/human-design-calc";

export const runtime = "nodejs";

// 老的生命图谱提交记录（在"人类图·门"这个功能上线之前生成的），存在数据库
// 里的 facts 字段没有 humanDesign 这一项——不是bug，是当时这个功能还不
// 存在。出生日期/时间本身是存过的（birth_input），人类图的门位计算又是
// 纯天文计算、完全确定性的，所以可以只用当年存的出生信息，把这一项补
// 算出来，不需要用户重新走一遍表单，也不需要重新花钱调用AI。
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });

  const { data: submission, error: fetchErr } = await supabase
    .from("life_map_submissions")
    .select("facts, birth_input, user_id")
    .eq("id", body.id)
    .single();
  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (submission.user_id !== user.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  const facts = (submission.facts ?? {}) as Record<string, unknown>;
  if (facts.humanDesign) {
    // 已经有了，不用重算
    return NextResponse.json({ facts });
  }

  const birthInput = submission.birth_input as
    | { year?: number; month?: number; day?: number; hour?: number; minute?: number; hasTime?: boolean }
    | null;
  if (!birthInput?.year || !birthInput?.month || !birthInput?.day) {
    return NextResponse.json({ error: "这份记录缺少出生信息，无法补算。" }, { status: 422 });
  }

  try {
    const usedHour = typeof birthInput.hour === "number" ? birthInput.hour : 12;
    const usedMinute = typeof birthInput.minute === "number" ? birthInput.minute : 0;
    const birthUTC = new Date(Date.UTC(birthInput.year, birthInput.month - 1, birthInput.day, usedHour, usedMinute));
    const humanDesign = computeHumanDesign(birthUTC);
    const newFacts = { ...facts, humanDesign };

    const { error: updateErr } = await supabase
      .from("life_map_submissions")
      .update({ facts: newFacts })
      .eq("id", body.id);
    if (updateErr) {
      return NextResponse.json({ error: "补算成功但保存失败，请稍后再试。" }, { status: 500 });
    }
    return NextResponse.json({ facts: newFacts });
  } catch {
    return NextResponse.json({ error: "补算失败，请稍后再试。" }, { status: 500 });
  }
}
