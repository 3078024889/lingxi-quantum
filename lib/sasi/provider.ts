import "server-only";
import type { SasiQuality } from "@/lib/sasi/catalog";

export type SasiVideoProviderId = "seedance" | "xai" | "openai" | "wan";

export type SasiVideoSelection = {
  provider: SasiVideoProviderId;
  model: string;
  quality: SasiQuality;
};

type SubmitInput = {
  prompt: string;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  quality: SasiQuality;
  selection: SasiVideoSelection;
};

const XAI_ORIGIN = "https://api.x.ai/v1";
const OPENAI_ORIGIN = "https://api.openai.com/v1";
const ARK_ORIGIN = "https://ark.cn-beijing.volces.com/api/v3";

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function modelName(value: string, fallback: string) {
  const model = value || fallback;
  return /^[a-z0-9][a-z0-9._/-]{2,180}$/i.test(model) ? model : "";
}

function wanBaseUrl() {
  const raw = env("SASI_WAN_BASE_URL").replace(/\/$/, "");
  try {
    const url = new URL(raw);
    const allowedHost = url.hostname === "dashscope.aliyuncs.com" || url.hostname.endsWith(".maas.aliyuncs.com");
    if (url.protocol !== "https:" || !allowedHost || !url.pathname.endsWith("/api/v1")) return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function verifiedProviders() {
  return new Set(
    env("SASI_VERIFIED_VIDEO_PROVIDERS")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item): item is SasiVideoProviderId => item === "seedance" || item === "xai" || item === "openai" || item === "wan"),
  );
}

export function sasiVideoProviderReadiness() {
  const verified = verifiedProviders();
  const providers = {
    seedance: {
      configured: Boolean(env("ARK_API_KEY") && modelName(env("SASI_SEEDANCE_VIDEO_MODEL"), "")),
      verified: Boolean(env("ARK_API_KEY") && modelName(env("SASI_SEEDANCE_VIDEO_MODEL"), "") && verified.has("seedance")),
      model: modelName(env("SASI_SEEDANCE_VIDEO_MODEL"), ""),
    },
    xai: {
      configured: Boolean(env("XAI_API_KEY")),
      verified: Boolean(env("XAI_API_KEY") && verified.has("xai")),
      model: modelName(env("SASI_XAI_VIDEO_MODEL"), "grok-imagine-video-1.5"),
    },
    openai: {
      configured: Boolean(env("OPENAI_API_KEY")),
      verified: Boolean(env("OPENAI_API_KEY") && verified.has("openai")),
      model: modelName(env("SASI_OPENAI_VIDEO_MODEL"), "sora-2"),
      cinemaModel: modelName(env("SASI_OPENAI_CINEMA_MODEL"), "sora-2-pro"),
    },
    wan: {
      configured: Boolean(env("DASHSCOPE_API_KEY") && wanBaseUrl()),
      verified: Boolean(env("DASHSCOPE_API_KEY") && wanBaseUrl() && verified.has("wan")),
      model: modelName(env("SASI_WAN_VIDEO_MODEL"), "wan2.7-t2v"),
    },
  };
  return {
    providers,
    anyConfigured: Object.values(providers).some((provider) => provider.configured),
    anyVerified: Object.values(providers).some((provider) => provider.verified),
  };
}

export function selectSasiVideoProvider(input: {
  quality: SasiQuality;
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  preferredProvider?: SasiVideoProviderId | null;
}): SasiVideoSelection | null {
  const readiness = sasiVideoProviderReadiness();
  const priorities: Record<SasiQuality, SasiVideoProviderId[]> = {
    fast: ["wan", "seedance", "xai", "openai"],
    balanced: ["seedance", "wan", "xai", "openai"],
    cinema: ["seedance", "openai", "xai", "wan"],
  };
  const candidates = input.preferredProvider ? [input.preferredProvider] : priorities[input.quality];
  for (const provider of candidates) {
    const current = readiness.providers[provider];
    if (!current.verified) continue;
    if (provider === "openai" && (![4, 8, 12].includes(input.duration) || input.aspectRatio === "1:1")) continue;
    const model = provider === "openai" && input.quality === "cinema" ? readiness.providers.openai.cinemaModel : current.model;
    if (model) return { provider, model, quality: input.quality };
  }
  return null;
}

async function jsonRequest(url: string, init: RequestInit, prefix: string) {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const nested = payload.error && typeof payload.error === "object" ? payload.error as Record<string, unknown> : null;
    const message = String(nested?.message ?? payload.message ?? payload.detail ?? `HTTP_${response.status}`);
    throw new Error(`${prefix}_${message.slice(0, 120)}`);
  }
  return payload;
}

function bearer(keyName: string) {
  const key = env(keyName);
  if (!key) throw new Error(`${keyName}_MISSING`);
  return `Bearer ${key}`;
}

function openAiSize(aspectRatio: SubmitInput["aspectRatio"], quality: SasiQuality) {
  if (aspectRatio === "1:1") throw new Error("OPENAI_VIDEO_ASPECT_UNSUPPORTED");
  if (quality === "cinema") return aspectRatio === "9:16" ? "1024x1792" : "1792x1024";
  return aspectRatio === "9:16" ? "720x1280" : "1280x720";
}

export async function submitSasiVideo(input: SubmitInput) {
  const { provider, model } = input.selection;
  if (provider === "seedance") {
    const payload = await jsonRequest(`${ARK_ORIGIN}/contents/generations/tasks`, {
      method: "POST",
      headers: { Authorization: bearer("ARK_API_KEY"), "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        content: [{ type: "text", text: input.prompt }],
        ratio: input.aspectRatio,
        duration: input.duration,
        resolution: input.quality === "cinema" ? "1080p" : "720p",
        generate_audio: true,
        watermark: false,
      }),
    }, "SEEDANCE");
    const requestId = typeof payload.id === "string" ? payload.id : "";
    if (!/^[A-Za-z0-9_-]{6,180}$/.test(requestId)) throw new Error("SEEDANCE_INVALID_TASK_ID");
    return { provider, model, providerJobId: requestId };
  }

  if (provider === "xai") {
    const payload = await jsonRequest(`${XAI_ORIGIN}/videos/generations`, {
      method: "POST",
      headers: { Authorization: bearer("XAI_API_KEY"), "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: input.prompt,
        duration: input.duration,
        aspect_ratio: input.aspectRatio,
        resolution: input.quality === "cinema" ? "1080p" : "720p",
      }),
    }, "XAI");
    const requestId = typeof payload.request_id === "string" ? payload.request_id : "";
    if (!/^[A-Za-z0-9_-]{6,180}$/.test(requestId)) throw new Error("XAI_INVALID_REQUEST_ID");
    return { provider, model, providerJobId: requestId };
  }

  if (provider === "openai") {
    const form = new FormData();
    form.set("model", model);
    form.set("prompt", input.prompt);
    form.set("seconds", String(input.duration));
    form.set("size", openAiSize(input.aspectRatio, input.quality));
    const payload = await jsonRequest(`${OPENAI_ORIGIN}/videos`, {
      method: "POST",
      headers: { Authorization: bearer("OPENAI_API_KEY") },
      body: form,
    }, "OPENAI");
    const requestId = typeof payload.id === "string" ? payload.id : "";
    if (!/^video_[A-Za-z0-9_-]{6,180}$/.test(requestId)) throw new Error("OPENAI_INVALID_REQUEST_ID");
    return { provider, model, providerJobId: requestId };
  }

  const baseUrl = wanBaseUrl();
  if (!baseUrl) throw new Error("SASI_WAN_BASE_URL_INVALID");
  const payload = await jsonRequest(`${baseUrl}/services/aigc/video-generation/video-synthesis`, {
    method: "POST",
    headers: {
      Authorization: bearer("DASHSCOPE_API_KEY"),
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model,
      input: { prompt: input.prompt },
      parameters: {
        resolution: input.quality === "cinema" ? "1080P" : "720P",
        ratio: input.aspectRatio,
        duration: input.duration,
        prompt_extend: true,
        watermark: false,
      },
    }),
  }, "WAN");
  const output = payload.output && typeof payload.output === "object" ? payload.output as Record<string, unknown> : {};
  const requestId = typeof output.task_id === "string" ? output.task_id : "";
  if (!/^[A-Za-z0-9_-]{6,180}$/.test(requestId)) throw new Error("WAN_INVALID_TASK_ID");
  return { provider, model, providerJobId: requestId };
}

function videoUrlFrom(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function pollSasiVideo(provider: string, model: string, providerJobId: string) {
  if (provider !== "seedance" && provider !== "xai" && provider !== "openai" && provider !== "wan") throw new Error("UNKNOWN_VIDEO_PROVIDER");
  if (!modelName(model, "")) throw new Error("INVALID_PROVIDER_MODEL");
  if (!/^[A-Za-z0-9_-]{6,180}$/.test(providerJobId)) throw new Error("INVALID_PROVIDER_JOB_ID");

  if (provider === "seedance") {
    const payload = await jsonRequest(`${ARK_ORIGIN}/contents/generations/tasks/${providerJobId}`, {
      headers: { Authorization: bearer("ARK_API_KEY") },
    }, "SEEDANCE");
    const status = String(payload.status ?? "").toLowerCase();
    if (status === "queued") return { state: "queued" as const };
    if (status === "running") return { state: "running" as const };
    if (status === "failed" || status === "expired" || status === "cancelled" || status === "canceled") {
      return { state: "failed" as const, errorCode: `SEEDANCE_${status.toUpperCase()}` };
    }
    if (status === "succeeded") {
      const content = payload.content && typeof payload.content === "object" ? payload.content as Record<string, unknown> : {};
      const videoUrl = videoUrlFrom(content.video_url ?? payload.video_url);
      if (!videoUrl) throw new Error("PROVIDER_RESULT_HAS_NO_VIDEO");
      return { state: "succeeded" as const, videoUrl, providerCostMinor: null, providerCostCurrency: "CNY" as const };
    }
    throw new Error("SEEDANCE_UNKNOWN_STATUS");
  }

  if (provider === "xai") {
    const payload = await jsonRequest(`${XAI_ORIGIN}/videos/${providerJobId}`, {
      headers: { Authorization: bearer("XAI_API_KEY") },
    }, "XAI");
    const status = String(payload.status ?? "").toLowerCase();
    if (status === "pending") return { state: "running" as const };
    if (status === "failed" || status === "expired") return { state: "failed" as const, errorCode: `XAI_${status.toUpperCase()}` };
    if (status === "done") {
      const video = payload.video && typeof payload.video === "object" ? payload.video as Record<string, unknown> : {};
      const usage = payload.usage && typeof payload.usage === "object" ? payload.usage as Record<string, unknown> : {};
      const videoUrl = videoUrlFrom(video.url);
      if (!videoUrl) throw new Error("PROVIDER_RESULT_HAS_NO_VIDEO");
      const ticks = Number(usage.cost_in_usd_ticks);
      return {
        state: "succeeded" as const,
        videoUrl,
        providerCostMinor: Number.isFinite(ticks) ? Math.round(ticks / 100_000_000) : null,
        providerCostCurrency: "USD" as const,
      };
    }
    throw new Error("XAI_UNKNOWN_STATUS");
  }

  if (provider === "openai") {
    const payload = await jsonRequest(`${OPENAI_ORIGIN}/videos/${providerJobId}`, {
      headers: { Authorization: bearer("OPENAI_API_KEY") },
    }, "OPENAI");
    const status = String(payload.status ?? "").toLowerCase();
    if (status === "queued") return { state: "queued" as const };
    if (status === "in_progress") return { state: "running" as const };
    if (status === "failed") return { state: "failed" as const, errorCode: "OPENAI_FAILED" };
    if (status === "completed") {
      return {
        state: "succeeded" as const,
        videoUrl: `${OPENAI_ORIGIN}/videos/${providerJobId}/content`,
        providerCostMinor: null,
        providerCostCurrency: "USD" as const,
      };
    }
    throw new Error("OPENAI_UNKNOWN_STATUS");
  }

  const baseUrl = wanBaseUrl();
  if (!baseUrl) throw new Error("SASI_WAN_BASE_URL_INVALID");
  const payload = await jsonRequest(`${baseUrl}/tasks/${providerJobId}`, {
    headers: { Authorization: bearer("DASHSCOPE_API_KEY") },
  }, "WAN");
  const output = payload.output && typeof payload.output === "object" ? payload.output as Record<string, unknown> : {};
  const status = String(output.task_status ?? "").toUpperCase();
  if (status === "PENDING") return { state: "queued" as const };
  if (status === "RUNNING") return { state: "running" as const };
  if (status === "FAILED" || status === "CANCELED" || status === "UNKNOWN") {
    return { state: "failed" as const, errorCode: `WAN_${status}` };
  }
  if (status === "SUCCEEDED") {
    const videoUrl = videoUrlFrom(output.video_url);
    if (!videoUrl) throw new Error("PROVIDER_RESULT_HAS_NO_VIDEO");
    return { state: "succeeded" as const, videoUrl, providerCostMinor: null, providerCostCurrency: "CNY" as const };
  }
  throw new Error("WAN_UNKNOWN_STATUS");
}

function configuredAssetHosts() {
  return new Set(env("SASI_PROVIDER_ASSET_HOSTS").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
}

export function providerAssetAccess(provider: string, value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") return { trusted: false, headers: {} as Record<string, string> };
  const host = url.hostname.toLowerCase();
  const configured = configuredAssetHosts().has(host);
  if (provider === "openai" && host === "api.openai.com") {
    return { trusted: true, headers: { Authorization: bearer("OPENAI_API_KEY") } };
  }
  const xaiHost = provider === "xai" && (host === "x.ai" || host.endsWith(".x.ai"));
  const wanHost = provider === "wan" && (
    /^dashscope-result-[a-z0-9-]+\.oss-accelerate\.aliyuncs\.com$/.test(host)
    || /^dashscope-result-[a-z0-9-]+\.oss-cn-[a-z0-9-]+\.aliyuncs\.com$/.test(host)
  );
  // Seedance result hosts are accepted only after the exact host has been observed
  // during a paid verification run and added to SASI_PROVIDER_ASSET_HOSTS.
  return { trusted: configured || xaiHost || wanHost, headers: {} as Record<string, string> };
}

export async function cancelSasiVideo(provider: string, providerJobId: string) {
  if (providerJobId && provider) throw new Error("PROVIDER_CANCEL_UNSUPPORTED");
}
