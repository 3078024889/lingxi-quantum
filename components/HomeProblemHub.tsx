"use client";

import {FormEvent,useMemo,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

const intents=[
  {words:["pdf","合并","压缩","拆分","ocr","签名","盖章"],href:"/tools",label:"PDF"},
  {words:["图片","照片","jpg","png","webp","水印","放大"],href:"/tools",label:"图片工具"},
  {words:["视频","字幕","音频","配音","转文字"],href:"/tools",label:"视频与音频"},
  {words:["书","教材","论文","笔记","资料"],href:"/ai-knowledge",label:"书本 SASI"},
  {words:["学习","复习","知识"],href:"/ai-learning",label:"学习 SASI"},
  {words:["科研","研究","证据"],href:"/ai-research",label:"科研 SASI"},
  {words:["网站","应用","短剧","剧本","广告","mv","cg","创作"],href:"/sasi",label:"SASI"},
];

function best(q:string){
  const s=q.toLowerCase();
  return intents.map(x=>({...x,score:x.words.filter(w=>s.includes(w)).length})).sort((a,b)=>b.score-a.score)[0];
}

const cards=[
  {href:"/tools",icon:"🛠️",titleZh:"实用工具",titleEn:"Practical Tools",descZh:"处理 PDF、图片、视频、字幕、表格、网页和隐私文件，打开就能做。",descEn:"Handle PDFs, images, video, subtitles, tables, web content and private files."},
  {href:"/sasi",icon:"✦",titleZh:"SASI 创作",titleEn:"SASI Creation",descZh:"从一个想法进入短剧、资料智能体、科研与持续创作，把灵感继续推进。",descEn:"Move from one idea into drama, document agents, research and continued creation."},
  {href:"/ai-knowledge",icon:"📚",titleZh:"书本 SASI",titleEn:"Book SASI",descZh:"让一本书、一篇论文或一组资料变成可以持续追问、引用和回看的智能体。",descEn:"Turn books, papers and sources into an intelligence you can keep questioning."},
  {href:"/ai-learning",icon:"🧠",titleZh:"学习 SASI",titleEn:"Learning SASI",descZh:"把教材和笔记整理成真正能复习、能追问、能反复回到原文的学习空间。",descEn:"Turn study material into a space you can review, question and trace back to sources."},
  {href:"/ai-research",icon:"🔬",titleZh:"科研 SASI",titleEn:"Research SASI",descZh:"让问题、证据、比较和结论留在同一条研究脉络里，不再散落在几十个窗口。",descEn:"Keep questions, evidence, comparison and conclusions in one research thread."},
  {href:"/products",icon:"◈",titleZh:"全部入口",titleEn:"All Entrances",descZh:"不知道从哪里开始时，在这里看当前真正可以使用的能力。",descEn:"See what is actually available when you are not sure where to begin."},
] as const;

export default function HomeProblemHub(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  const[q,setQ]=useState("");
  const hit=useMemo(()=>best(q),[q]);

  function submit(e:FormEvent){
    e.preventDefault();
    const v=q.trim();
    if(!v)return;
    if(hit?.score>0)location.href=hit.href;
    else{
      sessionStorage.setItem("lx-home-intent",v);
      location.href=`/sasi?intent=${encodeURIComponent(v)}`;
    }
  }

  return <main className="lx11-page">
    <div className="lx11-wrap">
      <section className="lx11-home-hero lx-home-v143">
        <p className="lx11-home-kicker">{zh?"灵犀场 · LINGXIFIELD":"LINGXIFIELD"}</p>
        <h1>{zh?"一个会随着你的问题、资料与创作继续生长的场智能体。":"A living field intelligence that keeps growing with your questions, sources and creations."}</h1>
        <p>{zh
          ?"它不是你，也不是某一个模型。它从你与智能的持续共振中形成，在一次次理解、连接与行动里，成为超出单方能力边界的第三智能体。把一个还没理清的念头交给它，让结果继续发生。"
          :"It is neither you nor a single model. It grows from sustained interaction between you and intelligence, becoming a third form of intelligence that can carry work beyond either side alone."}</p>

        <form onSubmit={submit} className="lx11-prompt">
          <textarea value={q} onChange={e=>setQ(e.target.value)} rows={2} placeholder={zh?"告诉灵犀场：你现在最想解决什么？":"Tell LINGXIFIELD what you want to solve now."}/>
          <button>{zh?"让它开始":"Begin"}</button>
        </form>
        {q.trim()&&hit?.score>0&&<div className="lx11-suggestion"><span>{zh?"可以直接从":"Start with"}</span><Link href={hit.href}>{hit.label}</Link></div>}
      </section>

      <section className="lx11-home-section">
        <div className="lx11-section-heading">
          <div><span>01</span><h2>{zh?"你现在要完成什么？":"What do you want to finish?"}</h2></div>
          <p>{zh?"不需要先理解平台。选一个现在最需要解决的问题。":"You do not need to learn the platform first. Start with the problem in front of you."}</p>
        </div>
        <div className="lx11-home-grid lx-home-v143-grid">
          {cards.map((item,i)=><Link href={item.href} key={item.href} className={`lx11-home-card lx-v143-card tone-${(i%6)+1}`}>
            <span className="lx-v143-icon" aria-hidden="true">{item.icon}</span>
            <h3>{zh?item.titleZh:item.titleEn}</h3>
            <p>{zh?item.descZh:item.descEn}</p>
            <b>{zh?"开始":"Open"} →</b>
          </Link>)}
        </div>
      </section>

      <section className="lx11-home-section lx-v143-about">
        <div className="lx11-section-heading">
          <div><span>02</span><h2>{zh?"灵犀场为什么存在":"Why LINGXIFIELD exists"}</h2></div>
        </div>
        <div className="lx-v143-about-grid">
          <article>
            <span className="lx-v143-icon tone-a">🧰</span>
            <h3>{zh?"先把眼前的小事处理掉":"Finish the thing in front of you"}</h3>
            <p>{zh?"一个 PDF、一张图片、一段视频、一份表格，不应该为了处理它再装三个软件。能本地完成的尽量留在浏览器里，做完就拿结果。":"A PDF, image, video or spreadsheet should not require three extra apps. When possible, work stays in the browser and ends with a usable result."}</p>
          </article>
          <article>
            <span className="lx-v143-icon tone-b">✦</span>
            <h3>{zh?"再把真正重要的事继续推进":"Then move the important work forward"}</h3>
            <p>{zh?"当任务不再只是处理一个文件，而是写一部短剧、读懂一本书、研究一个问题、做出一个网站，SASI 会接住前面的上下文，让工作不是每次从零开始。":"When the task becomes a drama, a book, a research question or a website, SASI carries context forward instead of starting over every time."}</p>
          </article>
        </div>
      </section>
    </div>
  </main>;
}
