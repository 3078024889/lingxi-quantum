"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { StellarTraceResult } from "@/lib/stellar-trace";
import { PublicationCopy, PublicationLabel, PublicationPage } from "@/app/mini-report/PublicationPage";
import { ALL_REPORT_PDF_ART } from "@/lib/report-art-registry";
import StellarTraceVisualization from "@/app/stellar-trace/StellarTraceVisualization";
import PreciseMapPicker from "@/app/stellar-trace/PreciseMapPicker";
import { EMPTY_STELLAR_TRACE_DRAFT, STELLAR_TRACE_DRAFT_KEY, sanitizeStellarTraceDraft, stellarTraceCompleteness, stellarTraceCoreCompleteness, stellarTraceEssentialComplete, validContactAt, validCoordinates, validIsoDate, type StellarTraceDraft } from "@/lib/stellar-trace-intake";

const art = (index: number) => ALL_REPORT_PDF_ART[index % ALL_REPORT_PDF_ART.length].src;
const levelZh = { divergent: "发散", weak: "弱收敛", moderate: "中等收敛", strong: "较强收敛", high: "高度收敛" } as const;
const bodies = ["太阳", "水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"];
const inputClass = "mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base !text-bone caret-lattice outline-none opacity-100 transition [-webkit-text-fill-color:#F0EDF7] focus:border-lattice";

function sectorLabel(sector: [number, number] | null) {
  if (!sector) return "尚未成域";
  return sector[0] > sector[1] ? `正北跨界扇区 · ${sector[0]}° → 0° → ${sector[1]}°` : `${sector[0]}°—${sector[1]}°`;
}

export default function StellarTraceExperience({ unlocked = false, initialDraft }: { unlocked?: boolean; initialDraft?: Partial<StellarTraceDraft> | null }) {
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
  const coreMissing = [
    !draft.name && "寻踪对象姓名",
    !validIsoDate(draft.birthDate) && "有效出生日期（1900 年以后且不得晚于今天）",
    !validContactAt(draft.lastContactAt) && "有效联系日期与时间（不得晚于现在）",
    !draft.lastKnownPlace && "最后已知位置说明",
    !validCoordinates(draft) && "精准地图选点",
  ].filter(Boolean).join("、");
  const today = new Date().toISOString().slice(0, 10);
  const [lastContactDate = "", lastContactTime = ""] = draft.lastContactAt.split(/[T ]/);
  const updateContact = (date: string, time: string) => update("lastContactAt", date && time ? `${date} ${time}` : date);

  useEffect(() => {
    if (initialDraft) return;
    try { const saved = window.localStorage.getItem(STELLAR_TRACE_DRAFT_KEY); if (saved) setDraft(sanitizeStellarTraceDraft(JSON.parse(saved))); }
    catch { /* Private browsing restrictions should not block the form. */ }
  }, [initialDraft]);

  function update<K extends keyof StellarTraceDraft>(key: K, value: StellarTraceDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!essentialComplete) { setError(`核心锚点尚缺：${coreMissing || "请检查日期与时间格式"}。`); return; }
    if (!consent) { setError("请先确认资料来源与使用规则。"); return; }
    if (!unlocked && !boundaryConsent) { setError("请先确认支付前结果边界。"); return; }
    try { window.localStorage.setItem(STELLAR_TRACE_DRAFT_KEY, JSON.stringify(draft)); } catch { /* Continue without persistence. */ }
    if (!unlocked) {
      // window.name survives the intentional .com → .cn WeChat OAuth hand-off.
      // The checkout consumes and clears it immediately, so PII is not placed in a URL.
      window.name = JSON.stringify({ kind: "lingxifield-stellar-trace-draft-v1", draft });
      window.location.href = "/checkout?productId=stellar-trace&redirect=%2Fstellar-trace&intake=complete";
      return;
    }
    setLoading(true); setResult(null);
    try {
      const response = await fetch("/api/stellar-trace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, consent }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "星迹暂未形成");
      setResult(data); requestAnimationFrame(() => document.getElementById("stellar-result")?.scrollIntoView({ behavior: "smooth" }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "星迹暂未形成"); }
    finally { setLoading(false); }
  }

  const summary = result ? `灵犀场星迹 · 万里寻踪\n方位状态：${levelZh[result.direction.level]}\n圆周集中度：R=${result.direction.resultantLength.toFixed(3)}\n方位：${sectorLabel(result.direction.sector)}\n距离状态：尚无可校准距离。\n候选坐标：尚未成域。\n\n${result.modelBoundaryZh}\n${result.safetyBoundaryZh}` : "";
  async function copy() { if (summary) await navigator.clipboard.writeText(summary); }
  async function downloadPdf() { if (!resultRef.current || !result) return; setExporting(true); setError(""); try { const { exportPublicationPagesPdf } = await import("@/lib/pdf-export"); await exportPublicationPagesPdf({ containerRef: resultRef.current, fileName: "灵犀场星迹-万里寻踪-研究档案.pdf" }); } catch (reason) { setError(reason instanceof Error ? reason.message : "PDF 未能生成"); } finally { setExporting(false); } }
  async function saveImage() { const page = resultRef.current?.querySelector<HTMLElement>(".lx-pdf-page"); if (!page) return; const { default: html2canvas } = await import("html2canvas"); const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#eef0f6" }); const link = document.createElement("a"); link.download = "灵犀场星迹-四证合度.png"; link.href = canvas.toDataURL("image/png"); link.click(); }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_14%_8%,rgba(121,96,186,.34),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(40,155,168,.25),transparent_34%),#07112d] px-4 py-14 text-bone sm:px-6">
    <section className="mx-auto max-w-5xl">
      <p className="text-xs uppercase tracking-[.34em] text-lattice">LINGXI STELLAR TRACE · NINE-FIELD COORDINATES</p>
      <h1 className="mt-5 font-display text-4xl font-light sm:text-6xl">灵犀场星迹 · 万里寻踪</h1>
      <p className="mt-4 font-display text-xl text-lattice">循时而索迹，因星而见位。</p>
      <p className="mt-7 max-w-4xl text-sm leading-8 text-bone-dim">古人循日月、察星辰，以时定方，以象观变。灵犀场将“循迹”重新构造为一套天文坐标实验：以出生时间为初始纪元，以真实行星位置为参照，在太阳系尺度中展开一组属于该时刻的星域坐标。</p>
      <div className="mt-8 grid gap-5 border border-white/10 bg-white/[.04] p-5 backdrop-blur-xl md:grid-cols-[1.2fr_.8fr] sm:p-8">
        <div><p className="text-xs tracking-[.28em] text-amber">九域坐标</p><h2 className="mt-3 font-display text-2xl">Lingxi Stellar Trace · Nine-Field Coordinates</h2><p className="mt-4 text-sm leading-7 text-bone-dim">九域天文事实、四层透明投影与圆周收敛检验形成研究档案；方向或距离证据不足时，系统主动止于证界，不制造坐标。</p><p className="mt-4 font-display text-lg text-lattice">以生时为原点，以今时为流转。</p><p className="mt-3 text-sm leading-7 text-bone-dim">日月五星，各有其度；天王、海王，亦循其轨。九域同列，则一时之天象可复，一岁之迁流可见。</p></div>
        <ol className="grid grid-cols-3 gap-2 text-center text-xs text-bone-dim">{bodies.map((body, index) => <li key={body} className="border border-white/10 bg-void/25 px-2 py-4"><span className="block text-[10px] tracking-widest text-amber">{String(index + 1).padStart(2, "0")}</span><span className="mt-1 block">{body}</span></li>)}</ol>
      </div>
      <p className="mt-6 max-w-4xl text-sm leading-8 text-bone-dim">输入出生日期与地点，系统依据真实天文历算重建出生时刻的太阳系参照位置，再与当前星体坐标叠合，形成个人星迹图。人行于地，必有所经；星行于天，必有所度。取其时，参其位，合其迹，而求其方。所示为天文坐标与时间结构。</p>
      <div className="mt-6 border-l border-amber/60 bg-white/[.035] px-5 py-4 text-xs leading-6 text-bone-dim">本研究不读取设备、通信、GPS 或实时行踪。涉及失联、走失、威胁或人身安全，请先报警并使用可核验的通信、交通和救援渠道。</div>
    </section>

    <form onSubmit={submit} className="mx-auto mt-12 max-w-5xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs tracking-[.26em] text-amber">01 · 寻踪档案</p><h2 className="mt-2 font-display text-3xl">基础坐标</h2></div><div className="min-w-[220px]"><p className="text-xs text-bone-dim">资料完整度 <strong className="text-lattice">{visibleCompleteness} / 11</strong> · 开启必填 <strong className="text-amber">{coreCompleteness} / 5</strong></p><div className="mt-2 h-1 overflow-hidden bg-white/10"><div className="h-full bg-gradient-to-r from-lattice to-amber transition-all" style={{ width: `${visibleCompleteness / 11 * 100}%` }}/></div></div></div>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-bone-dim">一切寻迹，先定其人，复定其时。姓名用于锚定对象，生时用于还原初始天文坐标；出生地点与时间越完整，九域基准越清晰。</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs tracking-wider text-bone-dim">寻踪对象姓名 *<input required value={draft.name} onChange={(e) => update("name", e.target.value)} maxLength={40} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">用于建立本次星迹档案与身份锚点</span></label>
        <label className="text-xs tracking-wider text-bone-dim">与寻踪对象的关系 *<select value={draft.relationship} onChange={(e) => update("relationship", e.target.value as StellarTraceDraft["relationship"])} className={inputClass}><option value="self">本人</option><option value="family">家人</option><option value="partner">伴侣</option><option value="friend">朋友</option><option value="colleague">同事</option><option value="other">其他</option></select></label>
        <label className="text-xs tracking-wider text-bone-dim">真实出生日期 *<input required type="date" min="1900-01-01" max={today} value={draft.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">固定格式 YYYY-MM-DD；不得晚于今天</span></label>
        <label className="text-xs tracking-wider text-bone-dim">出生时间<input type="time" value={draft.birthTime} onChange={(e) => update("birthTime", e.target.value)} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">若知，请尽量精确；未知亦可继续</span></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">出生地点<input value={draft.birthPlace} onChange={(e) => update("birthPlace", e.target.value)} maxLength={80} placeholder="填写城市即可，若可提供更具体地点则更佳" className={inputClass}/></label>
      </div>

      <div className="mt-10 border-t border-white/10 pt-8"><p className="text-xs tracking-[.26em] text-amber">02 · 行迹锚点</p><h2 className="mt-2 font-display text-3xl">最后可证之处</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-bone-dim">寻踪不从虚处起。最后一次能够确认的时间、地点与行动，是现实推演的起点。</p></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs tracking-wider text-bone-dim">最后有效联系日期 *<input required type="date" min="1900-01-01" max={today} value={lastContactDate} onChange={(e) => updateContact(e.target.value, lastContactTime)} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">固定格式 YYYY-MM-DD</span></label>
        <label className="text-xs tracking-wider text-bone-dim">最后有效联系时间 *<input required type="time" value={lastContactTime} onChange={(e) => updateContact(lastContactDate, e.target.value)} className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">固定格式 HH:MM</span></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后已知位置说明 *<input required value={draft.lastKnownPlace} onChange={(e) => update("lastKnownPlace", e.target.value)} maxLength={120} placeholder="例如：广州市天河区某道路、建筑入口或可核验地点" className={inputClass}/><span className="mt-1 block text-[10px] text-bone-mute">先写地点名称，再在下方地图确认精准点；无需查询或手填经纬度</span></label>
        <PreciseMapPicker lat={draft.lastKnownLat} lon={draft.lastKnownLon} place={draft.lastKnownPlace} onConfirm={({ lat, lon }) => setDraft((current) => ({ ...current, lastKnownMapLabel: current.lastKnownPlace, lastKnownLat: lat.toFixed(7), lastKnownLon: lon.toFixed(7) }))}/>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后一次已知移动方向<select value={draft.movementDirection} onChange={(e) => update("movementDirection", e.target.value)} className={inputClass}><option value="">不详 / 尚无可证方向</option><option value="向北">向北</option><option value="东北">东北</option><option value="向东">向东</option><option value="东南">东南</option><option value="向南">向南</option><option value="西南">西南</option><option value="向西">向西</option><option value="西北">西北</option></select></label>
        <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后一次有效信息<textarea value={draft.context} onChange={(e) => update("context", e.target.value)} maxLength={500} rows={3} placeholder="例如：18:20 电话联系；随后从某地出发，乘车向北；21:00 后未再取得有效联系。" className={`${inputClass} resize-none leading-7`}/></label>
      </div>

      <div className="mt-8 border border-lattice/20 bg-void/30 p-5"><p className="text-xs leading-6 text-bone-dim">{essentialComplete ? "五项开启锚点已齐，可正常进入支付与九域推演；其余资料用于增加现实参照，不阻断开启。" : `尚缺：${coreMissing || "请检查日期、时间与地图选点"}。无效日期、未来时间或仅有地点文字但未完成地图选点，都不会被误算为有效锚点。`}</p><p className="mt-2 text-xs text-amber">权益自支付成功起 7 天内有效。</p></div>
      {!unlocked && <div className="mt-6 border border-amber/35 bg-amber/[.06] p-5"><p className="text-xs tracking-[.2em] text-amber">支付前结果边界</p><p className="mt-3 text-sm leading-7 text-bone-soft">¥688 购买的是九域天文事实、四层透明投影、圆周收敛检验及其研究档案，不是保证生成唯一方向、公里距离或现实坐标。若证据不足，系统仍会交付完整据链与推演边界，并主动停止在尚未成域的层级。</p><p className="mt-2 text-xs leading-6 text-bone-dim">技术故障、重复支付或支付后无法开启，依《退款政策》处理；模型停止于证界不等同于技术故障。</p></div>}
      {!unlocked && <label className="mt-5 flex items-start gap-3 text-xs leading-6 text-bone-dim"><input required type="checkbox" checked={boundaryConsent} onChange={(e) => setBoundaryConsent(e.target.checked)} className="mt-1"/><span>我已理解：本次付费保证交付推演与证据档案，不保证形成唯一候选坐标；证不足时，结果可能为“尚未成域”。</span></label>}
      <label className="mt-5 flex items-start gap-3 text-xs leading-6 text-bone-dim"><input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1"/><span>我确认所填资料来源真实，并知悉本模型不得用于跟踪、骚扰、监控或替代警方与救援定位。<span className="mt-1 block"><a href="/terms" className="text-lattice">《服务条款》</a> · <a href="/refunds" className="text-lattice">《退款政策》</a> · <a href="/privacy" className="text-lattice">《隐私政策》</a> · <a href="/declaration" className="text-lattice">《免责声明》</a></span></span></label>
      <button disabled={loading || !essentialComplete || !consent || (!unlocked && !boundaryConsent)} className="mt-7 w-full border border-lattice/60 bg-lattice/10 px-6 py-4 text-sm tracking-[.18em] text-lattice disabled:cursor-not-allowed disabled:opacity-40">{loading ? "九域正在合参…" : unlocked ? "展开四证合度" : "确认边界并开启 · ¥688"}</button>
      <p className="mt-3 text-center text-[11px] text-bone-mute">{unlocked ? "资料确认后形成本次星迹档案。" : "建档完成并确认边界后进入支付。"}</p>
      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}
    </form>

    {result && <section id="stellar-result" className="mx-auto mt-16 max-w-[794px] scroll-mt-8"><StellarTraceVisualization result={result} mode="live"/><div ref={resultRef} className="mt-7 space-y-7">
      <PublicationPage index={1} total={2} eyebrow="FOUR EVIDENCES · CIRCULAR CONVERGENCE" title="四证合度" art={art(result.artIndexes[0])} layout="cover"><PublicationLabel>STELLAR TRACE CONVERGENCE INSTRUMENT</PublicationLabel><p className="mt-4 font-display text-[34px] leading-tight text-[#557f79]">{result.direction.qualified ? levelZh[result.direction.level] : "方位未收敛"}</p><PublicationCopy>圆周集中度 R = {result.direction.resultantLength.toFixed(3)}，离散度 = {result.direction.circularDispersion.toFixed(3)}。{result.direction.qualified ? `四证合度成立：${sectorLabel(result.direction.sector)}。` : "四证分布发散，数学均值仅留作审计，不越证形成主候选方位。"}</PublicationCopy><StellarTraceVisualization result={result} mode="print"/></PublicationPage>
      <PublicationPage index={2} total={2} eyebrow="NINE-FIELD EVIDENCE · INFERENCE BOUNDARY" title="九域据链 · 推演边界" art={art(result.artIndexes[1])} layout="full"><PublicationLabel>证不足，则止于此层，不越证而作数</PublicationLabel><div className="mt-4 grid grid-cols-3 gap-2">{result.snapshots.map((snapshot) => <div key={snapshot.epoch} className="border border-[#4c4966]/15 bg-white/25 p-3"><p className="text-[13px] font-semibold text-[#557f79]">{snapshot.labelZh}</p><p className="mt-1 text-[11px] text-[#565162]">{new Date(snapshot.observedAt).toLocaleString("zh-CN", { hour12: false })}</p><p className="mt-1 text-[9px] text-[#88818f]">JD {snapshot.julianDay}</p></div>)}</div><div className="mt-5 space-y-3">{result.evidence.map((item) => <div key={item.id} className="border-l-2 border-[#a78e63]/55 pl-3"><p className="text-[14px] font-semibold">{item.labelZh}</p><p className="mt-1 text-[13px] leading-6 text-[#565162]">{item.projectionBasisZh}</p><p className="mt-1 text-[12px] text-[#7b5f55]">距离映射：{item.relativeRangeBand}；尚无可校准公里规则</p></div>)}</div><div className="mt-5 border border-[#8b6759]/25 bg-[#fff8f1]/55 p-4"><p className="font-display text-xl text-[#6f5147]">候选坐标尚未成域</p><p className="mt-2 text-[13px] leading-6">概率距离层暂不作数。{result.distance.explanationZh}</p></div><p className="mt-4 border-t border-[#4c4966]/15 pt-3 text-[12px] leading-6 text-[#696473]">{result.modelBoundaryZh}<br/>{result.safetyBoundaryZh}</p></PublicationPage>
    </div><div className="mt-7 grid gap-3 sm:grid-cols-3"><button onClick={copy} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">复制结果</button><button onClick={saveImage} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">保存图片</button><button onClick={downloadPdf} disabled={exporting} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice disabled:opacity-50">{exporting ? "正在生成…" : "下载 2 页研究 PDF"}</button></div></section>}
  </main>;
}
