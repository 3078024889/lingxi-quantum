import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightPackage = process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright";
const { chromium } = require(playwrightPackage);
const root = process.cwd();
const outDir = path.join(root, "outputs");
fs.mkdirSync(outDir, { recursive: true });
const imageData = (relative) => {
  const file = path.join(root, "public", relative);
  return `data:image/${path.extname(file).slice(1)};base64,${fs.readFileSync(file).toString("base64")}`;
};
const plate = imageData("images/lifemap/page-5.png");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 794, height: 2246 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#edf1ff;font-family:"Microsoft YaHei",sans-serif;background:#08132f}.page{width:794px;height:1123px;overflow:hidden;padding:38px;background:radial-gradient(circle at 8% 5%,rgba(142,88,190,.55),transparent 30%),radial-gradient(circle at 90% 22%,rgba(31,159,172,.42),transparent 34%),#08132f;page-break-after:always}.glass{margin-bottom:13px;padding:20px;border:1px solid rgba(189,222,255,.54);background:linear-gradient(135deg,rgba(209,194,244,.18),rgba(38,101,142,.17));box-shadow:inset 0 0 42px rgba(255,255,255,.035)}.k{color:#9ce8df;font:11px Georgia;letter-spacing:5px}.title{margin:12px 0 6px;font:38px Georgia,"Microsoft YaHei"}.subject{color:#9ce8df;letter-spacing:3px}.lead{margin-top:18px;border-left:2px solid #8ee8dc;padding-left:16px;color:#a5f1e3;font-size:22px;line-height:1.45}.copy{margin:9px 0;color:#d7def2;font-size:15px;line-height:1.8}.plate{padding:8px}.plate img{display:block;width:100%;height:390px;object-fit:contain}.matrix{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{padding:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035);font-size:14px}.field span{float:right;color:#9ce8df}.bar{clear:both;height:5px;margin-top:10px;background:rgba(255,255,255,.1)}.bar i{display:block;height:100%;background:linear-gradient(90deg,#76dfd3,#cea8ff)}h2{font:25px Georgia,"Microsoft YaHei";margin:7px 0 12px}.relation{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.12);padding:12px 0;color:#d7def2}.relation b{color:#9ce8df}.num{color:#9ce8df;letter-spacing:5px}
</style><main>
<section class="page"><header class="glass"><div class="k">LINGXIFIELD DENDRITIC ARCHIVE · FIELD 09</div><div class="title">生命原型 · 八流归一</div><div class="subject">档案主体 · V318 质量验证</div><div class="lead">生命图谱 × 关系共振 × 生命韧性</div><p class="copy">当前显现的不是人格标签，也不是八份结果的摘要，而是八条生命支流共同形成的主轴、增强回路、承接差与现实入口。</p></header><figure class="glass plate"><img src="${plate}"></figure><section class="glass"><div class="num">01</div><h2>八流归一 · 当前原型结构</h2><p class="copy">生命图谱承担方向，关系共振形成现实接口，生命韧性调节行动强度。只有八条支流的完整证据同时存在，这个跨域结构才成立。</p></section></section>
<section class="page"><section class="glass"><div class="k">EIGHT-FIELD CONTRIBUTION</div><h2>八重场域贡献</h2><p class="copy">八域保持各自证据，不被压缩成一段总结。</p><div class="matrix">${[["生命图谱",91],["关系共振",86],["生命韧性",83],["桃花磁场",76],["财富创造",72],["今日潮汐",69],["生命镜像",64],["生命灵签",58]].map(([name,score])=>`<div class="field">${name}<span>${score}</span><div class="bar"><i style="width:${score}%"></i></div></div>`).join("")}</div></section><section class="glass"><div class="k">STRUCTURAL RELATIONS</div><h2>结构关系矩阵</h2><div class="relation"><span>生命图谱 → 关系共振</span><b>增强 · 95</b></div><div class="relation"><span>生命韧性 → 财富创造</span><b>桥接 · 78</b></div><div class="relation"><span>生命图谱 → 生命灵签</span><b>张力 · 43</b></div></section><section class="glass"><div class="num">07</div><h2>七日现实入口</h2><p class="copy">未来七天只验证一个动作，并分别记录它是否增强现实接口、是否给安静支流留下参与空间、是否产生一个外部可见的新结果。</p></section></section>
</main>`);
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: path.join(outDir, "v318-life-archetype-qa.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
await page.screenshot({ path: path.join(outDir, "v318-life-archetype-qa.png"), fullPage: true });
await browser.close();
console.log("PASS V318 Life Archetype PDF and PNG QA artifacts rendered");
