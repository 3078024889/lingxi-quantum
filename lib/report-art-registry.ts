export type PdfProductKey =
  | "life-map" | "deep-relationship" | "business-relationship" | "other-relationship"
  | "resilience" | "romance" | "wealth" | "daily-tide" | "life-mirror" | "life-oracle";

export type PdfArtAsset = { id: string; src: string; product: PdfProductKey; slot: number };

const ROOT = "/shared/report-assets";
const pool = (product: PdfProductKey): PdfArtAsset[] => Array.from({ length: 6 }, (_, index) => ({
  id: `${product}-${String(index + 1).padStart(2, "0")}`,
  src: `${ROOT}/${product}/${String(index + 1).padStart(2, "0")}.png`,
  product,
  slot: index + 1,
}));

/** The only registry used by web and Mini Program report publications. */
export const PDF_ASSET_REGISTRY: Record<PdfProductKey, PdfArtAsset[]> = {
  "life-map": pool("life-map"),
  "deep-relationship": pool("deep-relationship"),
  "business-relationship": pool("business-relationship"),
  "other-relationship": pool("other-relationship"),
  resilience: pool("resilience"),
  romance: pool("romance"),
  wealth: pool("wealth"),
  "daily-tide": pool("daily-tide"),
  "life-mirror": pool("life-mirror"),
  "life-oracle": pool("life-oracle"),
};

/** Sixty text-free publication artworks shared by result-only experiments. */
export const ALL_REPORT_PDF_ART: PdfArtAsset[] = Object.values(PDF_ASSET_REGISTRY).flat();

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectPdfArt(assets: PdfArtAsset[], reportId: string, pageIndex: number) {
  if (!assets.length) throw new Error("PDF art pool is empty");
  return assets[stableHash(`${reportId}:${pageIndex}`) % assets.length];
}

export function productArtKey(productId: string, relationshipType?: string): PdfProductKey {
  if (productId === "relationship-resonance") {
    return relationshipType === "business" ? "business-relationship" : relationshipType === "other" ? "other-relationship" : "deep-relationship";
  }
  return ({
    "life-map-report": "life-map", "resilience-report": "resilience", "romance-report": "romance",
    "wealth-report": "wealth", "daily-tide-report": "daily-tide", "tarot-reading": "life-mirror",
    "qian-reading": "life-oracle",
  } as Record<string, PdfProductKey>)[productId] ?? "life-map";
}

/** Independent, text-free visual pool for the complete Life Archetype archive. */
export const WEB_ARCHETYPE_PDF_ART_POOL: PdfArtAsset[] = [
  PDF_ASSET_REGISTRY["life-map"][1], PDF_ASSET_REGISTRY["deep-relationship"][4],
  PDF_ASSET_REGISTRY.resilience[2], PDF_ASSET_REGISTRY.romance[5],
  PDF_ASSET_REGISTRY.wealth[0], PDF_ASSET_REGISTRY["daily-tide"][3],
  PDF_ASSET_REGISTRY["life-mirror"][1], PDF_ASSET_REGISTRY["life-oracle"][4],
];
