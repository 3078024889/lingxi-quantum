import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.resolve(__dirname, "..");
const OUT = path.join(WORK, "extracts", "web");
fs.mkdirSync(OUT, { recursive: true });

const URLS = [
  "http://www.wingmakers.com.cn/",
  "http://www.mocilife.cn/",
  "http://www.sovereignintegral.cn/",
  "https://www.wingmakers.com.cn/otherwebsite.html",
  "http://www.jamesmahu.com.cn/",
  "https://www.wingmakerschina.com/",
  "https://www.wingmakers.com/",
  "http://www.moci.life/",
  "https://www.jamesmahu.com/",
];

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error("too many redirects"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; field-source-mind/1.0)", Accept: "text/html" }, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchUrl(next, redirects + 1));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, url, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function stripHtml(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  // drop copyrightish blocks
  s = s.replace(/<[^>]+>/g, "\n");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ");
  const lines = s.split(/\n+/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const LEGAL = /copyright|©|all rights reserved|版权|著作权|出版社|ICP|备案|知识共享|BY-NC|privacy policy|terms of use|cookie/i;
  const kept = lines.filter((l) => !LEGAL.test(l) && l.length > 1);
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function safeName(url) {
  return url.replace(/^https?:\/\//, "").replace(/[^\w\u4e00-\u9fff.-]+/g, "_").replace(/_+/g, "_").slice(0, 120);
}

const manifest = [];
for (const url of URLS) {
  const rec = { url, ok: false, chars: 0 };
  try {
    const { status, body, url: finalUrl } = await fetchUrl(url);
    rec.status = status;
    rec.finalUrl = finalUrl;
    if (status >= 400) {
      rec.error = "http_" + status;
    } else {
      const text = stripHtml(body);
      rec.chars = text.length;
      const outPath = path.join(OUT, safeName(url) + ".txt");
      fs.writeFileSync(outPath, text, "utf8");
      rec.outPath = outPath;
      rec.ok = text.length >= 80;
      if (!rec.ok) rec.error = "too_little_text";
    }
  } catch (e) {
    rec.error = String(e.message || e);
  }
  manifest.push(rec);
  console.log(rec.ok ? "OK" : "FAIL", url, rec.chars || 0, rec.error || "");
}

fs.writeFileSync(path.join(WORK, "06-web-fetch-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), strip: "html-chrome+copyright", records: manifest }, null, 2), "utf8");
console.log("[web done]", manifest.filter((m) => m.ok).length + "/" + manifest.length);