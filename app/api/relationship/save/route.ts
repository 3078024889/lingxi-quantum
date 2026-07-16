import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeMapFacts, type BirthInput } from "@/lib/lifemap-calc";

export const runtime = "nodejs";

type PersonInput = { name: string; year: number; month: number; day: number; hour: number; minute: number; hasTime: boolean };

// 关系共振图谱的"提交"这一步——只做两个人各自命盘的计算（跟生命图谱
// 用的是同一套纯函数 computeLifeMapFacts，不是另外发明一套算法），
// 不调用AI，先把数据存下来，拿到一个 id，再走去付款；付款成功后，
// 真正生成报告文本那一步在 /api/relationship/generate-full 里。
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { a?: PersonInput; b?: PersonInput; relationshipType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  const { a, b } = body;
  if (!a || !b || !a.name?.trim() || !b.name?.trim()) {
    return NextResponse.json({ error: "请填写两个人的姓名和出生信息。" }, { status: 400 });
  }
  for (const p of [a, b]) {
    if (
      typeof p.year !== "number" || typeof p.month !== "number" || typeof p.day !== "number" ||
      p.year < 1 || p.year > 2026 || p.month < 1 || p.month > 12 || p.day < 1 || p.day > 31
    ) {
      return NextResponse.json({ error: "出生日期无效。" }, { status: 400 });
    }
  }

  try {
    const toBirthInput = (p: PersonInput): BirthInput => ({
      year: p.year, month: p.month, day: p.day,
      hour: p.hasTime ? p.hour : 12, minute: p.hasTime ? p.minute : 0,
      hasTime: p.hasTime,
    });
    const factsA = computeLifeMapFacts(toBirthInput(a));
    const factsB = computeLifeMapFacts(toBirthInput(b));

    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("relationship_submissions")
      .insert({
        user_id: user.id,
        name_a: a.name.trim(),
        name_b: b.name.trim(),
        birth_input_a: { year: a.year, month: a.month, day: a.day, hour: a.hour, minute: a.minute, hasTime: a.hasTime },
        birth_input_b: { year: b.year, month: b.month, day: b.day, hour: b.hour, minute: b.minute, hasTime: b.hasTime },
        facts_a: factsA,
        facts_b: factsB,
        relationship_type: body.relationshipType === "business" ? "business" : body.relationshipType === "general" ? "general" : "romantic",
      })
      .select("id")
      .single();
    if (error || !row) {
      return NextResponse.json({ error: "保存失败，请稍后再试。" }, { status: 500 });
    }
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "计算失败，请检查出生信息是否正确。" }, { status: 500 });
  }
}
