"use client";

import { useRef, useState } from "react";
import Bi from "@/components/Bi";
import ReportReturnBar from "./ReportReturnBar";
import { PublicationCopy, PublicationLabel, PublicationPage } from "./PublicationPage";
import { PDF_ASSET_REGISTRY, productArtKey, selectPdfArt } from "@/lib/report-art-registry";
import type { DendriteReportEntry } from "@/lib/mini/report-entry-library";

type Result = {
  titleZh:string; titleEn:string; insightZh:string; insightEn:string;
  nodes:Array<{id:string;zh:string;en:string;score:number;actionZh?:string;actionEn?:string}>;
  dominant:Array<{id:string;zh:string;en:string;score:number;actionZh?:string;actionEn?:string}>;
  evidence?:{answered:number;total:number;historyProducts:number;sourceZh:string;sourceEn:string};
  structuralRelations?:Array<{from:string;to:string;kind:"reinforce"|"bridge"|"tension";strength:number}>;
  reportEntries?:DendriteReportEntry[];
};

const EDITORIAL: Record<string, [string,string,string]> = {
  "life-map-report":["长期结构与现实角色是否仍在同一条线上","跨情境读取本源倾向、现实适应与适应成本","以无人要求时的自然选择校准现实角色"],
  "relationship-resonance":["两个人真实形成的第三种关系结构","比较靠近、表达、安全、边界、冲突与修复","把一处感知落差改写为双方可验证的回应"],
  "resilience-report":["表面恢复、可用能量与恢复成本之间的差","读取压力进入、承接、回弹与再次投入的时间差","建立七天双轨记录，分别记录功能与容量"],
  "romance-report":["吸引在哪里形成，又在哪里停止进入双向互动","共同读取可见度、靠近许可、边界与现实回应","发出一个清晰、有边界且可被回应的兴趣信号"],
  "wealth-report":["价值创造与现实交换之间的具体断点","追踪价值的创造、命名、交付、验证与复制","把一个已有成果改写成可交换的现实交付"],
  "daily-tide-report":["让今天的决定与今天真实可用的容量一致","读取能量、负载、专注与连接窗口","调整一项任务强度并在日末验证容量"],
  "tarot-reading":["从同一面镜像中分开经验、条件与行动空间","以三重镜像打开互不替代的观察位置","移动一个最小现实变量并记录反馈"],
  "qian-reading":["让难以命名的经验获得象征坐标","以源流、灵魂与行者校准意义和行动","将最有触动的象征句转成三日观察"],
};
const confidenceLabel={clear:"证据清晰",developing:"正在形成",open:"保持开放"} as const;

export default function MiniDendriteReport({reportId,relationshipType,productId,productName,subjectName,createdAt,result}:{reportId:string;relationshipType?:string;productId:string;productName:string;subjectName:string;createdAt:string;result:Result}) {
  const reportRef=useRef<HTMLDivElement>(null);
  const [downloading,setDownloading]=useState(false); const [downloaded,setDownloaded]=useState(false); const [downloadError,setDownloadError]=useState("");
  const artPool=PDF_ASSET_REGISTRY[productArtKey(productId,relationshipType)];
  const art=(page:number)=>selectPdfArt(artPool,reportId,page).src;
  const entries=(result.reportEntries??[]).slice(0,24);
  const nodeById=new Map(result.nodes.map((node)=>[node.id,node.zh]));
  const editorial=EDITORIAL[productId]??EDITORIAL["life-map-report"];
  // A paid archive keeps one evidence entry per page. This protects the
  // elderly-friendly reading size instead of shrinking 24 entries to fit an
  // arbitrary page count.
  const total=30;
  const download=async()=>{if(!reportRef.current||downloading)return;setDownloading(true);setDownloadError("");try{const{exportPublicationPagesPdf}=await import("@/lib/pdf-export");await exportPublicationPagesPdf({containerRef:reportRef.current,fileName:`${productName}-完整场域档案.pdf`});setDownloaded(true);}catch(error){console.error(error);setDownloadError("PDF 未能完整生成。系统已阻止空图或残缺页面下载，请稍后重试；网页档案仍已保存。");}finally{setDownloading(false);}};
  return <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(127,91,180,.34),transparent_30%),radial-gradient(circle_at_88%_24%,rgba(43,156,168,.28),transparent_35%),#0a1330] text-bone">
    <ReportReturnBar miniLabel="返回我的场域"/>
    <div ref={reportRef} className="space-y-7 px-3 py-8 sm:px-6">
      <PublicationPage index={1} total={total} eyebrow="LINGXIFIELD DENDRITIC ARCHIVE" title={productName} art={art(1)} layout="cover"><PublicationLabel>档案主体 · {subjectName}</PublicationLabel><p className="mt-3 text-xs opacity-70">{new Date(createdAt).toLocaleString("zh-CN")}</p><p className="mt-6 font-display text-2xl text-[#557f79]"><Bi zh={result.titleZh} en={result.titleEn}/></p><PublicationCopy><Bi zh={result.insightZh} en={result.insightEn}/></PublicationCopy></PublicationPage>
      <PublicationPage index={2} total={total} eyebrow="EDITORIAL POSITION" title="这份报告真正读取什么" art={art(2)}><div className="grid gap-4">{["当前解决什么","如何形成判断","现实验证入口"].map((label,index)=><article key={label} className="border-l border-[#78b8b7] pl-4"><PublicationLabel>{String(index+1).padStart(2,"0")} · {label}</PublicationLabel><PublicationCopy>{editorial[index]}</PublicationCopy></article>)}</div></PublicationPage>
      <PublicationPage index={3} total={total} eyebrow="NODE ACTIVATION MAP" title="节点激活与主轴" art={art(3)}><div className="grid grid-cols-2 gap-x-6 gap-y-3">{result.nodes.map((node)=><div key={node.id}><div className="flex justify-between text-[11px]"><span>{node.zh}</span><span>{node.score}</span></div><div className="mt-1.5 h-1.5 bg-[#514f67]/12"><div className="h-full bg-gradient-to-r from-[#79c9c1] to-[#a98bce]" style={{width:`${node.score}%`}}/></div></div>)}</div><PublicationCopy muted>高分不等于优点，低分也不等于缺陷。它们表示哪些结构更常进入前景，哪些仍需要现实场景继续验证。</PublicationCopy></PublicationPage>
      {entries.map((entry,entryIndex)=><PublicationPage key={entry.id} index={entryIndex+4} total={total} eyebrow={`ARCHIVE ENTRY ${String(entryIndex+1).padStart(2,"0")}`} title={<Bi zh={entry.chapterZh??"结构档案"} en={entry.chapterEn??"Structural Archive"}/>} art={art(entryIndex+4)}><article className="p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><h3 className="font-display text-xl sm:text-2xl">{String(entryIndex+1).padStart(2,"0")} · <Bi zh={entry.titleZh} en={entry.titleEn}/></h3><span className="shrink-0 text-[11px] text-[#557f79]">{confidenceLabel[entry.confidence]}</span></div><p className="mt-5 font-display text-[17px] leading-[1.9] text-[#343043] sm:text-[19px]"><Bi zh={entry.structureZh} en={entry.structureEn}/></p><p className="mt-4 text-[15px] leading-[1.85] sm:text-[17px]"><Bi zh={entry.mechanismZh} en={entry.mechanismEn}/></p><p className="mt-4 border-l border-[#78b8b7] pl-4 text-[15px] leading-[1.85] sm:text-[17px]"><Bi zh={entry.realityZh} en={entry.realityEn}/></p>{entry.strengthZh&&<p className="mt-3 text-[14px] leading-[1.75] text-[#557f79]"><Bi zh={entry.strengthZh} en={entry.strengthEn??""}/></p>}{entry.costZh&&<p className="mt-3 text-[14px] leading-[1.75] text-[#6d4891]"><Bi zh={entry.costZh} en={entry.costEn??""}/></p>}<p className="mt-4 text-[15px] leading-[1.85] sm:text-[17px]"><Bi zh={entry.actionZh} en={entry.actionEn}/></p><p className="mt-4 text-[13px] leading-[1.75] text-[#696473]"><Bi zh={entry.observationZh} en={entry.observationEn}/></p></article></PublicationPage>)}
      <PublicationPage index={28} total={total} eyebrow="STRUCTURAL RELATIONS" title={<Bi zh="增强、桥接与张力" en="Reinforcement, Bridges and Tensions"/>} art={art(28)}><div className="grid gap-4">{(result.structuralRelations??[]).map((relation,index)=><article key={index} className="border-l border-[#78b8b7] p-4"><PublicationLabel>{{reinforce:"共同增强",bridge:"现实桥接",tension:"结构张力"}[relation.kind]} · {relation.strength}</PublicationLabel><p className="mt-2 font-display text-xl">{nodeById.get(relation.from)} × {nodeById.get(relation.to)}</p><PublicationCopy muted><Bi zh="这条关系来自节点共现与差值，不是单项分数的重新命名。下一次相似情境中，观察两者的启动先后和现实承接。" en="This relationship comes from node co-activation and difference, not a renamed score. In the next similar context, observe sequence and real-world capacity."/></PublicationCopy></article>)}</div></PublicationPage>
      <PublicationPage index={29} total={total} eyebrow="EVIDENCE AND ACTION" title={<Bi zh="证据边界与验证路径" en="Evidence Boundary and Validation"/>} art={art(29)}><PublicationCopy><Bi zh={result.evidence?.sourceZh??"本报告依据 24 次完整选择构建。缺失证据保持缺失，不由想象补全。"} en={result.evidence?.sourceEn??"This archive is built from 24 complete choices. Missing evidence remains missing and is never filled by assumption."}/></PublicationCopy><div className="mt-5 border border-[#4c4966]/15 bg-white/28 p-5"><PublicationLabel>下一次记录 · NEXT RECORD</PublicationLabel><PublicationCopy><Bi zh={result.dominant[0]?.actionZh??editorial[2]} en={result.dominant[0]?.actionEn??"Complete one observable action and record the response."}/></PublicationCopy></div><PublicationCopy muted><Bi zh="完成动作后，只记录现实反馈：发生了什么、谁如何回应、结构是否移动。不要用一次情绪替代证据。" en="After the action, record only real feedback: what happened, how others responded, and whether the structure moved."/></PublicationCopy></PublicationPage>
      <PublicationPage index={30} total={total} eyebrow="LINGXIFIELD ORIGINAL FIELD" title={<Bi zh="让报告回到现实" en="Return the Archive to Reality"/>} art={art(30)} layout="full"><PublicationCopy><Bi zh="这份档案不是一组漂亮结论，而是一套可再次验证的观察坐标。24 个条目都保留自己的证据位置；下一次记录将检验结构是否真的改变。" en="This archive is not a collection of elegant conclusions, but a set of coordinates that can be tested again. Each of the 24 entries keeps its evidence position."/></PublicationCopy><p className="mt-6 font-display text-2xl text-[#557f79]">证据 → 结构机制 → 现实影响 → 可验证行动</p><p className="mt-6 text-[11px] leading-6 opacity-75"><Bi zh="用于个人探索与反思体验，不构成医疗、金融、法律或其他专业建议。" en="For personal exploration and reflection only; not medical, financial, legal, or other professional advice."/></p></PublicationPage>
    </div>
    <div className="mx-auto max-w-[794px] px-3 pb-16 sm:px-6"><button onClick={download} disabled={downloading} className="w-full border border-lattice/50 bg-lattice/10 py-4 text-sm tracking-widest2 text-lattice">{downloading?"正在生成固定 A4 PDF…":"下载 30 页完整 PDF · DOWNLOAD"}</button>{downloaded&&<p className="mt-3 text-center text-xs text-lattice">30 页完整档案已生成；每一页均包含适老正文与专属艺术图。</p>}{downloadError&&<p className="mt-3 text-center text-xs text-rose-300">{downloadError}</p>}</div>
  </main>;
}
