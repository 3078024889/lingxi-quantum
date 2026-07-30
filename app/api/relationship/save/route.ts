import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeMapFacts, type BirthInput } from "@/lib/lifemap-calc";

// v261：之前这里没有设置maxDuration——不显式配置的话，Vercel默认的
// 函数运行时长上限，比这个接口真实需要的计算+数据库写入时间更容易
// 不够用，一旦稍微跑得慢一点，就会被平台直接杀死，前端表现为"点了
// 按钮但没反应"，不会报出任何看得懂的错误。这里统一补上，跟支付
// 相关接口用的是同一个思路。
export const runtime = "nodejs";
export const maxDuration = 30;

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
    // 这条校验本身范围很宽——1年到今年都能通过，不是"必须1900年以后"
    // 这种限制。之前"填12年，结果不对"的真正原因，出在下面
    // computeLifeMapFacts() 内部一个JS Date对象的经典陷阱（0-99之间的
    // 年份会被自动当成19xx年处理），已经在 lib/lifemap-calc.ts 里修好了，
    // 不是这里的范围判断需要收紧或放宽。
    if (
      typeof p.year !== "number" || typeof p.month !== "number" || typeof p.day !== "number" ||
      p.year < 1 || p.year > 2026 || p.month < 1 || p.month > 12 || p.day < 1 || p.day > 31
    ) {
      return NextResponse.json({ error: "出生日期无效，请检查年月日是否都填写了完整的数字。" }, { status: 400 });
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
      // 之前这里报错只回一句"保存失败，请稍后再试"，看不出到底是哪里
      // 失败的——数据库那张表如果压根没建（比如迁移SQL没跑），或者
      // 权限规则不对，都会走到这里，但表现出来的症状一模一样，没法
      // 从用户这边的报错信息反推。这次把 Supabase 返回的真实错误内容
      // 打进服务器日志（不会暴露给用户，但能在 Vercel 的 Logs 里看到），
      // 方便真正定位是"表不存在"还是别的原因。
      console.error("[relationship/save] 插入 relationship_submissions 失败:", error);
      return NextResponse.json({ error: "保存失败——如果持续出现，请检查 Supabase 里 relationship_submissions 这张表是否已经建好。" }, { status: 500 });
    }
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ error: "计算失败，请检查出生信息是否正确。" }, { status: 500 });
  }
}
