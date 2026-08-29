#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.NODE_PATH?path.join(process.env.NODE_PATH,"playwright"):"playwright");
const root=path.resolve(import.meta.dirname,"..");
const outDir=path.join(root,"output","pdf"); fs.mkdirSync(outDir,{recursive:true});
// Render every formal product asset family, not only representative samples.
// Life Archetype is exported separately as the automatic convergence archive.
const products=[
  ["life-map","生命图谱"],
  ["deep-relationship","深度关系共振"],
  ["business-relationship","合伙商业关系共振"],
  ["other-relationship","其他关系共振"],
  ["resilience","生命韧性"],
  ["romance","桃花磁场"],
  ["wealth","财富创造地图"],
  ["daily-tide","今日潮汐"],
  ["life-mirror","生命镜像"],
  ["life-oracle","生命灵签"],
];
const entryTitles=["结构源点","自然运行方式","现实适应","隐性代价","启动机制","承接机制","边界表达","连接方式","压力反应","恢复入口","价值识别","现实交换","重复模式","场景切换","增强回路","结构张力","低估能力","当前盲区","行动接口","反馈回路","长期观察","近期变化","验证动作","下一次记录"];
const archetypeTitles=["生命原型 · 八流归一","档案来源与主体边界","当前生命原型","原型源点","三条主轴","长期稳定结构","隐性结构","场景切换机制","关系中的原型表达","创造与价值路径","压力下的原型变化","第二结构与适应层","跨域增强回路","结构张力","被抑制的力量","树突连接图谱","当前盲区","被低估的能力","现实承接条件","现实验证入口","八流时间轨迹","证据与置信边界","持续观察协议","八流汇聚，原型自现"];
const esc=(value)=>String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const assetCache=new Map();
const asset=(key,page)=>{const name=`${String(((page-1)%6)+1).padStart(2,"0")}.png`;const cacheKey=`${key}/${name}`;if(!assetCache.has(cacheKey))assetCache.set(cacheKey,`https://assets.lingxifield.local/${cacheKey}`);return assetCache.get(cacheKey);};
const css=`<style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#eef0f6;font-family:"Microsoft YaHei","Noto Sans SC",sans-serif;color:#454151;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{position:relative;width:210mm;height:297mm;overflow:hidden;page-break-after:always;background:#eef0f6}.page:last-child{page-break-after:auto}.art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.veil{display:none}.frame{position:relative;z-index:1;height:100%;padding:15mm 16.93mm;display:flex;flex-direction:column}.meta{display:flex;justify-content:space-between;font-size:8pt;font-weight:600;letter-spacing:.22em;color:#557f79}.content{margin:auto 0}.cover .content,.full .content{margin-top:auto;color:#454151}.title{font-family:Georgia,"Noto Serif SC",serif;font-weight:400;font-size:27pt;line-height:1.2;margin:0 0 7mm;color:#302941;text-shadow:0 1px 7px rgba(255,255,255,.98)}.panel{padding:9mm;border:1px solid rgba(255,255,255,.46);border-radius:1mm;background:linear-gradient(135deg,rgba(252,250,247,.64),rgba(248,246,250,.48));box-shadow:0 3mm 12mm rgba(35,30,55,.05),inset 0 .3mm 0 rgba(255,255,255,.42)}.copy{font-size:12.5pt;line-height:1.78;margin:0 0 4mm;color:#454151}.label{font-size:8.5pt;font-weight:600;letter-spacing:.2em;color:#557f79;margin:0 0 2mm}.entry{padding:6mm;border:1px solid rgba(76,73,102,.14);background:rgba(255,255,255,.24);margin-bottom:3mm}.entry h3{font:400 17pt Georgia,"Noto Serif SC",serif;color:#302941;margin:0 0 4mm}.entry p{font-size:11.5pt;line-height:1.72;margin:2.5mm 0}.footer{margin-top:auto;border-top:1px solid rgba(76,73,102,.16);padding-top:3mm;display:flex;justify-content:space-between;font-size:6.5pt;letter-spacing:.15em;color:#696473}.nodes{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.node{font-size:10.5pt;border-bottom:1px solid rgba(76,73,102,.16);padding-bottom:2mm}.accent{font:400 19pt Georgia,"Noto Serif SC",serif;color:#557f79}.streams{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 7mm;margin:5mm 0}.stream{font-size:10.5pt;padding-bottom:2mm;border-bottom:1px solid rgba(76,73,102,.16)}</style>`;
const page=(index,total,key,title,body,{cover=false,full=false}={})=>`<section class="page ${cover?"cover":""} ${full?"full":""}"><img class="art" src="${asset(key,index)}"><div class="veil"></div><div class="frame"><div class="meta"><span>LINGXIFIELD ORIGINAL ARCHIVE</span><span>${String(index).padStart(2,"0")} / ${String(total).padStart(2,"0")}</span></div><div class="content"><h1 class="title">${esc(title)}</h1><div class="panel">${body}</div></div><div class="footer"><span>FIXED A4 PUBLICATION</span><span>lingxifield.com</span></div></div></section>`;
const productHtml=(key,name)=>{
  const total=30; const pages=[]; pages.push(page(1,total,key,name,`<p class="label">24-EVIDENCE DENDRITIC ARCHIVE</p><p class="accent">档案主体 · PDF验收样本</p><p class="copy">本页保留完整艺术场、档案主体与结构定位；正文从艺术背景上方的透光玻璃进入。</p>`,{cover:true}));
  pages.push(page(2,total,key,"这份报告真正读取什么",`<p class="label">01 · 当前解决什么</p><p class="copy">辨认当下结构如何进入现实，以及真正的断点发生在哪里。</p><p class="label">02 · 如何形成判断</p><p class="copy">以24次选择、节点强弱和共同激活连接作为证据，不用单一分数定义人。</p><p class="label">03 · 现实验证入口</p><p class="copy">将报告收束为可观察、可反馈、可再次验证的行动。</p>`));
  pages.push(page(3,total,key,"节点激活与主轴",`<div class="nodes">${["感知","判断","行动","连接","承接","边界","恢复","现实"].map((n,i)=>`<div class="node">${n}<span style="float:right">${88-i*4}</span></div>`).join("")}</div><p class="copy" style="margin-top:5mm">高分不等于优点，低分也不等于缺陷；它们表示本次证据中结构进入前景的频率。</p>`));
  for(let index=0;index<24;index++){const title=entryTitles[index];pages.push(page(index+4,total,key,`第 ${Math.floor(index/4)+1} 章 · 结构档案`,`<article class="entry"><h3>${String(index+1).padStart(2,"0")} · ${title}</h3><p><b>结构：</b>跨情境选择显示这一节点正在稳定进入前景。</p><p><b>机制：</b>它通过注意、判断、行动与反馈形成可重复路径。</p><p><b>现实：</b>当资源或边界变化时，这一结构会改变表达强度。</p><p><b>可移动点：</b>安排一个七日内可以验证的最小动作，并记录回应。</p></article>`));}
  pages.push(page(28,total,key,"增强、桥接与张力",`<p class="label">共同增强 · 86</p><p class="accent">方向 × 承接</p><p class="copy">两个节点在独立情境中同时进入前景，形成可重复的增强关系。</p><p class="label">结构张力 · 72</p><p class="accent">推进 × 保留</p><p class="copy">真正需要维护的是先后、接口与容量，而不是二选一。</p>`));
  pages.push(page(29,total,key,"证据边界与验证路径",`<p class="copy">本报告依据24次完整选择建立。缺失证据保持缺失，不由想象补全；象征内容必须返回现实验证。</p><p class="label">下一次记录</p><p class="copy">完成一个最小动作，只记录发生了什么、谁如何回应、结构是否移动。</p>`));
  pages.push(page(30,total,key,"让报告回到现实",`<p class="copy">24个条目都保留自己的证据位置。下一次记录将检验结构是否真的改变。</p><p class="accent">证据 → 结构机制 → 现实影响 → 可验证行动</p>`,{full:true})); return pages.join("");
};
const archetypeHtml=()=>archetypeTitles.map((title,i)=>page(i+1,24,["life-map","deep-relationship","resilience","romance","wealth","daily-tide","life-mirror","life-oracle"][i%8],title,i===0?`<p class="label">EIGHT-STREAM CONVERGENCE · 8 / 8</p><div class="streams">${["生命图谱","关系共振","生命韧性","桃花磁场","财富创造地图","今日潮汐","生命镜像","生命灵签"].map((name)=>`<div class="stream"><span style="color:#557f79;margin-right:2mm">●</span>${name}</div>`).join("")}</div><p class="copy">八条生命支流均已完成并进入同一座场域；本档案从完整八流证据开始展开。</p>`:`<p class="label">INFERENCE MODULE</p><p class="accent">方向 × 承接 × 校准</p><p class="copy">本模块读取跨域证据之间的连接关系，不复述任一单独产品结论，也不把八份报告压缩成摘要。所有判断保留证据边界，并回到可观察的现实动作。</p><p class="copy">This module cross-reads independent evidence, preserves tensions and missing data, and returns the structure to an observable real-world action.</p>`,{cover:i===0,full:i===23})).join("");

const renderPublication=async(key,html,fileName)=>{
  const output=path.join(outDir,fileName);
  if(fs.existsSync(output)&&fs.statSync(output).size>1000000){console.log(`SKIP ${key}: existing complete PDF`);return;}
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"C:/Program Files/Google/Chrome/Application/chrome.exe"});
  try{
    const browserPage=await browser.newPage({viewport:{width:794,height:1123}});
    await browserPage.route("https://assets.lingxifield.local/**",async(route)=>{
      const url=new URL(route.request().url());
      const relative=url.pathname.replace(/^\//,"");
      const file=path.join(root,"public","shared","report-assets",...relative.split("/"));
      await route.fulfill({status:200,contentType:"image/png",body:fs.readFileSync(file)});
    });
    await browserPage.setContent(`<!doctype html><html><head><meta charset="utf-8">${css}</head><body>${html}</body></html>`,{waitUntil:"load"});
    await browserPage.waitForFunction(()=>[...document.images].every((img)=>img.complete&&img.naturalWidth>0));
    const overflow=await browserPage.$$eval(".page",pages=>pages.filter((page)=>page.scrollHeight>page.clientHeight+1).length);
    if(overflow)throw new Error(`${key}: ${overflow} overflowing pages`);
    await browserPage.pdf({path:output,format:"A4",printBackground:true,preferCSSPageSize:true});
    console.log(`PASS ${key}`);
  }finally{await browser.close();}
};
for(const [key,name] of products)await renderPublication(key,productHtml(key,name),`v326-${key}-cross-platform-visual-qa.pdf`);
await renderPublication("life-archetype",archetypeHtml(),"v326-life-archetype-cross-platform-visual-qa.pdf");
console.log(`PASS V326 PDF suite: ${products.length+1} cross-platform visual publications rendered to ${outDir}`);
