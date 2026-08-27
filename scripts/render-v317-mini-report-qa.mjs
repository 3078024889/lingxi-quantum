import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightPackage = process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright";
const { chromium } = require(playwrightPackage);

const root = process.cwd();
const outDir = path.join(root, "outputs");
fs.mkdirSync(outDir, { recursive: true });
const dataUrl = (relative) => {
  const file = path.join(root, "public", relative);
  return `data:image/${path.extname(file).slice(1)};base64,${fs.readFileSync(file).toString("base64")}`;
};
const bg = dataUrl("images/lifemap/content-bg-1.jpg");
const plate = dataUrl("images/lifemap/page-5.png");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#edf1ff;font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;background:#08132f}.page{width:794px;min-height:1123px;margin:auto;padding:54px;background:radial-gradient(circle at 12% 8%,rgba(134,86,183,.52),transparent 34%),radial-gradient(circle at 88% 24%,rgba(36,160,168,.38),transparent 36%),linear-gradient(rgba(8,19,47,.72),rgba(8,19,47,.82)),url('${bg}') center/cover fixed}.glass{margin:0 0 22px;padding:30px;border:1px solid rgba(188,221,255,.52);background:linear-gradient(135deg,rgba(214,197,245,.19),rgba(39,98,136,.17));box-shadow:inset 0 0 40px rgba(255,255,255,.035);backdrop-filter:blur(12px)}.k{color:#9ce8df;font:13px Georgia;letter-spacing:5px}.title{font:44px Georgia,"Microsoft YaHei";margin:18px 0}.lead{border-left:2px solid #8ee8dc;padding-left:20px;color:#a5f1e3;font-size:25px;line-height:1.55}.copy{color:#d4ddf3;font-size:17px;line-height:2}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.mini{padding:20px;min-height:150px}.mini b{display:block;color:#91e7dc;font-size:12px;letter-spacing:2px;margin-bottom:13px}.plate{padding:10px}.plate img{display:block;width:100%;max-height:520px;object-fit:contain}.chapter h2{font:28px Georgia,"Microsoft YaHei";margin:12px 0}.num{color:#91e7dc;letter-spacing:5px}.evidence{border-left:2px solid #91e7dc;padding-left:18px;color:#a8f1e6}
</style><main class="page"><section class="glass"><div class="k">LINGXIFIELD DENDRITIC ARCHIVE</div><div class="title">生命图谱完整报告</div><div class="lead">深度觉察 × 自主决定 × 行动启动</div><p class="copy">当前最值得解决的不是能力不足，而是自然结构进入现实后，是否因长期适应而偏离自己的运行方式。</p></section><section class="grid"><div class="glass mini"><b>01 · 当前解决什么</b><span class="copy">辨认长期结构与现实运行之间的断点。</span></div><div class="glass mini"><b>02 · 为什么会这样</b><span class="copy">24次跨情境选择形成证据链。</span></div><div class="glass mini"><b>03 · 现在做什么</b><span class="copy">进入一个可验证的现实动作。</span></div></section><figure class="glass plate"><img src="${plate}"></figure></main>`);
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: path.join(outDir, "v317-mini-report-qa.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
await page.screenshot({ path: path.join(outDir, "v317-mini-report-qa.png"), fullPage: true });
await browser.close();
console.log("PASS v317 PDF and PNG QA artifacts rendered");
