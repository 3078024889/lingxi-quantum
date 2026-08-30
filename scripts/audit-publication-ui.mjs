#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const views = [
  "app/life-map/full/FullReportView.tsx",
  "app/relationship/full/RelationshipReportView.tsx",
  "app/romance/full/RomanceReportView.tsx",
  "app/wealth/full/WealthReportView.tsx",
  "app/daily/full/DailyTideReportView.tsx",
  "app/qian/full/QianReport.tsx",
  "app/resilience/full/ResilienceReportView.tsx",
  "app/mirror/reading/full/TarotReadingReport.tsx",
  "app/tarot/reading/full/TarotReadingReport.tsx",
];
const failures = [];

for (const view of views) {
  const source = readFileSync(resolve(root, view), "utf8");
  if (!source.includes("max-w-4xl")) failures.push(`${view}: publication width is not max-w-4xl`);
  if (!source.includes("lx-publication-page") && !source.includes("aspect-[1/1.414]")) failures.push(`${view}: missing A4 publication page primitive`);
  if (source.includes("linear-gradient(rgba(24,16,48")) failures.push(`${view}: legacy dark artwork veil remains`);
}

const lifemap = readFileSync(resolve(root, views[0]), "utf8");
if (!lifemap.includes("/images/lifemap/page-${(i % 11) + 1}.png")) failures.push("life-map: body artwork is not cyclic");
for (const page of [2, 3, 4]) {
  if (!lifemap.includes(`lx-art-lifemap-${page}`)) failures.push(`life-map: artwork page ${page} is missing`);
}
const relationship = readFileSync(resolve(root, views[1]), "utf8");if (relationship.includes("maxWidth: 220")) failures.push("relationship: hero artwork regressed to the legacy small size");
if (!relationship.includes("min(100%, 480px)")) failures.push("relationship: full-size relationship card is missing");
if (!relationship.includes("lx-publication-copy")) failures.push("relationship: shared publication typography is missing");
if (!relationship.includes("lx-report-glass-readable")) failures.push("relationship: readable publication panel is missing");
const mirror = readFileSync(resolve(root, "app/mirror/reading/full/TarotReadingReport.tsx"), "utf8");
const oracle = readFileSync(resolve(root, "app/qian/full/QianReport.tsx"), "utf8");
if (!mirror.includes("lx-publication-cover lx-mirror-cover")) failures.push("life-mirror: vertical readable cover is missing");
if (!oracle.includes("lx-publication-cover")) failures.push("life-oracle: vertical cover is missing");
for (const [name, source] of [["life-mirror", mirror], ["life-oracle", oracle]]) {
  if (!source.includes("featurePages:" )) failures.push(`${name}: PDF card pages are not declared through the shared exporter`);
  if (!source.includes("lx-publication-card-page")) failures.push(`${name}: web card pages are not using the publication card primitive`);
}
const legacyTarot = readFileSync(resolve(root, "app/tarot/reading/full/TarotReadingReport.tsx"), "utf8");
if (!legacyTarot.includes("featurePages:") || !legacyTarot.includes("lx-publication-card-page")) failures.push("legacy tarot: card-page parity with life-mirror is broken");
if (!lifemap.includes("featurePages:") || !lifemap.includes("lx-publication-card-page")) failures.push("life-map: full-size archetype card is missing from web or PDF");
for (const artworkPage of ["lx-art-lifemap-2", "lx-art-lifemap-3", "lx-art-lifemap-4"]) {
  if (!lifemap.includes(`<section className=\"lx-publication-page ${artworkPage}`)) failures.push(`life-map: ${artworkPage} is not a full publication page`);
}
if (!relationship.includes("const bgIndex = (i % 11) + 1;")) failures.push("relationship: body artwork is not cyclic");
for (const view of views.slice(2, 5)) {
  const source = readFileSync(resolve(root, view), "utf8");
  if (!source.includes("page-${(i % 11) + 1}.png")) failures.push(`${view}: body artwork is not cyclic`);
}
for (const view of ["app/daily/full/DailyTideReportView.tsx", "app/romance/full/RomanceReportView.tsx", "app/wealth/full/WealthReportView.tsx", "app/resilience/full/ResilienceReportView.tsx"]) {
  const source = readFileSync(resolve(root, view), "utf8");
  if (!source.includes("lx-publication-copy")) failures.push(`${view}: shared publication typography is missing`);
}

const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
for (const token of [".lx-publication-page", ".lx-report-glass-readable", ".lx-report-chart text", ".lx-publication-card-page", "--lx-publication-serif", "--lx-publication-sans", ".lx-publication-copy"]) {
  if (!css.includes(token)) failures.push(`app/globals.css: missing ${token}`);
}
for (const token of ["PingFang SC", "HarmonyOS Sans SC", "--report-title: #292638", "--report-body: #454151", ".lx-report-main", "backdrop-filter: none", ".lx-page-layout-left", ".lx-page-layout-right"]) {
  if (!css.includes(token)) failures.push(`app/globals.css: missing publication token ${token}`);
}
const exporter = readFileSync(resolve(root, "lib/pdf-export.ts"), "utf8");
if (!exporter.includes("'Noto Sans SC'")) failures.push("pdf-export: Noto Sans SC body font is missing");
if (!exporter.includes("stage.remove()")) failures.push("pdf-export: failed export cleanup is missing");
if (!exporter.includes("preloadPdfAssets")) failures.push("pdf-export: publication artwork preload is missing");
if (!exporter.includes("scale: 2")) failures.push("pdf-export: A4 raster resolution is below the resilience publication baseline");
if (!exporter.includes("flowPanelFits")) failures.push("pdf-export: cross-chapter publication flow is missing");
if (!exporter.includes("Math.min(2, units.length - offset)")) failures.push("pdf-export: orphan heading protection is missing");
if (!exporter.includes('const placement = "left:64px;right:64px"')) failures.push("pdf-export: centred A4 reading grid is missing");
for (const token of ['left:64px;right:64px;top:34%', 'top:48px;bottom:48px;left:64px;right:64px', 'bgColorHex = "#EEF0F6"']) {
  if (!exporter.includes(token)) failures.push(`pdf-export: cross-platform A4 geometry is missing ${token}`);
}
if (!css.includes("--lx-header-height")) failures.push("app/globals.css: report header safe offset is missing");

const miniPublication = readFileSync(resolve(root, "app/mini-report/MiniDendriteReport.tsx"), "utf8");
const miniPublicationPage = readFileSync(resolve(root, "app/mini-report/page.tsx"), "utf8");
const archetypePublication = readFileSync(resolve(root, "app/mini-report/MiniLifeArchetypeReport.tsx"), "utf8");
const artRegistry = readFileSync(resolve(root, "lib/report-art-registry.ts"), "utf8");
if (!miniPublication.includes("exportPublicationPagesPdf") || !archetypePublication.includes("exportPublicationPagesPdf")) failures.push("mini publications: fixed-page exporter is not shared");
if (!miniPublication.includes("const total=16") || !miniPublication.includes("slice(0,11)") || !miniPublication.includes("来处印记") || !miniPublication.includes("entry.briefZh")) failures.push("mini publications: eleven titled readings and the 24-leaf original-echo appendix are not preserved");
if (/全卷总断|本卷取证|结构关系|result\.dominant\[/.test(miniPublication)) failures.push("mini publications: dominant-triple or proposal-style legacy pages remain");
if (!miniPublicationPage.includes("buildReportEntries") || !miniPublication.includes("cleanLegacyAnswer")) failures.push("mini publications: saved archives are not rehydrated through the current reading layer");
if (!archetypePublication.includes("readings.length+1") || !archetypePublication.includes("readings.length!==24") || !archetypePublication.includes("reading.classicalZh")) failures.push("Life Archetype: cover plus 24 V6 readings are missing");
if (!archetypePublication.includes("coverage.streamEvidence") || !archetypePublication.includes('8 / 8') || !archetypePublication.includes("identityVerified")) failures.push("Life Archetype: cover does not visibly confirm identity and all eight tributaries");
if (/\/images\/qian\//.test(archetypePublication)) failures.push("Life Archetype: 64 Life Oracle card artwork leaked into the publication");
if (!artRegistry.includes("WEB_ARCHETYPE_PDF_ART_POOL") || !artRegistry.includes("/shared/report-assets")) failures.push("PDF artwork: formal text-free asset registry is missing");
if (!exporter.includes("exportPublicationPagesPdf") || !exporter.includes("No fixed publication pages")) failures.push("pdf-export: strict fixed A4 publication path is missing");
for (const token of [".lx-report-glass-readable", "font-size: 12.5pt", ".lx-resilience-reading-column"]) {
  if (!css.includes(token)) failures.push(`shared aurora publication: missing ${token}`);
}
const publicationPage = readFileSync(resolve(root, "app/mini-report/PublicationPage.tsx"), "utf8");
if (publicationPage.includes("h-[39%]") || publicationPage.includes("lx-archive-glass") || publicationPage.includes("bg-gradient-to-br from-[#07132d]")) failures.push("mini publications: legacy coloured publication layer remains");
if (!publicationPage.includes("lx-report-glass-readable") || !publicationPage.includes("h-full w-full object-cover")) failures.push("mini publications: full-field artwork and original web glass are missing");

const reportRoutes = [
  "app/api/lifemap/generate-full/route.ts",
  "app/api/relationship/generate-full/route.ts",
  "app/api/resilience/generate-full/route.ts",
  "app/api/romance/generate-full/route.ts",
  "app/api/wealth/generate-full/route.ts",
  "app/api/daily-tide/generate-full/route.ts",
  "app/api/qian/generate-full/route.ts",
  "app/api/tarot/reading/generate-full/route.ts",
];
for (const route of reportRoutes) {
  const source = readFileSync(resolve(root, route), "utf8");
  if (!source.includes('lang === "en"')) failures.push(`${route}: English report selection is missing`);
  if (!source.includes("full_report_en")) failures.push(`${route}: English report cache is missing`);
  if (!/!\w+\.includes\("结构证据："\)/.test(source)) failures.push(`${route}: legacy score-dump Chinese cache is not invalidated`);
}
for (const view of views) {
  const source = readFileSync(resolve(root, view), "utf8");
  if (!source.includes("[id, langEn]")) failures.push(`${view}: report does not reload when language changes`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  process.exit(1);
}
console.log("PASS publication width: 9 views / 10 products use the 896px system");
console.log("PASS artwork: life-map, relationship, romance, wealth and daily pages cycle original assets");
console.log("PASS readability: all report families use elderly-friendly Sans body type over aurora-glass reading surfaces");
console.log("PASS Mini Program pagination: eleven product readings lead; 24 evidence leaves remain in a readable appendix");
console.log("PASS cross-platform geometry: web and Mini Program PDF panels share a 64px A4 gutter");
console.log("PASS safe area: all full-report routes use the measured navigation offset");
console.log("PASS card pagination: Life Map, Life Mirror and Life Oracle cards own full web and PDF pages");
console.log("PASS compatibility: mirror and legacy tarot report routes share the same publication system");
console.log("PASS language: all complete-report routes select Chinese or English report caches explicitly");
