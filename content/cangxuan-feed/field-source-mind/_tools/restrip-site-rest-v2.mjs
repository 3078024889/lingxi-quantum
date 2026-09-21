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
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
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
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  const LEGAL = /copyright|©|all rights reserved|版权所有|著作权|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress|Elementor/i;
  return s
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && l.length > 1 && !LEGAL.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractBalancedDiv(html, openRe) {
  const m = openRe.exec(html);
  if (!m) return null;
  const start = m.index + m[0].length;
  let i = start;
  let depth = 1;
  const lower = html;
  while (i < lower.length && depth > 0) {
    const nextOpen = lower.toLowerCase().indexOf("<div", i);
    const nextClose = lower.toLowerCase().indexOf("</div>", i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) return lower.slice(start, nextClose);
      i = nextClose + 6;
    }
  }
  return lower.slice(start, Math.min(lower.length, start + 900000));
}

function extractWmCnBody(html) {
  // Collect all class="wen ov" balanced blocks; pick longest text
  let best = "";
  const re = /<div class="wen ov"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    // manually balanced from this open
    const openTag = m[0];
    const start = m.index + openTag.length;
    let i = start, depth = 1;
    while (i < html.length && depth > 0) {
      const no = html.toLowerCase().indexOf("<div", i);
      const nc = html.toLowerCase().indexOf("</div>", i);
      if (nc < 0) break;
      if (no >= 0 && no < nc) { depth++; i = no + 4; }
      else { depth--; if (depth === 0) {
        const block = html.slice(start, nc);
        const t = htmlToText(block);
        if (t.length > best.length) best = t;
        break;
      } i = nc + 6; }
    }
  }
  if (best.length < 500) {
    const i = html.search(/作者[：:]/);
    if (i >= 0) {
      const slice = html.slice(i);
      const cut = slice.search(/条款和条件|class="footer|友情链接|<\/body>/);
      best = htmlToText(cut > 0 ? slice.slice(0, cut) : slice.slice(0, 500000));
    }
  }
  // Strip duplicated footer nav: second occurrence of interview cluster
  const lines = best.split("\n");
  let seen = 0, cutIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "玛呼2008年面访及录音1" || lines[i] === "2008年4月面访及录音1") {
      seen++;
      if (seen >= 2) { cutIdx = i; break; }
    }
  }
  const cleaned = (cutIdx > 20 ? lines.slice(0, cutIdx) : lines)
    .filter((l) => !/^(造翼者中文站(-文本|-文学)?|首页|Select Page)$/.test(l));
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractWpBody(html) {
  let inner =
    extractBalancedDiv(html, /<div[^>]+class=["'][^"']*entry-content[^"']*["'][^>]*>/i) ||
    extractBalancedDiv(html, /<article[^>]*>/i) ||
    extractBalancedDiv(html, /<div[^>]+id=["']content["'][^>]*>/i);
  if (!inner) {
    // sovereign / moci often embed long text in page builder
    const i = html.search(/詹姆斯\.?玛呼写于|作者序|一种新的存在模式|Launched in 2023|主权性积分态/);
    if (i >= 0) inner = html.slice(i, i + 700000);
  }
  if (!inner) return htmlToText(html);
  // cut share/footer widgets
  const cut = inner.search(/sharedaddy|jp-relatedposts|post-navigation|comments-area|footer-widgets|©/);
  if (cut > 200) inner = inner.slice(0, cut);
  return htmlToText(inner);
}

function extractTitle(html, fallback) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (m) {
    let t = decodeEntities(m[1]).replace(/\s+/g, " ").trim();
    t = t.replace(/^造翼者中文网站-/, "").replace(/\s*[\|].*$/, "").replace(/\s+[—\-–].*$/, "").trim();
    if (t && t !== "造翼者中文站") return t;
  }
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const t = htmlToText(h1[1]).split("\n")[0];
    if (t) return t;
  }
  return fallback;
}

function statusOf(n) {
  if (n >= 2000) return "READ";
  if (n >= 400) return "THIN";
  return "THIN/MISS";
}

function findRaw(url) {
  if (!url) return null;
  const files = fs.readdirSync(RAW).filter((f) => f.endsWith(".html"));
  const um = url.match(/works\.html\?id=(\d+)/);
  if (um) {
    const hit = files.find((f) => f.includes(`works.html_id_${um[1]}`));
    if (hit) return path.join(RAW, hit);
  }
  const am = url.match(/about\.html\?id=(\d+)/);
  if (am) {
    const hit = files.find((f) => f.includes(`about.html_id_${am[1]}`));
    if (hit) return path.join(RAW, hit);
  }
  if (/wingmakerschina\.com\/\d{4}\//.test(url)) {
    const u = new URL(url);
    const segs = u.pathname.split("/").filter(Boolean); // 2017,12,08,questions
    const key = segs.join("_");
    let hit = files.find((f) => f.includes(key));
    if (!hit && segs.length) hit = files.find((f) => f.includes(segs[segs.length - 1]) && f.includes(segs[0]));
    if (hit) return path.join(RAW, hit);
  }
  const safe = url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 120);
  const hit = files.find((f) => f.replace(/\.html$/, "") === safe) || files.find((f) => f.includes(safe.slice(0, 60)));
  return hit ? path.join(RAW, hit) : null;
}

const cov = JSON.parse(fs.readFileSync(path.join(WORK, "12-site-rest-coverage.json"), "utf8"));
const queue = cov.results.filter((r) => r.id !== "yale_interview");

// Ensure china pages that collapsed have raw; refetch if needed
for (const item of queue) {
  if (!item.url || item.kind === "pdf" || /\.pdf$/i.test(item.url || "")) continue;
  let raw = findRaw(item.url);
  if (!raw) {
    try {
      const r = await fetchBuf(item.url);
      if (r.status < 400) {
        const safe = item.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 120);
        raw = path.join(RAW, safe + ".html");
        fs.writeFileSync(raw, r.body.toString("utf8"), "utf8");
        console.log("fetched", item.id);
      }
    } catch (e) {
      console.log("fetch fail", item.id, e.message);
    }
  }
}

const results = [];
for (const item of queue) {
  const id = item.id;
  try {
    if (item.kind === "pdf" || /\.pdf$/i.test(item.url || "")) {
      const pdfPath = path.join(PDFDIR, id + ".pdf");
      let text = "";
      if (fs.existsSync(pdfPath)) {
        const parsed = await pdfParse(fs.readFileSync(pdfPath));
        text = (parsed.text || "")
          .split(/\n+/)
          .map((l) => l.replace(/\s+/g, " ").trim())
          .filter((l) => l && !/copyright|©|版权所有|ICP|备案/i.test(l))
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
      const chars = text.length;
      const status = statusOf(chars);
      const title = item.title || id;
      fs.writeFileSync(path.join(OUT, id + ".txt"), `TITLE: ${title}\nSOURCE: ${item.url || ""}\nCHARS: ${chars}\nSTATUS: ${status}\n\n${text}`, "utf8");
      results.push({ id, title, pageTitle: title, url: item.url, kind: "pdf", chars, status });
      console.log(status, chars, id);
      continue;
    }

    let raw = findRaw(item.url);
    let html = raw ? fs.readFileSync(raw, "utf8") : null;
    if (!html && item.url) {
      const r = await fetchBuf(item.url);
      if (r.status >= 400) throw new Error("http_" + r.status);
      html = r.body.toString("utf8");
      const safe = item.url.replace(/^https?:\/\//, "").replace(/[^\w.-]+/g, "_").slice(0, 120);
      fs.writeFileSync(path.join(RAW, safe + ".html"), html, "utf8");
    }
    if (!html) throw new Error("no_html");

    const pageTitle = extractTitle(html, item.title || id);
    let text;
    if (/wingmakers\.com\.cn/.test(item.url || "")) text = extractWmCnBody(html);
    else text = extractWpBody(html);

    const chars = text.length;
    const status = statusOf(chars);
    fs.writeFileSync(
      path.join(OUT, id + ".txt"),
      `TITLE: ${pageTitle}\nSOURCE: ${item.url || ""}\nCHARS: ${chars}\nSTATUS: ${status}\n\n${text}`,
      "utf8"
    );
    results.push({ id, title: item.title, pageTitle, url: item.url, chars, status });
    console.log(status, chars, id, "::", pageTitle);
  } catch (e) {
    results.push({ id, title: item.title, url: item.url, chars: 0, status: "MISS", error: String(e.message || e) });
    console.log("MISS", id, e.message);
  }
}

const yale = {
  target: "耶鲁大访谈 / Yale Interview",
  status: "MISS",
  notes:
    "Not linked on allowlisted CN sites nav/download; wingmakerschina interviews = Camelot / Conscious Media / Evolver only. Keep MISS — no invention.",
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
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.json"), JSON.stringify(report, null, 2), "utf8");
const md = ["# 12-site-rest-coverage", "", "generated: " + report.generatedAt + " UTC", "", "Rule: READ >= 2000 chars real body.", "", "| status | chars | title | id |", "|---|---:|---|---|"];
for (const r of report.results) md.push(`| ${r.status} | ${r.chars || 0} | ${(r.pageTitle || r.title || "").replace(/\|/g, "/")} | ${r.id} |`);
md.push("", "## Yale", `- **${yale.status}**: ${yale.notes}`, "", "## Summary", JSON.stringify(report.summary, null, 2), "");
fs.writeFileSync(path.join(WORK, "12-site-rest-coverage.md"), md.join("\n"), "utf8");
console.log("SUMMARY", report.summary);
