import "server-only";

import type {
  SasiTeacherAdapter,
  SasiTeacherCallInput,
  SasiTeacherCallResult,
} from "@/lib/sasi/teachers/adapter";
import type { SasiTeacherProfile } from "@/lib/sasi/teachers/registry";

export type ArkTeacherAdapterOptions = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeoutMs?: number;
};

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export class ArkTeacherAdapter implements SasiTeacherAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: ArkTeacherAdapterOptions) {
    const key = options.apiKey.trim();
    const model = options.model.trim();
    if (key.length < 12) throw new Error("ARK_TEACHER_KEY_INVALID");
    if (!model) throw new Error("ARK_TEACHER_MODEL_REQUIRED");

    this.apiKey = key;
    this.model = model;
    this.baseUrl =
      options.baseUrl?.trim() ||
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    this.timeoutMs = Math.max(5_000, Math.min(options.timeoutMs ?? 45_000, 90_000));
  }

  supports(profile: SasiTeacherProfile) {
    return (
      profile.provider === "doubao" &&
      profile.model === this.model &&
      profile.enabled
    );
  }

  async call(input: SasiTeacherCallInput): Promise<SasiTeacherCallResult> {
    if (!this.supports(input.profile)) {
      throw new Error("ARK_TEACHER_PROFILE_UNSUPPORTED");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(this.timeoutMs),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: input.messages,
        max_tokens: Math.max(
          256,
          Math.min(input.maxOutputTokens ?? 1600, 4096),
        ),
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
      }),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerCode = safeText(body?.error?.code);
      throw new Error(
        providerCode === "ModelNotOpen"
          ? "ARK_TEACHER_MODEL_NOT_OPEN"
          : `ARK_TEACHER_HTTP_${response.status}`,
      );
    }

    const outputText = safeText(body?.choices?.[0]?.message?.content);
    if (!outputText.trim()) throw new Error("ARK_TEACHER_EMPTY_OUTPUT");

    return {
      provider: "doubao",
      model: this.model,
      providerRequestId:
        response.headers.get("x-request-id") ||
        response.headers.get("x-tt-logid") ||
        null,
      outputText,
      usage: {
        inputTokens: Number.isSafeInteger(body?.usage?.prompt_tokens)
          ? body.usage.prompt_tokens
          : undefined,
        outputTokens: Number.isSafeInteger(body?.usage?.completion_tokens)
          ? body.usage.completion_tokens
          : undefined,
      },
    };
  }
}
