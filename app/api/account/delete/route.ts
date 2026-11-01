import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  // A valid long-lived session alone is insufficient for irreversible deletion.
  // Require a new login within ten minutes; a missing or invalid timestamp fails closed.
  const signedInAt = Date.parse(user.last_sign_in_at ?? "");
  const sessionAge = Date.now() - signedInAt;
  if (!Number.isFinite(signedInAt) || sessionAge < 0 || sessionAge > 10 * 60 * 1000) {
    return NextResponse.json({ error: "RECENT_SIGN_IN_REQUIRED" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "注销失败，请稍后再试，或联系我们处理。" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
