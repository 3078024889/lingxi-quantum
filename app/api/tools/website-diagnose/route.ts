import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { parsePublicHttpsUrl, pinnedHttpsProbe, pinnedTlsCertificate } from "@/lib/security/public-endpoint";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }

  const abuse = await enforceAbuseGuard(req, {
    scope: "website-diagnose",
    ipLimit: 40,
    windowSeconds: 3600,
  });
  if (!abuse.ok) return NextResponse.json({ error: abuse.error }, { status: abuse.status });

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 16 * 1024) {
    return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
  }

  const body = await req.json().catch(() => null) as { url?: unknown } | null;
  const raw = typeof body?.url === "string" ? body.url.trim() : "";
  if (!raw || raw.length > 2048) {
    return NextResponse.json({ error: "INVALID_URL" }, { status: 400 });
  }

  let url: URL;
  try {
    const normalized = /^https:\/\//i.test(raw) ? raw : `https://${raw}`;
    ({ url } = await parsePublicHttpsUrl(normalized));
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_URL";
    const status = [
      "HTTPS_REQUIRED",
      "URL_CREDENTIALS_FORBIDDEN",
      "NON_STANDARD_PORT_FORBIDDEN",
      "PRIVATE_NETWORK_FORBIDDEN",
    ].includes(code) ? 422 : 400;
    return NextResponse.json({ error: code }, { status });
  }

  const host = url.hostname.toLowerCase();
  const started = Date.now();

  const [a, aaaa, mx, tlsInfo, http] = await Promise.all([
    dns.resolve4(host).catch(() => []),
    dns.resolve6(host).catch(() => []),
    dns.resolveMx(host).catch(() => []),
    pinnedTlsCertificate(host),
    pinnedHttpsProbe(url.toString()).catch((error) => ({
      error: error instanceof Error ? error.message : "HTTP_FAILED",
    })),
  ]);

  const problems: string[] = [];
  if (!a.length && !aaaa.length) problems.push("DNS_NO_ADDRESS");
  if ("error" in tlsInfo) problems.push("TLS_FAILED");
  if ("error" in http) problems.push("HTTP_FAILED");
  if ("status" in http && http.status >= 400) problems.push(`HTTP_${http.status}`);

  return NextResponse.json({
    ok: problems.length === 0,
    host,
    dns: { a, aaaa, mx },
    tls: tlsInfo,
    http,
    problems,
    elapsedMs: Date.now() - started,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
