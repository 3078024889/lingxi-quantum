"use client";

import { useRef, useState } from "react";
import Bi from "@/components/Bi";
import ReportReturnBar from "./ReportReturnBar";
import type { DendriteResult } from "@/lib/mini/dendrite-engine";

const FIELD_LABELS: Record<string, { zh: string; en: string }> = {
  "life-map-report":{zh:"生命图谱",en:"Life Blueprint"}, "relationship-resonance":{zh:"关系共振",en:"Relationship Resonance"},
  "resilience-report":{zh:"生命韧性",en:"Life Resilience"}, "romance-report":{zh:"桃花磁场",en:"Romance Field"},
  "wealth-report":{zh:"财富创造地图",en:"Wealth Creation Map"}, "daily-tide-report":{zh:"今日潮汐",en:"Today's Tide"},
  "tarot-reading":{zh:"生命镜像",en:"Life Mirror"}, "qian-reading":{zh:"生命灵签",en:"Life Oracle"},
};
const ROLE_LABELS = { foundation:"长期支撑", amplifier:"共同增强", calibration:"当前校准", tension:"形成张力" } as const;

function Page({ index, eyebrow, title, children, image, className = "" }: { index: number; eyebrow: string; title: React.ReactNode; children?: React.ReactNode; image?: string; className?: string }) {
  return (
    <section className={`lx-pdf-page relative mx-auto aspect-[210/297] w-full max-w-[794px] overflow-hidden border border-white/15 bg-[#0a1330] p-7 shadow-[0_22px_90px_rgba(0,0,30,.35)] sm:p-12 ${className}`}>
      {image && <><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-[#07102c]/45 via-[#07102c]/70 to-[#07102c]"/></>}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-5"><p className="text-[10px] uppercase tracking-[.3em] text-lattice sm:text-xs">{eyebrow}</p><p className="text-[10px] tracking-[.2em] text-bone-mute">{String(index).padStart(2,"0")} / 22</p></div>
        <h2 className="mt-5 font-display text-2xl font-light text-bone sm:text-4xl">{title}</h2>
        <div className="mt-7 min-h-0 flex-1">{children}</div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] tracking-[.18em] text-bone-mute"><span>LINGXIFIELD DENDRITIC ARCHIVE</span><span>lingxifield.com</span></div>
      </div>
    </section>
  );
}

function Text({ children }: { children: React.ReactNode }) { return <p className="text-sm leading-7 text-bone-soft sm:text-base sm:leading-9">{children}</p>; }

export default function MiniLifeArchetypeReport({ subjectName, createdAt, result, artworks }: { subjectName: string; createdAt: string; result: DendriteResult; artworks: string[] }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const current = result.currentArchetype;
  const archetypeImage = current ? `/images/qian/${String(current.index).padStart(2,"0")}.jpg` : artworks[0];
  const streamById = new Map((result.tributaryDetails ?? []).map((stream) => [stream.productId, stream]));
  const contributionById = new Map((result.fieldContributions ?? []).map((item) => [item.productId, item]));
  const nodeById = new Map(result.nodes.map((node) => [node.id, node]));
  const download = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true); setError("");
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({ containerRef:reportRef.current, fileName:"生命原型-八流归一-22页档案.pdf", bgColorRgb:[7,16,44], bgColorHex:"#07102c" });
    } catch { setError("PDF 生成未完成，请保留本页并稍后重试；网页档案已经保存。 "); }
    finally { setDownloading(false); }
  };
  const pages: React.ReactNode[] = [];
  pages.push(<Page key="cover" index={1} eyebrow="MINI PROGRAM · EIGHT-STREAM CONVERGENCE" title="生命原型 · 八流归一" image={archetypeImage}><div className="flex h-full flex-col justify-end"><p className="text-xs tracking-[.22em] text-lattice">档案主体 · {subjectName}</p><p className="mt-3 text-xs text-bone-dim">{new Date(createdAt).toLocaleString("zh-CN")}</p><div className="mt-6 border-l border-lattice/60 pl-5"><p className="font-display text-3xl text-lattice sm:text-5xl"><Bi zh={current?.nameZh ?? result.titleZh} en={current?.nameEn ?? result.titleEn}/></p><p className="mt-4 text-sm leading-8 text-bone-soft"><Bi zh={current?.meaningZh ?? result.insightZh} en={current?.meaningEn ?? result.insightEn}/></p></div></div></Page>);
  pages.push(<Page key="intro" index={2} eyebrow="EIGHT STREAMS AS ONE" title={<Bi zh="八流归一序言" en="Prelude to Convergence"/>} image={artworks[0]}><div className="space-y-5"><Text>生命原型并非一次测定，而是八条生命支流在同一时间窗口中留下的证据共同汇聚。它读取长期重复、近期增强、结构支撑、现实张力与暂时受到抑制的力量。</Text><Text>这不是八份结果的叠加，也不是固定人格或未来判断。它呈现的是：此刻，哪一种生命力量最能解释八个场域共同形成的整体结构。</Text><p className="mt-8 font-display text-2xl text-lattice">八流汇聚，原型自现。</p></div></Page>);
  pages.push(<Page key="current" index={3} eyebrow="CURRENT LIFE ARCHETYPE" title={<Bi zh="当前生命原型" en="Current Life Archetype"/>} image={archetypeImage}><div className="mt-auto rounded-sm border border-lattice/35 bg-[#07102c]/80 p-6"><p className="text-xs tracking-[.2em] text-lattice">{current?.evidenceLevel === "clear" ? "结构证据 · 清晰" : "结构证据 · 正在形成"}</p><p className="mt-4 font-display text-3xl text-bone">{current ? `${String(current.index + 1).padStart(2,"0")} · ${current.nameZh}` : result.titleZh}</p><p className="mt-4 text-sm leading-8 text-bone-soft">{current?.keywordsZh}</p><p className="mt-4 text-sm leading-8 text-bone-dim">{current?.meaningZh ?? result.insightZh}</p></div></Page>);
  pages.push(<Page key="graph" index={4} eyebrow="DENDRITIC CONVERGENCE MAP" title={<Bi zh="八流汇聚图" en="Eight-stream Convergence Map"/>}><div className="relative mx-auto mt-4 aspect-square max-w-[520px] rounded-full border border-lattice/30"><div className="absolute inset-[30%] flex items-center justify-center rounded-full border border-lattice/60 bg-lattice/10 text-center font-display text-lg text-lattice">{current?.nameZh ?? result.titleZh}</div>{(result.tributaryDetails ?? []).map((stream,index)=>{const angle=(Math.PI*2*index)/8-Math.PI/2;const x=50+42*Math.cos(angle);const y=50+42*Math.sin(angle);return <div key={stream.productId} className="absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center" style={{left:`${x}%`,top:`${y}%`}}><span className="mx-auto block h-2 w-2 rounded-full bg-lattice shadow-[0_0_14px_rgba(126,226,214,.8)]"/><span className="mt-2 block text-[10px] leading-4 text-bone-soft">{FIELD_LABELS[stream.productId]?.zh}</span></div>})}</div></Page>);
  pages.push(<Page key="why" index={5} eyebrow="WHY THIS ARCHETYPE" title={<Bi zh="为什么是这一枚" en="Why This Archetype"/>}>{(result.whyEvidence ?? []).map((item)=><article key={item.kind} className="mb-4 border-l border-lattice/45 bg-white/[.035] p-4"><h3 className="font-display text-lg text-lattice"><Bi zh={item.titleZh} en={item.titleEn}/></h3><p className="mt-2 text-xs leading-6 text-bone-soft sm:text-sm sm:leading-7"><Bi zh={item.bodyZh} en={item.bodyEn}/></p></article>)}</Page>);
  (result.timeline ?? []).forEach((item, streamIndex) => {
    const stream=streamById.get(item.productId); const label=FIELD_LABELS[item.productId]; const pageIndex=6+streamIndex;
    pages.push(<Page key={item.productId} index={pageIndex} eyebrow={`STREAM ${String(streamIndex+1).padStart(2,"0")} · ${stream?.role ? ROLE_LABELS[stream.role] : "结构证据"}`} title={<Bi zh={label?.zh ?? item.productId} en={label?.en ?? item.productId}/>} image={artworks[streamIndex % artworks.length]}><div className="mt-auto rounded-sm border border-white/15 bg-[#07102c]/82 p-5"><p className="text-xs text-lattice">完成时间 · {item.completedAt ? new Date(item.completedAt).toLocaleDateString("zh-CN") : "已归档"}</p><p className="mt-4 text-sm leading-7 text-bone-soft">本流核心信号：{stream?.signalsZh.join(" · ")}</p><p className="mt-4 text-sm leading-7 text-bone-dim">它以“{stream?.role ? ROLE_LABELS[stream.role] : "结构证据"}”进入当前原型，贡献强度 {stream?.score ?? contributionById.get(item.productId)?.score ?? "—"}。系统保留本流自己的证据，不把它压缩成一句摘要。</p>{item.productId==="relationship-resonance" && <p className="mt-4 text-xs leading-6 text-lattice">关系证据集 · {result.relationshipEvidenceCount ?? 1} 个独立关系情境；只计一条支流，但扩大场景覆盖。</p>}</div></Page>);
  });
  pages.push(<Page key="matrix" index={14} eyebrow="FIELD CONTRIBUTION MATRIX" title={<Bi zh="八流贡献矩阵" en="Eight-stream Contribution Matrix"/>}>{(result.tributaryDetails ?? []).map((stream)=><div key={stream.productId} className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/10 pb-3"><div><p className="text-sm text-bone">{FIELD_LABELS[stream.productId]?.zh}</p><p className="mt-1 text-[10px] text-bone-mute">{ROLE_LABELS[stream.role]} · {stream.signalsZh.slice(0,2).join(" / ")}</p></div><p className="font-display text-xl text-lattice">{stream.score}</p></div>)}</Page>);
  pages.push(<Page key="amplification" index={15} eyebrow="CROSS-FIELD AMPLIFICATION" title={<Bi zh="跨域共同增强" en="Cross-field Amplification"/>} image={artworks[8 % artworks.length]}><div className="mt-auto rounded-sm border border-lattice/35 bg-[#07102c]/84 p-6"><p className="font-display text-2xl text-lattice">{result.dominant.slice(0,3).map((node)=>node.zh).join(" × ")}</p><Text>这些节点在多个独立场域同时进入前景，因此不再属于某一份单独报告。它们形成当前最稳定的共同增强回路：一个负责启动，一个负责现实接口，一个负责持续。</Text></div></Page>);
  pages.push(<Page key="relations" index={16} eyebrow="STRUCTURE RELATION MAP" title={<Bi zh="当前结构关系图" en="Current Structure Relation Map"/>}>{(result.structuralRelations ?? []).map((relation,index)=><article key={index} className="mb-5 rounded-sm border border-white/12 bg-white/[.035] p-5"><p className="font-display text-xl text-lattice">{nodeById.get(relation.from)?.zh} → {nodeById.get(relation.to)?.zh}</p><p className="mt-3 text-sm leading-7 text-bone-soft">{{reinforce:"共同增强",bridge:"现实桥接",tension:"形成张力"}[relation.kind]} · 结构强度 {relation.strength}</p></article>)}</Page>);
  pages.push(<Page key="tensions" index={17} eyebrow="ACTIVE TENSIONS" title={<Bi zh="正在形成的张力" en="Tensions Now Forming"/>}>{(result.tensions ?? []).map((tension,index)=><article key={index} className="mb-5 border-l-2 border-purple-300/60 bg-white/[.035] p-5"><p className="font-display text-xl text-purple-200"><Bi zh={tension.titleZh} en={tension.titleEn}/></p><p className="mt-3 text-sm leading-7 text-bone-soft"><Bi zh={tension.bodyZh} en={tension.bodyEn}/></p></article>)}</Page>);
  pages.push(<Page key="suppressed" index={18} eyebrow="INHIBITED CAPACITIES" title={<Bi zh="被抑制的力量" en="Suppressed Capacities"/>}>{(result.suppressedArchetypes ?? []).map((item)=><article key={item.index} className="mb-5 grid grid-cols-[84px_1fr] gap-4 border border-white/12 bg-white/[.035] p-4"><img src={`/images/qian/${String(item.index).padStart(2,"0")}.jpg`} alt={item.nameZh} className="aspect-[2/3] w-full object-cover"/><div><p className="font-display text-lg text-lattice"><Bi zh={item.nameZh} en={item.nameEn}/></p><p className="mt-3 text-xs leading-6 text-bone-soft"><Bi zh={item.reasonZh} en={item.reasonEn}/></p></div></article>)}</Page>);
  pages.push(<Page key="entry" index={19} eyebrow="ONE REALITY ENTRANCE" title={<Bi zh="当前现实入口" en="Present Reality Entrance"/>} image={artworks[9 % artworks.length]}><div className="mt-auto rounded-sm border border-lattice/40 bg-[#07102c]/86 p-6"><p className="font-display text-2xl text-lattice"><Bi zh={result.realityEntry?.titleZh ?? "一个现实动作"} en={result.realityEntry?.titleEn ?? "One Reality Action"}/></p><p className="mt-5 text-sm leading-8 text-bone"><Bi zh={result.realityEntry?.actionZh ?? result.dominant[0].actionZh} en={result.realityEntry?.actionEn ?? result.dominant[0].actionEn}/></p><p className="mt-5 text-sm leading-8 text-bone-dim"><Bi zh={result.realityEntry?.observeZh ?? "完成后只记录现实反馈。"} en={result.realityEntry?.observeEn ?? "Record only real feedback afterwards."}/></p></div></Page>);
  pages.push(<Page key="timeline" index={20} eyebrow="EIGHT-STREAM LIFE TRAJECTORY" title={<Bi zh="八流生命轨迹" en="Eight-stream Life Trajectory"/>}>{(result.timeline ?? []).map((item,index)=><div key={item.productId} className="relative ml-3 border-l border-lattice/35 pb-5 pl-7"><span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-lattice"/><p className="text-sm text-bone">{String(index+1).padStart(2,"0")} · {FIELD_LABELS[item.productId]?.zh}</p><p className="mt-1 text-xs text-bone-mute">{item.completedAt ? new Date(item.completedAt).toLocaleString("zh-CN") : "已保存"}</p></div>)}</Page>);
  pages.push(<Page key="engine" index={21} eyebrow="LINGXIFIELD DENDRITIC KNOWLEDGE NETWORK" title={<Bi zh="灵犀场树突演算说明" en="Dendritic Calculation Notes"/>} image={artworks[10 % artworks.length]}><div className="mt-auto space-y-4 rounded-sm border border-white/15 bg-[#07102c]/86 p-6"><Text>系统读取一年窗口内八项已完成且仍有有效权限的场域档案。每一次真实选择激活产品专属节点；相邻激活形成连接，跨域重复产生增强，低参与节点保留为抑制或张力证据。</Text><Text>任何单题都不会直接决定原型；任何一份报告也不能替代八流汇聚。缺失的数据保持缺失，不由想象填补。</Text><p className="text-xs leading-6 text-bone-mute">用于个人探索与反思体验，不构成医疗、金融、法律或其他专业建议。</p></div></Page>);
  pages.push(<Page key="end" index={22} eyebrow="LINGXIFIELD ORIGINAL ARCHIVE" title={<Bi zh="八流汇聚，原型自现" en="Eight Streams Converge; the Archetype Appears"/>} image={archetypeImage}><div className="flex h-full flex-col justify-end"><p className="max-w-xl text-sm leading-8 text-bone-soft">这份档案不是终点。未来任一支流形成新的完整记录后，系统会比较新旧证据；只有节点强度、跨域关系或现实验证发生实质变化，原型才会更新。</p><p className="mt-7 text-xs tracking-[.22em] text-lattice">LINGXIFIELD · A LIVING DIGITAL FIELD</p></div></Page>);
  return <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(126,91,180,.35),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(43,156,168,.28),transparent_36%),#07102c] text-bone"><ReportReturnBar/><div ref={reportRef} className="space-y-7 px-3 py-7 sm:px-6 sm:py-12">{pages}</div><div className="mx-auto max-w-[794px] px-3 pb-16 sm:px-6"><button onClick={download} disabled={downloading} className="w-full border border-lattice/50 bg-lattice/10 py-4 text-sm tracking-widest2 text-lattice">{downloading?"正在生成 22 页 PDF…":"下载 22 页完整 PDF · DOWNLOAD"}</button>{error&&<p className="mt-3 text-center text-xs text-rose-300">{error}</p>}</div></main>;
}
