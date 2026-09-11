import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAskMessages, buildDeterministicAskAnswer } from "@/lib/sasi/ask/prompt";
import { retrieveFoundryContext } from "@/lib/sasi/ask/retrieve";

export type RunSasiAskInput = {
  userId: string;
  question: string;
  admin: SupabaseClient;
};

export type AskCitation = {
  id: string;
  title: string;
  tier?: string;
};

export type RunSasiAskResult = {
  answer: string;
  citations: AskCitation[];
  retrievedCount: number;
  model?: string;
  grounded: boolean;
  generation: "llm" | "deterministic";
};

const MIN_Q = 1;
const MAX_Q = 2000;

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function modelName(value: string, fallback: string) {
  const model = value || fallback;
  return /^[a-z0-9][a-z0-9._/-]{2,180}$/i.test(model) ? model : "";
}

type ChatProvider = {
  id: "xai" | "openai";
  origin: string;
  keyEnv: string;
  model: string;
};

function resolveChatProvider(preferLight: boolean): ChatProvider | null {
  const xaiKey = env("XAI_API_KEY");
  const openaiKey = env("OPENAI_API_KEY");
  const askModel = modelName(env("SASI_ASK_MODEL"), "");
  const lightModel = modelName(env("SASI_ASK_LIGHT_MODEL"), "");

  if (xaiKey) {
    const model =
      (preferLight ? lightModel : "") ||
      askModel ||
      modelName("", preferLight ? "grok-3-mini" : "grok-3-mini");
    if (model) {
      return { id: "xai", origin: "https://api.x.ai/v1", keyEnv: "XAI_API_KEY", model };
    }
  }
  if (openaiKey) {
    const model =
      (preferLight ? lightModel : "") ||
      askModel ||
      modelName("", preferLight ? "gpt-4o-mini" : "gpt-4o-mini");
    if (model) {
      return { id: "openai", origin: "https://api.openai.com/v1", keyEnv: "OPENAI_API_KEY", model };
    }
  }
  return null;
}

async function callChatCompletions(
  provider: ChatProvider,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const key = env(provider.keyEnv);
  if (!key) throw new Error(`${provider.keyEnv}_MISSING`);

  const response = await fetch(`${provider.origin}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.3,
      max_tokens: 1200,
      messages,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const nested = payload.error && typeof payload.error === "object" ? (payload.error as Record<string, unknown>) : null;
    const message = String(nested?.message ?? payload.message ?? `HTTP_${response.status}`);
    throw new Error(`${provider.id.toUpperCase()}_CHAT_${message.slice(0, 160)}`);
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = choices[0] && typeof choices[0] === "object" ? (choices[0] as Record<string, unknown>) : null;
  const message = first?.message && typeof first.message === "object" ? (first.message as Record<string, unknown>) : null;
  const content = typeof message?.content === "string" ? message.content.trim() : "";
  if (!content) throw new Error(`${provider.id.toUpperCase()}_CHAT_EMPTY`);
  return content;
}

export function validateAskQuestion(question: unknown): { ok: true; question: string } | { ok: false; error: string } {
  if (typeof question !== "string") return { ok: false, error: "QUESTION_INVALID" };
  const trimmed = question.trim();
  if (trimmed.length < MIN_Q || trimmed.length > MAX_Q) return { ok: false, error: "QUESTION_LENGTH" };
  return { ok: true, question: trimmed };
}

/**
 * Retrieve Foundry context and answer with LLM when keys exist; else deterministic vault digest.
 * Does not enable training.
 */
export async function runSasiAsk(input: RunSasiAskInput): Promise<RunSasiAskResult> {
  const validated = validateAskQuestion(input.question);
  if (!validated.ok) {
    const err = new Error(validated.error);
    err.name = "AskValidationError";
    throw err;
  }

  const retrieved = await retrieveFoundryContext(input.admin, input.userId, validated.question);
  const citations: AskCitation[] = retrieved.items.map((item) => ({
    id: item.id,
    title: item.title,
    tier: item.tier,
  }));
  const retrievedCount = retrieved.items.length + retrieved.characters.length;
  const grounded = retrieved.items.length > 0;
  const messages = buildAskMessages({
    question: validated.question,
    items: retrieved.items,
    characters: retrieved.characters,
  });

  const preferLight = retrievedCount === 0;
  const provider = resolveChatProvider(preferLight);

  if (!provider) {
    return {
      answer: buildDeterministicAskAnswer({
        question: validated.question,
        items: retrieved.items,
        characters: retrieved.characters,
      }),
      citations,
      retrievedCount,
      grounded,
      generation: "deterministic",
    };
  }

  try {
    const answer = await callChatCompletions(provider, messages);
    return {
      answer,
      citations,
      retrievedCount,
      model: `${provider.id}:${provider.model}`,
      grounded,
      generation: "llm",
    };
  } catch (error) {
    console.error("[sasi ask] llm unavailable", error instanceof Error ? error.message : "unknown");
    return {
      answer: buildDeterministicAskAnswer({
        question: validated.question,
        items: retrieved.items,
        characters: retrieved.characters,
      }),
      citations,
      retrievedCount,
      grounded,
      generation: "deterministic",
    };
  }
}
