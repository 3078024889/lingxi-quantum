/**
 * Main site upgrade notice is off until every *independently verified*
 * acceptance result is formally approved by the release operator.
 * These flags are attestations only, never substitutes for E2E evidence.
 */
export function mainSiteReleaseNoticeState(env: NodeJS.ProcessEnv = process.env) {
  const sha=String(env.LINGXI_RELEASE_SOURCE_SHA||"").trim();
  const complete=/^[a-f0-9]{40}$/.test(sha)
    && env.LINGXI_FULLSITE_ACCEPTED_SHA===sha
    && env.LINGXI_SITE_NOTICE_ENABLED==="1"
    && env.LINGXI_TOOLPASS_PAYMENT_ACCEPTED==="1"
    && env.LINGXI_CN_AUTH_ACCEPTED==="1"
    && env.LINGXI_COM_BACKEND_ACCEPTED==="1";
  return {
    enabled:complete,
    version:complete?"2026-11-dual-site-"+sha.slice(0,12):"2026-11-dual-site-pending",
    site:"main" as const,
  };
}
