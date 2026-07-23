import type { MetadataRoute } from "next";
import { NARRATIVES } from "@/lib/narratives";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";

const SITE = "https://lingxifield.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/learn",
    "/learn/manifestation", "/learn/manifestation-methods", "/learn/manifestation-not-working",
    "/learn/manifestation-signs", "/learn/manifestation-journal", "/learn/manifest-money",
    "/learn/manifest-person", "/learn/manifest-love", "/learn/method-369", "/learn/affirmations", "/learn/dream-same-person", "/learn/twin-flame", "/learn/inner-friction", "/learn/what-is-consciousness", "/learn/letting-go", "/learn/angel-numbers", "/learn/emptiness", "/learn/energy-drain",
    "/narrative", ...NARRATIVES.map((n) => `/narrative/${n.slug}`),
    "/learn/moon-manifestation", "/learn/law-of-attraction-vs", "/learn/subconscious-power",
    "/learn/dream", "/learn/dream-symbols", "/learn/more-dream-meanings", "/learn/recurring-dreams",
    "/learn/lucid-dreaming", "/learn/remember-dreams", "/learn/sleep-paralysis", "/learn/dreams-premonition",
    "/learn/wingmakers", "/learn/higher-self", "/learn/how-to-meditate", "/learn/raise-frequency",
    "/learn/chakras", "/learn/synchronicity", "/learn/awakening",
    "/glossary", "/dream", "/live-as", "/practice",
    "/practice/breath", "/practice/heart-reset", "/practice/ascending-heart", "/practice/intuition",
    "/gate/origin", "/gate/relation", "/gate/wealth", "/gate/health", "/gate/mind", "/gate/destiny",
    "/membership",
    // 这三个是"场域精测"产品页——之前一直没被收进sitemap，对搜索引擎
    // 来说等于不存在，跟"要方便浏览器检索引流"这条需求是矛盾的，顺手补上。
    "/life-map", "/relationship", "/resilience", "/romance", "/daily", "/tarot", "/tarot/reading", "/tarot/daily", "/qian", "/terms", "/privacy", "/refunds",
    // 十二星座各自的每日运势页——每一个都对应"今天XX座运势"这种真实
    // 高搜索量的查询意图，单独收录进sitemap，而不是只收一个/daily
    // 入口，更容易被搜索引擎索引到具体星座的那个词。
    ...ZODIAC_SIGNS.map((s) => `/daily/${s.slug}`),
  ];
  const now = new Date();
  return routes.map((r) => ({
    url: `${SITE}${r}`,
    lastModified: now,
    changeFrequency: r.startsWith("/learn") || r === "/glossary" ? "monthly" : "weekly",
    priority: r === "" ? 1 : r.startsWith("/learn") || r === "/glossary" ? 0.8 : 0.6,
  }));
}
