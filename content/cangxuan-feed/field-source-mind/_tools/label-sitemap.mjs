import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, "_raw-html");
const WORK = path.resolve(__dirname, "..");

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function pairs(html, base) {
  const out = [];
  const re = /<a\s+[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = decode(m[1].trim());
    let text = decode(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (!href || /^(javascript:|mailto:)/i.test(href)) continue;
    let abs;
    try { abs = new URL(href, base).href.split("#")[0]; } catch { continue; }
    out.push({ href: abs, text });
  }
  return out;
}

const files = [
  ["www.wingmakers.com.cn_.html", "https://www.wingmakers.com.cn/"],
  ["www.wingmakers.com.cn_otherwebsite.html.html", "https://www.wingmakers.com.cn/otherwebsite.html"],
  ["www.wingmakerschina.com_.html", "https://www.wingmakerschina.com/"],
  ["www.mocilife.cn_.html", "https://www.mocilife.cn/"],
  ["www.sovereignintegral.cn_.html", "http://www.sovereignintegral.cn/"],
  ["www.jamesmahu.com.cn_.html", "http://www.jamesmahu.com.cn/"],
];

const byUrl = new Map();
for (const [f, base] of files) {
  const p = path.join(RAW, f);
  if (!fs.existsSync(p)) { console.log("missing", f); continue; }
  const html = fs.readFileSync(p, "utf8");
  for (const { href, text } of pairs(html, base)) {
    if (!byUrl.has(href)) byUrl.set(href, new Set());
    if (text) byUrl.get(href).add(text);
  }
}

const rows = [...byUrl.entries()].map(([url, texts]) => ({
  url,
  texts: [...texts].slice(0, 5),
})).sort((a,b)=>a.url.localeCompare(b.url));

fs.writeFileSync(path.join(WORK, "11-site-rest-link-labels.json"), JSON.stringify(rows, null, 2), "utf8");

// Focus wingmakers.com.cn works/about
const wm = rows.filter(r => /wingmakers\.com\.cn\/(works|about|literature|othertext|questions|blog)/i.test(r.url));
console.log("=== wingmakers.com.cn content-ish ===");
for (const r of wm) console.log(r.url, "=>", r.texts.join(" | "));

console.log("\n=== wingmakerschina posts ===");
for (const r of rows.filter(r => /wingmakerschina\.com\/\d{4}\//.test(r.url))) {
  console.log(r.url, "=>", r.texts.join(" | "));
}

console.log("\n=== mocilife show/pdf ===");
for (const r of rows.filter(r => /mocilife\.cn\/(index\.php\?c=show|uploadfile\/.+\.pdf)/i.test(r.url))) {
  console.log(r.url, "=>", r.texts.join(" | "));
}

console.log("\n=== sovereign pdf/cat ===");
for (const r of rows.filter(r => /sovereignintegral\.cn/.test(r.url) && !/wp-|xmlrpc|feed|manifest|oembed/.test(r.url))) {
  console.log(r.url, "=>", r.texts.join(" | "));
}

console.log("\n=== jamesmahu cn ===");
for (const r of rows.filter(r => /jamesmahu\.com\.cn/.test(r.url) && !/wp-|xmlrpc|feed|manifest|oembed|fonts\.|googletag/.test(r.url))) {
  console.log(r.url, "=>", r.texts.join(" | "));
}
