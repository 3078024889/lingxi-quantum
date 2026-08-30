import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const AUDIT_EMAIL = "945462373@qq.com";

/** Exact-account, idempotent review entitlement. No other address can enter this path. */
export async function ensureAuditAccountAccess(user: { id: string; email?: string | null }) {
  if (user.email?.trim().toLowerCase() !== AUDIT_EMAIL || !isSupabaseAdminConfigured()) return false;
  const admin = createAdminClient();
  const { error } = await admin.from("unlocks").upsert(
    { user_id: user.id, product_id: "everything", expires_at: null },
    { onConflict: "user_id,product_id" },
  );
  if (error) throw new Error(`AUDIT_ACCESS_GRANT_FAILED:${error.code}`);
  return true;
}
