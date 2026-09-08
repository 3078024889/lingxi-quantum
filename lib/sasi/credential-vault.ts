import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

export const BYOK_PROVIDERS = ["openai", "xai", "anthropic", "luma", "volcengine", "aliyun", "gemini"] as const;
export type ByokProvider = typeof BYOK_PROVIDERS[number];

function masterKey(): Buffer {
  const raw = process.env.SASI_BYOK_ENCRYPTION_KEY?.trim();
  if (!raw) throw new Error("SASI_BYOK_ENCRYPTION_KEY_MISSING");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SASI_BYOK_ENCRYPTION_KEY_INVALID");
  return key;
}

function aad(userId: string, provider: ByokProvider) {
  return Buffer.from(`sasi-byok:v1:${userId}:${provider}`, "utf8");
}

export function byokVaultConfigured() {
  try { return masterKey().length === 32; } catch { return false; }
}

export function validByokProvider(value: unknown): value is ByokProvider {
  return typeof value === "string" && (BYOK_PROVIDERS as readonly string[]).includes(value);
}

export function validateProviderKey(provider: ByokProvider, value: unknown) {
  if (typeof value !== "string") return "KEY_REQUIRED";
  const key = value.trim();
  if (key.length < 12 || key.length > 512 || /[\r\n\0]/.test(key)) return "KEY_FORMAT_INVALID";
  if (provider === "openai" && !key.startsWith("sk-")) return "KEY_FORMAT_INVALID";
  return null;
}

export function encryptProviderKey(userId: string, provider: ByokProvider, plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  cipher.setAAD(aad(userId, provider));
  const ciphertext = Buffer.concat([cipher.update(plaintext.trim(), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptProviderKey(userId: string, provider: ByokProvider, payload: string) {
  const [version, ivText, tagText, ciphertextText] = payload.split(".");
  if (version !== "v1" || !ivText || !tagText || !ciphertextText) throw new Error("BYOK_CIPHERTEXT_INVALID");
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), Buffer.from(ivText, "base64url"));
  decipher.setAAD(aad(userId, provider));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8");
}

export function providerKeyFingerprint(value: string) {
  return createHash("sha256").update(value.trim()).digest("hex").slice(0, 16);
}

export function providerKeyHint(value: string) {
  const key = value.trim();
  return `••••${key.slice(-4)}`;
}
