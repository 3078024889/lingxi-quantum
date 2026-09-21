import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
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
  console.error("missing env");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const incrPath = resolve(
  "content/cangxuan-feed/field-source-mind/foundry-ingest/04-seed-knowledge-incremental-web-retry.json"
);
const incr = JSON.parse(readFileSync(incrPath, "utf8"));
const sourceId = "b8a7852d-dd26-4594-9746-fda7dd49846c";

const { data: src, error: se } = await admin
  .from("cangxuan_sources")
  .select("id,title,extracted_count")
  .eq("id", sourceId)
  .eq("user_id", userId)
  .maybeSingle();
if (se) {
  console.error(se.message);
  process.exit(1);
}
if (!src) {
  console.error("source not found for user");
  process.exit(1);
}
console.log("[source]", src.id, src.title, "extracted", src.extracted_count);

let ok = 0;
let skipped = 0;
for (const item of incr) {
  const content_hash =
    item.content_hash ||
    createHash("sha256").update(`${item.category}:${item.statement}`, "utf8").digest("hex");
  const { data: existing } = await admin
    .from("cangxuan_knowledge_items")
    .select("id")
    .eq("user_id", userId)
    .eq("content_hash", content_hash)
    .maybeSingle();
  if (existing) {
    skipped++;
    continue;
  }
  const { error } = await admin.from("cangxuan_knowledge_items").insert({
    user_id: userId,
    source_id: sourceId,
    category: item.category,
    title: item.title,
    statement: String(item.statement).slice(0, 1000),
    evidence: String(item.evidence).slice(0, 1200),
    tier: item.tier || "gold",
    trainability: "trainable",
    quality_score: 0.93,
    review_status: "approved",
    content_hash,
  });
  if (error) {
    console.error(item.title, error.message);
    process.exit(1);
  }
  ok++;
}

await admin
  .from("cangxuan_sources")
  .update({ extracted_count: (src.extracted_count || 356) + ok })
  .eq("id", sourceId);

const result = { inserted: ok, skippedExisting: skipped, incrementalFile: incr.length, sourceId, at: new Date().toISOString() };
writeFileSync(
  resolve("content/cangxuan-feed/field-source-mind/foundry-ingest/05-incremental-web-retry-ingest.json"),
  JSON.stringify(result, null, 2),
  "utf8"
);
console.log(JSON.stringify(result, null, 2));
