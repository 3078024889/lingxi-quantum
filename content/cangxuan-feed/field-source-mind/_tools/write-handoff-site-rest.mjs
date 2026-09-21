import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "site-rest");
const SYNC = path.join(WORK, "sync-with-ershiwatt");
const cov = JSON.parse(fs.readFileSync(path.join(WORK, "12-site-rest-coverage.json"), "utf8"));

const read = cov.results.filter((r) => r.status === "READ");
const thin = cov.results.filter((r) => String(r.status).startsWith("THIN") && r.status !== "THIN/MISS");
const miss = cov.results.filter((r) => r.status === "MISS" || r.status === "THIN/MISS");

const lines = [];
lines.push("# handoff → 二十瓦特 · site-rest");
lines.push("");
lines.push("Generated: " + new Date().toISOString() + " UTC (Asia/Shanghai = UTC+8)");
lines.push("");
lines.push("Full-text site page bodies only (chrome stripped). Paths relative to field-source-mind/.");
lines.push("");
lines.push("## READ (>=2000 chars)");
lines.push("");
for (const r of read.sort((a, b) => (b.chars || 0) - (a.chars || 0))) {
  const f = `extracts/site-rest/${r.id}.txt`;
  lines.push(`- [${r.chars} chars] \`${f}\` — ${(r.pageTitle || r.title || r.id).replace(/\n/g, " ")}`);
}
lines.push("");
lines.push("## THIN (400–1999)");
lines.push("");
for (const r of thin.sort((a, b) => (b.chars || 0) - (a.chars || 0))) {
  lines.push(`- [${r.chars} chars] \`${r.id}\` — ${r.pageTitle || r.title}`);
}
lines.push("");
lines.push("## MISS / THIN-MISS");
lines.push("");
for (const r of miss) {
  lines.push(`- [${r.chars || 0}] ${r.id} — ${r.title || ""} ${r.notes || r.error || ""}`);
}
lines.push("");
lines.push("## Yale Interview");
lines.push(`- **${cov.yale.status}**: ${cov.yale.notes}`);
lines.push("");
lines.push("## Foundry");
lines.push("- incremental chunks: `foundry-ingest/04-seed-knowledge-incremental-site-rest-fulltext.json`");
lines.push("- ingest result: `foundry-ingest/05-incremental-site-rest-fulltext-ingest.json` (may still be writing)");
lines.push("- sourceId: b8a7852d-dd26-4594-9746-fda7dd49846c");
lines.push("- mode: fulltext_chunk_1k real body slices (statement<=900)");
lines.push("");
lines.push("## Summary");
lines.push(JSON.stringify(cov.summary, null, 2));
lines.push("");
lines.push("No 底座 invention. No git push. Priority READ set left intact; this is remaining allowlisted CN site bodies.");
lines.push("");

const handoffPath = path.join(SYNC, "handoff-site-rest-fulltext.md");
fs.writeFileSync(handoffPath, lines.join("\n"), "utf8");

// also append short note to out-to-ershiwatt
const outDir = path.join(SYNC, "out-to-ershiwatt");
fs.mkdirSync(outDir, { recursive: true });
const stamp = "2026-09-10-site-rest-handoff.md";
fs.writeFileSync(path.join(outDir, stamp), lines.join("\n"), "utf8");

// copy READ extracts listing into sync folder pointer file
const ptr = path.join(SYNC, "site-rest-extracts");
fs.mkdirSync(ptr, { recursive: true });
fs.writeFileSync(
  path.join(ptr, "README.md"),
  "Site-rest extracts live at ../../extracts/site-rest/\nSee ../handoff-site-rest-fulltext.md for titles+char counts.\n",
  "utf8"
);

// update 04-progress.md append
const progPath = path.join(WORK, "04-progress.md");
let prog = fs.existsSync(progPath) ? fs.readFileSync(progPath, "utf8") : "";
const note = [
  "",
  "## site-rest pass (UTC+8 evening)",
  `- sitemap: 11-site-rest-sitemap.json / link-labels`,
  `- coverage: 12-site-rest-coverage.md`,
  `- extracts/site-rest/ READ=${cov.summary.READ} THIN=${cov.summary.THIN} MISS=${cov.summary.MISS} readChars=${cov.summary.readChars}`,
  `- 耶鲁大访谈: MISS (honest)`,
  `- Foundry site-rest fulltext chunks prepared; ingest to source b8a7852d…`,
  `- handoff: sync-with-ershiwatt/handoff-site-rest-fulltext.md`,
  "",
].join("\n");
if (!prog.includes("site-rest pass")) {
  fs.writeFileSync(progPath, prog.trimEnd() + "\n" + note, "utf8");
}

console.log("handoff written", handoffPath);
console.log("READ", read.length, "THIN", thin.length, "MISS", miss.length);
