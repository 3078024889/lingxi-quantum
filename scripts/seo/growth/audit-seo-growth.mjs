import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
let failed = false;
const pass = m => console.log(`[PASS] ${m}`);
const fail = m => { console.error(`[FAIL] ${m}`); failed = true; };
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const required = [
  "package.json",
  "lib/seo/global-seo.ts",
  "lib/seo/search-intent-faq.ts",
  "public/llms.txt",
  "scripts/seo/growth/audit-seo-growth.mjs",
  "scripts/seo/growth/generate-llms-full.mjs",
  "scripts/seo/growth/indexnow-submit.mjs"
];

for (const rel of required) exists(rel) ? pass(rel) : fail(rel);

if (!exists("package.json")) process.exit(1);
const pkg = JSON.parse(read("package.json"));
for (const key of ["seo:growth:audit","seo:growth:generate","seo:growth:indexnow"]) {
  pkg.scripts?.[key] ? pass(`package script ${key}`) : fail(`package script ${key} missing`);
}

const globalSeo = read("lib/seo/global-seo.ts");
const faq = read("lib/seo/search-intent-faq.ts");
const locales = ["zh","en","ja","ko","fr","de","es","pt","ar"];
for (const locale of locales) {
  new RegExp(`["']?${locale}["']?\\s*:`).test(globalSeo)
    ? pass(`locale ${locale}`)
    : fail(`locale ${locale} missing`);
}

const catalogStart = globalSeo.indexOf("export const GLOBAL_TOOL_CATALOG=[");
const catalogEnd = globalSeo.indexOf("] as const", catalogStart);
const catalogSlice = catalogStart >= 0 && catalogEnd > catalogStart
  ? globalSeo.slice(catalogStart, catalogEnd)
  : "";
const slugs = [...catalogSlice.matchAll(/\{slug:"([^"]+)"/g)].map(m => m[1]);
const uniqueSlugs = [...new Set(slugs)];
if (uniqueSlugs.length >= 90) pass(`SEO catalog tools=${uniqueSlugs.length}`);
else fail(`SEO catalog unexpectedly small=${uniqueSlugs.length}`);

const faqOverrides = [...faq.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map(m => m[1]);
if (faqOverrides.length >= 10) pass(`curated search-intent FAQ overrides=${faqOverrides.length}`);
else fail(`curated FAQ override coverage low=${faqOverrides.length}`);

const llmsFull = path.join(root, "public/llms-full.txt");
const index = path.join(root, "public/search-intent-index.json");
exists("public/llms-full.txt") ? pass("public/llms-full.txt") : fail("public/llms-full.txt missing");
exists("public/search-intent-index.json") ? pass("public/search-intent-index.json") : fail("public/search-intent-index.json missing");

if (exists("public/search-intent-index.json")) {
  try {
    const data = JSON.parse(fs.readFileSync(index, "utf8"));
    if (data.tools >= 90 && data.locales === 9) pass(`search-intent index tools=${data.tools} locales=${data.locales}`);
    else fail("search-intent index counts");
  } catch { fail("search-intent-index.json invalid JSON"); }
}

if (!failed) {
  console.log(`SEO_GROWTH_AUDIT=PASS tools=${uniqueSlugs.length} locales=${locales.length}`);
  process.exit(0);
}
console.error("SEO_GROWTH_AUDIT=FAIL");
process.exit(1);
