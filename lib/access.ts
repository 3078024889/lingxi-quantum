import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";

// 检查当前用户的访问权限
export async function getAccess() {
  // 审核模式：无需登录、无需付费，全部视为已解锁，方便审查内容与图片
  if (REVIEW_MODE) {
    return {
      user: { id: "review" } as { id: string },
      manifestActive: true,
      unlocks: ["bundle"] as string[],
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, manifestActive: false, unlocks: [] as string[] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("manifest_until")
    .eq("id", user.id)
    .single();

  const { data: u } = await supabase
    .from("unlocks")
    .select("product_id")
    .eq("user_id", user.id);

  const manifestActive =
    !!profile?.manifest_until && new Date(profile.manifest_until) > new Date();
  const unlocks = (u ?? []).map((r: { product_id: string }) => r.product_id);

  return { user, manifestActive, unlocks };
}

// 是否解锁了某项修炼技术（拥有该项或四项合集）
export function hasUnlock(unlocks: string[], productId: string) {
  if (REVIEW_MODE) return true;
  return unlocks.includes(productId) || unlocks.includes("bundle");
}
