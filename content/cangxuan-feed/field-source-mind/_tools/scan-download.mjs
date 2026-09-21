import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, "_raw-html");
const html = fs.readFileSync(path.join(RAW, "www.wingmakers.com.cn_download.html.html"), "utf8");
// list pdf and doc links + text
const re = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let m;
const rows = [];
while ((m = re.exec(html))) {
  const href = m[1].replace(/&amp;/g, "&");
  const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (/\.(pdf|doc|docx|zip|rar|mp3)/i.test(href) || /下载|pdf|访谈|耶鲁|Yale/i.test(text+href)) {
    rows.push({ href, text });
  }
}
console.log("download links of interest:", rows.length);
for (const r of rows) console.log(r.href, "=>", r.text);

// also search whole download for interview-ish Chinese
for (const kw of ["耶鲁", "Yale", "访谈", "Interview", "Evolver", "进化"]) {
  const i = html.indexOf(kw);
  console.log("kw", kw, i >= 0 ? "HIT@"+i : "MISS");
}
