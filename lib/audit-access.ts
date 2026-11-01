/**
 * Retired production review entitlement hook (SEC-001).
 *
 * Legacy import compatibility only. NEVER grant or mutate user entitlements
 * from a request-time account lookup. Administrative test grants must be
 * time-limited, explicitly approved and tracked separately from purchases.
 */
export async function ensureAuditAccountAccess(_user: {id:string;email?:string|null}):Promise<false>{
  return false;
}
