"use client";
import {useEffect} from "react";
import Link from "next/link";
export default function SasiError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error("SASI_CLIENT_RECOVERY",error)},[error]);
 return <main className="lx11-page min-h-[calc(100vh-64px)]"><div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5"><div className="w-full rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 text-center"><h1 className="text-xl font-semibold">刚才没有顺利继续</h1><p className="mt-3 text-sm leading-6 text-[var(--lx-muted)]">你可以重试，或回到 SASI 继续输入新的任务。当前页面不会自动执行任何付费操作。</p><div className="mt-5 flex justify-center gap-3"><button type="button" onClick={reset} className="rounded-full border border-[var(--lx-line)] px-4 py-2 text-sm">重试</button><Link href="/sasi" className="rounded-full bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">返回 SASI</Link></div></div></div></main>;
}
