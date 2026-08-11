import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = createClient()
  const admin = createAdminClient();
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
  if (!body.id) return NextResponse.json({ error: "缺少记录 ID。" }, { status: 400 });

  const { data, error } = await admin
    .from("tarot_reading_submissions")
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "删除失败，请稍后再试。" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "找不到这份记录，或者它不属于你。" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
