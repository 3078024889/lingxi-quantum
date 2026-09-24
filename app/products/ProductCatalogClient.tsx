"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLingxiLang } from "@/lib/lingxi-i18n";

const ai=[
  {href:"/ai-knowledge",icon:"📚",code:"BK",zh:"书本 SASI",en:"Book SASI",dzh:"上传书本、论文、讲义与资料，把原文变成可以继续追问的知识工作区。",den:"Turn books, papers and sources into an askable knowledge workspace."},
  {href:"/ai-learning",icon:"🧠",code:"ST",zh:"学习 SASI",en:"Learning SASI",dzh:"围绕资料学习、拆解概念、整理知识结构与复习路径。",den:"Learn around your sources, break down concepts and build reviewable structure."},
  {href:"/ai-research",icon:"🔬",code:"RS",zh:"科研 SASI",en:"Research SASI",dzh:"把问题、证据、推理、冲突与结论留在同一个研究空间。",den:"Keep questions, evidence, reasoning, conflicts and conclusions together."},
];

const main=[
  {href:"/sasi",icon:"✦",tone:"violet",zh:"SASI 创作与构建",en:"SASI Creation & Building",dzh:"AI短剧、广告、MV、电影、网站、应用与游戏CG，从一个想法继续推进成作品。",den:"AI short drama, ads, MV, film, websites, apps and game CG—from an idea into a finished work."},
  {href:"/tools",icon:"🛠️",tone:"cyan",zh:"免费实用工具",en:"Free Practical Tools",dzh:"PDF、图片、视频、字幕、OCR、表格、网页与隐私处理，一打开就能用。",den:"PDF, images, video, subtitles, OCR, tables, web and privacy tools—ready to use."},
];

export default function ProductCatalogClient(){
  const {lang}=useLingxiLang();
  const zh=lang==="zh";
  const [ready,setReady]=useState<boolean|null>(null);

  useEffect(()=>{
    let alive=true;
    fetch("/api/sasi/readiness",{cache:"no-store"})
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(alive)setReady(Boolean(data?.productionReady))})
      .catch(()=>{if(alive)setReady(false)});
    return()=>{alive=false};
  },[]);

  return <main className="lx11-page lx-product-v143">
    <div className="lx11-wrap py-16 sm:py-20">
      <section className="lx-v143-product-hero">
        <div>
          <p className="lx11-kicker">{zh?"灵犀场 · 产品中心":"LINGXIFIELD · Product Center"}</p>
          <h1>{zh?"真实可用的产品，都在这里。":"Everything here is available to use."}</h1>
          <p>{zh?"不再混入旧版探索产品。现在只保留 AI 工作区、SASI 创作、实用工具与清晰的余额入口。":"The catalog now contains only AI workspaces, SASI creation, practical tools and clear balance entrances."}</p>
        </div>
        <span className="lx-v143-orbit">◌</span>
      </section>

      <section className="mt-12">
        <div className="lx-v143-section-title"><span>01</span><h2>{zh?"AI 工作区":"AI Workspaces"}</h2></div>
        <div className="lx-v143-product-grid">
          {ai.map((item,i)=><Link href={item.href} key={item.href} className={`lx-v143-product-card tone-${i+1}`}>
            <span className="lx-v143-icon">{item.icon}</span>
            <small>{item.code}</small>
            <h3>{zh?item.zh:item.en}</h3>
            <p>{zh?item.dzh:item.den}</p>
            <b>{zh?"进入工作区":"Open workspace"} →</b>
          </Link>)}
        </div>
      </section>

      <section className="mt-12">
        <div className="lx-v143-section-title"><span>02</span><h2>{zh?"创作与处理":"Create & Process"}</h2></div>
        <div className="lx-v143-main-grid">
          {main.map(item=><Link href={item.href} key={item.href} className={`lx-v143-main-card ${item.tone}`}>
            <span className="lx-v143-icon">{item.icon}</span>
            <h3>{zh?item.zh:item.en}</h3>
            <p>{zh?item.dzh:item.den}</p>
            {item.href==="/sasi"&&<small>{ready===true?(zh?"生产能力已开放":"Production ready"):ready===false?(zh?"可先构建项目，付费生产按实时状态开放":"Build projects now; paid production follows live readiness"):"…"}</small>}
          </Link>)}
        </div>
      </section>

      <section className="mt-12">
        <div className="lx-v143-section-title"><span>03</span><h2>{zh?"余额":"Balances"}</h2></div>
        <div className="lx-v143-wallet-grid">
          <Link href="/ai-wallet"><span className="lx-v143-icon">💠</span><div><b>AI Balance</b><p>{zh?"托管 AI 服务按实际使用扣费。":"Hosted AI services are charged by actual usage."}</p></div><em>→</em></Link>
          <Link href="/sasi/pricing"><span className="lx-v143-icon">🎬</span><div><b>SASI Creation Balance</b><p>{zh?"用于你明确确认后的 SASI 创作与生产任务。":"For SASI creation and production tasks you explicitly approve."}</p></div><em>→</em></Link>
        </div>
      </section>
    </div>
  </main>;
}
