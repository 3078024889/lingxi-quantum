import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin";

// v261：之前这里没有设置maxDuration——不显式配置的话，Vercel默认的
// 函数运行时长上限，比这个接口真实需要的计算+数据库写入时间更容易
// 不够用，一旦稍微跑得慢一点，就会被平台直接杀死，前端表现为"点了
// 按钮但没反应"，不会报出任何看得懂的错误。这里统一补上，跟支付
// 相关接口用的是同一个思路。
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = createClient()
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: {
    name?: string;
    birthInput?: object;
    facts?: object;
    coreTypeName?: string;
    freeNarrative?: string;
    focus?: string;
    currentState?: string;
    energyLevel?: number;
    clarityLevel?: number;
    alignmentLevel?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("life_map_submissions")
    .insert({
      user_id: user.id,
      name: body.name || null,
      birth_input: body.birthInput,
      facts: body.facts,
      core_type_name: body.coreTypeName,
      free_narrative: body.freeNarrative,
      focus: body.focus,
      current_state: body.currentState,
      energy_level: body.energyLevel,
      clarity_level: body.clarityLevel,
      alignment_level: body.alignmentLevel,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("life_map_submissions 保存失败:", error);
    // 把真实的数据库错误信息带回前端（记录在浏览器控制台），方便定位——
    // 最常见的原因是 life_map_submissions 表还没在 Supabase 里建好。
    return NextResponse.json(
      { error: "保存失败，请稍后再试。"},
      { status: 500 }
    );
  }
  return NextResponse.json({ id: data.id });
}
