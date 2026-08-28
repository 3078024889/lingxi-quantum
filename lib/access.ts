import { createClient, isSupabasePublicConfigured } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { NARRATIVES } from "@/lib/narratives";

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

  if (!isSupabasePublicConfigured()) {
    console.error("[access] Supabase public configuration is missing");
    return { user: null, manifestActive: false, unlocks: [] as string[] };
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("[access] Supabase auth unavailable", authError.code);
    return { user: null, manifestActive: false, unlocks: [] as string[] };
  }

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

  // expires_at 为空 = 永久解锁（原有行为不变）；有值但已经过了，就不
  // 算数——不能让一个过期的"多维叙事年解锁"继续被当成有效解锁。
  const nowTs = new Date();
  const unlocks = (u ?? [])
    .filter((r: { product_id: string; expires_at: string | null }) => !r.expires_at || new Date(r.expires_at) > nowTs)
    .map((r: { product_id: string }) => r.product_id);

  // 「神尊 · 全域解锁」是年度全域通行证：有效期内也必须覆盖显化与
  // 梦境模块，不能只在修炼技术和多维叙事的单项校验中生效。
  const manifestActive =
    (!!profile?.manifest_until && new Date(profile.manifest_until) > nowTs) ||
    unlocks.includes("everything");

  return { user, manifestActive, unlocks };
}

// 是否解锁了某项修炼技术或某篇多维叙事
const CULTIVATION_IDS = ["breath", "intuition", "heart-reset", "ascending-heart"];
const NARRATIVE_IDS = new Set(NARRATIVES.map((item) => item.slug));

export function hasUnlock(unlocks: string[], productId: string) {
  if (REVIEW_MODE) return true;
  // 神尊层级覆盖当前与未来的全部付费产品。放在具体产品映射之前，未来
  // 新增产品无需再修改这张白名单，也不会出现网页承诺与权限实现分叉。
  if (unlocks.includes("everything")) return true;
  if (unlocks.includes(productId)) return true;
  if (CULTIVATION_IDS.includes(productId)) {
    return unlocks.includes("bundle") || unlocks.includes("everything");
  }
  if (NARRATIVE_IDS.has(productId)) {
    return unlocks.includes("narrative-all") || unlocks.includes("everything");
  }
  return false;
}
