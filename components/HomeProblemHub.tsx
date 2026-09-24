"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useLingxiLang } from "@/lib/lingxi-i18n";
import { brandText } from "@/lib/brand-system-i18n";

const intents=[
  {words:["pdf","合并","压缩","拆分","ocr","签名","盖章"],href:"/tools",label:"PDF"},
  {words:["图片","照片","jpg","png","webp","水印","放大"],href:"/tools",label:"Images"},
  {words:["视频","字幕","音频","配音","转文字"],href:"/tools",label:"Media"},
  {words:["书","教材","论文","笔记","资料"],href:"/ai-knowledge",label:"Book SASI"},
  {words:["学习","复习","知识"],href:"/ai-learning",label:"Learning SASI"},
  {words:["科研","研究","证据"],href:"/ai-research",label:"Research SASI"},
  {words:["网站","应用","短剧","剧本","广告","mv","cg","创作"],href:"/sasi",label:"SASI"},
];

function best(q:string){
  const s=q.toLowerCase();
  return intents
    .map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length}))
    .sort((a,b)=>b.score-a.score)[0];
}

const cards=[
  {href:"/tools",icon:"🛠️",titleZh:"免费实用工具",titleEn:"Free Practical Tools",descZh:"PDF、图片、视频、字幕、OCR、网页、表格、隐私与日常文件处理。",descEn:"PDF, image, video, subtitles, OCR, web, tables, privacy and everyday file work."},
  {href:"/sasi",icon:"✦",titleZh:"SASI 创作与构建",titleEn:"SASI Creation & Building",descZh:"AI短剧、网站、应用、广告、MV、电影与游戏CG，从一个想法继续做到可用结果。",descEn:"AI short drama, websites, apps, ads, MV, film and game CG—from an idea to a usable result."},
  {href:"/ai-knowledge",icon:"📚",titleZh:"书本 SASI",titleEn:"Book SASI",descZh:"上传书本、论文和资料，变成可以继续追问的知识工作区。",descEn:"Turn books, papers and sources into an askable knowledge workspace."},
  {href:"/ai-learning",icon:"🧠",titleZh:"学习 SASI",titleEn:"Learning SASI",descZh:"围绕资料拆解概念、整理结构、形成可复习的学习空间。",descEn:"Break down concepts, organize structure and build a reviewable learning space."},
  {href:"/ai-research",icon:"🔬",titleZh:"科研 SASI",titleEn:"Research SASI",descZh:"把问题、证据、推理与结论留在同一个研究工作区。",descEn:"Keep questions, evidence, reasoning and conclusions in one research workspace."},
  {href:"/products",icon:"◈",titleZh:"产品中心",titleEn:"Product Center",descZh:"查看当前真实可用的 AI、SASI、工具与余额入口。",descEn:"See the currently available AI, SASI, tools and balance entrances."},
] as const;

export default function HomeProblemHub(){
  const {lang}=useLingxiLang();
  const brand=(k:Parameters<typeof brandText>[1])=>brandText(lang,k);
  const [q,setQ]=useState("");
  const hit=useMemo(()=>best(q),[q]);

  function submit(e:FormEvent){
    e.preventDefault();
    const v=q.trim();
    if(!v)return;
    if(hit?.score>0) location.href=hit.href;
    else{
      sessionStorage.setItem("lx-home-intent",v);
      location.href=`/tools?q=${encodeURIComponent(v)}`;
    }
  }

  const zh=lang==="zh";

  return <main className="lx11-page">
    <div className="lx11-wrap">
      <section className="lx11-home-hero lx-home-v143">
        <p className="lx11-home-kicker">{brand("brandTagline")}</p>
        <h1>{brand("brandLead")}</h1>
        <p>{brand("closing")}</p>
        <form onSubmit={submit} className="lx11-prompt">
          <textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} placeholder={zh?"告诉灵犀场，你现在想处理什么？":"Tell LINGXIFIELD what you want to get done."}/>
          <button>{zh?"开始处理":"Start"}</button>
        </form>
        {q.trim()&&hit?.score>0&&<div className="lx11-suggestion"><span>{zh?"更适合从":"Best place to start:"}</span><Link href={hit.href}>{hit.label}</Link></div>}
      </section>

      <section className="lx11-home-section">
        <div className="lx11-section-heading">
          <div><span>01</span><h2>{zh?"从这里开始":"Start here"}</h2></div>
          <p>{zh?"不用先研究系统，先选你现在要完成的事。":"Choose what you need to accomplish first; no system to learn."}</p>
        </div>
        <div className="lx11-home-grid lx-home-v143-grid">
          {cards.map((item,i)=><Link href={item.href} key={item.href} className={`lx11-home-card lx-v143-card tone-${(i%6)+1}`}>
            <span className="lx-v143-icon" aria-hidden="true">{item.icon}</span>
            <h3>{zh?item.titleZh:item.titleEn}</h3>
            <p>{zh?item.descZh:item.descEn}</p>
            <b>{zh?"进入":"Open"} →</b>
          </Link>)}
        </div>
      </section>

      <section className="lx11-home-section lx-v143-about">
        <div className="lx11-section-heading">
          <div><span>02</span><h2>{zh?"灵犀场是什么":"What is LINGXIFIELD?"}</h2></div>
        </div>
        <div className="lx-v143-about-grid">
          <article><span className="lx-v143-icon tone-a">🧰</span><h3>{zh?"免费实用工具":"Free practical tools"}</h3><p>{zh?"面向 PDF、图片、视频、字幕、网页、表格、文件隐私与日常识别等高频需求，提供可以直接上手、直接得到结果的实用工具。PDF编辑、签名盖章、骑缝章、图片修复与高清放大、图片/视频去水印、图片压缩与格式转换、视频转文字、字幕翻译、网页内容提取、表格转Excel、合同/PDF对比、卡路里识别、临时邮箱、阅后即焚等会持续增加。":"Practical tools for PDFs, images, video, subtitles, web pages, tables, privacy and everyday recognition—designed to be used immediately and return a result."}</p></article>
          <article><span className="lx-v143-icon tone-b">✦</span><h3>{zh?"SASI 创作与构建":"SASI creation & building"}</h3><p>{zh?"从一个想法出发，继续完成 AI短剧生成、网站构建、资料整理、学习研究与智能创作，让灵感不只停留在想法里，而是一步步成为可使用、可发布、可持续迭代的结果。":"Start with an idea and continue into AI short drama, website building, knowledge organization, learning, research and intelligent creation—until the idea becomes something usable, publishable and continuously improvable."}</p></article>
        </div>
      </section>
    </div>
  </main>;
}
