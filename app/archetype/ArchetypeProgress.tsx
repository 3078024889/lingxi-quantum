"use client";

import { useCallback, useEffect, useState } from "react";

type Tributary = { productId: string; nameZh: string; nameEn: string; noteZh?: string; completed: boolean; assessmentCompleted?: boolean; needsRetest?: boolean; completedAt?: string | null };
type Subject = { subject: { subjectId: string; displayName: string; birthDate?: string }; completed: number };
type Progress = { authenticated: boolean; ready: boolean; completed: number; subject?: Subject["subject"]; subjects?: Subject[]; tributaries: Tributary[]; submissionId?: string; archivedSubmissionId?: string; blockedReason?: "identity-mismatch"|"legacy-evidence-missing"|"outside-365-days"|"coverage-incomplete"; subjectSelectionRequired?: boolean; error?: string };

function blockedCopy(data: Progress) {
  if (data.subjectSelectionRequired) return "此账户已有多个完成八流的姓名主体。请选择姓名核对，系统不会自行合并或猜测。";
  if (data.blockedReason === "legacy-evidence-missing") return "八流数量已齐，但至少一份旧报告没有保存底层证据叶。系统不会补写证据，请用同一姓名重新完成该支流。";
  if (data.blockedReason === "identity-mismatch") return "八份报告的姓名主体未通过完全一致核验，暂不生成生命原型。";
  if (data.blockedReason === "outside-365-days") return "八份报告未落在同一 365 天有效窗口内，暂不生成生命原型。";
  return "自第一条支流开启之日起，365 天内完成八项同主体场域精测。八流齐备后，系统才会读取底层证据并生成完整原型档案。";
}

export default function ArchetypeProgress() {
  const [data, setData] = useState<Progress | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const load = useCallback(async (subjectId?: string) => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/archetype/progress${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`progress request failed: ${response.status}`);
      const payload = await response.json() as Progress;
      setData(payload);
      if (!subjectId && payload.subject?.subjectId) setSelected(payload.subject.subjectId);
    } catch {
      setData(null);
      setLoadError("暂时无法读取生命原型进度。你的既有报告没有被改动，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <section className="archetype-progress-shell"><p className="archetype-progress-loading">正在核对同一报告主体的八条生命支流…</p></section>;
  if (loadError && !data) return <section className="archetype-progress-shell archetype-progress-signed-out"><div><p className="archetype-kicker">EVIDENCE SERVICE</p><h2>真实进度暂时无法读取</h2><p>{loadError}</p></div><button type="button" onClick={() => void load()}>重新读取 →</button></section>;
  if (!data?.authenticated) return <section className="archetype-progress-shell archetype-progress-signed-out"><div><p className="archetype-kicker">YOUR EVIDENCE MAP</p><h2>登录后查看真实八流进度</h2><p>系统只核对同一主体名下的有效报告，不会把同一账户中为家人、朋友或伴侣生成的档案混在一起。</p></div><a href="/account">登录并查看我的进度 →</a></section>;

  const percent = Math.round(((data.completed ?? 0) / 8) * 100);
  const reportId = data.submissionId ?? data.archivedSubmissionId;

  return <section className="archetype-progress-shell">
    <div className="archetype-progress-head">
      <div><p className="archetype-kicker">EIGHT-STREAM CONVERGENCE</p><h2>只呈现你的真实记录</h2><p>当前主体：<b>{data.subject?.displayName ?? "尚未确认"}</b></p></div>
      <div className="archetype-progress-meter" aria-label={`已完成 ${data.completed ?? 0} 项，共 8 项`}><strong>{data.completed ?? 0}<small>/ 8</small></strong><span><i style={{ width: `${percent}%` }} /></span><p>{percent}% · 仅按有效记录计算</p></div>
    </div>

    {(data.subjects?.length ?? 0) > 0 && <label className="archetype-subject-select">核对报告主体<select value={selected} onChange={(event) => { setSelected(event.target.value); if (event.target.value) void load(event.target.value); }}><option value="">请选择同一姓名主体</option>{data.subjects!.map((item) => <option key={item.subject.subjectId} value={item.subject.subjectId}>{item.subject.displayName} · {item.completed}/8</option>)}</select></label>}

    <div className="archetype-stream-grid">{(data.tributaries ?? []).map((item, index) => <article key={item.productId} className={item.needsRetest ? "needs-retest" : item.completed ? "is-complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.nameZh}</h3><small>{item.nameEn}</small>{item.completedAt && <p>采用记录 · {new Date(item.completedAt).toLocaleString("zh-CN")}</p>}{item.noteZh && <p>{item.noteZh}</p>}</div><b>{item.needsRetest ? "旧版缺证据" : item.completed ? "已完成" : item.assessmentCompleted ? "待恢复权限" : "未开启"}</b></article>)}</div>

    {data.ready && reportId ? <a href={`/mini-report?id=${encodeURIComponent(reportId)}`} className="archetype-report-link">展开完整生命原型报告 →</a> : <div className="archetype-progress-boundary">{blockedCopy(data)}</div>}
    {data.error && <p className="archetype-progress-error">{data.error}</p>}
  </section>;
}
