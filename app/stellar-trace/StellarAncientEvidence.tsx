"use client";

import type { AncientSystem, AncientTraceEnvelope, AncientTraceResult } from "@/lib/stellar-trace/ancient";

type TraceKind = "person" | "object" | "animal";

const SYSTEM_ZH: Record<AncientSystem, string> = {
  qimen: "奇门",
  liuren: "六壬",
  taiyi: "太乙",
  liuyao: "六爻",
};

const STATUS_ZH: Record<AncientTraceResult["status"], string> = {
  ok: "本证成立",
  partial: "本证未全",
  "missing-input": "本法不适用",
  unsupported: "本法不适用",
};

const DISTANCE_ZH: Record<string, string> = {
  near: "近域",
  medium: "中域",
  far: "远域",
  very_far: "极远层",
  unknown: "远近未定",
};

function evidenceTitle(system: AncientSystem, kind: TraceKind) {
  if (system === "qimen") return kind === "object" ? "奇门失物证" : kind === "animal" ? "奇门六畜证" : "奇门行人证";
  if (system === "liuren") return kind === "object" ? "六壬亡财证" : "六壬行人证";
  if (system === "taiyi") return "太乙行人证";
  return kind === "animal" ? "六爻六畜证" : kind === "object" ? "六爻失物证" : "六爻行人证";
}

function moduleVerdict(item: AncientTraceResult) {
  const primary = item.evidence.find((entry) => !entry.ruleId.startsWith("MOD-"));
  return primary?.outputZh ?? item.warningsZh[0] ?? "本证尚无足够输入，不入诸证合度。";
}

function distanceText(item: AncientTraceResult) {
  if (!item.distance) return "未形成远近层";
  const base = DISTANCE_ZH[item.distance.normalizedBand] ?? "远近未定";
  return item.distance.ancientUnit ? `${base} · ${item.distance.ancientUnit}` : base;
}

export function formedAncientResults(ancient: AncientTraceEnvelope) {
  return ancient.results.filter((item) => item.status === "ok" || item.status === "partial");
}

export function AncientEvidenceDetail({ ancient, kind }: { ancient: AncientTraceEnvelope; kind: TraceKind }) {
  const formed = formedAncientResults(ancient);
  const engineCount = ancient.results.length;

  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3 border-b border-[#4c4966]/15 pb-3 text-[11px] leading-5 text-[#565162]">
      <p>时法成向<br/><strong className="text-[17px] text-[#557f79]">{formed.length} / {engineCount}</strong></p>
      <p>方向一致度<br/><strong className="text-[17px] text-[#557f79]">R = {ancient.fused.resultantLength.toFixed(3)}</strong></p>
    </div>
    {formed.length ? formed.map((item, index) => {
      const primary = item.evidence.find((entry) => !entry.ruleId.startsWith("MOD-"));
      return <section key={item.system} className="border border-[#557f79]/24 bg-white/45 p-3">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-semibold tracking-[.18em] text-[#8b6759]">第{["一","二","三","四"][index]}证</p><h3 className="mt-1 font-display text-[18px] text-[#302941]">{evidenceTitle(item.system, kind)}</h3></div>
          <span className="text-[10px] text-[#557f79]">{STATUS_ZH[item.status]}</span>
        </div>
        {primary && <p className="mt-2 text-[10px] leading-4 text-[#696473]">据《{primary.sourceTitle}》{primary.sourceChapter ? ` · ${primary.sourceChapter}` : ""}</p>}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] leading-5 text-[#565162]">
          <p>方位：<strong>{item.direction ? `${item.direction.labelZh} ${item.direction.centerDeg}°` : "未成向"}</strong></p>
          <p>候选扇区：<strong>{item.direction ? `${item.direction.sector[0]}°—${item.direction.sector[1]}°` : "未成域"}</strong></p>
          <p>远近：<strong>{distanceText(item)}</strong></p>
          <p>动静：<strong>{item.motion?.noteZh || (item.motion?.state === "unknown" ? "原典未定" : item.motion?.state) || "未形成"}</strong></p>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#454151]">断曰：{moduleVerdict(item)}</p>
        {!!item.environmentZh.length && <p className="mt-1 text-[10px] leading-4 text-[#696473]">环境象：{item.environmentZh.join("、")}。此象只用于现实核验，不等同具体地址。</p>}
      </section>;
    }) : <section className="border border-[#8b6759]/25 bg-white/45 p-4 text-[12px] leading-6 text-[#565162]">当前目标类别没有形成可复算的时法方位。报告转入现实搜索次序，不增加玄学式交互，也不以名称、习性、已知移动方向或天文投影反造方位。</section>}
    <p className="text-[10px] leading-4 text-[#696473]">R 只表示已成方位之间的圆周一致程度，不是定位概率，也不代表现实精度。</p>
  </div>;
}

export function AncientDebugDetails({ ancient }: { ancient: AncientTraceEnvelope }) {
  return <details className="mt-5 border border-white/10 bg-white/[.035] p-4 text-xs text-bone-dim">
    <summary className="cursor-pointer tracking-[.16em] text-lattice">研究校验抽屉 · 规则与原始盘面</summary>
    <div className="mt-4 space-y-4">{ancient.results.map((item) => <section key={item.system}>
      <p className="font-semibold text-bone">{SYSTEM_ZH[item.system]} · {STATUS_ZH[item.status]}</p>
      {item.evidence.map((entry) => <p key={entry.ruleId} className="mt-1 break-words leading-5">{entry.ruleId} · {entry.sourceTitle} · {entry.outputZh}</p>)}
      {item.debug && <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all bg-black/20 p-3 text-[10px] leading-4">{JSON.stringify(item.debug, null, 2)}</pre>}
    </section>)}</div>
  </details>;
}
