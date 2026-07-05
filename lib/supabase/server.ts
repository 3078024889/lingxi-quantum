import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 服务器端 Supabase 客户端（用于读取登录状态）。
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 在 Server Component 中调用 set 会被忽略，由 middleware 处理刷新
          }
        },
      },
    }
  );
}
