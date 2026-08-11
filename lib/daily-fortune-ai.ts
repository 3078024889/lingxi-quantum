import type { TodayTransit, RetrogradeInfo, ElementRelation, NextTidePeak } from "@/lib/daily-transit";
import { generateDailyTidePreview } from "@/lib/daily-tide-knowledge";

// Kept under the historical filename to avoid a broad import migration.
// The implementation is deterministic and performs no model, network, or database call.
export async function getDailyFortuneContent(params: {
  signSlug: string;
  signZh: string;
  signEn: string;
  transit: TodayTransit;
  retro: RetrogradeInfo;
  ruler: { zh: string; en: string };
  relation: ElementRelation;
  tide: number;
  nextTide: NextTidePeak;
  lang: "zh" | "en";
}): Promise<string> {
  return generateDailyTidePreview({
    lang: params.lang,
    generatedDate: params.transit.date,
    transit: params.transit,
    relation: params.relation,
    tide: params.tide,
    nextTurningPoint: params.nextTide,
  });
}