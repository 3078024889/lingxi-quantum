import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTRACTS = path.resolve(__dirname, "../extracts");

const LEGAL_LINE = /(?:copyright|\(c\)|©|all\s+rights\s+reserved|isbn[\s:-]|issn[\s:-]|published\s+by|publisher|creative\s+commons|知识共享|BY-NC-ND|非商业用途|禁止演绎|版权所有|著作权|版权声明|保留一切权利|保留所有权利|不得复制|未经许可|出版社|发行声明|书号|CIP数据|图书在版编目|侵权必究|免责声明|rights?\s+reserved|基于非商业目的|署名必须归于|纯属虚构|纯属巧合|WingMakers\.com|JamesMahu\.com|SovereignIntegral\.(?:org|cn)|英文版本|中文版本|英文站|中文站|封面原画|原创混合媒体)/i;

function deepStrip(raw, rel) {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Prefer start at first real chapter body
  const chapRe = /\n第\s*1\s*章[^\n]*\n/;
  const chapEn = /\nChapter\s+1\b[^\n]*\n/i;
  let start = -1;
  const m1 = text.match(chapRe);
  const m2 = text.match(chapEn);
  if (m1) start = m1.index;
  else if (m2) start = m2.index;
  // Codex often starts with title then body — if huge front TOC, cut after first long prose break
  if (start > 200) text = text.slice(start + 1); // keep the chapter heading line

  // End-matter cuts (keep earliest among candidates in last 20%)
  const endMarkers = [
    /\n关于作者\n/,
    /\nAbout the Author\n/i,
    /\n制作说明\n/,
    /\n感谢\n/,
    /\n致谢\n/,
    /\nAcknowledgments?\n/i,
    /\n尾声\s*\d*\n桥上旅者/,
  ];
  let cutAt = -1;
  for (const re of endMarkers) {
    const m = text.match(re);
    if (m && m.index > text.length * 0.75) {
      if (cutAt < 0 || m.index < cutAt) cutAt = m.index;
    }
  }
  // For 哥白尼 specifically: cut from 制作说明 / 感谢 if present late
  if (/哥白尼/.test(rel)) {
    const mk = text.search(/\n制作说明\n|\n感谢\n|\n关于作者\n/);
    if (mk > text.length * 0.7) cutAt = cutAt < 0 ? mk : Math.min(cutAt, mk);
  }
  if (cutAt > 0) text = text.slice(0, cutAt);

  const lines = text.split("\n");
  const kept = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) { kept.push(""); continue; }
    if (/^[\d\-\.\s\/第页共]+$/.test(t)) continue;
    if (/^page\s+\d+/i.test(t)) continue;
    if (LEGAL_LINE.test(t)) continue;
    if (/^(英文站|中文站|注：|《第\s*\d+)/.test(t)) continue;
    if (/译者[：:]/.test(t) && t.length < 80) continue;
    if (/^https?:\/\/\S+$/i.test(t)) continue;
    if (/^第\s*\d+\s*章\s*\d+\s*$/.test(t)) continue;
    if (/^(尾声|桥上旅者|制作说明|感谢|关于作者)\s*\d*\s*$/.test(t)) continue;
    kept.push(line);
  }
  let out = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  out = out
    .split(/\n{2,}/)
    .filter((para) => {
      const p = para.trim();
      if (!p) return false;
      const hits = (p.match(LEGAL_LINE) || []).length;
      if (hits >= 2) return false;
      if (hits >= 1 && p.length < 280) return false;
      return true;
    })
    .join("\n\n")
    .trim();
  return out;
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith(".txt")) acc.push(full);
  }
  return acc;
}

const files = walk(EXTRACTS);
let changed = 0;
const report = [];
for (const f of files) {
  const rel = path.relative(EXTRACTS, f);
  const before = fs.readFileSync(f, "utf8");
  const after = deepStrip(before, rel);
  if (after !== before) {
    fs.writeFileSync(f, after, "utf8");
    changed++;
  }
  report.push({ file: rel, before: before.length, after: after.length });
}
fs.writeFileSync(path.resolve(__dirname, "../05-post-strip-report.json"), JSON.stringify({ changed, count: files.length, report }, null, 2), "utf8");
console.log(JSON.stringify({ changed, count: files.length }));
const g = report.find((r) => r.file.includes("哥白尼"));
console.log("gebaini", g);