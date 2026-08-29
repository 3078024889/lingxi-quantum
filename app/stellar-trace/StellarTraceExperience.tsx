"use client";

import { FormEvent, useRef, useState } from "react";
import type { StellarTraceResult } from "@/lib/stellar-trace";
import { PublicationCopy, PublicationLabel, PublicationPage } from "@/app/mini-report/PublicationPage";
import { ALL_REPORT_PDF_ART } from "@/lib/report-art-registry";

const art = (index: number) => ALL_REPORT_PDF_ART[index % ALL_REPORT_PDF_ART.length].src;

export default function StellarTraceExperience() {
  const [result, setResult] = useState<StellarTraceResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const candidateLat = result ? `${Math.abs(result.candidate.lat)}° ${result.candidate.lat >= 0 ? "N" : "S"}` : "";
  const candidateLon = result ? `${Math.abs(result.candidate.lon)}° ${result.candidate.lon >= 0 ? "E" : "W"}` : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/stellar-trace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, consent: form.get("consent") === "on" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "星迹暂未形成");
      setResult(data);
      requestAnimationFrame(() => document.getElementById("stellar-result")?.scrollIntoView({ behavior: "smooth" }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "星迹暂未形成"); }
    finally { setLoading(false); }
  }

  const summary = result ? `灵犀场星迹 · 万里追踪\n主方位 ${result.bearing}°\n候选扇区 ${result.sector[0]}°—${result.sector[1]}°\n距离带 ${result.distanceKm[0]}—${result.distanceKm[1]} km\n候选中心 ${candidateLat}, ${candidateLon}\n搜索半径 ${result.candidate.radiusKm} km\n四证收敛 ${result.convergence}%\n\n${result.boundaryZh}` : "";
  async function copy() { if (summary) await navigator.clipboard.writeText(summary); }
  async function downloadPdf() {
    if (!resultRef.current || !result) return; setExporting(true); setError("");
    try { const { exportPublicationPagesPdf } = await import("@/lib/pdf-export"); await exportPublicationPagesPdf({ containerRef: resultRef.current, fileName: "灵犀场星迹-万里追踪.pdf" }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "PDF 未能生成"); }
    finally { setExporting(false); }
  }
  async function saveImage() {
    const page = resultRef.current?.querySelector<HTMLElement>(".lx-pdf-page"); if (!page) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#eef0f6" });
    const link = document.createElement("a"); link.download = "灵犀场星迹-万里追踪.png"; link.href = canvas.toDataURL("image/png"); link.click();
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_14%_8%,rgba(121,96,186,.34),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(40,155,168,.25),transparent_34%),#07112d] px-4 py-14 text-bone sm:px-6">
    <section className="mx-auto max-w-5xl">
      <p className="text-xs uppercase tracking-[.34em] text-lattice">LINGXI STELLAR TRACE · EXPERIMENTAL FIELD</p>
      <h1 className="mt-5 font-display text-4xl font-light sm:text-6xl">灵犀场星迹 · 万里追踪</h1>
      <p className="mt-4 font-display text-xl text-lattice">循时而索迹，因星而见位。</p>
      <p className="mt-7 max-w-3xl text-sm leading-8 text-bone-dim">人行于地，必有所经；星行于天，必有所度。系统从最后一个确定的位置出发，把生时、最后有效联系时间、真实九域天体坐标与四条古法方位证据合并，再投影为一组可保存、可复核的候选坐标场。</p>
      <div className="mt-6 border-l border-amber/60 bg-white/[.035] px-5 py-4 text-xs leading-6 text-bone-dim">它不读取设备、通信、GPS 或实时行踪，也不声称知道某个人当前在哪里。涉及失联、走失、威胁或人身安全，请先报警并使用可核验的通信、交通和救援渠道。</div>
    </section>

    <form onSubmit={submit} className="mx-auto mt-12 grid max-w-5xl gap-5 border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl sm:grid-cols-2 sm:p-8">
      <label className="text-xs tracking-wider text-bone-dim">寻踪对象姓名<input required name="name" maxLength={40} className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim">真实出生日期<input required type="date" name="birthDate" className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim">出生时间（若知）<input type="time" name="birthTime" className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim">最后有效联系时间<input required type="datetime-local" name="lastContactAt" className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim">最后已知纬度<input required type="number" step="0.0001" min="-90" max="90" name="lastKnownLat" placeholder="31.2304" className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim">最后已知经度<input required type="number" step="0.0001" min="-180" max="180" name="lastKnownLon" placeholder="121.4737" className="mt-2 w-full border border-white/15 bg-void/50 px-4 py-3 text-base text-bone outline-none focus:border-lattice" /></label>
      <label className="text-xs tracking-wider text-bone-dim sm:col-span-2">最后一次有效信息（选填）<textarea name="context" maxLength={500} rows={3} placeholder="电话、文字联系、见面、出发、乘车、到达某地等已知事实" className="mt-2 w-full resize-none border border-white/15 bg-void/50 px-4 py-3 text-base leading-7 text-bone outline-none focus:border-lattice" /></label>
      <label className="flex items-start gap-3 text-xs leading-6 text-bone-dim sm:col-span-2"><input required type="checkbox" name="consent" className="mt-1"/><span>我确认有权使用所填资料，并理解结果仅为探索性候选区域，不用于跟踪、骚扰、监控或替代警方与救援定位。</span></label>
      <button disabled={loading} className="border border-lattice/60 bg-lattice/10 px-6 py-4 text-sm tracking-[.22em] text-lattice disabled:opacity-50 sm:col-span-2">{loading ? "九域正在合参…" : "展开第一次联合推演"}</button>
      {error && <p className="text-center text-sm text-rose-300 sm:col-span-2">{error}</p>}
    </form>

    {result && <section id="stellar-result" className="mx-auto mt-16 max-w-[794px] scroll-mt-8">
      <div ref={resultRef} className="space-y-7">
        <PublicationPage index={1} total={2} eyebrow="LINGXI STELLAR TRACE" title="万里追踪 · 联合推演" art={art(result.artIndexes[0])} layout="cover">
          <PublicationLabel>九域参照 · FOUR-EVIDENCE CONVERGENCE</PublicationLabel>
          <p className="mt-4 font-display text-3xl text-[#557f79]">{result.bearing}°</p>
          <PublicationCopy>主候选扇区 {result.sector[0]}°—{result.sector[1]}°；距最后已知位置 {result.distanceKm[0]}—{result.distanceKm[1]} km。</PublicationCopy>
          <div className="mt-5 grid grid-cols-2 gap-3">{result.evidence.map((item)=><div key={item.id} className="border border-[#4c4966]/15 bg-white/25 p-3"><p className="text-xs font-semibold text-[#557f79]">{item.labelZh}</p><p className="mt-2 text-sm">{item.bearing}° · {item.distanceBand}</p></div>)}</div>
        </PublicationPage>
        <PublicationPage index={2} total={2} eyebrow="CANDIDATE COORDINATE FIELD" title="候选坐标场" art={art(result.artIndexes[1])} layout="full">
          <div className="grid gap-4 sm:grid-cols-2"><div><PublicationLabel>候选中心</PublicationLabel><p className="mt-2 font-display text-2xl">{candidateLat}<br/>{candidateLon}</p></div><div><PublicationLabel>候选半径</PublicationLabel><p className="mt-2 font-display text-2xl">{result.candidate.radiusKm} km</p><p className="mt-2 text-sm">四证收敛 {result.convergence}%</p></div></div>
          <PublicationCopy>环境重合象：{result.environmentZh.join(" / ")}。九域天文数据以生成时刻为纪元，保留太阳、水星、金星、地球、火星、木星、土星、天王星与海王星的真实日心经度。</PublicationCopy>
          <p className="mt-5 border-t border-[#4c4966]/15 pt-4 text-[11px] leading-5 text-[#696473]">{result.boundaryZh}</p>
        </PublicationPage>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><button onClick={copy} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">复制结果</button><button onClick={saveImage} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice">保存图片</button><button onClick={downloadPdf} disabled={exporting} className="border border-lattice/45 py-3 text-xs tracking-widest2 text-lattice disabled:opacity-50">{exporting?"正在生成…":"下载 2 页 PDF"}</button></div>
    </section>}
  </main>;
}
