#!/usr/bin/env node
/**
 * Ingest field-source-mind local extracts (codex / 17fen / wm36) as Foundry
 * fulltext sources + SCRIPT knowledge sections so SASI can retrieve real text.
 *
 * Usage (repo root):
 *   node scripts/ingest-field-extracts-fulltext.mjs
 *   node scripts/ingest-field-extracts-fulltext.mjs --force
 *
 * Env (.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CANGXUAN_SEED_USER_ID
 *
 * Resume-safe manifest:
 *   content/cangxuan-feed/field-source-mind/10-fulltext-ingest-manifest.json
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join, relative, basename } from "path";

const CHUNK_MAX = 180000;
const STATEMENT_MAX = 900; // under DB 1000
const EVIDENCE_MAX = 1100; // under DB 1200
const ITEMS_PER_SOURCE_CAP = 900; // under extracted_count 1000
const FORCE = process.argv.includes("--force");
const CORPUS = ["codex", "17fen", "wm36"];

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

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function sha256(s) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function normalizeText(value) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(text, max = CHUNK_MAX) {
  if (text.length <= max) return [text];
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + max, text.length);
    if (end < text.length) {
      const window = text.slice(i, end);
      const breakAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf("\n"), window.lastIndexOf("。"), window.lastIndexOf(". "));
      if (breakAt > max * 0.6) end = i + breakAt + 1;
    }
    const piece = text.slice(i, end).trim();
    if (piece) chunks.push(piece);
    i = end;
  }
  return chunks.length ? chunks : [text.slice(0, max)];
}

function sectionText(text, max = STATEMENT_MAX) {
  if (text.length <= max) return [text];
  const sections = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + max, text.length);
    if (end < text.length) {
      const window = text.slice(i, end);
      const breakAt = Math.max(
        window.lastIndexOf("\n"),
        window.lastIndexOf("。"),
        window.lastIndexOf("！"),
        window.lastIndexOf("？"),
        window.lastIndexOf(". "),
        window.lastIndexOf("; "),
        window.lastIndexOf(" "),
      );
      if (breakAt > max * 0.5) end = i + breakAt + 1;
    }
    const piece = text.slice(i, end).trim();
    if (piece) sections.push(piece);
    i = end;
  }
  return sections;
}

function listExtracts(extractsRoot) {
  const out = [];
  for (const corpus of CORPUS) {
    const dir = join(extractsRoot, corpus);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.toLowerCase().endsWith(".txt")) continue;
      const abs = join(dir, name);
      if (!statSync(abs).isFile()) continue;
      out.push({ corpus, name, abs, rel: `${corpus}/${name}` });
    }
  }
  return out;
}

loadEnvLocal();

const packRoot = resolve(process.cwd(), "content/cangxuan-feed/field-source-mind");
const extractsRoot = join(packRoot, "extracts");
const manifestPath = join(packRoot, "10-fulltext-ingest-manifest.json");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.CANGXUAN_SEED_USER_ID;

if (!existsSync(extractsRoot)) die("missing extracts root: " + extractsRoot);
if (!url || !key) die("missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) die("Set CANGXUAN_SEED_USER_ID in .env.local");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let hasContentColumn = false;
{
  const probe = await admin.from("cangxuan_sources").select("content").limit(1);
  if (!probe.error) hasContentColumn = true;
  else console.log("[schema] content column absent — storing body in license_metadata.content + SCRIPT items");
}

const files = listExtracts(extractsRoot);
console.log(`[ingest] extracts=${files.length} user=${userId.slice(0, 8)}… contentCol=${hasContentColumn} force=${FORCE}`);

let manifest = { updatedAt: null, version: 1, summary: {}, files: {} };
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!manifest.files) manifest.files = {};
  } catch {
    console.warn("[manifest] corrupt — starting fresh");
  }
}

function saveManifest() {
  manifest.updatedAt = new Date().toISOString();
  const entries = Object.values(manifest.files);
  manifest.summary = {
    totalFiles: files.length,
    okFiles: entries.filter((e) => e.ok).length,
    failedFiles: entries.filter((e) => e.ok === false).length,
    totalChars: entries.reduce((s, e) => s + (e.chars || 0), 0),
    totalSources: entries.reduce((s, e) => s + ((e.sourceIds && e.sourceIds.length) || 0), 0),
    totalItems: entries.reduce((s, e) => s + (e.itemCount || 0), 0),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

async function upsertSource({ title, contentHash, characterCount, extractedCount, body, meta }) {
  const existing = await admin
    .from("cangxuan_sources")
    .select("id,character_count,extracted_count")
    .eq("user_id", userId)
    .eq("content_hash", contentHash)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    // Optionally backfill content/metadata if column now exists
    if (hasContentColumn) {
      await admin
        .from("cangxuan_sources")
        .update({ content: body, license_metadata: meta, character_count: characterCount, extracted_count: extractedCount })
        .eq("id", existing.data.id)
        .eq("user_id", userId);
    } else {
      await admin
        .from("cangxuan_sources")
        .update({ license_metadata: meta, character_count: characterCount, extracted_count: extractedCount })
        .eq("id", existing.data.id)
        .eq("user_id", userId);
    }
    return { id: existing.data.id, dedup: true };
  }

  const row = {
    user_id: userId,
    title: String(title).slice(0, 160),
    source_type: "sasi_native",
    rights_scope: "private_reference",
    trainability: "private_only",
    license_metadata: meta,
    consent_version: null,
    content_hash: contentHash,
    character_count: characterCount,
    extracted_count: extractedCount,
  };
  if (hasContentColumn) row.content = body;

  const { data, error } = await admin.from("cangxuan_sources").insert(row).select("id").single();
  if (error) throw error;
  return { id: data.id, dedup: false };
}

async function upsertItems(sourceId, items) {
  let ok = 0;
  const batchSize = 40;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize).map((item) => ({
      user_id: userId,
      source_id: sourceId,
      category: item.category,
      title: item.title.slice(0, 200),
      statement: item.statement.slice(0, 1000),
      evidence: item.evidence.slice(0, 1200),
      tier: item.tier || "silver",
      trainability: "private_only",
      quality_score: item.quality_score ?? 0.88,
      review_status: "approved",
      content_hash: item.content_hash,
    }));
    const { error } = await admin.from("cangxuan_knowledge_items").upsert(batch, {
      onConflict: "user_id,content_hash",
      ignoreDuplicates: true,
    });
    if (error) throw error;
    ok += batch.length;
  }
  return ok;
}

function buildItems(fileRel, chunkIndex, chunkBody, chunkCount) {
  const sections = sectionText(chunkBody, STATEMENT_MAX).slice(0, ITEMS_PER_SOURCE_CAP);
  const baseTitle = basename(fileRel, ".txt");
  const items = [];
  for (let s = 0; s < sections.length; s++) {
    const statement = sections[s];
    const evidence = statement.length <= EVIDENCE_MAX ? statement : statement.slice(0, EVIDENCE_MAX);
    const category = "SCRIPT";
    const title =
      chunkCount > 1
        ? `${baseTitle} · c${chunkIndex + 1}/${chunkCount} · s${s + 1}`
        : `${baseTitle} · s${s + 1}`;
    items.push({
      category,
      title: title.slice(0, 200),
      statement,
      evidence,
      tier: "silver",
      quality_score: 0.9,
      content_hash: sha256(`${category}:${statement}`),
    });
  }
  // Prefer PREFERENCE pointer only when sections empty (should not happen)
  if (!items.length && chunkBody.length) {
    const statement = chunkBody.slice(0, STATEMENT_MAX);
    items.push({
      category: "PREFERENCE",
      title: `${baseTitle} · fulltext-ref`,
      statement,
      evidence: statement.slice(0, EVIDENCE_MAX),
      tier: "silver",
      quality_score: 0.85,
      content_hash: sha256(`PREFERENCE:${statement}`),
    });
  }
  return items;
}

let processed = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const prev = manifest.files[file.rel];
  const raw = readFileSync(file.abs, "utf8");
  const body = normalizeText(raw);
  const chars = body.length;

  if (!FORCE && prev && prev.ok && prev.chars === chars && Array.isArray(prev.sourceIds) && prev.sourceIds.length) {
    skipped++;
    continue;
  }

  if (chars < 20) {
    manifest.files[file.rel] = {
      ok: false,
      chars,
      reason: "too_short",
      sourceIds: [],
      itemCount: 0,
      corpus: file.corpus,
    };
    failed++;
    saveManifest();
    console.warn(`[skip-short] ${file.rel} chars=${chars}`);
    continue;
  }

  try {
    const chunks = chunkText(body, CHUNK_MAX);
    const sourceIds = [];
    let itemCount = 0;
    const chunkHashes = [];

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      const items = buildItems(file.rel, ci, chunk, chunks.length);
      const contentHash = sha256(`field-fulltext:${file.rel}:c${ci}:${chunk}`);
      chunkHashes.push(contentHash.slice(0, 12));

      const titleBase = basename(file.name, ".txt");
      const title =
        chunks.length > 1
          ? `${titleBase} [${ci + 1}/${chunks.length}]`.slice(0, 160)
          : titleBase.slice(0, 160);

      const meta = {
        pack: "field-source-mind",
        kind: "field-extract-fulltext",
        corpus: file.corpus,
        extract_rel: file.rel,
        chunk_index: ci,
        chunk_count: chunks.length,
        extract_chars: chars,
        // Always embed body so SASI/tools can read even without content column
        content: hasContentColumn ? undefined : chunk,
        content_present_in_column: hasContentColumn,
      };
      // Remove undefined keys
      if (meta.content === undefined) delete meta.content;

      const src = await upsertSource({
        title,
        contentHash,
        characterCount: Math.min(200000, Math.max(1, chunk.length)),
        extractedCount: Math.min(1000, items.length),
        body: chunk,
        meta,
      });
      sourceIds.push(src.id);
      const n = await upsertItems(src.id, items);
      itemCount += n;
      console.log(
        `[chunk] ${file.rel} ${ci + 1}/${chunks.length} source=${src.id.slice(0, 8)}… chars=${chunk.length} items=${items.length} dedup=${src.dedup}`,
      );
    }

    manifest.files[file.rel] = {
      ok: true,
      chars,
      sourceIds,
      itemCount,
      chunks: chunks.length,
      corpus: file.corpus,
      chunkHashPrefixes: chunkHashes,
    };
    processed++;
    saveManifest();
    console.log(`[ok] ${file.rel} chars=${chars} sources=${sourceIds.length} items=${itemCount}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : (err && err.message) ? String(err.message) : JSON.stringify(err);
    manifest.files[file.rel] = {
      ok: false,
      chars,
      reason: message,
      sourceIds: (prev && prev.sourceIds) || [],
      itemCount: (prev && prev.itemCount) || 0,
      corpus: file.corpus,
    };
    failed++;
    saveManifest();
    console.error(`[fail] ${file.rel}: ${message}`);
  }
}

saveManifest();
console.log(
  JSON.stringify(
    {
      done: true,
      processed,
      skipped,
      failed,
      summary: manifest.summary,
      manifest: relative(process.cwd(), manifestPath),
    },
    null,
    2,
  ),
);
