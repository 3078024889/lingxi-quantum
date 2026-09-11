"use server";

import { computeLifeMapFacts, lunarToSolar, ZODIAC_SIGNS, type BirthInput } from "@/lib/lifemap-calc";
import { computeTodayTransit, elementRelation, computeRetrogrades, dayRuler, tideLevel, nextTidePeak } from "@/lib/daily-transit";
import { PHASE_THEME, RELATION_THEME } from "@/lib/daily-horoscope-narrative";
import { getDailyFortuneContent } from "@/lib/daily-fortune-ai";


export async function readDailyPreview(input: BirthInput & { calendarType?: string }) {
  try {
    let { year, month, day } = input;
    if (![year, month, day, input.hour, input.minute].every(Number.isInteger) || year < 1 || year > new Date().getFullYear() || month < 1 || month > 12 || day < 1 || day > 31 || input.hour < 0 || input.hour > 23 || input.minute < 0 || input.minute > 59) throw Error("invalid date");
    if (input.calendarType === "lunar") ({year, month, day} = lunarToSolar(year, month, day));
    const date = new Date(0); date.setUTCFullYear(year, month - 1, day);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || date > new Date()) throw Error("invalid date");
    const facts = computeLifeMapFacts({ ...input, year, month, day });
    const sign = ZODIAC_SIGNS.find(s => s.zh === facts.sunSignZh);
    if (!sign) throw Error("missing sign");
      const transit = computeTodayTransit();
  const relation = elementRelation(transit.moonElement, sign.element);
  const retro = computeRetrogrades();
  const ruler = dayRuler();
  const tide = tideLevel(transit.moonPhaseAngle);
  const nextTide = nextTidePeak();
  const todayLabel = new Date(transit.date + "T00:00:00Z").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  // Chinese and English previews share the same deterministic date snapshot.
  const [fortuneZh, fortuneEn] = await Promise.all([
    getDailyFortuneContent({ signSlug: sign.slug, signZh: sign.zh, signEn: sign.en, transit, retro, ruler, relation, tide, nextTide, lang: "zh" }),
    getDailyFortuneContent({ signSlug: sign.slug, signZh: sign.zh, signEn: sign.en, transit, retro, ruler, relation, tide, nextTide, lang: "en" }),
  ]);
  const fallbackZh = `${PHASE_THEME[transit.moonPhaseKey].zh} ${RELATION_THEME[relation].zh}`;
  const fallbackEn = `${PHASE_THEME[transit.moonPhaseKey].en} ${RELATION_THEME[relation].en}`;

    return {preview:{sign,transit,relation,retro,ruler,tide,nextTide,todayLabel,fortuneZh,fortuneEn,fallbackZh,fallbackEn},error:null};
  } catch {
    return { preview: null, error: "请检查出生日期与时刻后重试。Please check your birth date and time." };
  }
}
