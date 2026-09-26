import "server-only";

type JsonObject = Record<string, unknown>;

type ProviderAttempt = {
  baseUrl: string;
  model: string;
  status?: number;
  code?: string;
};

function normalizeBaseUrl(input: string) {
  return input.trim().replace(/\/+$/, "");
}

function compatibleFromWan(input: string) {
  try {
    const u = new URL(input);
    if (
      u.protocol !== "https:" ||
      !(
        u.hostname === "dashscope.aliyuncs.com" ||
        u.hostname === "dashscope-intl.aliyuncs.com" ||
        u.hostname.endsWith(".maas.aliyuncs.com")
      )
    ) {
      return "";
    }
    u.pathname = "/compatible-mode/v1";
    u.search = "";
    u.hash = "";
    return normalizeBaseUrl(u.toString());
  } catch {
    return "";
  }
}

function baseUrls() {
  const explicit = process.env.DASHSCOPE_COMPATIBLE_BASE_URL?.trim();
  if (explicit) return [normalizeBaseUrl(explicit)];

  const wan = process.env.SASI_WAN_BASE_URL?.trim();
  const fromWan = wan ? compatibleFromWan(wan) : "";
  if (fromWan) return [fromWan];

  const region = (process.env.DASHSCOPE_REGION || "").trim().toLowerCase();
  const china = "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const intl = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

  // Model Studio API keys are region-bound. If no explicit region/base is configured,
  // try both legacy compatible endpoints, preserving a deterministic order.
  if (["sg", "singapore", "intl", "international", "ap-southeast-1"].includes(region)) {
    return [intl, china];
  }
  return [china, intl];
}

function modelCandidates() {
  const configured = process.env.QWEN_VISION_MODEL?.trim();
  return [...new Set([configured, "qwen3-vl-flash", "qwen3-vl-plus"].filter(Boolean) as string[])];
}

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function messageText(data: unknown) {
  const root = asObject(data);
  const choices = Array.isArray(root?.choices) ? root?.choices : [];
  const first = asObject(choices[0]);
  const message = asObject(first?.message);
  const value = message?.content;

  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        const item = asObject(entry);
        return typeof item?.text === "string" ? item.text : "";
      })
      .join("")
      .trim();
  }

  return "";
}

function providerErrorCode(body: unknown) {
  const root = asObject(body);
  const error = asObject(root?.error);
  if (typeof error?.code === "string") return error.code;
  if (typeof root?.code === "string") return root.code;
  return "";
}

function retryableAcrossRegion(status: number, code: string) {
  if ([400, 401, 403, 404].includes(status)) return true;
  return [
    "invalid_api_key",
    "InvalidApiKey",
    "ModelNotFound",
    "model_not_found",
    "InvalidParameter",
  ].includes(code);
}

export async function analyzeFoodWithQwen(input: { dataUrl: string; prompt: string }) {
  const key = process.env.DASHSCOPE_API_KEY?.trim();
  if (!key) throw new Error("DASHSCOPE_API_KEY_MISSING");

  const attempts: ProviderAttempt[] = [];
  let lastError = "QWEN_VISION_FAILED";

  for (const baseUrl of baseUrls()) {
    for (const model of modelCandidates()) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: input.prompt },
                  { type: "image_url", image_url: { url: input.dataUrl } },
                ],
              },
            ],
            stream: false,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(45000),
        });

        const body: unknown = await response.json().catch(() => ({}));
        const code = providerErrorCode(body);
        attempts.push({ baseUrl, model, status: response.status, code });

        if (!response.ok) {
          lastError = `QWEN_VISION_${response.status}${code ? `_${code}` : ""}`;
          if (retryableAcrossRegion(response.status, code)) continue;
          throw new Error(lastError);
        }

        const text = messageText(body);
        if (!text) {
          lastError = "QWEN_VISION_EMPTY";
          continue;
        }

        const root = asObject(body);
        return {
          text,
          model: typeof root?.model === "string" ? root.model : model,
          usage: root?.usage ?? null,
          endpoint: new URL(baseUrl).hostname,
          attempts: attempts.length,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        lastError = message;
        attempts.push({ baseUrl, model });
        if (message.includes("timeout") || message.includes("AbortError")) continue;
        if (message.startsWith("QWEN_VISION_")) continue;
        continue;
      }
    }
  }

  console.error("[qwen vision] all providers failed", {
    attempts: attempts.map((x) => ({
      endpoint: (() => {
        try { return new URL(x.baseUrl).hostname; } catch { return "invalid"; }
      })(),
      model: x.model,
      status: x.status,
      code: x.code,
    })),
    lastError,
  });

  throw new Error(lastError);
}
