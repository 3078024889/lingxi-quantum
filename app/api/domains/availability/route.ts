import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizeAvailabilityResponse, parseDomainQuery } from "@/lib/domains/domain-center";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"};
const bad = (code: number, error: string) => NextResponse.json({error}, {status: code, headers: HEADERS});

/**
 * Read-only lookup only. No domain registration, payment, contact collection or
 * write operation is exposed. Credentials never enter the client bundle.
 */
export async function POST(req: Request) {
  const userId = process.env.DOMAIN_RESELLER_USER_ID;
  const apiKey = process.env.DOMAIN_RESELLER_API_KEY;
  if (!userId || !apiKey) return bad(503, "search_unavailable");

  const environment = process.env.DOMAIN_RESELLER_ENV === "live" ? "live" : "sandbox";
  if (environment === "live" && process.env.DOMAIN_CENTER_LIVE_ENABLED !== "true")
    return bad(503, "search_unavailable");

  if (!await checkRateLimit("domain-lookup:" + getClientIp(req), 20, 60))
    return bad(429, "too_many_requests");
  if (Number(req.headers.get("content-length") || "0") > 2048)
    return bad(413, "request_too_large");

  let query: ReturnType<typeof parseDomainQuery>;
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") return bad(400, "invalid_domain");
    const data = body as Record<string, unknown>;
    query = parseDomainQuery(data.name, data.tld);
  } catch {
    return bad(400, "invalid_domain");
  }

  const base = environment === "live" ? "https://api.resellerclub.com/v2" : "https://api.sandbox.resellerclub.com/v2";
  const url = new URL(base + "/domains/available");
  url.searchParams.append("domainName", query.label);
  url.searchParams.append("tlds", query.tld);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "ApiKey " + apiKey,
        "X-User-Id": userId,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) return bad(502, "registrar_unavailable");
    const payload: unknown = await response.json();
    const result = normalizeAvailabilityResponse(payload, query.domain, environment);
    return NextResponse.json(result, {headers: HEADERS});
  } catch {
    return bad(502, "registrar_unavailable");
  }
}
