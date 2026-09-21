import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const EXTRACTS = path.join(WORK, "extracts");
const PRIORITY = path.normalize("D:\\17份\\哥白尼.pdf");

const ROOTS = [
  { root: "D:\\小仙女的\\Codex", bucket: "codex" },
  { root: "D:\\17份", bucket: "17fen" },
  { root: "D:\\小仙女的\\WM新资料20260704 36份", bucket: "wm36" },
];

const LEGAL_LINE = /(?:copyright|\(c\)|©|all\s+rights\s+reserved|isbn[\s:-]|issn[\s:-]|published\s+by|publisher|printing|reprint|permission\s+to\s+reproduce|unauthorized|disclaimer|terms\s+of\s+(?:use|service)|creative\s+commons|license\s+agreement|版权所有|著作权|版权声明|版权归|保留一切权利|保留所有权利|不得复制|未经许可|出版社|发行声明|发行者|发行人|书号|国际标准书号|CIP数据|图书在版编目|印刷|装订|定价|开本|印张|字数|版次|印次|经销|责任编辑|封面设计|法律顾问|侵权必究|敬请|声明[:：]|免责声明|rights?\s+reserved)/i;

const FRONT_BACK_MARKERS = /(?:table\s+of\s+contents|contents|目录|版权页|出版说明|编者的话|about\s+the\s+(?:author|publisher)|acknowledg(?:e)?ments|index\s*$|参考文献|后记|跋|colophon)/i;

function safeName(name) {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function walkPdfs(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && /\.pdf$/i.test(e.name)) out.push(full);
    }
  }
  walk(root);
  return out;
}

function stripLegalContent(raw) {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const pages = text.split(/\f+/);
  const cleanedPages = [];

  for (let pi = 0; pi < pages.length; pi++) {
    const lines = pages[pi].split("\n");
    const kept = [];
    let legalHits = 0;
    let contentHits = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();
      if (!t) { kept.push(""); continue; }
      if (/^[\d\-\.\s\/第页共]+$/.test(t)) continue;
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(t)) continue;
      if (/^第\s*\d+\s*页/.test(t)) continue;
      if (LEGAL_LINE.test(t)) { legalHits++; continue; }
      if (/^https?:\/\/\S+$/i.test(t) && /press|publish|amazon|isbn|copyright/i.test(t)) continue;
      contentHits++;
      kept.push(line);
    }

    const ratio = legalHits / Math.max(1, legalHits + contentHits);
    const joined = kept.join("\n").trim();
    const isEdge = pi < 2 || pi >= pages.length - 2;
    if (isEdge && (ratio > 0.35 || (joined.length < 80 && legalHits > 0))) continue;
    if (isEdge && FRONT_BACK_MARKERS.test(joined) && joined.length < 400 && ratio > 0.15) continue;
    if (joined) cleanedPages.push(joined);
  }

  let out = cleanedPages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  out = out
    .split(/\n{2,}/)
    .filter((para) => {
      const p = para.trim();
      if (!p) return false;
      const hits = (p.match(LEGAL_LINE) || []).length;
      if (hits >= 2) return false;
      if (hits >= 1 && p.length < 220) return false;
      return true;
    })
    .join("\n\n");
  return out.trim();
}

async function extractOne(sourcePath, bucket) {
  const base = safeName(path.basename(sourcePath));
  const outDir = path.join(EXTRACTS, bucket);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, base + ".txt");
  const rec = { sourcePath, outPath, bucket, pages: null, charsRaw: 0, chars: 0, ok: false };
  try {
    const buffer = fs.readFileSync(sourcePath);
    const data = await pdf(buffer);
    const raw = data.text || "";
    rec.pages = data.numpages || null;
    rec.charsRaw = raw.length;
    const cleaned = stripLegalContent(raw);
    rec.chars = cleaned.length;
    if (!cleaned || cleaned.length < 40) {
      rec.ok = false;
      rec.error = cleaned.length === 0 ? "empty_after_strip_or_image_only" : "too_little_text_after_strip";
      fs.writeFileSync(outPath, cleaned || "", "utf8");
      return rec;
    }
    fs.writeFileSync(outPath, cleaned, "utf8");
    rec.ok = true;
  } catch (e) {
    rec.ok = false;
    rec.error = String(e && e.message ? e.message : e);
  }
  return rec;
}

async function main() {
  fs.mkdirSync(EXTRACTS, { recursive: true });
  const manifest = [];
  const stats = {};
  const all = [];
  for (const { root, bucket } of ROOTS) {
    stats[bucket] = { attempted: 0, ok: 0, fail: 0, chars: 0, pages: 0 };
    if (!fs.existsSync(root)) { console.error("[missing root]", root); continue; }
    for (const f of walkPdfs(root)) all.push({ f, bucket });
  }
  all.sort((a, b) => {
    const ap = path.normalize(a.f).toLowerCase() === PRIORITY.toLowerCase() ? 0 : 1;
    const bp = path.normalize(b.f).toLowerCase() === PRIORITY.toLowerCase() ? 0 : 1;
    if (ap !== bp) return ap - bp;
    if (a.bucket !== b.bucket) return a.bucket.localeCompare(b.bucket);
    return a.f.localeCompare(b.f, "zh");
  });
  console.log(`[start] pdfs=${all.length} priority=${PRIORITY}`);
  let i = 0;
  for (const { f, bucket } of all) {
    i++;
    const rec = await extractOne(f, bucket);
    manifest.push(rec);
    stats[bucket].attempted++;
    if (rec.ok) { stats[bucket].ok++; stats[bucket].chars += rec.chars; stats[bucket].pages += rec.pages || 0; }
    else stats[bucket].fail++;
    console.log(`[${i}/${all.length}] ${rec.ok ? "OK" : "FAIL"} ${bucket} ${path.basename(f)} chars=${rec.chars} ${rec.error || ""}`);
    if (i % 5 === 0 || i === 1) {
      fs.writeFileSync(path.join(WORK, "02-extract-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
      fs.writeFileSync(path.join(WORK, "03-extract-stats.json"), JSON.stringify(stats, null, 2), "utf8");
      const prog = `# Progress\n\nUpdated: ${new Date().toISOString()}\n\nPriority first: 哥白尼.pdf\nStrip: copyright/legal/front-back/headers-footers on ALL files\n\nDone: ${i}/${all.length}\nStats: ${JSON.stringify(stats)}\n`;
      fs.writeFileSync(path.join(WORK, "04-progress.md"), prog, "utf8");
    }
  }
  const skipped = { mp4: "D:\\\\17份\\\\鳞毛羽肤.mp4 — skipped", png: "Codex png not extracted" };
  fs.writeFileSync(path.join(WORK, "02-extract-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), strip: "copyright/legal/front-back/headers-footers", skipped, records: manifest }, null, 2), "utf8");
  fs.writeFileSync(path.join(WORK, "03-extract-stats.json"), JSON.stringify({ generatedAt: new Date().toISOString(), totals: stats, skipped }, null, 2), "utf8");
  console.log("[done]", JSON.stringify(stats));
}

main().catch((e) => { console.error(e); process.exit(1); });