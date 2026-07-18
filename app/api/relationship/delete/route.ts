import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 跟 app/api/lifemap/delete/route.ts 是同一套逻辑，只是换了一张表——
// 关系共振图谱之前完全没有删除入口（场域入口页面那边，之前那一块
// 只是个纯 <Link>，没有配套的删除接口），这里补上。
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
  if (!body.id) return NextResponse.json({ error: "缺少图谱 ID。" }, { status: 400 });

  const { data, error } = await supabase
    .from("relationship_submissions")
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "删除失败，请稍后再试。" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "找不到这份图谱，或者它不属于你。" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
