#!/usr/bin/env node
/**
 * Ingest a CangXuan series pack from content/cangxuan-feed/<slug>/foundry-ingest
 * into Supabase Foundry tables (service role).
 *
 * Usage (from repo root):
 *   node scripts/ingest-cangxuan-series-pack.mjs luoyun-xiaoweiba
 *
 * Env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CANGXUAN_SEED_USER_ID  (uuid of the Lingxi Field owner account)
 */
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

const slug = process.argv[2] || "luoyun-xiaoweiba";
const packRoot = resolve(process.cwd(), "content/cangxuan-feed", slug, "foundry-ingest");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.CANGXUAN_SEED_USER_ID;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

/** DB check: ^[A-Z0-9_]{3,64}$ — pad short keys */
function normalizeKey(raw) {
  let k = String(raw || "").toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (k.length < 3) k = (k + "___").slice(0, 3);
  return k.slice(0, 64);
}

if (!existsSync(packRoot)) die(`Pack not found: ${packRoot}`);
if (!url || !key) die("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) die("Set CANGXUAN_SEED_USER_ID to your account UUID in .env.local");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const readJson = (name) => JSON.parse(readFileSync(join(packRoot, name), "utf8"));

const characters = readJson("01-characters.json");
const events = readJson("02-continuity-events.json");
const imports = readJson("03-episode-imports.json");
const knowledge = readJson("04-seed-knowledge.json");

function sha256(s) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

const keyToId = {};
const aliasToNorm = {};

console.log(`[ingest] pack=${slug} user=${userId}`);

for (const c of characters) {
  const raw = c.characterKey;
  const characterKey = normalizeKey(raw);
  aliasToNorm[raw] = characterKey;
  aliasToNorm[characterKey] = characterKey;
  const { data, error } = await admin
    .from("cangxuan_characters")
    .upsert(
      {
        user_id: userId,
        character_key: characterKey,
        display_name: c.displayName,
        permanent_identity: c.permanentIdentity,
        identity_version: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,character_key,identity_version" }
    )
    .select("id,character_key")
    .single();
  if (error) die(`character ${characterKey}: ${error.message}`);
  keyToId[characterKey] = data.id;
  keyToId[raw] = data.id;
  console.log(`[character] ${raw} -> ${characterKey} -> ${data.id}`);
}

const seriesBody = readFileSync(resolve(process.cwd(), "content/cangxuan-feed", slug, "00-SERIES-BIBLE.md"), "utf8");
const seriesHash = sha256(seriesBody);
let seriesSourceId;
{
  const existing = await admin.from("cangxuan_sources").select("id").eq("user_id", userId).eq("content_hash", seriesHash).maybeSingle();
  if (existing.data) {
    seriesSourceId = existing.data.id;
    console.log(`[source] bible dedup ${seriesSourceId}`);
  } else {
    const { data, error } = await admin
      .from("cangxuan_sources")
      .insert({
        user_id: userId,
        title: `落云宗的小尾巴·系列圣经`,
        source_type: "sasi_native",
        rights_scope: "opted_in_training",
        trainability: "trainable",
        license_metadata: { series: "luoyun-xiaoweiba", kind: "bible" },
        consent_version: "cangxuan-training-consent-v1",
        content_hash: seriesHash,
        character_count: seriesBody.length,
        extracted_count: knowledge.length,
      })
      .select("id")
      .single();
    if (error) die(`bible source: ${error.message}`);
    seriesSourceId = data.id;
    console.log(`[source] bible ${seriesSourceId}`);
  }
}

for (const item of knowledge) {
  const { error } = await admin.from("cangxuan_knowledge_items").upsert(
    {
      user_id: userId,
      source_id: seriesSourceId,
      category: item.category,
      title: item.title,
      statement: item.statement.slice(0, 1000),
      evidence: item.evidence.slice(0, 1200),
      tier: item.tier || "gold",
      trainability: "trainable",
      quality_score: 0.9,
      review_status: "approved",
      content_hash: item.content_hash || sha256(`${item.category}:${item.statement}`),
    },
    { onConflict: "user_id,content_hash", ignoreDuplicates: true }
  );
  if (error) die(`knowledge ${item.title}: ${error.message}`);
}
console.log(`[knowledge] ${knowledge.length} seed rules`);

let epOk = 0;
for (const imp of imports) {
  const content = String(imp.content || "");
  if (content.length < 1) continue;
  const contentHash = sha256(content);
  const existing = await admin.from("cangxuan_sources").select("id").eq("user_id", userId).eq("content_hash", contentHash).maybeSingle();
  if (existing.data) {
    epOk++;
    continue;
  }
  const body = content.slice(0, 200000);
  const { error } = await admin.from("cangxuan_sources").insert({
    user_id: userId,
    title: String(imp.title).slice(0, 160),
    source_type: "sasi_native",
    rights_scope: "opted_in_training",
    trainability: "trainable",
    license_metadata: { series: "luoyun-xiaoweiba", kind: "episode" },
    consent_version: "cangxuan-training-consent-v1",
    content_hash: contentHash,
    character_count: body.length,
    extracted_count: 0,
  });
  if (error) die(`episode ${imp.title}: ${error.message}`);
  epOk++;
}
console.log(`[episodes] sources upserted/kept ${epOk}/${imports.length}`);

let evOk = 0;
for (const ev of events) {
  const characterId = keyToId[ev.characterKey] || keyToId[normalizeKey(ev.characterKey)];
  if (!characterId) {
    console.warn(`[skip event] unknown character ${ev.characterKey}`);
    continue;
  }
  const { error } = await admin.from("cangxuan_continuity_events").upsert(
    {
      user_id: userId,
      character_id: characterId,
      episode: ev.episode,
      scene: ev.scene,
      sequence: ev.sequence,
      script_event: String(ev.scriptEvent).slice(0, 1000),
      state_patch: ev.statePatch || {},
    },
    { onConflict: "character_id,episode,scene,sequence" }
  );
  if (error) die(`event E${ev.episode}.${ev.sequence}: ${error.message}`);
  evOk++;
}
console.log(`[events] ${evOk} continuity beats`);
console.log("[done] Series pack is in Foundry. CangXuan can read characters + timelines + sources.");