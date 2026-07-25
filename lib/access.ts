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
    .select("product_id, expires_at")
    .eq("user_id", user.id);

  const manifestActive =
    !!profile?.manifest_until && new Date(profile.manifest_until) > new Date();
  // expires_at 为空 = 永久解锁（原有行为不变）；有值但已经过了，就不
  // 算数——不能让一个过期的"多维叙事年解锁"继续被当成有效解锁。
  const nowTs = new Date();
  const unlocks = (u ?? [])
    .filter((r: { product_id: string; expires_at: string | null }) => !r.expires_at || new Date(r.expires_at) > nowTs)
    .map((r: { product_id: string }) => r.product_id);

  return { user, manifestActive, unlocks };
}

// 是否解锁了某项修炼技术或某篇多维叙事
const CULTIVATION_IDS = ["breath", "intuition", "heart-reset", "ascending-heart"];

export function hasUnlock(unlocks: string[], productId: string) {
  if (REVIEW_MODE) return true;
  if (unlocks.includes(productId)) return true;
  if (unlocks.includes("everything")) return true; // 全构造解锁：修炼技术 + 多维叙事，含日后新增
  if (CULTIVATION_IDS.includes(productId) && unlocks.includes("bundle")) return true; // 四项合集：仅解锁四大修炼技术
  if (!CULTIVATION_IDS.includes(productId) && unlocks.includes("narrative-all")) return true; // 多维叙事全解锁：含日后新增篇目
  return false;
}
