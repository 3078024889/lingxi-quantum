import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import {getRuntimeSupabasePublicConfig} from "./server-runtime-config";

export function getServerSupabasePublicConfig() {
  return getRuntimeSupabasePublicConfig();
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
