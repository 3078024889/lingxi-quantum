#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

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

const slug = process.argv[2] || "renshin-distill";
const packRoot = resolve(process.cwd(), "content/cangxuan-feed", slug);
const ingestDir = join(packRoot, "foundry-ingest");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.CANGXUAN_SEED_USER_ID;
const die = (m) => { console.error(m); process.exit(1); };
if (!existsSync(ingestDir)) die("missing " + ingestDir);
if (!url || !key || !userId) die("missing env");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const knowledge = JSON.parse(readFileSync(join(ingestDir, "04-seed-knowledge.json"), "utf8"));
const readme = existsSync(join(packRoot, "00-README.md"))
  ? readFileSync(join(packRoot, "00-README.md"), "utf8")
  : "renshin distill pack";
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const contentHash = sha256(readme + JSON.stringify(knowledge.map((k) => k.content_hash).sort()));

let sourceId;
const existing = await admin.from("cangxuan_sources").select("id").eq("user_id", userId).eq("content_hash", contentHash).maybeSingle();
if (existing.data) {
  sourceId = existing.data.id;
  console.log("[source] dedup", sourceId);
} else {
  const { data, error } = await admin.from("cangxuan_sources").insert({
    user_id: userId,
    title: "通识蒸馏·人心库 V1",
    source_type: "teacher_synthetic",
    rights_scope: "opted_in_training",
    trainability: "trainable",
    license_metadata: { pack: "renshin-distill", kind: "heart-mind", version: "V1" },
    consent_version: "cangxuan-training-consent-v1",
    content_hash: contentHash,
    character_count: Math.min(200000, Math.max(1, readme.length + knowledge.length * 80)),
    extracted_count: knowledge.length,
  }).select("id").single();
  if (error) die(error.message);
  sourceId = data.id;
  console.log("[source]", sourceId);
}

let ok = 0;
for (const item of knowledge) {
  const { error } = await admin.from("cangxuan_knowledge_items").upsert({
    user_id: userId,
    source_id: sourceId,
    category: item.category,
    title: item.title,
    statement: String(item.statement).slice(0, 1000),
    evidence: String(item.evidence).slice(0, 1200),
    tier: item.tier || "gold",
    trainability: "trainable",
    quality_score: 0.92,
    review_status: "approved",
    content_hash: item.content_hash || sha256(`${item.category}:${item.statement}`),
  }, { onConflict: "user_id,content_hash", ignoreDuplicates: true });
  if (error) die(`${item.title}: ${error.message}`);
  ok++;
}
console.log(`[knowledge] ${ok}/${knowledge.length}`);
console.log("[done] renshin pack in Foundry");
