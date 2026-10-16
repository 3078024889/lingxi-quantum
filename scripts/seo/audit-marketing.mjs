import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mustExist = [
  "package.json",
  "app/layout.tsx",
  "app/tools/[slug]/page.tsx",
  "app/[locale]/tools/[slug]/page.tsx",
  "components/seo/ToolFacts.tsx",
  "components/seo/SearchIntentFaq.tsx",
  "components/seo/ToolsIndexJsonLd.tsx",
  "components/seo/GlobalSeoJsonLd.tsx",
  "lib/seo/search-intent-faq.ts",
  "lib/seo/search-tool-metadata.ts",
  "public/llms.txt",
  "lib/seo/site-domains.ts",
];
let failed = false;
const pass = (m) => console.log(`[PASS] ${m}`);
const fail = (m) => { console.error(`[FAIL] ${m}`); failed = true; };

for (const rel of mustExist) {
  if (fs.existsSync(path.join(root, rel))) pass(rel);
  else fail(rel);
}

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const layout = read("app/layout.tsx");
const toolPage = read("app/tools/[slug]/page.tsx");
const localePage = read("app/[locale]/tools/[slug]/page.tsx");
const facts = read("components/seo/ToolFacts.tsx");
const jsonld = read("components/seo/GlobalSeoJsonLd.tsx");
const domains = read("lib/seo/site-domains.ts");
const llms = read("public/llms.txt");

if (layout.includes('href="/llms.txt"') && layout.includes('rel="describedby"')) pass("llms.txt is advertised in the document head");
else fail("missing llms.txt describedby link");

if (toolPage.includes("buildSearchOptimizedToolMetadata") && localePage.includes("buildSearchOptimizedToolMetadata")) pass("tool metadata is search-intent aware on zh + localized routes");
else fail("search metadata not wired on both tool route families");

if (facts.includes("<SearchIntentFaq")) pass("visible search-intent FAQ is wired into tool facts");
else fail("SearchIntentFaq is not wired");

if (jsonld.includes('"@type":"BreadcrumbList"') && !jsonld.includes('"@type":"FAQPage"')) pass("tool JSON-LD keeps breadcrumb/application semantics without deprecated FAQPage markup");
else fail("deprecated FAQPage markup still present or breadcrumb missing");

if (domains.includes("lingxifield.com") && domains.includes("lingxifield.cn")) pass("both public domains are declared");
else fail("two-domain configuration missing");

const locales = ["zh","en","ja","ko","fr","de","es","pt","ar"];
const seoSource = read("lib/seo/global-seo.ts");
for (const locale of locales) {
  if (new RegExp("(?:[\"']?"+locale+"[\"']?)\\s*:").test(seoSource)) pass(`locale ${locale} declared`);
  else fail(`locale ${locale} missing`);
}

const toolDirs = fs.readdirSync(path.join(root, "app/tools"), { withFileTypes: true })
  .filter(e => e.isDirectory() && e.name !== "admin")
  .map(e => e.name);
if (toolDirs.length >= 50) pass(`tool route surface detected: ${toolDirs.length} directories`);
else fail(`unexpectedly small tool route surface: ${toolDirs.length}`);

for (const u of [
  "https://lingxifield.com/tools",
  "https://lingxifield.com/sasi",
  "https://lingxifield.com/en/tools",
  "https://lingxifield.com/ja/tools",
  "https://lingxifield.com/ko/tools",
  "https://lingxifield.com/fr/tools",
  "https://lingxifield.com/de/tools",
  "https://lingxifield.com/es/tools",
  "https://lingxifield.com/pt/tools",
  "https://lingxifield.com/ar/tools",
]) {
  if (llms.includes(u)) pass(`llms entry: ${u}`);
}

if (!failed) {
  console.log(`SEO_MARKETING_AUDIT=PASS tools=${toolDirs.length} locales=${locales.length}`);
  process.exit(0);
}
console.error("SEO_MARKETING_AUDIT=FAIL");
process.exit(1);
