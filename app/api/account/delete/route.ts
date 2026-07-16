import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 注销账户——彻底删除这个人的登录身份。数据库里那几张表（profiles、
// life_map_submissions、unlocks 等）建表时外键都带了 on delete cascade，
// 删除 auth.users 里的这一行，会自动连带清掉这个人名下的所有数据，
// 不需要在这里手动一张表一张表地删。
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "注销失败，请稍后再试，或联系我们处理。" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
