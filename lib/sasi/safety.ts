export function reviewSasiProductionInput(input: {
  prompt: string;
  rightsConfirmed: unknown;
  aiLabelAcknowledged: unknown;
}) {
  if (input.rightsConfirmed !== true) return { ok: false as const, error: "RIGHTS_CONFIRMATION_REQUIRED" };
  if (input.aiLabelAcknowledged !== true) return { ok: false as const, error: "AI_LABEL_ACKNOWLEDGEMENT_REQUIRED" };
  const normalized = input.prompt.normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
  const blocked = [
    /(?:未成年|儿童|幼女|幼童|child|minor).{0,32}(?:裸|色情|性行为|脱衣|nude|sexual|explicit)/i,
    /(?:裸|色情|性行为|脱衣|nude|sexual|explicit).{0,32}(?:未成年|儿童|幼女|幼童|child|minor)/i,
    /(?:换脸|deepfake|冒充|impersonat).{0,40}(?:未经同意|不知情|without consent)/i,
    /(?:制作|生成|伪造).{0,32}(?:身份证|护照|银行流水|官方公文|medical record|passport|identity card)/i,
  ];
  if (blocked.some((pattern) => pattern.test(normalized))) return { ok: false as const, error: "PRODUCTION_POLICY_BLOCKED" };
  return { ok: true as const, normalizedPrompt: normalized };
}
