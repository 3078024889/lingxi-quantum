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
const relationship = readFileSync(resolve(root, views[1]), "utf8");
if (!relationship.includes("const bgIndex = (i % 11) + 1;")) failures.push("relationship: body artwork is not cyclic");
for (const view of views.slice(2, 5)) {
  const source = readFileSync(resolve(root, view), "utf8");
  if (!source.includes("page-${(i % 11) + 1}.png")) failures.push(`${view}: body artwork is not cyclic`);
}

const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
for (const token of [".lx-publication-page", ".lx-report-glass-readable", ".lx-report-chart text"]) {
  if (!css.includes(token)) failures.push(`app/globals.css: missing ${token}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  process.exit(1);
}
console.log("PASS publication width: 9 views / 10 products use the 896px system");
console.log("PASS artwork: life-map, relationship, romance, wealth and daily pages cycle original assets");
console.log("PASS readability: transparent glass and chart contrast primitives are present");
console.log("PASS compatibility: mirror and legacy tarot report routes share the same publication system");