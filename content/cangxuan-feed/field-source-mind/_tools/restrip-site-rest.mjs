import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "site-rest");
const RAW = path.join(__dirname, "_raw-html");
const PDFDIR = path.join(__dirname, "_raw-pdf");
fs.mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 7) return reject(new Error("too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 60000 }, (res) => {
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
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function htmlToText(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  const lines = s
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const LEGAL =
    /copyright|©|all rights reserved|版权所有|著作权|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress|Elementor/i;
  return lines.filter((l) => !LEGAL.test(l) && l.length > 1).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractWmCnBody(html) {
  // Prefer .wen.ov blocks that contain author / long body
  const blocks = [];
  const re = /<div class="wen ov"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1]);
  // also nested: sometimes content is last wen before footer
  let best = "";
  for (const b of blocks) {
    const t = htmlToText(b);
    if (t.length > best.length) best = t;
  }
  // Fallback: from first 作者： to footer-ish
  if (best.length < 800) {
    const i = html.search(/作者[：:]/);
    if (i >= 0) {
      const slice = html.slice(i, i + 800000);
      // cut at common footer markers
      const cut = slice.search(/条款和条件|捐款|<\/body>|class="footer|友情链接/);
      best = htmlToText(cut > 0 ? slice.slice(0, cut) : slice);
    }
  }
  // Drop leading chrome lines that are pure nav tokens
  const NAV =
    /^(造翼者中文站|首页|介绍|古箭计划遗址|图\s*解|历\s*史|玛呼访谈|詹姆斯\.玛呼|社交媒体|翻译|常见问答|下载及电台|哲学|文本|理瑞克斯|心脏六美德|文学|诗歌|实践者|博客|其他官网|联系方式|关于本站|音乐|艺术|艺术商店|条款和条件|捐款|造翼者中文站-文本|造翼者中文站-文学)$/;
  const lines = best.split("\n").filter((l) => !NAV.test(l));
  // remove duplicated trailing nav block if present
  const trailStart = lines.findIndex((l, idx) => idx > 20 && /^进化杂志访谈（暂无）$/.test(l));
  // better: find second occurrence of "玛呼2008年面访及录音1" deep in file as footer nav start
  let cutIdx = -1;
  let seen = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "玛呼2008年面访及录音1" || lines[i] === "2008年4月面访及录音1") {
      seen++;
      if (seen >= 2) {
        cutIdx = i;
        break;
      }
    }
  }
  const cleaned = cutIdx > 30 ? lines.slice(0, cutIdx) : lines;
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractWpBody(html) {
  const m =
    html.match(/<div[^>]+class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>/i);
  if (m) return htmlToText(m[1]);
  // fallback: after 跳至正文
  const i = html.indexOf("跳至正文");
  if (i >= 0) return htmlToText(html.slice(i + 4));
  return htmlToText(html);
}

function extractTitle(html, fallback) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (m) {
    let t = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
    t = t
      .replace(/^造翼者中文网站-/, "")
      .replace(/\s*[|\-–].*$/, "")
      .replace(/\|.*$/, "")
      .trim();
    if (t && t.length > 1 && t !== "造翼者中文站") return t;
  }
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const t = htmlToText(h1[1]).split("\n")[0];
    if (t) return t;
  }
  return fallback;
}

function statusOf(chars) {
  if (chars >= 2000) return "READ";
  if (chars >= 400) return "THIN";
  return "THIN/MISS";
}

// Map id -> metadata from coverage json if present
const covPath = path.join(WORK, "12-site-rest-coverage.json");
const cov = fs.existsSync(covPath) ? JSON.parse(fs.readFileSync(covPath, "utf8")) : { results: [] };
const byId = new Map(cov.results.map((r) => [r.id, r]));

// Fetch wrongly skipped WM pages
const missingFetch = [
  { id: "wm_cn_mantustia", url: "https://www.wingmakers.com.cn/works.html?id=40", title: "曼图斯迪亚的愿景" },
  { id: "wm_cn_first_source_transmission", url: "https://www.wingmakers.com.cn/works.html?id=41", title: "第一源头传递" },
  { id: "wm_cn_poetry_index", url: "https://www.wingmakers.com.cn/works.html?id=42", title: "诗歌索引" },
  { id: "wm_cn_practitioner", url: "https://www.wingmakers.com.cn/works.html?id=45", title: "实践者" },
  { id: "wm_cn_wm_tools", url: "https://www.wingmakers.com.cn/works.html?id=47", title: "造翼者工具" },
];

for (const item of missingFetch) {
  try {
    const r = await fetchBuf(item.url);
    if (r.status >= 400) throw new Error("http_" + r.status);
    const html = r.body.toString("utf8");
    const safe = item.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 120);
    fs.writeFileSync(path.join(RAW, safe + ".html"), html, "utf8");
    byId.set(item.id, { ...item, kind: "html", via: "refetch" });
    console.log("refetched", item.id, html.length);
  } catch (e) {
    console.log("refetch fail", item.id, e.message);
  }
}

// Build list of all site-rest targets: existing outs + coverage + missing
const ids = new Set([...byId.keys()].filter((id) => id !== "yale_interview"));
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith(".txt")) ids.add(f.replace(/\.txt$/, ""));
}

const results = [];
for (const id of [...ids].sort()) {
  const meta = byId.get(id) || { id, title: id, url: "", kind: "html" };
  if (meta.kind === "pdf" || (meta.url && meta.url.endsWith(".pdf"))) {
    // re-parse pdf from cache if present
    const pdfPath = path.join(PDFDIR, id + ".pdf");
    let text = "";
    let err = null;
    try {
      if (fs.existsSync(pdfPath)) {
        const parsed = await pdfParse(fs.readFileSync(pdfPath));
        text = (parsed.text || "")
          .split(/\n+/)
          .map((l) => l.replace(/\s+/g, " ").trim())
          .filter((l) => l && !/copyright|©|版权所有|ICP|备案/i.test(l))
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      } else {
        // keep existing extract body if any
        const existing = path.join(OUT, id + ".txt");
        if (fs.existsSync(existing)) {
          const raw = fs.readFileSync(existing, "utf8");
          text = raw.replace(/^TITLE:[\s\S]*?\n\n/, "");
        }
      }
    } catch (e) {
      err = String(e.message || e);
    }
    const chars = text.length;
    const status = statusOf(chars);
    const title = meta.title || id;
    fs.writeFileSync(
      path.join(OUT, id + ".txt"),
      `TITLE: ${title}\nSOURCE: ${meta.url || ""}\nCHARS: ${chars}\nSTATUS: ${status}\n\n${text}`,
      "utf8"
    );
    results.push({ id, title, pageTitle: title, url: meta.url, kind: "pdf", chars, status, error: err });
    console.log(status, chars, id);
    continue;
  }

  // HTML path: find raw
  let html = null;
  let rawUsed = null;
  const candidates = fs.readdirSync(RAW).filter((f) => f.endsWith(".html"));
  // match by URL id patterns
  if (meta.url) {
    const um = meta.url.match(/works\.html\?id=(\d+)/);
    const am = meta.url.match(/about\.html\?id=(\d+)/);
    if (um) {
      const hit = candidates.find((f) => f.includes(`works.html_id_${um[1]}`) || f.includes(`works_html_id_${um[1]}`));
      if (hit) {
        rawUsed = hit;
        html = fs.readFileSync(path.join(RAW, hit), "utf8");
      }
    } else if (am) {
      const hit = candidates.find((f) => f.includes(`about.html_id_${am[1]}`));
      if (hit) {
        rawUsed = hit;
        html = fs.readFileSync(path.join(RAW, hit), "utf8");
      }
    } else {
      const safe = meta.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 120);
      const hit =
        candidates.find((f) => f.replace(/\.html$/, "") === safe) ||
        candidates.find((f) => f.includes(safe.slice(0, 50))) ||
        candidates.find((f) => {
          try {
            const hostpath = new URL(meta.url).hostname + new URL(meta.url).pathname.replace(/\//g, "_");
            return f.includes(hostpath.slice(0, 40));
          } catch {
            return false;
          }
        });
      // wingmakerschina date paths
      if (!hit && /wingmakerschina\.com\/\d{4}\//.test(meta.url)) {
        const parts = meta.url.replace(/^https?:\/\//, "").split("/").filter(Boolean);
        const key = parts.slice(1).join("_"); // 2017_12_08_questions_
        const h2 = candidates.find((f) => f.includes(key) || f.includes(parts[parts.length - 2] + "_" + parts[parts.length - 1]));
        if (h2) {
          rawUsed = h2;
          html = fs.readFileSync(path.join(RAW, h2), "utf8");
        }
      } else if (hit) {
        rawUsed = hit;
        html = fs.readFileSync(path.join(RAW, hit), "utf8");
      }
    }
  }
  if (!html && meta.url) {
    try {
      const r = await fetchBuf(meta.url);
      if (r.status < 400) {
        html = r.body.toString("utf8");
        const safe = meta.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 120);
        fs.writeFileSync(path.join(RAW, safe + ".html"), html, "utf8");
        rawUsed = "fetch";
      }
    } catch (e) {
      results.push({ id, title: meta.title, url: meta.url, status: "MISS", chars: 0, error: String(e.message || e) });
      console.log("MISS", id, e.message);
      continue;
    }
  }
  if (!html) {
    // keep existing if any
    const existing = path.join(OUT, id + ".txt");
    if (fs.existsSync(existing)) {
      const raw = fs.readFileSync(existing, "utf8");
      const body = raw.replace(/^TITLE:[\s\S]*?\n\n/, "");
      const chars = body.length;
      results.push({ id, title: meta.title, url: meta.url, chars, status: statusOf(chars), note: "kept-existing" });
      continue;
    }
    results.push({ id, title: meta.title, url: meta.url, status: "MISS", chars: 0, error: "no_html" });
    continue;
  }

  const pageTitle = extractTitle(html, meta.title || id);
  let text;
  if (/wingmakers\.com\.cn/.test(meta.url || rawUsed || "")) text = extractWmCnBody(html);
  else if (/wingmakerschina\.com/.test(meta.url || rawUsed || "")) text = extractWpBody(html);
  else text = extractWpBody(html);

  // If still mostly nav (too many short menu lines), try author-cut for CN
  if (text.length < 800 && /wingmakers\.com\.cn/.test(meta.url || "")) {
    text = extractWmCnBody(html);
  }

  const chars = text.length;
  const status = statusOf(chars);
  fs.writeFileSync(
    path.join(OUT, id + ".txt"),
    `TITLE: ${pageTitle}\nSOURCE: ${meta.url || ""}\nCHARS: ${chars}\nSTATUS: ${status}\n\n${text}`,
    "utf8"
  );
  results.push({ id, title: meta.title, pageTitle, url: meta.url, chars, status, via: rawUsed });
  console.log(status, chars, id, pageTitle);
}

const yale = {
  target: "耶鲁大访谈 / Yale Interview",
  status: "MISS",
  notes:
    "Not linked on wingmakers.com.cn nav/download; not in wingmakerschina interview menu (Camelot/Conscious Media/Evolver only); not in mocilife/sovereignintegral/jamesmahu.cn labels. Keep MISS — no invention.",
};
results.push({ id: "yale_interview", title: yale.target, status: "MISS", chars: 0, notes: yale.notes });

const read = results.filter((r) => r.status === "READ");
const thin = results.filter((r) => String(r.status).startsWith("THIN"));
const miss = results.filter((r) => r.status === "MISS" || r.status === "THIN/MISS");
const report = {
  generatedAt: new Date().toISOString(),
  zone: "Asia/Shanghai",
  summary: {
    total: results.length,
    READ: read.length,
    THIN: thin.length,
    MISS: miss.length,
    readChars: read.reduce((a, b) => a + (b.chars || 0), 0),
  },
  yale,
  results: results.sort((a, b) => (b.chars || 0) - (a.chars || 0)),
};

const md = [];
md.push("# 12-site-rest-coverage");
md.push("");
md.push("generated: " + report.generatedAt + " UTC → Asia/Shanghai");
md.push("");
md.push("Rule: READ only if extract body >= 2000 chars of real text (not nav).");
md.push("");
md.push("| status | chars | title | id |");
md.push("|---|---:|---|---|");
for (const r of report.results) {
  md.push(`| ${r.status} | ${r.chars || 0} | ${(r.pageTitle || r.title || "").replace(/\|/g, "/")} | ${r.id} |`);
}
md.push("");
md.push("## Yale");
md.push(`- **${yale.status}**: ${yale.notes}`);
md.push("");
md.push("## Summary");
md.push("- READ: " + report.summary.READ);
md.push("- THIN: " + report.summary.THIN);
md.push("- MISS: " + report.summary.MISS);
md.push("- readChars: " + report.summary.readChars);
md.push("");

fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.md"), md.join("\n"), "utf8");
console.log("SUMMARY", report.summary);
