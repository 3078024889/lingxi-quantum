import "server-only";
import { createHash } from "node:crypto";

// An operator-reviewed price envelope, never a client-supplied price. No default
// price: model access and current supplier tariffs must be verified first.
export type SeedanceProfile = {
  model: string;
  resolution: "720p" | "1080p";
  generateAudio: boolean;
  maxDuration: number;
  estimatedFenPerSecond: number;
  validUntil: string;
  priceSource: string;
  imageMode?: "none" | "first_frame" | "reference_image";
};

export function seedanceProfile(raw = process.env.SASI_BYOK_SEEDANCE_PROFILE, now = Date.now()): SeedanceProfile | null {
  try {
    const p = JSON.parse(raw ?? "null");
    if (!p || typeof p.model !== "string" || !/^[a-z0-9][a-z0-9._-]{2,180}$/i.test(p.model)
      || !["720p", "1080p"].includes(p.resolution) || typeof p.generateAudio !== "boolean"
      || !Number.isInteger(p.maxDuration) || p.maxDuration < 4 || p.maxDuration > 12
      || !Number.isSafeInteger(p.estimatedFenPerSecond) || p.estimatedFenPerSecond <= 0 || p.estimatedFenPerSecond > 100000
      || !Number.isFinite(Date.parse(p.validUntil)) || Date.parse(p.validUntil) <= now) return null;
    const source = new URL(p.priceSource);
    if (source.protocol !== "https:" || !["www.volcengine.com", "docs.volcengine.com"].includes(source.hostname)) return null;
    if (p.imageMode !== undefined && !["none", "first_frame", "reference_image"].includes(p.imageMode)) return null;
    return { model: p.model, resolution: p.resolution, generateAudio: p.generateAudio, maxDuration: p.maxDuration,
      estimatedFenPerSecond: p.estimatedFenPerSecond, validUntil: p.validUntil, priceSource: source.toString(), ...(p.imageMode ? { imageMode: p.imageMode } : {}) };
  } catch { return null; }
}

export function seedanceProfileVersion(profile: SeedanceProfile) {
  return createHash("sha256").update(JSON.stringify(profile)).digest("hex");
}

export type SeedanceRequest = { model: string; prompt: string; duration: number; ratio: "16:9" | "9:16" | "1:1";
  resolution: "720p" | "1080p"; generateAudio: boolean };

const TASKS = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";

async function arkRequest(apiKey: string, url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, { method: body ? "POST" : "GET", cache: "no-store",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20_000) });
  // Never return arbitrary provider error messages: they may echo prompts or keys.
  if (!response.ok) throw new Error(`ARK_HTTP_${response.status}`);
  return await response.json() as Record<string, unknown>;
}

export async function submitSeedanceByok(apiKey: string, input: SeedanceRequest, images: { url: string; role: "first_frame" | "reference_image" }[] = []) {
  const body = await arkRequest(apiKey, TASKS, { model: input.model,
    content: [{ type: "text", text: input.prompt }, ...images.map(image => ({ type: "image_url", image_url: { url: image.url }, role: image.role }))], duration: input.duration, ratio: input.ratio,
    resolution: input.resolution, generate_audio: input.generateAudio, watermark: true });
  if (typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{6,180}$/.test(body.id)) throw new Error("ARK_INVALID_TASK_ID");
  return body.id;
}

export async function pollSeedanceByok(apiKey: string, taskId: string) {
  if (!/^[a-zA-Z0-9_-]{6,180}$/.test(taskId)) throw new Error("ARK_INVALID_TASK_ID");
  const body = await arkRequest(apiKey, `${TASKS}/${encodeURIComponent(taskId)}`);
  const status = String(body.status ?? "");
  if (["queued", "running"].includes(status)) return { state: status, output: {} };
  if (["failed", "expired", "cancelled", "canceled"].includes(status)) return { state: "failed", output: { supplierStatus: status } };
  if (status !== "succeeded") throw new Error("ARK_UNKNOWN_STATUS");
  const content = body.content as { video_url?: unknown } | undefined;
  const url = new URL(String(content?.video_url ?? ""));
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("ARK_INVALID_RESULT");
  const usage = body.usage as { completion_tokens?: unknown; total_tokens?: unknown } | undefined;
  return { state: "succeeded", output: { videoUrl: url.toString(), aiGenerated: true,
    completionTokens: Number.isSafeInteger(usage?.completion_tokens) ? usage!.completion_tokens : null,
    totalTokens: Number.isSafeInteger(usage?.total_tokens) ? usage!.total_tokens : null } };
}
