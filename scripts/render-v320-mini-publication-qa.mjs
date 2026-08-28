import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH ? path.join(process.env.NODE_PATH, "playwright") : "playwright");
const root = process.cwd();
const output = path.join(root, "tmp", "pdfs", "v320-mini-publication-qa.pdf");
fs.mkdirSync(path.dirname(output), { recursive: true });
const pools = ["lifemap", "relationship-full/general", "resilience-full", "romance-full", "wealth-full", "daily-tide-full", "tarot-full", "qian-full"];
const images = pools.map((dir, index) => {
  const file = path.join(root, "public", "images", dir, `page-${(index * 5 + 2) % 12}.png`);
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
});
const sections = [
  ["生命结构主轴", "LIFE STRUCTURE AXIS", "长期结构提供方向，关系结构决定它如何被现实接住，韧性结构则调节这股力量能够持续多久。这里读取的是三者的传递顺序，而不是一个最高分。"],
  ["关系现实接口", "RELATIONAL INTERFACE", "关系支流保存靠近、表达、安全、边界与修复的真实证据。三种关系路径任一完成即可汇入；更多路径会增加证据密度，但不会重复占据支流。"],
  ["恢复与承接差", "RESILIENCE AND CAPACITY", "系统区分表面恢复、内部可用能量与尚未计算的恢复成本。当理解已经发生而现实尚未容纳，真正需要调整的是节奏与接口。"],
  ["吸引与靠近", "ATTRACTION AND APPROACH", "吸引不是静态分数，而是信号如何形成、表达、被回应并进入双向互动。这里保留靠近许可与边界之间的真实张力。"],
  ["价值创造路径", "VALUE CREATION PATH", "价值从创造到交换需要经过命名、交付、验证、复制与承接。原型读取最强环节，也读取价值停止流动的具体位置。"],
  ["当下状态节律", "PRESENT RHYTHM", "今日潮汐不把状态误判成人格。它让当下的能量、负载、专注与连接窗口，为长期结构提供现实校准。"],
  ["象征镜像", "SYMBOLIC MIRROR", "象征不是未来判定。它为难以命名的经验打开另一观察面，再把注意力带回一个可以被现实验证的选择。"],
  ["七日现实协议", "SEVEN-DAY REALITY PROTOCOL", "未来七天只验证一个动作：让主轴获得清楚入口，同时为较安静的支流留下参与空间。下一次原型更新只接受新证据，不用想象填补变化。"],
];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#07102c;color:#f1f4ff;font-family:"Microsoft YaHei",sans-serif}.page{position:relative;width:794px;height:1123px;overflow:hidden;page-break-after:always}.art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,12,37,.98) 0%,rgba(5,12,37,.76) 34%,rgba(5,12,37,.08) 72%)}.copy{position:absolute;left:46px;right:46px;bottom:52px;padding:30px;border:1px solid rgba(180,223,255,.48);background:linear-gradient(135deg,rgba(12,23,58,.86),rgba(45,52,105,.62));backdrop-filter:blur(14px)}.k{color:#8de6dd;font:12px Georgia;letter-spacing:5px}.n{margin-top:10px;color:rgba(226,232,255,.58);font:12px Georgia;letter-spacing:4px}.title{margin:16px 0 12px;font:36px Georgia,"Microsoft YaHei"}.body{margin:0;color:#dde4f7;font-size:17px;line-height:2}.rule{width:70px;height:1px;margin:20px 0;background:#8de6dd}
</style><main>${sections.map((section,index)=>`<section class="page"><img class="art" src="${images[index]}"><div class="veil"></div><article class="copy"><div class="k">LINGXIFIELD ORIGINAL FIELD PLATE</div><div class="n">${String(index+1).padStart(2,"0")} · ${section[1]}</div><h1 class="title">${section[0]}</h1><div class="rule"></div><p class="body">${section[2]}</p></article></section>`).join("")}</main>`);
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: output, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`PASS V320 mini publication QA: ${output}`);
