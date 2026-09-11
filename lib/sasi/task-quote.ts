import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type SasiTaskQuote = {
  userId: string;
  projectId: string;
  nodeId: string | null;
  promptHash: string;
  duration: number;
  quality: "fast" | "balanced" | "cinema";
  aspectRatio: "16:9" | "9:16" | "1:1";
  provider: string;
  model: string;
  amountFen: number;
  expiresAt: number;
};

function quoteSecret() {
  const value = process.env.SASI_QUOTE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("SASI_QUOTE_SECRET_MISSING");
  return value;
}

export function hashSasiPrompt(prompt: string) {
  return createHash("sha256").update(prompt).digest("hex");
}

export function signSasiTaskQuote(payload: SasiTaskQuote) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", quoteSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySasiTaskQuote(token: string): SasiTaskQuote | null {
  const [encoded, supplied] = token.split(".");
  if (!encoded || !supplied) return null;
  const expected = createHmac("sha256", quoteSecret()).update(encoded).digest();
  let actual: Buffer;
  try { actual = Buffer.from(supplied, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SasiTaskQuote;
    if (!payload || !Number.isInteger(payload.amountFen) || payload.amountFen <= 0 || !Number.isFinite(payload.expiresAt)) return null;
    return payload;
  } catch { return null; }
}
