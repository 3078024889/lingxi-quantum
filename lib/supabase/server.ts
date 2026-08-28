import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

export function isSupabasePublicConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || key.length < 20) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// 服务器端 Supabase 客户端（用于读取登录状态）。
export function createClient() {
  if (!isSupabasePublicConfigured()) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
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

export async function getServerUser(client: ReturnType<typeof createClient>): Promise<User | null> {
  try {
    const { data, error } = await client.auth.getUser();
    if (error) {
      console.error("[supabase auth] unavailable", error.code);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error("[supabase auth] request failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}
