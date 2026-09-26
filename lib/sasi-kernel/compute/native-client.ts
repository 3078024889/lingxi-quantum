import "server-only";

import { createHash, createHmac, randomUUID } from "node:crypto";
import {
  SASI_COMPUTE_PROTOCOL_VERSION,
  isNativeJobPublic,
  type NativeJobKind,
  type NativeJobPublic,
  type NativeJobRequest,
} from "./protocol";
import { assertCommercialNativeModel } from "@/lib/sasi-kernel/models/catalog";

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function workerBase() {
  const raw = env("SASI_NATIVE_COMPUTE_URL").replace(/\/+$/, "");
  if (!raw) throw new Error("SASI_NATIVE_COMPUTE_NOT_CONFIGURED");
  const url = new URL(raw);
  if(url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("SASI_NATIVE_COMPUTE_URL_INVALID");
  const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  const allowed = new Set(
    env("SASI_NATIVE_COMPUTE_ALLOWED_HOSTS")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  if (!local && url.protocol !== "https:") throw new Error("SASI_NATIVE_COMPUTE_HTTPS_REQUIRED");
  if (!local && allowed.size === 0) throw new Error("SASI_NATIVE_COMPUTE_ALLOWLIST_REQUIRED");
  if (!local && !allowed.has(url.hostname.toLowerCase())) throw new Error("SASI_NATIVE_COMPUTE_HOST_NOT_ALLOWED");
  return raw;
}

function secret() {
  const value = env("SASI_NATIVE_COMPUTE_SECRET");
  if (value.length < 32) throw new Error("SASI_NATIVE_COMPUTE_SECRET_INVALID");
  return value;
}

function modelFor(kind: NativeJobKind, vision = false) {
  if (kind === "reason" && vision) {
    const model = env("SASI_NATIVE_VISION_MODEL") || "Qwen/Qwen2.5-VL-7B-Instruct";
    if(model !== "Qwen/Qwen2.5-VL-7B-Instruct") throw new Error("VISION_MODEL_NOT_APPROVED");
    return model;
  }
  const key = kind === "reason"
    ? "SASI_NATIVE_REASONING_MODEL"
    : kind === "image"
      ? "SASI_NATIVE_IMAGE_MODEL"
      : "SASI_NATIVE_VIDEO_MODEL";
  const fallback = kind === "reason"
    ? "Qwen/Qwen3-8B"
    : kind === "image"
      ? "black-forest-labs/FLUX.1-schnell"
      : "Wan-AI/Wan2.1-T2V-1.3B-Diffusers";
  const model = env(key) || fallback;
  assertCommercialNativeModel(model, kind === "reason" ? "reasoning" : kind);
  return model;
}

function signature(method: string, pathname: string, body: string, ts: string, nonce: string) {
  const digest = createHash("sha256").update(body).digest("hex");
  return createHmac("sha256", secret())
    .update(`${ts}.${nonce}.${method.toUpperCase()}.${pathname}.${digest}`)
    .digest("hex");
}

async function signedJson<T>(method: "POST" | "GET" | "DELETE", pathname: string, body?: unknown, timeoutMs = 30_000): Promise<T> {
  const encoded = body == null ? "" : JSON.stringify(body);
  const ts = String(Date.now());
  const nonce = randomUUID();
  const response = await fetch(`${workerBase()}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-lingxi-timestamp": ts,
      "x-lingxi-nonce": nonce,
      "x-lingxi-signature": signature(method, pathname, encoded, ts, nonce),
    },
    body: method === "GET" ? undefined : encoded,
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(payload.error ?? `SASI_NATIVE_COMPUTE_HTTP_${response.status}`).slice(0, 180));
  }
  return payload as T;
}

export async function nativeComputeReadiness() {
  const base = workerBase();
  const response = await fetch(`${base}/health`, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`SASI_NATIVE_HEALTH_${response.status}`);
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  return payload;
}

export async function submitNativeJob(input: {
  taskId: string;
  requestId?: string;
  ownerId: string;
  projectId?: string | null;
  kind: NativeJobKind;
  input: Record<string, unknown>;
}) {
  const request: NativeJobRequest = {
    protocolVersion: SASI_COMPUTE_PROTOCOL_VERSION,
    requestId: input.requestId ?? randomUUID(),
    taskId: input.taskId,
    ownerId: input.ownerId,
    projectId: input.projectId ?? null,
    kind: input.kind,
    model: modelFor(input.kind, Array.isArray(input.input.images) && input.input.images.length > 0),
    input: input.input,
  };
  const payload = await signedJson<{ job: unknown }>("POST", "/v1/jobs", request);
  if (!isNativeJobPublic(payload.job)) throw new Error("SASI_NATIVE_JOB_RESPONSE_INVALID");
  if(payload.job.ownerId!==input.ownerId || payload.job.taskId!==input.taskId || payload.job.requestId!==request.requestId) throw new Error("SASI_NATIVE_JOB_RESPONSE_MISMATCH");
  return payload.job;
}

export async function getNativeJob(id: string, ownerId: string) {
  if (!/^[a-f0-9-]{16,64}$/i.test(id)) throw new Error("SASI_NATIVE_JOB_ID_INVALID");
  const payload = await signedJson<{ job: unknown }>("GET", `/v1/jobs/${encodeURIComponent(id)}?owner=${encodeURIComponent(ownerId)}`);
  if (!isNativeJobPublic(payload.job)) throw new Error("SASI_NATIVE_JOB_RESPONSE_INVALID");
  if(payload.job.ownerId!==ownerId || payload.job.id!==id) throw new Error("SASI_NATIVE_JOB_RESPONSE_MISMATCH");
  return payload.job;
}

export async function cancelNativeJob(id: string, ownerId: string) {
  if (!/^[a-f0-9-]{16,64}$/i.test(id)) throw new Error("SASI_NATIVE_JOB_ID_INVALID");
  return signedJson<{ ok: boolean }>("DELETE", `/v1/jobs/${encodeURIComponent(id)}?owner=${encodeURIComponent(ownerId)}`, {});
}

export function configuredNativeModels() {
  return {
    reasoning: modelFor("reason"),
    vision: modelFor("reason",true),
    image: modelFor("image"),
    video: modelFor("video"),
  };
}

export async function assertNativeReady(kind: NativeJobKind, vision = false) {
  const health = await nativeComputeReadiness();
  const key = vision ? "vision" : kind;
  const capabilities = health.capabilities as Record<string,{ready?:boolean;id?:string}> | undefined;
  if(health.service !== "lingxifield-sasi-native-compute" || health.inference !== "self-hosted-offline" ||
      capabilities?.[key]?.ready !== true || capabilities[key].id !== modelFor(kind,vision)) {
    throw new Error("SASI_NATIVE_MODEL_NOT_ACCEPTED");
  }
}

export async function fetchNativeArtifact(jobId:string, artifactId:string, ownerId:string, range:string|null) {
  if(!/^[a-f0-9-]{16,64}$/i.test(jobId) || !/^[a-f0-9-]{16,64}$/i.test(artifactId)) throw new Error("INVALID_ARTIFACT_ID");
  const pathname = `/v1/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(artifactId)}?owner=${encodeURIComponent(ownerId)}`;
  const ts=String(Date.now()),nonce=randomUUID();
  return fetch(`${workerBase()}${pathname}`,{method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(30_000),
    headers:{"x-lingxi-timestamp":ts,"x-lingxi-nonce":nonce,"x-lingxi-signature":signature("GET",pathname,"",ts,nonce),
      ...(range && /^bytes=\d*-\d*$/.test(range)?{Range:range}:{})}});
}
