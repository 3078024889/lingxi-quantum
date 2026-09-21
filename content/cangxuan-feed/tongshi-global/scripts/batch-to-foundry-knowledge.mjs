#!/usr/bin/env node
/** Convert tongshi batch JSON → foundry-ingest/04-seed-knowledge.json */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const batchPath = process.argv[2] || resolve(__dirname, "../batches/batch-multi-002.json");
const outDir = process.argv[3] || resolve(__dirname, "../batches/foundry-ingest-multi-002");
const batch = JSON.parse(readFileSync(batchPath, "utf8"));
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const catMap = { gold: "RULE", silver: "SCRIPT", bronze: "SCRIPT" };
const knowledge = (batch.items || []).map((it) => {
  const category = it.tier === "gold" ? "RULE" : it.tier === "silver" ? "SCRIPT" : "SCRIPT";
  const statement = String(it.proposition).slice(0, 1000);
  const evidence = `${it.evidence || ""} | ${it.source_url || ""} | disc=${it.discipline}`.slice(0, 1200);
  return {
    category,
    title: String(it.source_title || it.id || "tongshi").slice(0, 120),
    statement,
    evidence,
    tier: it.tier === "gold" ? "gold" : it.tier === "silver" ? "silver" : "bronze",
    trainability: "trainable",
    review_status: "approved",
    content_hash: it.content_hash || sha(`${category}:${statement}`),
    domain: `tongshi-${it.discipline || "general"}`,
  };
});
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "04-seed-knowledge.json"), JSON.stringify(knowledge, null, 2));
writeFileSync(resolve(outDir, "00-manifest.json"), JSON.stringify({ pack: batch.batch, items: knowledge.length, fetched_at: batch.fetched_at }, null, 2));
console.log(`[ok] ${knowledge.length} → ${outDir}`);
