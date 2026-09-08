import "server-only";
import { createHash, randomUUID } from "node:crypto";

export const SASI_ASSET_BUCKET = "sasi-quarantine";
export const SASI_MAX_ASSET_BYTES = 100 * 1024 * 1024;
export const SASI_TEXT_INDEX_LIMIT = 2 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, readonly string[]> = {
  txt: ["text/plain", "application/octet-stream"], md: ["text/markdown", "text/plain", "application/octet-stream"],
  csv: ["text/csv", "text/plain", "application/octet-stream"], json: ["application/json", "text/plain", "application/octet-stream"],
  yaml: ["text/yaml", "application/yaml", "text/plain", "application/octet-stream"], yml: ["text/yaml", "application/yaml", "text/plain", "application/octet-stream"],
  pdf: ["application/pdf"], docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], zip: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
  jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"], gif: ["image/gif"],
  mp3: ["audio/mpeg", "application/octet-stream"], wav: ["audio/wav", "audio/x-wav", "application/octet-stream"], m4a: ["audio/mp4", "application/octet-stream"],
  mp4: ["video/mp4", "application/octet-stream"], mov: ["video/quicktime", "application/octet-stream"], webm: ["video/webm", "application/octet-stream"],
  js: ["text/javascript", "application/javascript", "text/plain", "application/octet-stream"], jsx: ["text/javascript", "text/plain", "application/octet-stream"],
  ts: ["text/typescript", "text/plain", "application/octet-stream"], tsx: ["text/typescript", "text/plain", "application/octet-stream"], css: ["text/css", "text/plain"],
  html: ["text/html", "text/plain"], sql: ["application/sql", "text/plain", "application/octet-stream"], py: ["text/x-python", "text/plain", "application/octet-stream"],
};

export function assetExtension(name: string) {
  return name.toLowerCase().split(".").pop()?.replace(/[^a-z0-9]/g, "") ?? "";
}

export function validateAsset(name: unknown, size: unknown, mime: unknown) {
  const originalName = typeof name === "string" ? name.trim().slice(0, 240) : "";
  const declaredSize = Math.round(Number(size));
  const declaredMime = typeof mime === "string" ? mime.toLowerCase().trim().slice(0, 120) : "application/octet-stream";
  const extension = assetExtension(originalName);
  const allowedMimes = MIME_BY_EXTENSION[extension];
  if (!originalName || !allowedMimes || !Number.isFinite(declaredSize) || declaredSize < 1 || declaredSize > SASI_MAX_ASSET_BYTES) return null;
  return { originalName, declaredSize, declaredMime: allowedMimes.includes(declaredMime) ? declaredMime : allowedMimes[0], extension };
}

export function mediaKindForExtension(extension: string) {
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return "image";
  if (["mp3", "wav", "m4a"].includes(extension)) return "audio";
  if (["mp4", "mov", "webm"].includes(extension)) return "video";
  if (["js", "jsx", "ts", "tsx", "css", "html", "sql", "py"].includes(extension)) return "code";
  if (["txt", "md", "csv", "json", "yaml", "yml", "pdf", "docx"].includes(extension)) return "document";
  return "other";
}

export function safeAssetPath(userId: string, projectId: string, extension: string) {
  return `${userId}/${projectId}/${randomUUID()}.${extension}`;
}

export function sha256(bytes: ArrayBuffer) {
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}

export function inspectText(bytes: ArrayBuffer) {
  if (bytes.byteLength > SASI_TEXT_INDEX_LIMIT) return { safe: false as const, reason: "TEXT_INDEX_LIMIT_EXCEEDED" };
  const buffer = Buffer.from(bytes);
  if (buffer.includes(0)) return { safe: false as const, reason: "BINARY_CONTENT_IN_TEXT_ASSET" };
  const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer).replace(/\r\n/g, "\n").trim();
  return { safe: true as const, text: text.slice(0, 500_000) };
}

export function isDirectlyIndexable(extension: string) {
  return ["txt", "md", "csv", "json", "yaml", "yml", "js", "jsx", "ts", "tsx", "css", "html", "sql", "py"].includes(extension);
}

export function hasExpectedSignature(extension: string, bytes: ArrayBuffer) {
  const b = new Uint8Array(bytes.slice(0, 16));
  if (extension === "pdf") return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
  if (extension === "png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (extension === "jpg" || extension === "jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (extension === "gif") return String.fromCharCode(...b.slice(0, 6)) === "GIF87a" || String.fromCharCode(...b.slice(0, 6)) === "GIF89a";
  if (extension === "zip" || extension === "docx") return b[0] === 0x50 && b[1] === 0x4b;
  if (extension === "webm") return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
  return true;
}
