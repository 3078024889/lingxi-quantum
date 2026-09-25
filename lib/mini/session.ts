import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sha256 } from "@/lib/mini/crypto";

export type MiniSession = { userId: string; openid: string; expiresAt: string };

function bearerToken(req: Request): string {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token.length >= 32 && token.length <= 256 ? token : "";
}

export async function createMiniSession(userId: string, openid: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();
  const { error } = await admin.from("wechat_mini_sessions").insert({
    token_hash: sha256(token),
    user_id: userId,
    openid,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Could not create mini session: ${error.code}`);
  return { token, expiresAt };
}

export async function requireMiniSession(req: Request): Promise<MiniSession | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wechat_mini_sessions")
    .select("user_id, openid, expires_at")
    .eq("token_hash", sha256(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return { userId: data.user_id, openid: data.openid, expiresAt: data.expires_at };
}

export async function revokeMiniSession(req: Request): Promise<boolean> {
  const token = bearerToken(req);
  if (!token) return false;
  const admin = createAdminClient();
  const { error } = await admin
    .from("wechat_mini_sessions")
    .delete()
    .eq("token_hash", sha256(token));
  return !error;
}
