import "server-only";
import { createHash, createHmac } from "node:crypto";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`SASI_ARTIFACT_R2_MISSING_${name}`);
  return value;
}
function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
function hmac(key: Buffer | string, value: string) { return createHmac("sha256", key).update(value).digest(); }
function enc(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function sasiArtifactBucket() {
  return required("R2_BUCKET_SASI_ARTIFACTS");
}

export function sasiArtifactR2Ready() {
  return Boolean(
    process.env.R2_ENDPOINT?.trim()
    && process.env.R2_ACCESS_KEY_ID?.trim()
    && process.env.R2_SECRET_ACCESS_KEY?.trim()
    && process.env.R2_BUCKET_SASI_ARTIFACTS?.trim()
  );
}

export function assertOwnedSasiObjectKey(userId: string, key: string) {
  const clean = key.replace(/^\/+/, "");
  const prefix = `sasi/${userId}/`;
  if (!clean.startsWith(prefix) || clean.includes("../") || clean.includes("\\") || clean.length > 600) {
    throw new Error("SASI_ARTIFACT_OWNER_MISMATCH");
  }
  return clean;
}

export function presignSasiArtifact(key: string, expiresSeconds = 300) {
  const endpoint = new URL(required("R2_ENDPOINT").replace(/\/+$/, ""));
  if (endpoint.protocol !== "https:") throw new Error("SASI_ARTIFACT_R2_ENDPOINT_INVALID");
  const access = required("R2_ACCESS_KEY_ID");
  const secret = required("R2_SECRET_ACCESS_KEY");
  const bucket = sasiArtifactBucket();
  const now = new Date();
  const amz = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amz.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const uri = "/" + `${bucket}/${key}`.split("/").map(enc).join("/");
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${access}/${scope}`,
    "X-Amz-Date": amz,
    "X-Amz-Expires": String(Math.max(30, Math.min(900, expiresSeconds))),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(query).sort().map((k) => `${enc(k)}=${enc(query[k])}`).join("&");
  const canonical = ["GET", uri, canonicalQuery, `host:${endpoint.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amz, scope, hash(canonical)].join("\n");
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, "auto");
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  return `${endpoint.origin}${uri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
