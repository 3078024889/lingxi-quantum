"use client";

import { useCallback, useEffect, useState } from "react";

type Tributary = { productId: string; nameZh: string; nameEn: string; noteZh?: string; completed: boolean; assessmentCompleted?: boolean; accessActive?: boolean; completedAt?: string | null; reportId?: string | null };
type Subject = { subject: { subjectId: string; displayName: string; birthDate?: string }; completed: number };
type Progress = { authenticated: boolean; ready: boolean; completed: number; subject?: Subject["subject"]; subjects?: Subject[]; tributaries: Tributary[]; submissionId?: string; archivedSubmissionId?: string; windowEndsAt?: string | null; error?: string };

export default function ArchetypeProgress() {
  const [data, setData] = useState<Progress | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async (subjectId?: string) => {
    setLoading(true);
    const response = await fetch(`/api/archetype/progress${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ""}`, { cache: "no-store" });
    const payload = await response.json() as Progress;
    setData(payload);
    if (!subjectId && payload.subject?.subjectId) setSelected(payload.subject.subjectId);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading && !data) return <section className="lx-glass mx-auto max-w-4xl p-8 text-bone-dim">正在核对同一报告主体的八条生命支流…</section>;
  if (!data?.authenticated) return <section className="lx-glass mx-auto max-w-4xl p-8"><h2 className="font-display text-2xl text-lattice">登录后查看八流进度</h2><p className="mt-4 leading-8 text-bone-dim">系统只会核对同一主体名下的八份有效报告，不会把同一账户中为家人、朋友或伴侣生成的档案混在一起。</p><a href="/account" className="mt-6 inline-block border border-lattice/50 px-5 py-3 text-sm text-lattice">进入场域账户</a></section>;
  const percent = Math.round(((data.completed ?? 0) / 8) * 100);
  const reportId = data.submissionId ?? data.archivedSubmissionId;
  return <section className="lx-glass mx-auto max-w-4xl border border-lattice/25 p-7 sm:p-10">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs tracking-[.28em] text-lattice">EIGHT-STREAM CONVERGENCE</p><h2 className="mt-3 font-display text-3xl text-bone">生命原型 · 八流进度</h2></div><p className="font-display text-4xl text-lattice">{data.completed ?? 0} / 8</p></div>
    {(data.subjects?.length ?? 0) > 0 && <label className="mt-7 block text-sm text-bone-dim">核对报告主体<select value={selected} onChange={(event) => { setSelected(event.target.value); void load(event.target.value); }} className="mt-2 w-full border border-white/15 bg-[#07102c] px-4 py-3 text-bone">{data.subjects!.map((item) => <option key={item.subject.subjectId} value={item.subject.subjectId}>{item.subject.displayName} · {item.completed}/8</option>)}</select></label>}
    <div className="mt-7 h-2 overflow-hidden bg-white/10"><div className="h-full bg-gradient-to-r from-lattice via-cyan-200 to-purple-300 transition-all" style={{ width: `${percent}%` }}/></div>
    <p className="mt-4 text-sm leading-7 text-bone-dim">当前主体：<span className="text-lattice">{data.subject?.displayName ?? "尚未确认"}</span>。只有这个主体的八类报告各存在一份有效完成记录时才会汇聚；关系报告只按发起测评的第一主体计入。</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-2">{(data.tributaries ?? []).map((item) => <article key={item.productId} className={`border p-4 ${item.completed ? "border-lattice/45 bg-lattice/[.07]" : "border-white/10 bg-white/[.025]"}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-lg text-bone">{item.nameZh}</h3><p className="mt-1 text-[11px] tracking-[.12em] text-bone-mute">{item.nameEn}</p></div><span className={`text-xs ${item.completed ? "text-lattice" : "text-bone-mute"}`}>{item.completed ? "已完成" : item.assessmentCompleted ? "待恢复权限" : "未开启"}</span></div>{item.completedAt && <p className="mt-3 text-xs text-bone-mute">采用版本 · {new Date(item.completedAt).toLocaleString("zh-CN")}</p>}{item.noteZh && <p className="mt-2 text-xs leading-5 text-bone-dim">{item.noteZh}</p>}</article>)}</div>
    {data.ready && reportId ? <a href={`/mini-report?id=${encodeURIComponent(reportId)}`} className="mt-7 inline-flex border border-lattice/60 bg-lattice/10 px-6 py-4 text-sm tracking-[.14em] text-lattice">展开完整生命原型报告 →</a> : <div className="mt-7 border-l border-lattice/50 bg-white/[.025] px-5 py-4 text-sm leading-7 text-bone-dim">自第一条支流开启之日起，365天内完成八项同主体场域精测。八流全部解锁后，系统才会重新推演并生成完整生命原型档案。</div>}
    {data.error && <p className="mt-4 text-sm text-rose-300">{data.error}</p>}
  </section>;
}
