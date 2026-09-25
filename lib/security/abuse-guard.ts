import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type AbuseGuardOptions = {
  scope: string;
  userId?: string | null;
  accountLimit?: number;
  ipLimit: number;
  windowSeconds?: number;
};

export type AbuseGuardResult =
  | { ok: true }
  | { ok: false; status: 429 | 503; error: "RATE_LIMITED" | "ABUSE_GUARD_UNAVAILABLE" };

function clientIp(request: Request) {
  const raw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return raw.slice(0, 128);
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeScope(scope: string) {
  const value = scope.trim().toLowerCase();
  if (!/^[a-z0-9:_-]{2,80}$/.test(value)) throw new Error("INVALID_ABUSE_SCOPE");
  return value;
}

async function bucket(key: string, limit: number, windowSeconds: number) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("rate_limit_check", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("[abuse-guard] rate limiter unavailable", {
      code: error.code,
      message: error.message,
      keyPrefix: key.split(":").slice(0, 2).join(":"),
    });
    return { ok: false as const, unavailable: true as const };
  }

  return { ok: data === true, unavailable: false as const };
}

/**
 * Cost-bearing/public mutation guard.
 *
 * - IP and account buckets are both checked when a user id exists.
 * - IPs are hashed before persistence; raw visitor IPs are not stored in rate-limit keys.
 * - Fail closed: if the limiter is unavailable, expensive endpoints stop instead of
 *   silently allowing unlimited provider/database work.
 * - Limits are route-specific. Shared NATs therefore get a larger IP allowance than
 *   a single account while account switching does not reset the IP bucket.
 */
export async function enforceAbuseGuard(
  request: Request,
  options: AbuseGuardOptions,
): Promise<AbuseGuardResult> {
  const scope = safeScope(options.scope);
  const windowSeconds = Math.max(10, Math.min(86400, Math.floor(options.windowSeconds ?? 3600)));
  const ipLimit = Math.max(1, Math.min(100000, Math.floor(options.ipLimit)));
  const accountLimit =
    options.accountLimit == null
      ? null
      : Math.max(1, Math.min(100000, Math.floor(options.accountLimit)));

  const ipKey = `abuse:${scope}:ip:${digest(clientIp(request))}`;
  const ip = await bucket(ipKey, ipLimit, windowSeconds);
  if (ip.unavailable) return { ok: false, status: 503, error: "ABUSE_GUARD_UNAVAILABLE" };
  if (!ip.ok) return { ok: false, status: 429, error: "RATE_LIMITED" };

  if (options.userId && accountLimit !== null) {
    const accountKey = `abuse:${scope}:account:${digest(options.userId)}`;
    const account = await bucket(accountKey, accountLimit, windowSeconds);
    if (account.unavailable) return { ok: false, status: 503, error: "ABUSE_GUARD_UNAVAILABLE" };
    if (!account.ok) return { ok: false, status: 429, error: "RATE_LIMITED" };
  }

  return { ok: true };
}
