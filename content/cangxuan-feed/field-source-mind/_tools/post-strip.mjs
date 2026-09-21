import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTRACTS = path.resolve(__dirname, "../extracts");

const LEGAL_LINE = /(?:copyright|\(c\)|©|all\s+rights\s+reserved|isbn[\s:-]|issn[\s:-]|published\s+by|publisher|printing|reprint|permission\s+to\s+reproduce|unauthorized|disclaimer|terms\s+of\s+(?:use|service)|creative\s+commons|license\s+agreement|知识共享|BY-NC-ND|非商业用途|禁止演绎|版权所有|著作权|版权声明|版权归|保留一切权利|保留所有权利|不得复制|未经许可|出版社|发行声明|发行者|发行人|书号|国际标准书号|CIP数据|图书在版编目|印刷|装订|定价|开本|印张|字数|版次|印次|经销|责任编辑|封面设计|法律顾问|侵权必究|免责声明|rights?\s+reserved|基于非商业目的|署名必须归于|纯属虚构|纯属巧合|WingMakers\.com|JamesMahu\.com|SovereignIntegral\.(?:org|cn)|英文版本|中文版本|英文站|中文站)/i;

function deepStrip(raw) {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Drop CC / publisher blocks early: from start until after license/fiction disclaimer
  const licenseEnd = text.search(/(?:纯属巧合|purely\s+coincidental|all\s+rights\s+reserved[^\n]*\n)/i);
  if (licenseEnd >= 0 && licenseEnd < 4000) {
    const after = text.indexOf("\n", licenseEnd);
    if (after > 0) text = text.slice(after + 1);
  }

  // Remove 目录 / TOC blocks: from 目录/Contents until first substantial chapter heading with prose
  text = text.replace(/(?:^|\n)(?:目\s*录|CONTENTS|Table of Contents)[^\n]*\n(?:(?:第\s*\d+\s*章|\d+\s*[\.、]|Chapter\s+\d+)[^\n]{0,80}\n){3,}/i, "\n");

  // Remove trailing 关于作者 / About the Author and acknowledgments-heavy tails
  const aboutIdx = text.search(/\n关于作者\n/);
  if (aboutIdx > text.length * 0.7) text = text.slice(0, aboutIdx);
  const aboutEn = text.search(/\nAbout the Author\n/i);
  if (aboutEn > text.length * 0.7) text = text.slice(0, aboutEn);
  const ackIdx = text.search(/\n(?:致谢|Acknowledgments?)\n/i);
  // only if near end and short remaining
  if (ackIdx > text.length * 0.85) text = text.slice(0, ackIdx);

  // Line filter
  const lines = text.split("\n");
  const kept = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) { kept.push(""); continue; }
    if (/^[\d\-\.\s\/第页共]+$/.test(t)) continue;
    if (/^page\s+\d+/i.test(t)) continue;
    if (/^第\s*\d+\s*页/.test(t)) continue;
    if (LEGAL_LINE.test(t)) continue;
    if (/^(英文站|中文站|封面原画|原创混合媒体)/.test(t)) continue;
    if (/^https?:\/\/\S+$/i.test(t)) continue;
    // lone TOC entry lines like 第N章NNN
    if (/^第\s*\d+\s*章\s*\d+\s*$/.test(t)) continue;
    kept.push(line);
  }
  let out = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // Paragraph filter leftover legal
  out = out
    .split(/\n{2,}/)
    .filter((para) => {
      const p = para.trim();
      if (!p) return false;
      const hits = (p.match(LEGAL_LINE) || []).length;
      if (hits >= 2) return false;
      if (hits >= 1 && p.length < 280) return false;
      // drop pure TOC residue paragraphs
      if (/^(第\s*\d+\s*章\s*\d+\s*\n?){3,}/m.test(p) && p.length < 800) return false;
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
  const before = fs.readFileSync(f, "utf8");
  const after = deepStrip(before);
  if (after !== before) {
    fs.writeFileSync(f, after, "utf8");
    changed++;
  }
  report.push({ file: path.relative(EXTRACTS, f), before: before.length, after: after.length });
}
fs.writeFileSync(path.resolve(__dirname, "../05-post-strip-report.json"), JSON.stringify({ changed, count: files.length, report }, null, 2), "utf8");
console.log(JSON.stringify({ changed, count: files.length }));
const g = report.find((r) => r.file.includes("哥白尼"));
console.log("gebaini", g);