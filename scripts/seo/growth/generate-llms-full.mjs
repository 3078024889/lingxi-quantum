import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const outDir = path.join(root, "public");
fs.mkdirSync(outDir, {recursive:true});

const globalPath = path.join(root, "lib/seo/global-seo.ts");
const faqPath = path.join(root, "lib/seo/search-intent-faq.ts");
const globalSeo = fs.readFileSync(globalPath, "utf8");
const faq = fs.readFileSync(faqPath, "utf8");

const localeMeta = [
  ["zh","zh-CN","中文"],["en","en","English"],["ja","ja","日本語"],
  ["ko","ko","한국어"],["fr","fr","Français"],["de","de","Deutsch"],
  ["es","es","Español"],["pt","pt","Português"],["ar","ar","العربية"]
];

const start = globalSeo.indexOf("export const GLOBAL_TOOL_CATALOG=[");
const end = globalSeo.indexOf("] as const", start);
if (start < 0 || end < 0) throw new Error("GLOBAL_TOOL_CATALOG_NOT_FOUND");

const catalog = [...globalSeo.slice(start,end).matchAll(
  /\{slug:"([^"]+)",zh:"([^"]+)",en:"([^"]+)",mode:"([^"]+)"/g
)].map(m => ({slug:m[1],zh:m[2],en:m[3],mode:m[4]}));

const unique = [...new Map(catalog.map(x => [x.slug,x])).values()];

const faqKeys = [...faq.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map(m => m[1]);
const curated = new Set(faqKeys);

const questions = {
  zh: n => [`${n}怎么用？`,`${n}手机可以用吗？`,`${n}免费吗？`,`${n}处理安全吗？`],
  en: n => [`How do I use ${n}?`,`Can I use ${n} on my phone?`,`Is ${n} free?`,`Is ${n} safe to use?`],
  ja: n => [`${n}の使い方は？`,`${n}はスマホで使えますか？`,`${n}は無料ですか？`,`${n}は安全ですか？`],
  ko: n => [`${n} 사용 방법은?`,`휴대폰에서 ${n}을 사용할 수 있나요?`,`${n}은 무료인가요?`,`${n}은 안전한가요?`],
  fr: n => [`Comment utiliser ${n} ?`,`Puis-je utiliser ${n} sur mobile ?`,`${n} est-il gratuit ?`,`${n} est-il sûr ?`],
  de: n => [`Wie benutzt man ${n}?`,`Kann ich ${n} auf dem Handy nutzen?`,`Ist ${n} kostenlos?`,`Ist ${n} sicher?`],
  es: n => [`¿Cómo se usa ${n}?`,`¿Puedo usar ${n} en el móvil?`,`¿${n} es gratis?`,`¿Es seguro usar ${n}?`],
  pt: n => [`Como usar ${n}?`,`Posso usar ${n} no celular?`,`${n} é gratuito?`,`${n} é seguro?`],
  ar: n => [`كيف أستخدم ${n}؟`,`هل يمكن استخدام ${n} على الهاتف؟`,`هل ${n} مجاني؟`,`هل استخدام ${n} آمن؟`]
};

const records = [];
for (const tool of unique) {
  for (const [locale, hreflang, label] of localeMeta) {
    const name = locale === "zh" ? tool.zh : tool.en;
    const prefix = locale === "zh" ? "" : `/${locale}`;
    records.push({
      slug: tool.slug, locale, language: label, mode: tool.mode,
      name, url: `https://lingxifield.com${prefix}/tools/${tool.slug}`,
      canonical: `https://lingxifield.com${prefix}/tools/${tool.slug}`,
      searchIntentQuestions: questions[locale](name),
      curatedFaq: curated.has(tool.slug),
      hreflang
    });
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  source: "LINGXIFIELD SEO search-intent catalog",
  note: "Generic questions describe common task intent. Curated FAQ pages are manually authored; this file does not claim private search-volume data.",
  tools: unique.length,
  locales: localeMeta.length,
  records
};

fs.writeFileSync(path.join(outDir,"search-intent-index.json"), JSON.stringify(payload,null,2)+"\n","utf8");

const lines = [
  "# LINGXIFIELD LLM / AI SEARCH INDEX",
  "",
  `Generated: ${payload.generatedAt}`,
  `Tools: ${unique.length}`,
  `Locales: ${localeMeta.length}`,
  "",
  "This machine-readable index maps public tool pages to languages, processing modes and common task-intent questions.",
  "It does not claim access to private Google/Bing/Search Console query-volume data.",
  "",
  "## Primary pages",
  "- https://lingxifield.com/tools",
  "- https://lingxifield.com/sasi",
  "- https://lingxifield.com/products",
  "",
  "## Tool index"
];

for (const tool of unique) {
  lines.push(`- ${tool.slug} | ${tool.zh} | ${tool.en} | ${tool.mode}`);
  for (const [locale] of localeMeta) {
    const prefix = locale === "zh" ? "" : `/${locale}`;
    lines.push(`  - ${locale}: https://lingxifield.com${prefix}/tools/${tool.slug}`);
  }
}

lines.push("", "## Search-intent policy");
lines.push("- Questions are phrased around real user tasks rather than keyword stuffing.");
lines.push("- Curated FAQ content is used where first-party product knowledge exists.");
lines.push("- No claim of private search-volume data is made.");
lines.push("- The public site remains the source of truth for tool behavior, limits, processing and pricing.");
lines.push("");

fs.writeFileSync(path.join(outDir,"llms-full.txt"), lines.join("\n"), "utf8");
console.log(`GENERATE_PASS tools=${unique.length} locales=${localeMeta.length}`);
