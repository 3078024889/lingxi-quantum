import "server-only";

export type SasiReasoningConfig = {
  provider: "volcengine";
  apiKeyConfigured: boolean;
  model: string;
  source:
    | "SASI_ARK_TEACHER_MODEL"
    | "SASI_REASONER_PRIMARY_MODEL"
    | "AI_HIGH_MODEL"
    | "AI_DEFAULT_MODEL"
    | "fallback";
};

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function validModel(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,180}$/.test(value);
}

export function resolveSasiReasoningConfig(): SasiReasoningConfig {
  const candidates = [
    ["SASI_ARK_TEACHER_MODEL", clean(process.env.SASI_ARK_TEACHER_MODEL)],
    ["SASI_REASONER_PRIMARY_MODEL", clean(process.env.SASI_REASONER_PRIMARY_MODEL)],
    ["AI_HIGH_MODEL", clean(process.env.AI_HIGH_MODEL)],
    ["AI_DEFAULT_MODEL", clean(process.env.AI_DEFAULT_MODEL)],
  ] as const;

  for (const [source, value] of candidates) {
    if (value && validModel(value)) {
      return {
        provider: "volcengine",
        apiKeyConfigured: Boolean(
          clean(process.env.ARK_API_KEY) ||
          clean(process.env.VOLCENGINE_ARK_API_KEY),
        ),
        model: value,
        source,
      };
    }
  }

  return {
    provider: "volcengine",
    apiKeyConfigured: Boolean(
      clean(process.env.ARK_API_KEY) ||
      clean(process.env.VOLCENGINE_ARK_API_KEY),
    ),
    model: "doubao-seed-evolving",
    source: "fallback",
  };
}

export function resolveArkApiKey() {
  return (
    clean(process.env.ARK_API_KEY) ||
    clean(process.env.VOLCENGINE_ARK_API_KEY)
  );
}
