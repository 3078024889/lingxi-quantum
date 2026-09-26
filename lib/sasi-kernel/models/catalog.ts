export type SasiNativeModelKind = "reasoning" | "image" | "video";
export type SasiLicenseClass = "commercial-open" | "restricted" | "unknown";

export type SasiNativeModelProfile = {
  id: string;
  kind: SasiNativeModelKind;
  family: string;
  license: string;
  licenseClass: SasiLicenseClass;
  commercialAllowed: boolean;
  source: string;
  minVramGb: number;
  recommendedVramGb: number;
  notes: string;
};

export const SASI_NATIVE_MODELS: readonly SasiNativeModelProfile[] = [
  {
    id: "Qwen/Qwen3-8B",
    kind: "reasoning",
    family: "Qwen3",
    license: "Apache-2.0",
    licenseClass: "commercial-open",
    commercialAllowed: true,
    source: "huggingface",
    minVramGb: 12,
    recommendedVramGb: 16,
    notes: "SASI native reasoning and structured planning baseline.",
  },
  {
    id: "black-forest-labs/FLUX.1-schnell",
    kind: "image",
    family: "FLUX.1",
    license: "Apache-2.0",
    licenseClass: "commercial-open",
    commercialAllowed: true,
    source: "huggingface",
    minVramGb: 16,
    recommendedVramGb: 24,
    notes: "Commercial-open text-to-image baseline. Keep non-commercial FLUX dev variants disabled by default.",
  },
  {
    id: "Wan-AI/Wan2.1-T2V-1.3B",
    kind: "video",
    family: "Wan2.1",
    license: "Apache-2.0",
    licenseClass: "commercial-open",
    commercialAllowed: true,
    source: "huggingface",
    minVramGb: 9,
    recommendedVramGb: 24,
    notes: "Text-to-video baseline for real generated shots. Production quality should use a larger reviewed model when hardware permits.",
  },
] as const;

const APPROVED = new Map(SASI_NATIVE_MODELS.map((model) => [model.id, model]));

export function getNativeModelProfile(id: string) {
  return APPROVED.get(id) ?? null;
}

export function assertCommercialNativeModel(id: string, kind: SasiNativeModelKind) {
  const profile = getNativeModelProfile(id);
  if (!profile) throw new Error(`SASI_MODEL_NOT_APPROVED:${id}`);
  if (profile.kind !== kind) throw new Error(`SASI_MODEL_KIND_MISMATCH:${id}`);
  if (!profile.commercialAllowed || profile.licenseClass !== "commercial-open") {
    throw new Error(`SASI_MODEL_LICENSE_BLOCKED:${id}`);
  }
  return profile;
}

export function nativeModelCatalogPublic() {
  return SASI_NATIVE_MODELS.map(({ id, kind, family, license, commercialAllowed, minVramGb, recommendedVramGb }) => ({
    id, kind, family, license, commercialAllowed, minVramGb, recommendedVramGb,
  }));
}
