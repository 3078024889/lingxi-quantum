/**
 * Server-only Supabase PUBLIC runtime configuration.
 * The env object is intentionally read indirectly. Next.js inlines direct
 * process.env.NEXT_PUBLIC_* references at build time, which caused an empty
 * standalone build to stay broken despite correct runtime systemd values.
 */
export function getRuntimeSupabasePublicConfig(env: NodeJS.ProcessEnv = process.env) {
  const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key || key.length < 20 ||
      key.startsWith("sb_secret_") || key.startsWith("sb_service_")) return null;
  try {
    const parsed = new URL(url);
    if (!(parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname)))) return null;
  } catch {
    return null;
  }
  if (key.startsWith("sb_publishable_")) {
    if (!/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(key)) return null;
  } else {
    const chunks = key.split(".");
    if (chunks.length !== 3) return null;
    try {
      const payload = JSON.parse(Buffer.from(chunks[1], "base64url").toString("utf8"));
      if (payload.role !== "anon" || (typeof payload.exp === "number" &&
        payload.exp * 1000 <= Date.now())) return null;
    } catch {
      return null;
    }
  }
  return {url, key};
}
