import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require=createRequire(import.meta.url);
const { chromium }=require(path.join(process.env.NODE_PATH,"playwright"));
const root=process.cwd(); const out=path.join(root,"tmp","pdfs","v321-life-archetype-22-page-qa.pdf");
fs.mkdirSync(path.dirname(out),{recursive:true});
const img=(file)=>`data:image/${path.extname(file).slice(1)};base64,${fs.readFileSync(file).toString("base64")}`;
const archetype=img(path.join(root,"public","images","qian","38.jpg"));
const dirs=["lifemap","relationship-full/romantic","resilience-full","romance-full","wealth-full","daily-tide-full","tarot-full","qian-full"];
const arts=dirs.map((dir,index)=>img(path.join(root,"public","images",dir,`page-${(index*5+2)%12}.png`)));
const pages=[
  ["生命原型 · 八流归一","CURRENT ARCHETYPE","39 · 内在建筑师","八条生命支流汇入同一张树突知识网络，此刻最清晰的共同力量开始显现。",archetype],
  ["八流归一序言","EIGHT STREAMS AS ONE","不是八份报告的叠加","系统读取长期重复、近期增强、彼此支撑、现实张力与暂时受到抑制的力量。",arts[0]],
  ["当前生命原型","CURRENT LIFE ARCHETYPE","39 · 内在建筑师","结构证据清晰。当前任务不是继续增加方向，而是让复杂信息形成可运行的现实结构。",archetype],
  ["八流汇聚图","DENDRITIC CONVERGENCE MAP","八条独立证据路径","生命图谱、关系、韧性、吸引、财富、潮汐、镜像与灵签保留各自证据并在中心汇聚。",null],
  ["为什么是这一枚","WHY THIS ARCHETYPE","长期 × 跨域 × 近期 × 抑制","系统同时保留支持证据与反证，避免只挑选最像或最讨喜的答案。",null],
  ...dirs.map((dir,index)=>[["生命图谱","关系共振","生命韧性","桃花磁场","财富创造地图","今日潮汐","生命镜像","生命灵签"][index],`STREAM ${String(index+1).padStart(2,"0")}`,"本流核心信号",`本流以${["长期支撑","边界校准","现实承接","关系前置信号","价值流动","当前校准","事件验证","意识方向"][index]}进入当前原型，并保留自己的节点证据。`,arts[index]]),
  ["八流贡献矩阵","FIELD CONTRIBUTION MATRIX","八域各自保留证据","贡献强度描述当前作用位置，不是价值高低，也不会把八份结果压成摘要。",null],
  ["跨域共同增强","CROSS-FIELD AMPLIFICATION","结构重建","多个独立场域同时出现近似节点，因此形成当前最稳定的共同增强回路。",arts[4]],
  ["当前结构关系图","STRUCTURE RELATION MAP","核心 · 支撑 · 张力 · 潜在 · 抑制","五层结构让用户看见力量怎样相连、在哪些位置互相牵引。",null],
  ["正在形成的张力","ACTIVE TENSIONS","推进 × 承接","理解已经发生，现实尚未容纳；需要调整节奏与接口，不是继续加大意志。",null],
  ["被抑制的力量","INHIBITED CAPACITIES","雷霆突破者","变化意愿已经出现，但近期恢复成本较高，因此暂未进入主原型。",archetype],
  ["当前现实入口","ONE REALITY ENTRANCE","完成一次结构收束","从最重要的一件事中删去一个已不承担核心作用的步骤，并观察专注是否回流。",arts[6]],
  ["八流生命轨迹","EIGHT-STREAM TRAJECTORY","第一支流 → 八流归一","每条支流保留完成时间，形成可验证的生命档案时间轴。",null],
  ["灵犀场树突演算说明","DENDRITIC ENGINE NOTES","零 Token · 本地知识结构","任何单题不会直接决定原型；缺失数据保持缺失，不用想象填补。",arts[7]],
  ["八流汇聚，原型自现","LINGXIFIELD ORIGINAL ARCHIVE","下一次更新只接受新证据","未来支流形成新记录后，只有节点与现实验证发生实质变化，原型才会更新。",archetype],
];
if(pages.length!==22)throw new Error(`expected 22 pages, got ${pages.length}`);
const browser=await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const page=await browser.newPage({viewport:{width:794,height:1123}});
await page.setContent(`<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#07102c;color:#f2f4ff;font-family:"Microsoft YaHei",sans-serif}.p{position:relative;width:794px;height:1123px;overflow:hidden;padding:48px;page-break-after:always;background:radial-gradient(circle at 12% 8%,rgba(126,91,180,.4),transparent 32%),radial-gradient(circle at 88% 25%,rgba(43,156,168,.3),transparent 34%),#07102c}.art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.veil{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(7,16,44,.48),rgba(7,16,44,.83) 56%,#07102c)}.inner{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}.top,.foot{display:flex;justify-content:space-between;font-size:10px;letter-spacing:3px;color:#84e5d9}.title{margin:34px 0 0;font:44px Georgia,"Microsoft YaHei"}.content{margin-top:auto;padding:28px;border:1px solid rgba(132,229,217,.42);background:rgba(7,16,44,.82)}.lead{font:28px Georgia,"Microsoft YaHei";color:#84e5d9}.body{font-size:17px;line-height:2;color:#d8def2}.nodes{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:28px}.node{padding:17px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.035);font-size:14px}.foot{margin-top:28px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12);color:#8b91ae}</style><main>${pages.map((p,index)=>`<section class="p">${p[4]?`<img class="art" src="${p[4]}"><div class="veil"></div>`:""}<div class="inner"><div class="top"><span>${p[1]}</span><span>${String(index+1).padStart(2,"0")} / 22</span></div><h1 class="title">${p[0]}</h1>${index===3?`<div class="nodes">${dirs.map((_,i)=>`<div class="node">${["生命图谱","关系共振","生命韧性","桃花磁场","财富创造","今日潮汐","生命镜像","生命灵签"][i]} · 已汇入</div>`).join("")}</div>`:""}<div class="content"><div class="lead">${p[2]}</div><p class="body">${p[3]}</p></div><div class="foot"><span>LINGXIFIELD DENDRITIC ARCHIVE</span><span>lingxifield.com</span></div></div></section>`).join("")}</main>`);
await page.pdf({path:out,format:"A4",printBackground:true,preferCSSPageSize:true}); await browser.close();
console.log(`PASS V321 22-page Life Archetype QA: ${out}`);
