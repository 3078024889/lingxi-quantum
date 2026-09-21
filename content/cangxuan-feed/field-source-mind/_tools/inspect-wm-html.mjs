import fs from "fs";
import path from "path";

const raw = "C:/Users/30780/Desktop/lingxi-quantum/content/cangxuan-feed/field-source-mind/_tools/_raw-html/";
const files = fs.readdirSync(raw).filter((f) =>
  /works\.html_id_(5|18|38|40|41|54)|literature|questions|belief/.test(f)
);
console.log("files", files);
for (const f of files) {
  const html = fs.readFileSync(path.join(raw, f), "utf8");
  console.log("\n====", f, "htmlLen", html.length);
  const markers = ["id=\"content\"", "id='content'", "class=\"content", "works_content", "article-content", "entry-content", "show_content", "layui", "ue_content", "detail"];
  for (const m of markers) {
    if (html.includes(m)) console.log(" has", m);
  }
  const idx = html.indexOf("作者");
  console.log(" authorIdx", idx);
  if (idx >= 0) console.log(" around:", html.slice(idx, idx + 180).replace(/\s+/g, " "));
  const texts = [...html.matchAll(/>([^<]{300,})</g)].map((m) => m[1].replace(/\s+/g, " ").trim());
  texts.sort((a, b) => b.length - a.length);
  console.log(" top blocks", texts.slice(0, 5).map((t) => t.length + ":" + t.slice(0, 100)));
  // look for iframe or ajax url
  const ifr = [...html.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1]).filter((u) => /php|html|api|json|txt/i.test(u)).slice(0, 20);
  console.log(" srcs", ifr);
  const ajax = [...html.matchAll(/url\s*[:=]\s*["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 20);
  console.log(" ajax urls", ajax);
}
