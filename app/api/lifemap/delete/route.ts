import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 有些人不想让某一份报告继续留着（比如拿别人的信息随便测过、或者单纯
// 想清理掉），给他们删除自己报告的权利——但要先确认这份报告真的是
// 这个人自己的，不能让谁都能拿着任意 id 来删别人的记录。
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
  if (!body.id) return NextResponse.json({ error: "缺少报告 ID。" }, { status: 400 });

  // RLS 本身也会挡住删别人的记录，这里的 .eq("user_id", user.id) 是双重
  // 保险，同时也让"删除了 0 行"（记录不存在或不是自己的）这种情况，
  // 能被明确识别出来，而不是静默地什么都没发生。
  const { data, error } = await supabase
    .from("life_map_submissions")
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "删除失败，请稍后再试。" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "找不到这份报告，或者它不属于你。" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
