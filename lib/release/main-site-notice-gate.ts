/**
 * Dual main-site announcement. Never confuse a planned recovery date with an
 * accepted production release. Maintenance is separate, explicitly opt-in,
 * and auto-expires before the Nov 8 local deadline becomes stale.
 */
export function mainSiteReleaseNoticeState(env: NodeJS.ProcessEnv = process.env, nowMs=Date.now()) {
  const sha=String(env.LINGXI_RELEASE_SOURCE_SHA||"").trim();
  const complete=/^[a-f0-9]{40}$/.test(sha)
    && env.LINGXI_FULLSITE_ACCEPTED_SHA===sha
    && env.LINGXI_SITE_NOTICE_ENABLED==="1"
    && env.LINGXI_TOOLPASS_PAYMENT_ACCEPTED==="1"
    && env.LINGXI_CN_AUTH_ACCEPTED==="1"
    && env.LINGXI_COM_BACKEND_ACCEPTED==="1";
  // Explicit 2-factor operator opt-in. Off by default. No stale deadline after
  // the end of 2026-11-08 in Singapore/China time (UTC+08).
  const maintenance=!complete
    && env.LINGXI_MAINTENANCE_NOTICE_ENABLED==="1"
    && env.LINGXI_MAINTENANCE_NOTICE_APPROVED==="1"
    && nowMs<Date.UTC(2026,10,8,16);
  return {
    enabled:complete||maintenance,
    phase:complete?"complete" as const:maintenance?"maintenance" as const:"pending" as const,
    version:complete?"2026-11-dual-site-"+sha.slice(0,12):
      maintenance?"2026-11-dual-site-maintenance":"2026-11-dual-site-pending",
    site:"main" as const,
  };
}
