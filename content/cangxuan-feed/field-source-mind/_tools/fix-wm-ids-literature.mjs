import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "site-rest");
const RAW = path.join(__dirname, "_raw-html");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 7) return reject(new Error("too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 90000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchBuf(next, redirects + 1));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function decodeEntities(s) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function htmlToText(html) {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n").replace(/<\/li>/gi, "\n").replace(/<\/div>/gi, "\n").replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  const LEGAL = /copyright|©|all rights reserved|版权所有|著作权|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress/i;
  return s.split(/\n+/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l && l.length > 1 && !LEGAL.test(l)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function balancedWenBlocks(html) {
  const out = [];
  const re = /<div class="wen ov"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index + m[0].length;
    let i = start, depth = 1;
    while (i < html.length && depth > 0) {
      const no = html.toLowerCase().indexOf("<div", i);
      const nc = html.toLowerCase().indexOf("</div>", i);
      if (nc < 0) break;
      if (no >= 0 && no < nc) { depth++; i = no + 4; }
      else {
        depth--;
        if (depth === 0) { out.push(html.slice(start, nc)); break; }
        i = nc + 6;
      }
    }
  }
  return out;
}

function extractWmBody(html, { allBlocks = false } = {}) {
  const blocks = balancedWenBlocks(html).map(htmlToText).filter((t) => t.length > 80);
  let best = allBlocks ? blocks.join("\n\n----\n\n") : blocks.sort((a, b) => b.length - a.length)[0] || "";
  if (best.length < 400) {
    const i = html.search(/作者[：:]/);
    if (i >= 0) {
      const slice = html.slice(i);
      const cut = slice.search(/条款和条件|class="footer|<\/body>/);
      best = htmlToText(cut > 0 ? slice.slice(0, cut) : slice.slice(0, 900000));
    }
  }
  const lines = best.split("\n");
  let seen = 0, cutIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "玛呼2008年面访及录音1" || lines[i] === "2008年4月面访及录音1") {
      seen++; if (seen >= 2) { cutIdx = i; break; }
    }
  }
  return (cutIdx > 20 ? lines.slice(0, cutIdx) : lines).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function exactRaw(id) {
  const files = fs.readdirSync(RAW);
  // exact: works.html_id_N.html or works.html_id_N_... not prefix of longer id
  const re = new RegExp(`works\\.html_id_${id}(?:\\.html|_|$)`);
  const hit = files.find((f) => re.test(f) && !new RegExp(`works\\.html_id_${id}\\d`).test(f));
  return hit ? path.join(RAW, hit) : null;
}

function statusOf(n) { return n >= 2000 ? "READ" : n >= 400 ? "THIN" : "THIN/MISS"; }

function writeOut(id, title, url, text) {
  const chars = text.length;
  const status = statusOf(chars);
  fs.writeFileSync(path.join(OUT, id + ".txt"), `TITLE: ${title}\nSOURCE: ${url}\nCHARS: ${chars}\nSTATUS: ${status}\n\n${text}`, "utf8");
  console.log(status, chars, id, title);
  return { id, title, url, chars, status };
}

// Refetch exact IDs that may have been confused
const need = [
  { id: "wm_cn_philosophy_index", wid: 1, title: "哲学" },
  { id: "wm_cn_liminal_cosmogony", wid: 18, title: "阈限宇宙起源论" },
  { id: "wm_cn_spiritual_tools", wid: 2, title: "灵性之旅的工具" },
  { id: "wm_cn_lyricus_index", wid: 3, title: "理瑞克斯" },
  { id: "wm_cn_myth_narrative", wid: 31, title: "神话叙事" },
  { id: "wm_cn_si_manifesto", wid: 38, title: "主权积分态宣言" },
  { id: "wm_cn_belief_energy", wid: 26, title: "信念及其能量系统" },
  { id: "wm_cn_poetry_index", wid: 42, title: "诗歌" },
  { id: "wm_cn_practitioner", wid: 45, title: "实践者" },
  { id: "wm_cn_wm_tools", wid: 47, title: "造翼者工具" },
];

const updates = [];
for (const item of need) {
  const url = `https://www.wingmakers.com.cn/works.html?id=${item.wid}`;
  let raw = exactRaw(item.wid);
  if (!raw) {
    const r = await fetchBuf(url);
    if (r.status >= 400) { console.log("FAIL", item.id, r.status); continue; }
    raw = path.join(RAW, `www.wingmakers.com.cn_works.html_id_${item.wid}.html`);
    fs.writeFileSync(raw, r.body.toString("utf8"), "utf8");
  } else {
    // still refresh to be sure
    try {
      const r = await fetchBuf(url);
      if (r.status < 400) {
        fs.writeFileSync(path.join(RAW, `www.wingmakers.com.cn_works.html_id_${item.wid}.html`), r.body.toString("utf8"), "utf8");
        raw = path.join(RAW, `www.wingmakers.com.cn_works.html_id_${item.wid}.html`);
      }
    } catch {}
  }
  const html = fs.readFileSync(raw, "utf8");
  const text = extractWmBody(html);
  updates.push(writeOut(item.id, item.title, url, text));
}

// Literature: all blocks
{
  const url = "https://www.wingmakers.com.cn/literature.html";
  let raw = path.join(RAW, "www.wingmakers.com.cn_literature.html.html");
  if (!fs.existsSync(raw)) {
    const r = await fetchBuf(url);
    raw = path.join(RAW, "www.wingmakers.com.cn_literature.html.html");
    fs.writeFileSync(raw, r.body.toString("utf8"), "utf8");
  }
  const html = fs.readFileSync(raw, "utf8");
  const text = extractWmBody(html, { allBlocks: true });
  // if still small vs html size, take from first 作者 to footer
  let final = text;
  if (final.length < 100000) {
    const i = html.search(/作者[：:]/);
    if (i >= 0) {
      const slice = html.slice(i);
      const cut = slice.search(/条款和条件|class="footer|<\/body>/);
      final = htmlToText(cut > 0 ? slice.slice(0, cut) : slice);
      // trim footer nav
      const lines = final.split("\n");
      let seen = 0, cutIdx = -1;
      for (let k = 0; k < lines.length; k++) {
        if (lines[k] === "玛呼2008年面访及录音1" || lines[k] === "2008年4月面访及录音1") {
          seen++; if (seen >= 2) { cutIdx = k; break; }
        }
      }
      final = (cutIdx > 50 ? lines.slice(0, cutIdx) : lines).join("\n").trim();
    }
  }
  updates.push(writeOut("wm_cn_literature", "文学", url, final));
}

// Patch coverage json
const covPath = path.join(WORK, "12-site-rest-coverage.json");
const cov = JSON.parse(fs.readFileSync(covPath, "utf8"));
const map = new Map(cov.results.map((r) => [r.id, r]));
for (const u of updates) {
  const prev = map.get(u.id) || {};
  map.set(u.id, { ...prev, ...u, pageTitle: u.title });
}
const results = [...map.values()].sort((a, b) => (b.chars || 0) - (a.chars || 0));
const read = results.filter((r) => r.status === "READ");
const thin = results.filter((r) => String(r.status).startsWith("THIN"));
const miss = results.filter((r) => r.status === "MISS" || r.status === "THIN/MISS");
cov.results = results;
cov.summary = {
  total: results.length,
  READ: read.length,
  THIN: thin.length,
  MISS: miss.length,
  readChars: read.reduce((a, b) => a + (b.chars || 0), 0),
};
cov.generatedAt = new Date().toISOString();
fs.writeFileSync(covPath, JSON.stringify(cov, null, 2), "utf8");
const md = ["# 12-site-rest-coverage", "", "generated: " + cov.generatedAt + " UTC", "", "Rule: READ >= 2000 chars real body.", "", "| status | chars | title | id |", "|---|---:|---|---|"];
for (const r of results) md.push(`| ${r.status} | ${r.chars || 0} | ${(r.pageTitle || r.title || "").replace(/\|/g, "/")} | ${r.id} |`);
md.push("", "## Yale", `- **${cov.yale.status}**: ${cov.yale.notes}`, "", "## Summary", JSON.stringify(cov.summary, null, 2), "");
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.md"), md.join("\n"), "utf8");
console.log("SUMMARY", cov.summary);
