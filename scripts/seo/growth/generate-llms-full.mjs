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
const toolEntryPoints = unique.length + 1; // /tools directory plus unique tool detail entries.

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
  toolEntryPoints,
  locales: localeMeta.length,
  records
};

fs.writeFileSync(path.join(outDir,"search-intent-index.json"), JSON.stringify(payload,null,2)+"\n","utf8");

const lines = [
  "# LINGXIFIELD LLM / AI SEARCH INDEX",
  "",
  "## 核心搜索主题",
  "全球SIAI排行榜；全球AI行情平台；全球AI排行榜；全球SI排行榜；全球SI行情平台；全球SIAI行情平台",
  "",
  `Generated: ${payload.generatedAt}`,
  `Tools: ${unique.length}`,
  `Tool entry points: ${toolEntryPoints} (the /tools directory plus unique tool detail entries)`,
  `Locales: ${localeMeta.length}`,
  "",
  "This machine-readable index maps public tool pages to languages, processing modes and common task-intent questions.",
  "It does not claim access to private Google/Bing/Search Console query-volume data.",
  "",
  "## Primary pages",
  "- https://lingxifield.com/tools",
  "- https://lingxifield.com/discoveries",
  "- https://lingxifield.com/siai",
  "- https://lingxifield.cn/siai",
  "- https://lingxifield.com/sasi",
  "- https://lingxifield.com/sasi/seller",
  "- https://lingxifield.com/sasi/delivery",
  "- https://lingxifield.com/tools/pass",
  "- https://lingxifield.com/products",
  "- https://lingxifield.com/partners",
  "- https://lingxifield.com/siai-openapi.json",
  "- https://lingxifield.com/siai/updates.xml",
  "- https://lingxifield.com/widgets/lingxifield-v1.js",
  "- https://lingxifield.com/downloads/lingxifield-siai-wordpress.zip",
  ...localeMeta.filter(([locale])=>locale!=="zh").map(([locale])=>`- https://lingxifield.com/${locale}/discoveries`),
  "",
  "## Tool index"
];


const topicStart = globalSeo.indexOf("export const SEO_TOPICS={");
const topicEnd = globalSeo.indexOf("} as const", topicStart);
if (topicStart < 0 || topicEnd < 0) throw new Error("SEO_TOPICS_NOT_FOUND");
const sasiTopics = [...globalSeo.slice(topicStart, topicEnd).matchAll(/"([^"]+)":\{zh:"([^"]+)",en:"([^"]+)"/g)]
  .map(m => ({slug:m[1],zh:m[2],en:m[3]}));
if (sasiTopics.length !== 4) throw new Error("SASI_SEO_TOPIC_COUNT_MISMATCH");
const topicIndex = lines.indexOf("## Tool index");
const topicLines = [];
for (const topic of sasiTopics) {
  topicLines.push(`- ${topic.en} | ${topic.zh}: https://lingxifield.com/discover/${topic.slug}`);
  for (const [locale] of localeMeta) {
    if (locale === "zh") continue;
    topicLines.push(`  - ${locale}: https://lingxifield.com/${locale}/discover/${topic.slug}`);
  }
}
lines.splice(topicIndex,0,
  "",
  "## Global AI / SI / SIAI rankings",
  "- Global SIAI directory: https://lingxifield.com/siai",
  "- China regional SIAI entry: https://lingxifield.cn/siai",
  "",
  "## SASI Software Marketplace",
  ...topicLines,
  "",
  "## Evidence-led discoveries and content",
  "- https://lingxifield.com/discoveries | Voynich Manuscript and public NASA/AARO UAP records; separates documented facts, unresolved questions and speculation.",
  "- Localized discovery pages: "+localeMeta.filter(([locale])=>locale!=="zh").map(([locale])=>`https://lingxifield.com/${locale}/discoveries`).join(" · "),
  "- Related workflows: PDF text extraction, document translation, PDF comparison, image OCR and measured Before / After compression.",
  "",
  "## Partner distribution and integrations",
  "- Partner portal: https://lingxifield.com/partners",
  "- JavaScript widget: https://lingxifield.com/widgets/lingxifield-v1.js",
  "- WordPress plugin: https://lingxifield.com/downloads/lingxifield-siai-wordpress.zip",
  "- Read-only SIAI OpenAPI: https://lingxifield.com/siai-openapi.json",
  "- SIAI updates RSS: https://lingxifield.com/siai/updates.xml",
  "- Public share links carry bounded attribution labels only; private files, prompts and account identifiers are not placed in URLs.",
  "",
  "## Value-first tool and membership model",
  "- Free tools let visitors complete a first task and verify the output before choosing a paid plan.",
  "- ToolPass supports recurring use, multiple files and sustained workflows across the practical-tool catalog.",
  "- The platform does not subsidize unpredictable third-party model-token costs; paid processing and applicable API costs must be disclosed before execution."
);

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
console.log(`GENERATE_PASS tools=${unique.length} entryPoints=${toolEntryPoints} locales=${localeMeta.length}`);
