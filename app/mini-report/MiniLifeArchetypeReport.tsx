"use client";

import { useRef, useState } from "react";
import Bi from "@/components/Bi";
import ReportReturnBar from "./ReportReturnBar";
import { PublicationCopy, PublicationLabel, PublicationPage } from "./PublicationPage";
import { selectPdfArt, WEB_ARCHETYPE_PDF_ART_POOL } from "@/lib/report-art-registry";
import type { DendriteResult, LifeArchetypeEvidenceLevel } from "@/lib/mini/dendrite-engine";

const FIELD_LABELS:Record<string,string>={"life-map-report":"生命图谱","relationship-resonance":"关系共振","resilience-report":"生命韧性","romance-report":"桃花磁场","wealth-report":"财富创造地图","daily-tide-report":"今日潮汐","tarot-reading":"生命镜像","qian-reading":"生命灵签"};
const LEVEL_LABELS:Record<LifeArchetypeEvidenceLevel,string>={established:"已立",strong:"强证",developing:"生长中",conditional:"有条件",insufficient:"证未足"};

export default function MiniLifeArchetypeReport({reportId,subjectName,createdAt,result}:{reportId:string;subjectName:string;createdAt:string;result:DendriteResult}) {
  const reportRef=useRef<HTMLDivElement>(null);
  const[downloading,setDownloading]=useState(false);
  const[error,setError]=useState("");
  const art=(page:number)=>selectPdfArt(WEB_ARCHETYPE_PDF_ART_POOL,reportId,page).src;
  const readings=result.archetypeReadings??[];
  const coverage=result.archetypeCoverage;
  const total=readings.length+1;
  const date=(value?:string)=>value?new Date(value).toLocaleDateString("zh-CN"):"未记录";
  const download=async()=>{
    if(!reportRef.current||downloading)return;
    setDownloading(true);setError("");
    try{
      const{exportPublicationPagesPdf}=await import("@/lib/pdf-export");
      await exportPublicationPagesPdf({containerRef:reportRef.current,fileName:"生命原型-V6-八流归一-封面与24条档案.pdf"});
    }catch(error){console.error(error);setError("PDF 未能完整生成。系统已阻止空图或残缺页面下载，请稍后重试。");}
    finally{setDownloading(false);}
  };

  if(!coverage||coverage.engineVersion!=="v6"||coverage.identityVerified!==true||readings.length!==24){
    return <main className="min-h-screen bg-[#07102c] px-5 py-24 text-bone"><section className="mx-auto max-w-2xl border border-amber/30 bg-white/[.04] p-8"><p className="text-xs tracking-[.28em] text-amber">ARCHIVE HELD</p><h1 className="mt-4 font-display text-3xl">此卷尚未通过 V6 证据核验</h1><p className="mt-5 leading-8 text-bone-dim">旧档案、不同姓名档案或缺少底层证据的支流不会被补写成生命原型。请返回八流进度，按同一姓名重新核验。</p><a href="/archetype" className="mt-7 inline-block border border-lattice/50 px-5 py-3 text-lattice">返回八流进度</a></section></main>;
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(127,91,180,.34),transparent_30%),radial-gradient(circle_at_88%_24%,rgba(43,156,168,.28),transparent_35%),#07102c] text-bone">
    <ReportReturnBar miniLabel="返回八流进度"/>
    <div ref={reportRef} className="space-y-7 px-3 py-8 sm:px-6">
      <PublicationPage index={1} total={total} eyebrow="LIFE ARCHETYPE V6 · EIGHT-STREAM CONVERGENCE" title={<Bi zh="生命原型 · 八流归一" en="Life Archetype · Eight Streams Converged"/>} art={art(1)} layout="cover">
        <div className="flex items-start justify-between gap-5"><div><PublicationLabel><Bi zh={`档案主体 · ${subjectName}`} en={`Archive subject · ${subjectName}`}/></PublicationLabel><p className="mt-2 text-xs leading-6 opacity-65">同账户 · 姓名完全核验 · 365 天窗口</p></div><p className="font-display text-3xl text-[#557f79]">8 / 8</p></div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-[12px] text-[#454151] sm:grid-cols-4"><div className="border border-[#4c4966]/15 bg-white/30 p-3"><span className="block text-[10px] tracking-[.16em] opacity-60">ENGINE</span>V6</div><div className="border border-[#4c4966]/15 bg-white/30 p-3"><span className="block text-[10px] tracking-[.16em] opacity-60">SOURCE REPORTS</span>{coverage.sourceReports} 份</div><div className="border border-[#4c4966]/15 bg-white/30 p-3"><span className="block text-[10px] tracking-[.16em] opacity-60">EVIDENCE LEAVES</span>{coverage.evidenceLeaves} 枚</div><div className="border border-[#4c4966]/15 bg-white/30 p-3"><span className="block text-[10px] tracking-[.16em] opacity-60">IDENTITY</span>已核验</div></div>
        <p className="mt-4 text-xs leading-6 opacity-65">取证期：{date(coverage.windowStart)} — {date(coverage.windowEnd)} · 成卷：{new Date(createdAt).toLocaleString("zh-CN")}</p>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2">{coverage.streamEvidence.map((stream)=><div key={stream.productId} className="border-b border-[#4c4966]/15 pb-2 text-[12px] text-[#454151]"><span className="mr-2 text-[#557f79]">●</span>{FIELD_LABELS[stream.productId]}<span className="float-right opacity-60">{stream.evidenceCount} 证 · 入 {stream.readingCount} 条</span></div>)}</div>
        <PublicationCopy><Bi zh="八流各守其证，交会而不相吞；同象相扶，异象留隙。今据其反复、相逆、所承与未发，成二十四问，以见此人当下之全局。" en="Eight streams retain their own evidence while converging. Repetition, contradiction, capacity and latent force are recomposed into twenty-four readings of the present whole."/></PublicationCopy>
      </PublicationPage>
      {readings.map((reading,index)=><PublicationPage key={reading.id} index={index+2} total={total} eyebrow={`LIFE ARCHETYPE V6 · ${reading.id.toUpperCase()}`} title={<Bi zh={reading.titleZh} en={reading.titleEn}/>} art={art(index+2)} layout={index===readings.length-1?"full":"split"}>
        <p className="mb-5 border-l-2 border-[#557f79]/55 pl-4 font-display text-lg leading-8 text-[#557f79]">{reading.briefZh}</p>
        <PublicationCopy><Bi zh={reading.classicalZh} en={reading.briefEn}/></PublicationCopy>
        <div className="mt-6 border-t border-[#4c4966]/15 pt-5 text-[12px] leading-6 text-[#454151]/80"><p>{reading.evidenceZh}</p><p className="mt-3">{reading.verificationZh}</p></div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] tracking-[.1em] text-[#557f79]"><span className="border border-[#557f79]/30 px-2 py-1">{LEVEL_LABELS[reading.evidenceLevel]}</span>{reading.supportStreams.map((id)=><span key={id} className="border border-[#4c4966]/15 bg-white/25 px-2 py-1">{FIELD_LABELS[id]}</span>)}</div>
      </PublicationPage>)}
    </div>
    <div className="mx-auto max-w-[794px] px-3 pb-16 sm:px-6"><button onClick={download} disabled={downloading} className="w-full border border-lattice/50 bg-lattice/10 py-4 text-sm tracking-widest2 text-lattice">{downloading?"正在生成封面与 24 条固定 A4 档案…":"下载生命原型 V6 完整 PDF"}</button>{error&&<p className="mt-3 text-center text-xs text-rose-300">{error}</p>}</div>
  </main>;
}
