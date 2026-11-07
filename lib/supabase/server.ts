import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

export function getServerSupabasePublicConfig() {
  // Next.js inlines direct process.env.NEXT_PUBLIC_* references at build time.
  // Read server-side runtime variables through the env object, so a standalone
  // artifact can use the correct Supabase project after an audited promotion.
  // These are PUBLIC keys only. Never select service_role or sb_secret_.
  const env = process.env;
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key || key.length < 20 ||
      key.startsWith("sb_secret_") || key.startsWith("sb_service_")) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return {url, key};
  } catch {
    return null;
  }
}

export function isSupabasePublicConfigured() {
  return getServerSupabasePublicConfig() !== null;
}

// 服务器端 Supabase 客户端（用于读取登录状态）。
export function createClient() {
  const config = getServerSupabasePublicConfig();
  if (!config) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  const cookieStore = cookies();
  return createServerClient(
    config.url,
    config.key,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
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
      // Anonymous visitors have no session. This is not a Supabase outage.
      if (error.name === "AuthSessionMissingError" || error.code === "session_not_found") return null;
      // Keep unexpected failures observable without logging credentials or tokens.
      console.error("[supabase auth] unavailable", {name:error.name,code:error.code ?? "unknown",status:error.status ?? 0});
      return null;
    }
    return data.user;
  } catch (error) {
    console.error("[supabase auth] request failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}
