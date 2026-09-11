"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Bi from "./Bi";
import { getFieldInsight } from "./FieldInsightsSection";
import "./assessment-workbench.css";

const REPORTS = {
  qian: dynamic(() => import("@/app/qian/full/QianReport")),
  mirror: dynamic(() => import("@/app/mirror/reading/full/TarotReadingReport")),
  wealth: dynamic(() => import("@/app/wealth/full/WealthReportView")),
  romance: dynamic(() => import("@/app/romance/full/RomanceReportView")),
  resilience: dynamic(() => import("@/app/resilience/full/ResilienceReportView")),
  relationship: dynamic(() => import("@/app/relationship/full/RelationshipReportView")),
  daily: dynamic(() => import("@/app/daily/full/DailyTideReportView")),
};
export type AssessmentProduct = keyof typeof REPORTS;
const COVERS: Record<AssessmentProduct, string> = {
  qian: "qian-full", mirror: "tarot-full", wealth: "wealth-full", romance: "romance-full",
  resilience: "resilience-full", relationship: "relationship-full/romantic", daily: "daily-tide-full",
};

export function AssessmentEmpty() {
  return <div className="aw-empty"><span aria-hidden>✧</span><h3><Bi zh="先看见自己，再决定深入" en="See yourself before going deeper" /></h3><p><Bi zh="填写姓名与出生日期，开启你的免费预览。结果会在这里展开，你可以先阅读，再决定是否解锁完整档案。" en="Enter your name and birth date to open your free preview here. Read it before deciding whether to unlock the complete archive." /></p></div>;
}

export default function AssessmentWorkbench({ product, input, preview, faq, busy = false, cover }: {
  product: AssessmentProduct; input: ReactNode; preview: ReactNode; faq?: ReactNode; busy?: boolean; cover?: string;
}) {
  const item = getFieldInsight(`/${product}`)!;
  const [focus, setFocus] = useState("balanced");
  const [archive, setArchive] = useState<string | null>(null);
  useEffect(() => { setArchive(new URLSearchParams(window.location.search).get("archive")); }, []);
  const Report = REPORTS[product];
  return <section className="aw" data-focus={focus} data-product={product}>
    <header className="aw-hero"><div><small>LINGXIFIELD · FIELD {item.no}</small><h1><Bi zh={product === "qian" ? "生命灵签" : item.zh} en={product === "qian" ? "Life Oracle" : item.en} /></h1><p><Bi zh="填写信息 → 免费预览 → 完整档案与 PDF" en="Your details → Free preview → Complete archive & PDF" /></p></div><blockquote><Bi zh={item.leadZh} en={item.leadEn} /></blockquote></header>
    <nav className="aw-controls" aria-label="工作区视图"><span><Bi zh="你的探索工作区" en="Your exploration workspace" /></span>{[{ id: "balanced", zh: "均衡", en: "Balanced" }, { id: "input", zh: "放大填写", en: "Details" }, { id: "preview", zh: "放大预览", en: "Preview" }, { id: "archive", zh: "放大档案", en: "Archive" }].map(v => <button key={v.id} aria-pressed={focus === v.id} onClick={() => setFocus(v.id)}><Bi zh={v.zh} en={v.en} /></button>)}</nav>
    <div className="aw-grid">
      <section className="aw-column aw-input"><div className="aw-column-title"><b>1</b><h2><Bi zh="从此刻的你开始" en="Begin with yourself" /></h2></div>
        <div className="aw-intro"><h3><Bi zh={item.leadZh} en={item.leadEn} /></h3><p><Bi zh={item.bodyZh[0]} en={item.bodyEn[0]} /></p><details><summary><Bi zh="如何理解这次探索" en="How to approach this exploration" /></summary>{item.bodyZh.slice(1).map((zh, i) => <p key={i}><Bi zh={zh} en={item.bodyEn[i + 1]} /></p>)}{item.closingZh && <p><Bi zh={item.closingZh} en={item.closingEn || ""} /></p>}</details><a href="#assessment-input"><Bi zh={item.ctaZh} en={item.ctaEn} /> ↓</a></div>
        <fieldset id="assessment-input" disabled={busy} className="aw-form">{input}</fieldset>{faq}
      </section>
      <section className="aw-column aw-preview" aria-busy={busy}><div className="aw-column-title"><b>2</b><h2><Bi zh="免费预览" en="Free preview" /></h2><small>FREE</small></div>{preview}</section>
      <section className="aw-column aw-archive"><div className="aw-column-title"><b>3</b><h2><Bi zh="完整档案与 PDF" en="Complete archive & PDF" /></h2></div>{archive ? <Report id={archive} /> : <div className="aw-locked"><div className="aw-cover"><img src={cover || `/images/${COVERS[product]}/page-0.png`} alt={`${item.zh} · 封面设计`} /><div><small>LINGXIFIELD</small><h3><Bi zh={product === "qian" ? "生命灵签" : item.zh} en={product === "qian" ? "Life Oracle" : item.en} /></h3><p><Bi zh="灵犀场 · 专属探索档案" en="Your personal exploration archive" /></p></div></div><small><Bi zh="档案封面 · 非个人结果" en="Cover artwork · not a personal result" /></small><h3><Bi zh="把此刻的理解，留成可回看的档案" en="Keep this understanding in an archive" /></h3><p><Bi zh="读完免费预览与章节介绍后，再决定是否解锁。完成支付后，你的完整报告将在这里展开，可阅读、下载 PDF，也可从账户中再次进入。" en="Read your free preview and chapter guide before deciding. After payment, your complete report opens here to read, download as PDF, and revisit from your account." /></p><a href="/account"><Bi zh="查看已有档案 →" en="Visit existing archives →" /></a></div>}</section>
    </div>
  </section>;
}
