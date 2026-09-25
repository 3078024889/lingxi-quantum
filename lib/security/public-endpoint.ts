import "server-only";

import dns from "node:dns/promises";
import https from "node:https";
import tls from "node:tls";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
]);

function isBlockedHostname(hostname: string) {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  return (
    BLOCKED_HOSTS.has(h) ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".home") ||
    h.endsWith(".lan")
  );
}

export function isPublicIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
    const [a,b,c] = p;
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 192 && b === 0 && c === 0) return false;
    if (a === 192 && b === 0 && c === 2) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    if (a === 198 && b === 51 && c === 100) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    if (a >= 224) return false;
    return true;
  }

  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v === "::" || v === "::1") return false;
    if (v.startsWith("fc") || v.startsWith("fd")) return false;
    if (/^fe[89ab]/.test(v)) return false;
    if (v.startsWith("ff")) return false;
    if (v.startsWith("2001:db8:")) return false;
    if (v.startsWith("::ffff:")) {
      const mapped = v.slice(7);
      return isIP(mapped) === 4 ? isPublicIp(mapped) : false;
    }
    return true;
  }

  return false;
}

export async function resolvePublicHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host || isBlockedHostname(host)) throw new Error("PRIVATE_NETWORK_FORBIDDEN");

  if (isIP(host)) {
    if (!isPublicIp(host)) throw new Error("PRIVATE_NETWORK_FORBIDDEN");
    return [{ address: host, family: isIP(host) as 4 | 6 }];
  }

  const answers = await dns.lookup(host, { all: true, verbatim: true });
  if (!answers.length || answers.some((entry) => !isPublicIp(entry.address))) {
    throw new Error("PRIVATE_NETWORK_FORBIDDEN");
  }
  return answers;
}

export async function parsePublicHttpsUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("HTTPS_REQUIRED");
  if (url.username || url.password) throw new Error("URL_CREDENTIALS_FORBIDDEN");
  if (url.port && url.port !== "443") throw new Error("NON_STANDARD_PORT_FORBIDDEN");
  const addresses = await resolvePublicHost(url.hostname);
  return { url, addresses };
}

function pinnedLookup(address: string, family: number) {
  return (
    _hostname: string,
    _options: unknown,
    callback: (error: NodeJS.ErrnoException | null, address: string, family: number) => void,
  ) => callback(null, address, family);
}

export async function pinnedHttpsProbe(raw: string) {
  const { url, addresses } = await parsePublicHttpsUrl(raw);
  const target = addresses[0];
  return await new Promise<{
    status: number;
    statusText: string;
    location: string | null;
    server: string | null;
    contentType: string | null;
  }>((resolve, reject) => {
    const request = https.request({
      protocol: "https:",
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method: "HEAD",
      port: 443,
      servername: url.hostname,
      lookup: pinnedLookup(target.address, target.family),
      headers: {
        "User-Agent": "LINGXIFIELD-Site-Diagnose/1.0",
        Accept: "*/*",
      },
      timeout: 8000,
      rejectUnauthorized: true,
    }, (response) => {
      const status = response.statusCode ?? 0;
      resolve({
        status,
        statusText: response.statusMessage ?? "",
        location: response.headers.location ?? null,
        server: typeof response.headers.server === "string" ? response.headers.server : null,
        contentType: typeof response.headers["content-type"] === "string" ? response.headers["content-type"] : null,
      });
      response.resume();
    });
    request.on("timeout", () => request.destroy(new Error("HTTP_TIMEOUT")));
    request.on("error", reject);
    request.end();
  });
}

export async function pinnedTlsCertificate(hostname: string) {
  const addresses = await resolvePublicHost(hostname);
  const target = addresses[0];

  return await new Promise<Record<string, unknown>>((resolve) => {
    const socket = tls.connect({
      host: target.address,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 8000,
    }, () => {
      const cert = socket.getPeerCertificate();
      resolve({
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        authorized: socket.authorized,
        authorizationError: socket.authorizationError ?? null,
      });
      socket.end();
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ error: "TLS_TIMEOUT" });
    });
    socket.on("error", (error) => resolve({ error: error.message }));
  });
}
