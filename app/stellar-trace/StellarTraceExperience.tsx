"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { StellarTraceResult } from "@/lib/stellar-trace";
import type { TargetTraceResult } from "@/lib/stellar-trace/targets";
import { PublicationCopy, PublicationLabel, PublicationPage } from "@/app/mini-report/PublicationPage";
import { ALL_REPORT_PDF_ART } from "@/lib/report-art-registry";
import StellarTraceVisualization from "@/app/stellar-trace/StellarTraceVisualization";
import PreciseMapPicker from "@/app/stellar-trace/PreciseMapPicker";
import { AncientDebugDetails, AncientEvidenceDetail, formedAncientResults } from "@/app/stellar-trace/StellarAncientEvidence";
import { EMPTY_STELLAR_TRACE_DRAFT, STELLAR_TRACE_DRAFT_KEY, sanitizeStellarTraceDraft, stellarTraceCompleteness, stellarTraceCoreCompleteness, stellarTraceEssentialComplete, stellarTraceMissingFields, validContactAt, validIsoDate, type StellarTraceDraft } from "@/lib/stellar-trace-intake";

const art = (index: number) => ALL_REPORT_PDF_ART[index % ALL_REPORT_PDF_ART.length].src;
const bodies = ["太阳", "水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"];
const inputClass = "mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base !text-bone caret-lattice outline-none opacity-100 transition [-webkit-text-fill-color:#F0EDF7] focus:border-lattice";
const reviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";

function sectorLabel(sector: [number, number] | null) {
  if (!sector) return "尚未成域";
  const degree = (value: number) => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  return sector[0] > sector[1] ? `正北跨界扇区 · ${degree(sector[0])}° → 0° → ${degree(sector[1])}°` : `${degree(sector[0])}°—${degree(sector[1])}°`;
}

function NonPersonTraceForm({kind,unlocked,initialDraft}:{kind:"object"|"animal";unlocked:boolean;initialDraft?:Partial<StellarTraceDraft>|null}){
  const[name,setName]=useState("");
  const[subtype,setSubtype]=useState(kind==="animal"?"cat":"wallet");
  const[lastSeenAt,setLastSeenAt]=useState("");
  const[place,setPlace]=useState("");
  const[lat,setLat]=useState("");
  const[lon,setLon]=useState("");
  const[context,setContext]=useState("");
  const[consent,setConsent]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[result,setResult]=useState<TargetTraceResult|null>(null);
  const reportRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{setSubtype(kind==="animal"?"cat":"wallet");setResult(null);setError("");},[kind]);
  useEffect(()=>{if(initialDraft?.targetKind!==kind)return;const saved=sanitizeStellarTraceDraft(initialDraft);setName(saved.name);setSubtype(saved.targetSubtype||(kind==="animal"?"cat":"wallet"));setLastSeenAt(saved.lastContactAt.slice(0,16));setPlace(saved.lastKnownMapLabel||saved.lastKnownPlace);setLat(saved.lastKnownLat);setLon(saved.lastKnownLon);setContext(saved.context);},[initialDraft,kind]);
  useEffect(()=>{const saved=sanitizeStellarTraceDraft({...EMPTY_STELLAR_TRACE_DRAFT,targetKind:kind,targetSubtype:subtype,name,lastContactAt:lastSeenAt,lastKnownPlace:place,lastKnownMapLabel:place,lastKnownLat:lat,lastKnownLon:lon,context});try{window.localStorage.setItem(STELLAR_TRACE_DRAFT_KEY,JSON.stringify(saved));}catch{/* Storage is optional. */}},[kind,subtype,name,lastSeenAt,place,lat,lon,context]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");
    if(!name||!lastSeenAt||!place||!lat||!lon)return setError("请完整填写目标、最后确认时间、地点与地图坐标。");
    if(!consent)return setError("请先确认现实安全边界。");
    const traceDraft=sanitizeStellarTraceDraft({...EMPTY_STELLAR_TRACE_DRAFT,targetKind:kind,targetSubtype:subtype,name,lastContactAt:lastSeenAt,lastKnownPlace:place,lastKnownMapLabel:place,lastKnownLat:lat,lastKnownLon:lon,context});
    const qaNow=new URLSearchParams(window.location.search).get("qaNow");
    const payload={targetKind:kind,targetName:name,queryTime:new Date().toISOString(),...(qaNow?{qaNow}:{}),lastSeenAt,lastKnownPlace:place,lastKnownLat:Number(lat),lastKnownLon:Number(lon),context,...(kind==="animal"?{animalKind:subtype,microchipped:null,indoorOutdoor:"unknown",temperament:"unknown"}:{objectKind:subtype,container:null,lastHandledBy:null,likelyTransport:"unknown"})};
    try{window.localStorage.setItem(STELLAR_TRACE_DRAFT_KEY,JSON.stringify(traceDraft));}catch{/* Continue without persistence. */}
    if(!unlocked){window.name=JSON.stringify({kind:"lingxifield-stellar-trace-draft-v3",draft:traceDraft});window.location.href="/checkout?productId=stellar-trace&redirect=%2Fstellar-trace&intake=complete";return;}
    setLoading(true);
    try{const response=await fetch("/api/stellar-trace/target",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await response.json();if(!response.ok)throw new Error(data.error||"联合推演暂未形成");setResult(data);}catch(reason){setError(reason instanceof Error?reason.message:"联合推演暂未形成");}finally{setLoading(false);}
  }
  async function download(){if(!reportRef.current)return;const{exportStellarTracePdf}=await import("@/lib/pdf-export");await exportStellarTracePdf({containerRef:reportRef.current,fileName:`灵犀场星迹-${kind==="animal"?"寻动物":"寻物"}-${name}${reviewMode?"-V341-QA":""}.pdf`});}
  const animalOptions=[["cat","猫"],["dog","狗"],["bird","鸟"],["livestock","牲畜"],["other","其他动物"]];
  const objectOptions=[["wallet","钱包"],["phone","手机"],["keys","钥匙"],["document","证件/文件"],["jewelry","首饰"],["bag","包袋"],["vehicle","车辆"],["other","其他物品"]];
  const formed=result?formedAncientResults(result.ancient):[];
  const firstDirection=formed.find(item=>item.direction)?.direction??null;
  const traceName=kind==="animal"?"寻动物":"寻物";
  function loadReviewSample(){
    const qaNow=new URLSearchParams(window.location.search).get("qaNow")||"2026-09-01T04:49:52.000Z";
    setName(kind==="animal"?"V341验收犬":"V341验收钱包");setSubtype(kind==="animal"?"dog":"wallet");setLastSeenAt(qaNow.slice(0,16));setPlace("上海市中心验收点");setLat("35.8617000");setLon("104.1954000");setContext("本地确定性验收样本，仅用于核验原典推演、报告结构与 PDF 清晰度。");setConsent(true);setResult(null);setError("");
  }

  return <>
    <form onSubmit={submit} className="mx-auto mt-12 max-w-5xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl sm:p-8">
      <p className="text-xs tracking-[.26em] text-amber">{kind==="animal"?"ANIMAL TRACE · 寻动物":"OBJECT TRACE · 寻物"}</p><h2 className="mt-2 font-display text-3xl">最后可证之处</h2>
      <p className="mt-3 text-sm leading-7 text-bone-dim">原典象、现实接触链与行为搜索层彼此分开。证据不足即停止，不以目标名称、已知方向或习性反造古法方位。</p>
      {reviewMode&&<button type="button" onClick={loadReviewSample} className="mt-4 border border-amber/45 px-4 py-2 text-xs text-amber">载入本地验收样本</button>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs text-bone-dim">{kind==="animal"?"动物名字":"物品名称"} *<input required value={name} onChange={event=>setName(event.target.value)} className={inputClass}/></label><label className="text-xs text-bone-dim">类别 *<select value={subtype} onChange={event=>setSubtype(event.target.value)} className={inputClass}>{(kind==="animal"?animalOptions:objectOptions).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs text-bone-dim sm:col-span-2">最后确认时间 *<input required type="datetime-local" value={lastSeenAt} onChange={event=>setLastSeenAt(event.target.value)} className={inputClass}/></label><label className="text-xs text-bone-dim sm:col-span-2">最后确认位置 *<input required value={place} onChange={event=>setPlace(event.target.value)} className={inputClass}/></label><PreciseMapPicker lat={lat} lon={lon} place={place} onConfirm={({lat:nextLat,lon:nextLon})=>{setLat(nextLat.toFixed(7));setLon(nextLon.toFixed(7));}}/><label className="text-xs text-bone-dim sm:col-span-2">现实线索<textarea value={context} onChange={event=>setContext(event.target.value)} rows={4} className={`${inputClass} resize-none`}/></label></div>
      {kind==="animal"&&<p className="mt-4 text-xs leading-6 text-bone-mute">牛羊牲畜可按原典明载规则形成奇门单项方位；猫、狗、鸟等宠物不强套牲畜用神，直接强化现实搜索次序，不增加玄学式交互。</p>}
      <label className="mt-6 flex gap-3 text-xs leading-6 text-bone-dim"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)} className="mt-1"/><span>我确认资料来源真实，并理解本结果不能替代监控、设备定位、警方、救援、芯片平台或现实接触链。</span></label>
      <button disabled={loading} className="mt-7 w-full border border-lattice/60 bg-lattice/10 px-6 py-4 text-sm tracking-[.18em] text-lattice disabled:opacity-40">{loading?"正在分层推演…":unlocked?"展开联合推演":"确认边界并开启 · ¥688"}</button>{error&&<p className="mt-4 text-sm text-rose-300">{error}</p>}
    </form>
    {result&&<section className="mx-auto mt-12 max-w-[794px]"><div ref={reportRef} className="space-y-7">
      <PublicationPage index={1} total={3} eyebrow="TIME-METHOD EVIDENCE · CONVERGENCE" title={`${traceName} · 时法合参`} art={art(7)} layout="cover"><PublicationLabel>{name} · 时法成向 {formed.length} / {result.ancient.results.length}</PublicationLabel><p className="mt-4 font-display text-[30px] leading-tight text-[#557f79]">{result.ancient.fused.primary?`主方向 ${result.ancient.fused.primary.labelZh} ${result.ancient.fused.primary.centerDeg}°`:firstDirection?`单项方向 ${firstDirection.labelZh} ${firstDirection.centerDeg}°`:"转入现实搜索"}</p><PublicationCopy>{result.ancient.fused.rationaleZh}</PublicationCopy><div className="mt-4 grid grid-cols-2 gap-3 text-[12px] leading-5 text-[#565162]"><p>方向一致度<br/><strong>R = {result.ancient.fused.resultantLength.toFixed(3)}</strong></p><p>候选扇区<br/><strong>{result.ancient.fused.primary?sectorLabel(result.ancient.fused.primary.sector):firstDirection?sectorLabel(firstDirection.sector):"尚未成域"}</strong></p></div><p className="mt-4 text-[11px] leading-5 text-[#696473]">R 是方位之间的一致程度，不是定位概率。只有两套独立时法同时成立并通过合参门，才形成主向。</p></PublicationPage>
      <PublicationPage index={2} total={3} eyebrow="SOURCE-TRACED REASONING" title="原典逐证 · 何以成向" art={art(13)} layout="full"><AncientEvidenceDetail ancient={result.ancient} kind={kind}/></PublicationPage>
      <PublicationPage index={3} total={3} eyebrow="REALITY SEARCH · PRACTICAL PRIORITY" title="现实搜索次序" art={art(19)} layout="full">{result.realityHints.searchPriorityZh.map((line,index)=><p key={line} className="mt-2 text-[12px] leading-5">{index+1}. {line}</p>)}{!!result.realityHints.likelyEnvironmentZh.length&&<p className="mt-4 text-[11px] leading-5 text-[#557f79]">现实环境优先：{result.realityHints.likelyEnvironmentZh.join("、")}</p>}{result.realityHints.stopConditionsZh.map(line=><p key={line} className="mt-2 text-[10px] leading-4 text-[#7b5f55]">停止条件：{line}</p>)}<PublicationCopy muted>{result.notesZh.join(" ")}</PublicationCopy></PublicationPage>
    </div><AncientDebugDetails ancient={result.ancient}/><button onClick={download} className="mt-6 w-full border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">下载 3 页高清推演 PDF</button></section>}
  </>;
}

export default function StellarTraceExperience({ unlocked = false, initialDraft }: { unlocked?: boolean; initialDraft?: Partial<StellarTraceDraft> | null }) {
  const [targetKind,setTargetKind]=useState<"person"|"object"|"animal">(initialDraft?.targetKind??"person");
  const [draft, setDraft] = useState<StellarTraceDraft>(() => sanitizeStellarTraceDraft(initialDraft ?? EMPTY_STELLAR_TRACE_DRAFT));
  const [consent, setConsent] = useState(false);
  const [boundaryConsent, setBoundaryConsent] = useState(false);
  const [result, setResult] = useState<StellarTraceResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const visibleCompleteness = stellarTraceCompleteness(draft);
  const coreCompleteness = stellarTraceCoreCompleteness(draft);
  const essentialComplete = stellarTraceEssentialComplete(draft);
  const coreMissing = stellarTraceMissingFields(draft).join("、");
  const today = new Date().toISOString().slice(0, 10);
  const [lastContactDate = "", lastContactTime = ""] = draft.lastContactAt.split(/[T ]/);
  const updateContact = (date: string, time: string) => update("lastContactAt", date && time ? `${date} ${time}` : date);

  useEffect(() => {
    if (initialDraft) return;
    try { const saved = window.localStorage.getItem(STELLAR_TRACE_DRAFT_KEY); if (saved) { const restored=sanitizeStellarTraceDraft(JSON.parse(saved));setDraft(restored);setTargetKind(restored.targetKind); } }
    catch { /* Private browsing restrictions should not block the form. */ }
  }, [initialDraft]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get("pickedLat"), lon = params.get("pickedLon"), label = params.get("pickedLabel")?.trim();
    if (!lat || !lon || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return;
    setDraft((current) => sanitizeStellarTraceDraft({
      ...current,
      lastKnownLat: Number(lat).toFixed(7),
      lastKnownLon: Number(lon).toFixed(7),
      lastKnownMapLabel: label || current.lastKnownPlace,
      lastKnownPlace: label || current.lastKnownPlace,
    }));
    params.delete("pickedLat"); params.delete("pickedLon"); params.delete("pickedLabel");
    const next = `${window.location.pathname}${params.size ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STELLAR_TRACE_DRAFT_KEY, JSON.stringify(draft)); }
    catch { /* Storage is optional. */ }
  }, [draft]);

  function update<K extends keyof StellarTraceDraft>(key: K, value: StellarTraceDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); }
  function loadPersonReviewSample(){
    setDraft(sanitizeStellarTraceDraft({...EMPTY_STELLAR_TRACE_DRAFT,targetKind:"person",name:"V341寻人验收",relationship:"family",birthDate:"1990-05-01",birthTime:"08:30",birthPlace:"上海",lastContactAt:"2026-08-31 18:30",lastKnownPlace:"上海市中心验收点",lastKnownMapLabel:"上海市中心验收点",lastKnownLat:"35.8617000",lastKnownLon:"104.1954000",context:"本地确定性验收样本，仅用于核验原典推演、报告结构与 PDF 清晰度。"}));setConsent(true);setResult(null);setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!essentialComplete) { setError(`核心锚点尚缺：${coreMissing || "请检查日期与时间格式"}。`); return; }
    if (!consent) { setError("请先确认资料来源与使用规则。"); return; }
    if (!unlocked && !boundaryConsent) { setError("请先确认支付前结果边界。"); return; }
    try { window.localStorage.setItem(STELLAR_TRACE_DRAFT_KEY, JSON.stringify(draft)); } catch { /* Continue without persistence. */ }
    if (!unlocked) {
      // window.name survives the intentional .com → .cn WeChat OAuth hand-off.
      // The checkout consumes and clears it immediately, so PII is not placed in a URL.
      window.name = JSON.stringify({ kind: "lingxifield-stellar-trace-draft-v3", draft });
      window.location.href = "/checkout?productId=stellar-trace&redirect=%2Fstellar-trace&intake=complete";
      return;
    }
    setLoading(true); setResult(null);
    try {
      const qaNow=new URLSearchParams(window.location.search).get("qaNow");
      const response = await fetch("/api/stellar-trace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, consent, ...(qaNow?{qaNow}: {}) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "星迹暂未形成");
      setResult(data); requestAnimationFrame(() => document.getElementById("stellar-result")?.scrollIntoView({ behavior: "smooth" }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "星迹暂未形成"); }
    finally { setLoading(false); }
  }

  const summary = result ? `灵犀场星迹 · 万里寻踪\n时法成向：${result.ancient.fused.usedSystems.length} / ${result.ancient.results.length}\n候选方位：${result.priority.available ? `${result.priority.primaryDirectionZh} ${result.priority.primaryBearing}°` : "尚未成向"}\n推演状态：${result.priority.statusZh}\n现实方向核验：${result.ancient.realityValidation.noteZh}\n\n${result.priority.basisZh}\n\n${result.priority.verificationZh.join("\n")}\n\n${result.modelBoundaryZh}\n${result.safetyBoundaryZh}` : "";
  async function copy() { if (summary) await navigator.clipboard.writeText(summary); }
  async function downloadPdf() { if (!resultRef.current || !result) return; setExporting(true); setError(""); try { const { exportStellarTracePdf } = await import("@/lib/pdf-export"); await exportStellarTracePdf({ containerRef: resultRef.current, fileName: `灵犀场星迹-万里寻踪-研究档案${reviewMode?"-V341-QA":""}.pdf` }); } catch (reason) { setError(reason instanceof Error ? reason.message : "PDF 未能生成"); } finally { setExporting(false); } }
  async function saveImage() { const page = resultRef.current?.querySelector<HTMLElement>(".lx-pdf-page"); if (!page) return; const { default: html2canvas } = await import("html2canvas"); const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#eef0f6" }); const link = document.createElement("a"); link.download = "灵犀场星迹-诸证合度.png"; link.href = canvas.toDataURL("image/png"); link.click(); }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_14%_8%,rgba(121,96,186,.34),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(40,155,168,.25),transparent_34%),#07112d] px-4 py-14 text-bone sm:px-6">
    <section className="mx-auto max-w-5xl">
      <p className="text-xs uppercase tracking-[.34em] text-lattice">LINGXI STELLAR TRACE · NINE-FIELD COORDINATES</p>
      <h1 className="mt-5 font-display text-4xl font-light sm:text-6xl">灵犀场星迹 · 万里寻踪</h1>
      <p className="mt-4 font-display text-xl text-lattice">循时而索迹，因星而见位。</p>
      <p className="mt-7 max-w-4xl text-sm leading-8 text-bone-dim">古人循日月、察星辰，以时定方，以象观变。灵犀场将“循迹”重新构造为一套天文坐标实验：以出生时间为初始纪元，以真实行星位置为参照，在太阳系尺度中展开一组属于该时刻的星域坐标。</p>
      <div className="mt-8 grid gap-5 border border-white/10 bg-white/[.04] p-5 backdrop-blur-xl md:grid-cols-[1.2fr_.8fr] sm:p-8">
        <div><p className="text-xs tracking-[.28em] text-amber">九域坐标</p><h2 className="mt-3 font-display text-2xl">Lingxi Stellar Trace · Nine-Field Coordinates</h2><p className="mt-4 text-sm leading-7 text-bone-dim">九域天文事实、奇门与六壬两套可复算时法、现实位置核验共同形成研究档案；方向或距离证据不足时不制造坐标。</p><p className="mt-4 font-display text-lg text-lattice">以生时为原点，以今时为流转。</p><p className="mt-3 text-sm leading-7 text-bone-dim">日月五星，各有其度；天王、海王，亦循其轨。九域同列，则一时之天象可复，一岁之迁流可见。</p></div>
        <ol className="grid grid-cols-3 gap-2 text-center text-xs text-bone-dim">{bodies.map((body, index) => <li key={body} className="border border-white/10 bg-void/25 px-2 py-4"><span className="block text-[10px] tracking-widest text-amber">{String(index + 1).padStart(2, "0")}</span><span className="mt-1 block">{body}</span></li>)}</ol>
      </div>
      <p className="mt-6 max-w-4xl text-sm leading-8 text-bone-dim">输入出生日期与地点，系统依据真实天文历算重建出生时刻的太阳系参照位置，再与当前星体坐标叠合，形成个人星迹图。人行于地，必有所经；星行于天，必有所度。取其时，参其位，合其迹，而求其方。所示为天文坐标与时间结构。</p>
      <div className="mt-6 border-l border-amber/60 bg-white/[.035] px-5 py-4 text-xs leading-6 text-bone-dim">本研究不读取设备、通信、GPS 或实时行踪。涉及失联、走失、威胁或人身安全，请先报警并使用可核验的通信、交通和救援渠道。</div>
    </section>

    <section className="mx-auto mt-10 max-w-5xl"><p className="text-xs tracking-[.26em] text-lattice">SELECT TRACE TARGET · 选择寻觅目标</p><div className="mt-4 grid grid-cols-3 gap-3">{([["person","寻人","PERSON"],["object","寻物","OBJECT"],["animal","寻动物","ANIMAL"]] as const).map(([value,zh,en])=><button key={value} type="button" onClick={()=>{setTargetKind(value);setDraft(current=>({...current,targetKind:value}));setResult(null);setError("");}} className={`border px-3 py-4 text-sm ${targetKind===value?"border-lattice bg-lattice/15 text-lattice":"border-white/15 text-bone-dim"}`}><span className="block">{zh}</span><span className="mt-1 block text-[10px] tracking-widest">{en}</span><span className="mt-2 block text-[11px] text-amber">¥688 · 7天权益</span></button>)}</div><p className="mt-3 text-xs leading-6 text-bone-mute">三类目标共用一个 stellar-trace 权益，不重复购买、不拆分 SKU；目标类型只决定资料字段与原典规则。</p></section>

    {targetKind!=="person"?<NonPersonTraceForm kind={targetKind} unlocked={unlocked} initialDraft={draft}/>:<form onSubmit={submit} className="mx-auto mt-12 max-w-5xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs tracking-[.26em] text-amber">01 · 寻踪档案</p><h2 className="mt-2 font-display text-3xl">基础坐标</h2></div><div className="min-w-[220px]"><p className="text-xs text-bone-dim">资料完整度 <strong className="text-lattice">{visibleCompleteness} / 11</strong> · 开启必填 <strong className="text-amber">{coreCompleteness} / 5</strong></p><div className="mt-2 h-1 overflow-hidden bg-white/10"><div className="h-full bg-gradient-to-r from-lattice to-amber transition-all" style={{ width: `${visibleCompleteness / 11 * 100}%` }}/></div></div></div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-bone-dim">一切寻迹，先定其人，复定其时。姓名用于锚定对象，生时用于还原初始天文坐标；出生地点与时间越完整，九域基准越清晰。</p>
      {reviewMode&&<button type="button" onClick={loadPersonReviewSample} className="mt-4 border border-amber/45 px-4 py-2 text-xs text-amber">载入本地验收样本</button>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs tracking-wider text-bone-dim">寻踪对象姓名 *<input required value={draft.name} onChange={(e) => update("name", e.target.value)} maxLength={40} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">用于建立本次星迹档案与身份锚点</span></label>
        <label className="text-xs tracking-wider text-bone-dim">与寻踪对象的关系 *<select value={draft.relationship} onChange={(e) => update("relationship", e.target.value as StellarTraceDraft["relationship"])} className={inputClass}><option value="self">本人</option><option value="family">家人</option><option value="partner">伴侣</option><option value="friend">朋友</option><option value="colleague">同事</option><option value="other">其他</option></select></label>
        <label className="text-xs tracking-wider text-bone-dim">真实出生日期 *<input required type="date" min="0001-01-01" max={today} value={draft.birthDate} onChange={(e) => update("birthDate", e.target.value)} aria-invalid={!!draft.birthDate && !validIsoDate(draft.birthDate)} className={`${inputClass} ${draft.birthDate && !validIsoDate(draft.birthDate) ? "!border-rose-300/80" : ""}`}/><span className={`mt-1 block text-[10px] ${draft.birthDate && !validIsoDate(draft.birthDate) ? "text-rose-300" : "text-bone-mute"}`}>{draft.birthDate && !validIsoDate(draft.birthDate) ? "此日期无效或晚于今天，请重新选择。" : "固定格式 YYYY-MM-DD；支持公元 0001 年至今"}</span></label>
        <label className="text-xs tracking-wider text-bone-dim">出生时间<input type="time" value={draft.birthTime} onChange={(e) => update("birthTime", e.target.value)} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">若知，请尽量精确；未知亦可继续</span></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">出生地点<input value={draft.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} maxLength={80} placeholder="填写城市即可，若可提供更具体地点则更佳" className={inputClass}/></label>
      </div>

      <div className="mt-10 border-t border-white/10 pt-8"><p className="text-xs tracking-[.26em] text-amber">02 · 行迹锚点</p><h2 className="mt-2 font-display text-3xl">最后可证之处</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-bone-dim">寻踪不从虚处起。最后一次能够确认的时间、地点与行动，是现实推演的起点。</p></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs tracking-wider text-bone-dim">最后有效联系日期 *<input required type="date" min="0001-01-01" max={today} value={lastContactDate} onChange={(e) => updateContact(e.target.value, lastContactTime)} aria-invalid={!!lastContactDate && !validIsoDate(lastContactDate)} className={`${inputClass} ${lastContactDate && !validIsoDate(lastContactDate) ? "!border-rose-300/80" : ""}`}/><span className={`mt-1 block text-[10px] ${lastContactDate && !validIsoDate(lastContactDate) ? "text-rose-300" : "text-bone-mute"}`}>{lastContactDate && !validIsoDate(lastContactDate) ? "此日期无效或晚于今天，请重新选择。" : "固定格式 YYYY-MM-DD；支持公元 0001 年至今"}</span></label>
        <label className="text-xs tracking-wider text-bone-dim">最后有效联系时间 *<input required type="time" value={lastContactTime} onChange={(e) => updateContact(lastContactDate, e.target.value)} aria-invalid={!!draft.lastContactAt && !validContactAt(draft.lastContactAt)} className={`${inputClass} ${draft.lastContactAt && !validContactAt(draft.lastContactAt) ? "!border-rose-300/80" : ""}`}/><span className={`mt-1 block text-[10px] ${draft.lastContactAt && !validContactAt(draft.lastContactAt) ? "text-rose-300" : "text-bone-mute"}`}>{draft.lastContactAt && !validContactAt(draft.lastContactAt) ? "联系时间无效或晚于当前时间，请重新选择。" : "固定格式 HH:MM"}</span></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后已知位置说明 *<input required value={draft.lastKnownPlace} onChange={(e) => update("lastKnownPlace", e.target.value)} maxLength={120} placeholder="例如：广州市天河区某道路、建筑入口或可核验地点" className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">先写地点名称，再在下方地图确认精准点；无需查询或手填经纬度</span></label>
        <PreciseMapPicker lat={draft.lastKnownLat} lon={draft.lastKnownLon} place={draft.lastKnownPlace} onConfirm={({ lat, lon }) => setDraft((current) => ({ ...current, lastKnownMapLabel: current.lastKnownPlace, lastKnownLat: lat.toFixed(7), lastKnownLon: lon.toFixed(7) }))}/>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后一次已知移动方向<select value={draft.movementDirection} onChange={(e) => update("movementDirection", e.target.value)} className={inputClass}><option value="">不详 / 尚无可证方向</option><option value="向北">向北</option><option value="东北">东北</option><option value="向东">向东</option><option value="东南">东南</option><option value="向南">向南</option><option value="西南">西南</option><option value="向西">向西</option><option value="西北">西北</option></select></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后一次有效信息<textarea value={draft.context} onChange={(e) => update("context", e.target.value)} maxLength={500} rows={3} placeholder="例如：18:20 电话联系；随后从某地出发，乘车向北；21:00 后未再取得有效联系。" className={`${inputClass} resize-none leading-7`}/></label>
      </div>

      <div className="mt-8 border border-lattice/20 bg-void/30 p-5"><p className="text-xs leading-6 text-bone-dim">{essentialComplete ? "五项开启锚点已齐，可正常进入支付与九域推演；其余资料用于增加现实参照，不阻断开启。" : `尚缺：${coreMissing || "请检查日期、时间与地图选点"}。无效日期、未来时间或仅有地点文字但未完成地图选点，都不会被误算为有效锚点。`}</p><p className="mt-2 text-xs text-amber">权益自支付成功起 7 天内有效。</p></div>
      {!unlocked && <div className="mt-6 border border-amber/35 bg-amber/[.06] p-5"><p className="text-xs tracking-[.2em] text-amber">支付前结果边界</p><p className="mt-3 text-sm leading-7 text-bone-soft">¥688 交付九域天文事实、奇门与六壬自动排盘、双式方向合参、现实方向核验与完整研究档案。所有时法由查询时刻自动历算；只有两套同时成向并通过一致度门时才生成主向，不把古法里数伪换算为公里或坐标。</p><p className="mt-2 text-xs leading-6 text-bone-dim">技术故障、重复支付或支付后无法开启，依《退款政策》处理。</p></div>}
      {!unlocked && <label className="mt-5 flex items-start gap-3 text-xs leading-6 text-bone-dim"><input required type="checkbox" checked={boundaryConsent} onChange={(e) => setBoundaryConsent(e.target.checked)} className="mt-1"/><span>我已理解：现实移动方向仅用于事后核验；原典证据不足时不会用天文投影或用户答案伪造主向与坐标。</span></label>}
      <label className="mt-5 flex items-start gap-3 text-xs leading-6 text-bone-dim"><input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1"/><span>我确认所填资料来源真实，并知悉本模型不得用于跟踪、骚扰、监控或替代警方与救援定位。<span className="mt-1 block"><a href="/terms" className="text-lattice">《服务条款》</a> · <a href="/refunds" className="text-lattice">《退款政策》</a> · <a href="/privacy" className="text-lattice">《隐私政策》</a> · <a href="/declaration" className="text-lattice">《免责声明》</a></span></span></label>
      <button disabled={loading || !essentialComplete || !consent || (!unlocked && !boundaryConsent)} className="mt-7 w-full border border-lattice/60 bg-lattice/10 px-6 py-4 text-sm tracking-[.18em] text-lattice disabled:cursor-not-allowed disabled:opacity-40">{loading ? "九域正在合参…" : unlocked ? "展开双式合参" : "确认边界并开启 · ¥688"}</button>
      <p className="mt-3 text-center text-[11px] text-bone-mute">{unlocked ? "资料确认后形成本次星迹档案。" : "建档完成并确认边界后进入支付。"}</p>
      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}
    </form>}

    {targetKind==="person"&&result && <section id="stellar-result" className="mx-auto mt-16 max-w-[794px] scroll-mt-8"><StellarTraceVisualization result={result} mode="live"/><div ref={resultRef} className="mt-7 space-y-7">
      <PublicationPage index={1} total={3} eyebrow="TIME-METHOD EVIDENCE · INDEPENDENT CONVERGENCE" title="双式时法 · 独立合参" art={art(result.artIndexes[0])} layout="cover"><PublicationLabel>STELLAR TRACE CONVERGENCE INSTRUMENT</PublicationLabel><p className="mt-4 font-display text-[34px] leading-tight text-[#557f79]">{result.priority.available ? `候选方位 · ${result.priority.primaryDirectionZh} ${result.priority.primaryBearing}°` : `时法成向 · ${result.ancient.fused.usedSystems.length} / ${result.ancient.results.length}`}</p><PublicationCopy>{result.priority.available ? `候选扇区：${sectorLabel(result.priority.primarySector)}。` : "两套时法尚未同时通过方向一致度门。"}{result.priority.basisZh}</PublicationCopy><StellarTraceVisualization result={result} mode="print"/></PublicationPage>
      <PublicationPage index={2} total={3} eyebrow="SOURCE-TRACED REASONING" title="原典逐证 · 何以成向" art={art((result.artIndexes[0]+11)%60)} layout="full"><AncientEvidenceDetail ancient={result.ancient} kind="person"/></PublicationPage>
      <PublicationPage index={3} total={3} eyebrow="NINE-FIELD FACTS · REALITY VALIDATION" title="九域事实 · 现实核验" art={art(result.artIndexes[1])} layout="full"><PublicationLabel>原典先独立成向，现实线索只作事后核验</PublicationLabel><p className="mt-3 text-[12px] leading-6 text-[#696473]">{result.distance.explanationZh}</p><div className="mt-3 border border-[#8b6759]/20 bg-white/55 p-4"><p className="text-[14px] font-semibold text-[#557f79]">现实方向核验</p><p className="mt-2 text-[12px] leading-5 text-[#565162]">{result.ancient.realityValidation.noteZh}</p></div><div className="mt-4 border border-[#557f79]/25 bg-white/35 p-4"><p className="font-display text-lg text-[#557f79]">现实核验次序</p>{result.priority.verificationZh.map((line,index)=><p key={line} className="mt-2 text-[12px] leading-5">{index+1}. {line}</p>)}{result.priority.conflictsZh.slice(0,4).map(line=><p key={line} className="mt-2 text-[10px] leading-4 text-[#7b5f55]">证据说明：{line}</p>)}</div><p className="mt-4 border-t border-[#4c4966]/15 pt-3 text-[11px] leading-5 text-[#696473]">{result.modelBoundaryZh}<br/>{result.safetyBoundaryZh}</p></PublicationPage>
    </div><AncientDebugDetails ancient={result.ancient}/><div className="mt-7 grid gap-3 sm:grid-cols-3"><button onClick={copy} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">复制结果</button><button onClick={saveImage} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">保存图片</button><button onClick={downloadPdf} disabled={exporting} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice disabled:opacity-50">{exporting ? "正在生成…" : "下载 3 页高清研究 PDF"}</button></div></section>}
  </main>;
}
