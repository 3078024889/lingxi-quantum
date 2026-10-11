export const TOPUP_EXPIRY_MS = 5 * 60 * 1000;
export function validOrderDeletionIds(ids: unknown): string[] | null {
 if (!Array.isArray(ids) || !ids.length || ids.length > 100 ||
  ids.some(id => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) return null;
 return [...new Set<string>(ids)];
}
