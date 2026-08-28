"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Bi from "@/components/Bi";

type Tributary = { productId: string; nameZh: string; nameEn: string; noteZh?: string; completed: boolean; completedAt?: string | null };
type Progress = { authenticated: boolean; ready: boolean; completed: number; submissionId?: string; windowEndsAt?: string | null; tributaries: Tributary[] };

export default function ArchetypeProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch("/api/archetype/progress", { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error("progress"); return response.json(); }).then(setProgress).catch(() => setError(true)); }, []);
  const completed = progress?.completed ?? 0;
  return <section className="mx-auto mt-8 max-w-4xl border border-lattice/25 bg-[#0a1330]/75 p-6 shadow-[0_24px_80px_rgba(0,5,35,.35)] sm:p-9">
    <div className="flex items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.28em] text-lattice">EIGHT-STREAM CONVERGENCE</p><h3 className="mt-3 font-display text-2xl text-bone"><Bi zh="八流进度" en="Eight-stream progress" /></h3></div><p className="font-display text-3xl text-lattice">{completed} / 8</p></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-lattice to-purple-300 transition-all" style={{ width: `${completed * 12.5}%` }} /></div>
    <p className="mt-4 text-sm leading-7 text-bone-dim">{progress?.windowEndsAt ? <Bi zh={`当前汇流窗口至 ${new Date(progress.windowEndsAt).toLocaleDateString("zh-CN")}`} en={`Current convergence window ends ${new Date(progress.windowEndsAt).toLocaleDateString("en-US")}`} /> : <Bi zh="第一条支流完成后，365 天汇流窗口开始计算。" en="The 365-day convergence window begins when the first tributary is completed." />}</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-2">{(progress?.tributaries ?? []).map((item) => <div key={item.productId} className={`border p-4 ${item.completed ? "border-lattice/40 bg-lattice/[.07]" : "border-white/10 bg-white/[.025]"}`}><div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${item.completed ? "bg-lattice shadow-[0_0_14px_rgba(126,226,214,.7)]" : "border border-white/35"}`} /><div><p className="text-sm text-bone"><Bi zh={item.nameZh} en={item.nameEn} /></p>{item.noteZh && <p className="mt-2 text-xs leading-6 text-bone-mute">{item.noteZh}</p>}<p className="mt-2 text-xs text-lattice">{item.completed ? "已汇入 · CONVERGED" : "未抵达 · NOT YET CONVERGED"}</p></div></div></div>)}</div>
    {error && <p className="mt-6 text-sm text-rose-300">进度暂未同步，请稍后刷新。</p>}
    <div className="mt-7 flex flex-wrap gap-3">{progress?.ready && progress.submissionId ? <Link href={`/mini-report?id=${progress.submissionId}`} className="border border-lattice/50 bg-lattice/10 px-5 py-3 text-sm text-lattice">展开完整生命原型报告 →</Link> : progress?.authenticated ? <Link href="/account" className="border border-lattice/50 bg-lattice/10 px-5 py-3 text-sm text-lattice">查看档案与继续解锁 →</Link> : <Link href="/account" className="border border-lattice/50 bg-lattice/10 px-5 py-3 text-sm text-lattice">登录后查看个人进度 →</Link>}</div>
  </section>;
}
