import { createClient } from "@supabase/supabase-js";

export function isSupabaseAdminConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

// 后台管理客户端：使用 service_role 密钥，拥有写入会员/订单的权限。
// 仅在服务器端（API 路由）使用，绝不暴露给浏览器。
// 密钥存放在 Vercel 环境变量 SUPABASE_SERVICE_ROLE_KEY 中。
export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) throw new Error("SUPABASE_ADMIN_CONFIG_MISSING");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
