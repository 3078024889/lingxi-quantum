import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzePhoneNumber, analyzePlateNumber } from "@/lib/number-energy-calc";

export const runtime = "nodejs";

// 给"已经生成过的旧报告"补录手机号/车牌号用的——不用重新走一遍完整的
// 出生信息表单，直接在报告页面补填这两项，更新到这条提交记录的 focus
// 字段里（跟表单提交时存的格式完全一致），前端拿到成功响应后再调用
// generate-full 的 regenerate，就能生成一份包含数字能量解读的新报告。
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { id?: string; phone?: string; plate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });

  const { data: submission, error: fetchErr } = await supabase
    .from("life_map_submissions")
    .select("focus, user_id")
    .eq("id", body.id)
    .single();
  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (submission.user_id !== user.id) {
    return NextResponse.json({ error: "无权修改这份记录。" }, { status: 403 });
  }

  // 先把旧的手机号/车牌号数字能量片段摘掉，但只摘"这次请求里真的提供了新值"
  // 的那一项——如果这次只想补一个新手机号、车牌号没动，就不能把已经存在的
  // 车牌号数据也一起删掉，之前的版本在这里有问题：不管这次填没填车牌号，
  // 都会把旧车牌号先清空，等于"补录手机号"这个操作，会意外把车牌号冲掉。
  let focus = submission.focus || "";
  const phone = (body.phone || "").trim();
  const plate = (body.plate || "").trim();
  if (phone) {
    focus = focus.replace(/\s*·\s*手机号数字能量：[^·]+/g, "");
    const r = analyzePhoneNumber(phone);
    focus += ` · 手机号数字能量：${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
  }
  if (plate) {
    focus = focus.replace(/\s*·\s*车牌号数字能量：[^·]+/g, "");
    const r = analyzePlateNumber(plate);
    focus += ` · 车牌号数字能量：${r.digitsOnly}（总和${r.totalSum}，${r.lingdong.zh}）`;
  }

  const { error: updateErr } = await supabase
    .from("life_map_submissions")
    .update({ focus })
    .eq("id", body.id);

  if (updateErr) {
    return NextResponse.json({ error: "更新失败，请稍后再试。", detail: updateErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
