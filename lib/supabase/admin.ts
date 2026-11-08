import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase supports both the new server-only sb_secret_* key and the legacy
 * service_role JWT. Prefer the new credential, so a stale legacy value cannot
 * shadow a corrected SUPABASE_SECRET_KEY.
 *
 * Never use a publishable key, anon JWT, or user-editable metadata for an
 * administrator client. Never expose the selected key in logs or responses.
 */
function adminRuntimeConfig() {
  const env = process.env;
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    const validOrigin = parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname));
    if (!validOrigin || parsed.username || parsed.password) return null;
  } catch {
    return null;
  }

  if (key.startsWith("sb_secret_")) {
    if (!/^sb_secret_[A-Za-z0-9_-]{12,}$/.test(key)) return null;
    return { url, key };
  }

  // Legacy service_role JWTs are still supported during the phased migration.
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      role?: unknown; exp?: unknown;
    };
    if (payload.role !== "service_role") return null;
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null;
    return { url, key };
  } catch {
    return null;
  }
}

export function isSupabaseAdminConfigured() {
  return adminRuntimeConfig() !== null;
}

/**
 * This client bypasses RLS. Instantiate only inside authenticated server
 * handlers that independently verify the operator's authorization.
 */
export function createAdminClient() {
  const config = adminRuntimeConfig();
  if (!config) throw new Error("SUPABASE_ADMIN_CONFIG_MISSING");
  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
