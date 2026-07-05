import type { MetadataRoute } from "next";
import { NARRATIVES } from "@/lib/narratives";

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
  ];
  const now = new Date();
  return routes.map((r) => ({
    url: `${SITE}${r}`,
    lastModified: now,
    changeFrequency: r.startsWith("/learn") || r === "/glossary" ? "monthly" : "weekly",
    priority: r === "" ? 1 : r.startsWith("/learn") || r === "/glossary" ? 0.8 : 0.6,
  }));
}
