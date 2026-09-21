import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const RAW = path.join(__dirname, "_raw-html");
const OUT = path.join(WORK, "extracts", "site-rest");
const SITEMAP = path.join(WORK, "11-site-rest-sitemap.json");
fs.mkdirSync(OUT, { recursive: true });

const ALLOW = [
  "wingmakers.com.cn",
  "wingmakerschina.com",
  "mocilife.cn",
  "sovereignintegral.cn",
  "jamesmahu.com.cn",
  "moci.life",
];

// Already READ substantial priority bodies — skip these source pages/PDF twins
const PRIORITY_SKIP = new Set([
  "energetic_heart", "camelot", "living_from_heart", "ascending_heart",
  "quantum_pause", "event_temples", "living_truth", "six_virtues",
  "ancient_arrow", "neruda_1", "neruda_2", "neruda_3", "neruda_4", "neruda_5",
  "mahu_2008_1", "mahu_2008_2", "mahu_2008_3", "mahu_2013",
  "consciousness_media", "conscious_media",
  "lyricus_1", "lyricus_2", "lyricus_3", "lyricus_4", "lyricus_5", "lyricus_6",
  "lyricus_intro", "philosophy_life_principles", "philosophy_modes",
  "philosophy_blueprint", "mahu_interview_index",
]);

function hostAllowed(u) {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "");
    return ALLOW.some((a) => h === a || h.endsWith("." + a));
  } catch { return false; }
}

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 6) return reject(new Error("too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/pdf,*/*;q=0.8",
        },
        timeout: 45000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          return resolve(fetchUrl(next, redirects + 1));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            url,
            finalUrl: url,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        );
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

function stripHtml(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  // drop common chrome blocks
  s = s.replace(/<(header|aside|menu)[\s\S]*?<\/\1>/gi, " ");
  s = s.replace(/<[^>]+>/g, "\n");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/&#x[0-9a-f]+;/gi, " ");
  const lines = s
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const LEGAL =
    /copyright|©|all rights reserved|版权所有|著作权|出版社|ICP备|备案号|知识共享|BY-NC|privacy policy|terms of use|cookie|Powered by|WordPress|Elementor/i;
  const NAVISH =
    /^(首页|Home|Select Page|菜单|Menu|搜索|Search|上一页|下一页|返回|Back|登录|Login)$/i;
  const kept = lines.filter((l) => !LEGAL.test(l) && !NAVISH.test(l) && l.length > 1);
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (m) return m[1].replace(/\s+/g, " ").trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].replace(/\s+/g, " ").trim();
  return "";
}

function safeName(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^\w\u4e00-\u9fff.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 140);
}

function looksLikePriority(url, title) {
  const blob = (url + " " + title).toLowerCase();
  for (const k of PRIORITY_SKIP) {
    if (blob.includes(k.replace(/_/g, "")) || blob.includes(k)) return k;
  }
  // chinese / html filename patterns already covered by priority
  const patterns = [
    /neruda[_-]?\d/i,
    /mahu[_-]?2008/i,
    /mahu[_-]?2013/i,
    /camelot/i,
    /energetic[_-]?heart/i,
    /living[_-]?from[_-]?heart/i,
    /ascending[_-]?heart/i,
    /quantum[_-]?pause/i,
    /event[_-]?temple/i,
    /lyricus/i,
    /consciousness[_-]?media/i,
    /living[_-]?truth/i,
    /six[_-]?virtue/i,
    /philosophy.*(life|mode|blueprint)/i,
  ];
  for (const p of patterns) if (p.test(blob)) return p.source;
  return null;
}

function collectLinks(html, baseUrl) {
  const out = new Map();
  const re = /href\s*=\s*["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1].trim();
    if (!href || /^(javascript:|mailto:|tel:)/i.test(href)) continue;
    let abs;
    try {
      abs = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    abs = abs.split("#")[0];
    if (!hostAllowed(abs)) continue;
    // skip binary assets except pdf
    if (/\.(css|js|png|jpe?g|gif|svg|webp|ico|mp3|mp4|zip|rar|woff2?|ttf)(\?|$)/i.test(abs))
      continue;
    out.set(abs, true);
  }
  return [...out.keys()];
}

function guessBaseFromFilename(f) {
  // www.wingmakers.com.cn_.html -> https://www.wingmakers.com.cn/
  let s = f.replace(/\.html$/, "");
  s = s.replace(/_+$/, "");
  // otherwebsite special
  if (s.includes("otherwebsite")) return "https://www.wingmakers.com.cn/otherwebsite.html";
  if (s.startsWith("www.")) return "https://" + s.replace(/_/g, "/") ; // fallback weak
  return "https://" + s;
}

const seeds = [
  { file: "www.wingmakers.com.cn_.html", base: "https://www.wingmakers.com.cn/" },
  { file: "www.wingmakers.com.cn_otherwebsite.html.html", base: "https://www.wingmakers.com.cn/otherwebsite.html" },
  { file: "www.wingmakerschina.com_.html", base: "https://www.wingmakerschina.com/" },
  { file: "www.mocilife.cn_.html", base: "https://www.mocilife.cn/" },
  { file: "www.sovereignintegral.cn_.html", base: "http://www.sovereignintegral.cn/" },
  { file: "www.jamesmahu.com.cn_.html", base: "http://www.jamesmahu.com.cn/" },
];

const allLinks = new Set();
const seedNotes = [];
for (const seed of seeds) {
  const p = path.join(RAW, seed.file);
  if (!fs.existsSync(p)) {
    // try fuzzy
    const alt = fs.readdirSync(RAW).find((x) => x.includes(seed.file.split(".")[1] || "xxx"));
    seedNotes.push({ seed: seed.file, missing: true, alt });
    continue;
  }
  const html = fs.readFileSync(p, "utf8");
  const links = collectLinks(html, seed.base);
  seedNotes.push({ seed: seed.file, base: seed.base, linkCount: links.length });
  for (const l of links) allLinks.add(l);
}

// also try absolute from any raw file with correct bases
for (const f of fs.readdirSync(RAW)) {
  if (!f.endsWith(".html")) continue;
  let base = "https://example.com/";
  if (f.includes("wingmakers.com.cn") && f.includes("otherwebsite"))
    base = "https://www.wingmakers.com.cn/otherwebsite.html";
  else if (f.includes("wingmakers.com.cn")) base = "https://www.wingmakers.com.cn/";
  else if (f.includes("wingmakerschina")) base = "https://www.wingmakerschina.com/";
  else if (f.includes("mocilife")) base = "https://www.mocilife.cn/";
  else if (f.includes("sovereignintegral")) base = "http://www.sovereignintegral.cn/";
  else if (f.includes("jamesmahu.com.cn")) base = "http://www.jamesmahu.com.cn/";
  else continue;
  const html = fs.readFileSync(path.join(RAW, f), "utf8");
  for (const l of collectLinks(html, base)) allLinks.add(l);
}

const links = [...allLinks].sort();
console.log("[sitemap seeds]", JSON.stringify(seedNotes, null, 2));
console.log("[unique allowlisted links]", links.length);
for (const l of links) console.log("LINK", l);

fs.writeFileSync(
  SITEMAP,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      seedNotes,
      linkCount: links.length,
      links,
    },
    null,
    2
  ),
  "utf8"
);
console.log("[wrote]", SITEMAP);
