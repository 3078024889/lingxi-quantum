import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { NARRATIVES } from "@/lib/narratives";
import { ZODIAC_SIGNS } from "@/lib/lifemap-calc";

export const dynamic = "force-dynamic";

// v250：之前这里写死SITE = "https://lingxifield.com"，但lingxifield.cn
// 也在通过阿里云CDN提供同一套内容——搜索引擎的sitemap协议要求，一份
// sitemap里列出的网址，必须跟这份sitemap文件自己所在的域名一致，
// 不能跨域名列（这是sitemaps.org规范本身的要求，不是某家搜索引擎
// 特别刁难）。之前.cn那边访问 /sitemap.xml，看到的却全是.com开头的
// 网址，Google报"站点地图地址无效"、必应报"源URL不是网站的一部分"，
// 都是在说这同一件事。这次改成：sitemap生成的时候，读取这次请求
// 实际是从哪个域名进来的，就用哪个域名生成里面的网址——.com访问看到
// 全部是.com的链接，.cn访问看到全部是.cn的链接，两边都能各自通过
// 校验。
async function resolveSite(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host") || "";
    if (host.includes("lingxifield.cn")) return "https://lingxifield.cn";
  } catch {
    // headers() 在某些静态预渲染场景下可能不可用，安全兜底回退到.com
  }
  return "https://lingxifield.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = await resolveSite();
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
    "/life-map", "/relationship", "/resilience", "/romance", "/daily", "/tarot", "/tarot/reading", "/tarot/daily", "/qian", "/terms", "/privacy", "/refunds", "/about",
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
