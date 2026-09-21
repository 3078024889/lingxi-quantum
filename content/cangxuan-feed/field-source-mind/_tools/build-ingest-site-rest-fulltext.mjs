import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "site-rest");
const FOUNDRY = path.join(WORK, "foundry-ingest");
const ROOT = path.resolve(WORK, "../../.."); // lingxi-quantum

const STATEMENT_MAX = 900;
const OVERLAP = 120;

function sha256(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function stripHeader(raw) {
  const m = raw.match(/^TITLE:.*\nSOURCE:.*\nCHARS:.*\nSTATUS:.*\n\n([\s\S]*)$/);
  return m ? m[1] : raw;
}

function chunkBody(text, max = STATEMENT_MAX, overlap = OVERLAP) {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  if (t.length <= max) return [t];
  const chunks = [];
  let i = 0;
  while (i < t.length) {
    let end = Math.min(t.length, i + max);
    if (end < t.length) {
      // prefer break at paragraph / sentence
      const window = t.slice(i, end);
      let br = window.lastIndexOf("\n\n");
      if (br < max * 0.4) br = window.lastIndexOf("\n");
      if (br < max * 0.4) br = Math.max(window.lastIndexOf("。"), window.lastIndexOf("！"), window.lastIndexOf("？"), window.lastIndexOf("."));
      if (br >= max * 0.4) end = i + br + 1;
    }
    const piece = t.slice(i, end).trim();
    if (piece) chunks.push(piece);
    if (end >= t.length) break;
    i = Math.max(i + 1, end - overlap);
  }
  return chunks;
}

const cov = JSON.parse(fs.readFileSync(path.join(WORK, "12-site-rest-coverage.json"), "utf8"));
const readItems = cov.results.filter((r) => r.status === "READ" && r.id !== "yale_interview");

const incremental = [];
for (const rec of readItems) {
  const fp = path.join(OUT, rec.id + ".txt");
  if (!fs.existsSync(fp)) continue;
  const raw = fs.readFileSync(fp, "utf8");
  const body = stripHeader(raw);
  // prefer CHARS from file body length
  const bodyChars = body.length;
  if (bodyChars < 2000) continue;
  const title = rec.pageTitle || rec.title || rec.id;
  const parts = chunkBody(body);
  parts.forEach((statement, idx) => {
    const titlePart = `${title} ·全文${idx + 1}`;
    const evidence = `fulltext fragment extracts/site-rest/${rec.id}.txt body_chars=${bodyChars} part=${idx + 1}/${parts.length}`;
    const item = {
      category: "SCRIPT",
      title: titlePart.slice(0, 200),
      statement,
      evidence: evidence.slice(0, 2000),
      tier: "gold",
      trainability: "trainable",
      review_status: "approved",
      content_hash: sha256(`SCRIPT:${statement}`),
      domain: "field-source-site-rest-fulltext",
      sourceFile: rec.id + ".txt",
      bucket: "site-rest",
      rightsScope: "licensed_open",
      ingestMode: "fulltext_chunk_1k",
      sourceUrl: rec.url || "",
    };
    incremental.push(item);
  });
}

const incrPath = path.join(FOUNDRY, "04-seed-knowledge-incremental-site-rest-fulltext.json");
fs.writeFileSync(incrPath, JSON.stringify(incremental, null, 2), "utf8");
console.log("chunks", incremental.length, "from READ files", readItems.length);
console.log("wrote", incrPath);

// --- ingest ---
function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.CANGXUAN_SEED_USER_ID;
if (!url || !key || !userId) {
  console.error("missing env", { url: !!url, key: !!key, userId: !!userId });
  process.exit(1);
}

// resolve supabase-js from project root
let createClient;
try {
  ({ createClient } = require(path.join(ROOT, "node_modules/@supabase/supabase-js")));
} catch {
  ({ createClient } = await import("@supabase/supabase-js"));
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const sourceId = "b8a7852d-dd26-4594-9746-fda7dd49846c";

const { data: src, error: se } = await admin
  .from("cangxuan_sources")
  .select("id,title,extracted_count")
  .eq("id", sourceId)
  .eq("user_id", userId)
  .maybeSingle();
if (se) { console.error(se.message); process.exit(1); }
if (!src) { console.error("source not found"); process.exit(1); }
console.log("[source]", src.id, src.title, "extracted", src.extracted_count);

let ok = 0, skipped = 0, errors = 0;
for (const item of incremental) {
  const content_hash = item.content_hash;
  const { data: existing } = await admin
    .from("cangxuan_knowledge_items")
    .select("id")
    .eq("user_id", userId)
    .eq("content_hash", content_hash)
    .maybeSingle();
  if (existing) { skipped++; continue; }
  const { error } = await admin.from("cangxuan_knowledge_items").insert({
    user_id: userId,
    source_id: sourceId,
    category: item.category || "SCRIPT",
    title: String(item.title || "").slice(0, 200),
    statement: String(item.statement || "").slice(0, 1000),
    evidence: String(item.evidence || "").slice(0, 2000),
    tier: item.tier || "gold",
    trainability: "trainable",
    quality_score: 0.95,
    review_status: "approved",
    content_hash,
  });
  if (error) {
    errors++;
    if (errors <= 8) console.error("ERR", item.title, error.message);
    continue;
  }
  ok++;
  if (ok % 50 === 0) console.log("inserted", ok);
}

await admin
  .from("cangxuan_sources")
  .update({ extracted_count: (src.extracted_count || 0) + ok })
  .eq("id", sourceId);

const result = {
  inserted: ok,
  skippedExisting: skipped,
  errors,
  incrementalFile: incremental.length,
  sourceId,
  mode: "site_rest_fulltext_chunks",
  at: new Date().toISOString(),
};
fs.writeFileSync(path.join(FOUNDRY, "05-incremental-site-rest-fulltext-ingest.json"), JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
