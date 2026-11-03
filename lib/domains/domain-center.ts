/**
 * Domain center V1: strict ASCII label and TLD policy.
 * IDN and additional ccTLDs require separate registry-rule validation.
 * A DNS/RDAP lookup is never treated as evidence of registration availability.
 */
export const DOMAIN_TLDS = ["com", "net", "org", "io", "ai", "co"] as const;
export type DomainTld = (typeof DOMAIN_TLDS)[number];
export type AvailabilityState = "available" | "unavailable" | "unknown";
export type AvailabilityResult = {
  domain: string;
  status: AvailabilityState;
  environment: "sandbox" | "live";
  checkedAt: string;
};

export function parseDomainQuery(input: unknown, tldInput: unknown): {label: string; tld: DomainTld; domain: string} {
  if (typeof input !== "string" || typeof tldInput !== "string") throw new Error("invalid_domain");
  const tld = tldInput.toLowerCase().trim();
  if (!(DOMAIN_TLDS as readonly string[]).includes(tld)) throw new Error("unsupported_tld");
  const raw = input.trim().toLowerCase();
  // A full domain is accepted only when its suffix matches the selected extension.
  const label = raw.endsWith("." + tld) ? raw.slice(0, -tld.length - 1) : raw;
  if (
    label.length < 2 ||
    label.length > 63 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(label) ||
    label.includes("--") && !label.startsWith("xn--") ||
    label.startsWith("xn--") // IDN requires per-registry language rules; not in V1
  ) throw new Error("invalid_domain");
  return {label, tld: tld as DomainTld, domain: label + "." + tld};
}

export function mapRegistrarStatus(value: unknown): AvailabilityState {
  const status = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (status === "available") return "available";
  if (["unavailable", "taken", "registered", "not available"].includes(status)) return "unavailable";
  return "unknown";
}

export function normalizeAvailabilityResponse(
  raw: unknown, domain: string, environment: "sandbox" | "live"
): AvailabilityResult {
  const obj = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const rows = Array.isArray(obj.domains) ? obj.domains : [];
  const matched = rows.find((entry: unknown) => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = (entry as Record<string, unknown>).domainName;
    return typeof candidate === "string" && candidate.toLowerCase() === domain.toLowerCase();
  }) as Record<string, unknown> | undefined;
  return {domain, status: matched ? mapRegistrarStatus(matched.status) : "unknown", environment, checkedAt: new Date().toISOString()};
}
