import {notFound} from "next/navigation";
import Nav from "@/components/Nav";
import {createClient} from "@/lib/supabase/server";
import {isSasiOperator} from "@/lib/sasi/operator/access";
import {loadSasiV5OperatorMetrics} from "@/lib/sasi-v5/operator-metrics";
export const dynamic="force-dynamic";
export const metadata={title:"灵犀场 SASI · V5 Quality & Growth",robots:{index:false,follow:false}};
function pct(v:unknown){return typeof v==="number"&&Number.isFinite(v)?`${(v*100).toFixed(1)}%`:"—"}
export default async function Page(){
 const{data:{user}}=await createClient().auth.getUser();if(!user||!isSasiOperator(user.email))notFound();
 const data=await loadSasiV5OperatorMetrics();
 return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
  <p className="lx10-kicker">SASI · V5 Operator</p><h1 className="lx10-title">质量、学习与利润健康</h1>
  <p className="lx10-lead">只展示真实记录；没有样本时保持空白，不推断“已经学会”。</p>
  <section className="mt-8 grid gap-4 md:grid-cols-4">
   <Card t="Learning samples" v={String(data.summary.sampleCount??0)}/>
   <Card t="Positive signals" v={pct(data.summary.positiveRate)}/>
   <Card t="Negative signals" v={pct(data.summary.negativeRate)}/>
   <Card t="Validator average" v={pct(data.summary.averageValidatorScore)}/>
  </section>
  <section className="mt-6 grid gap-3 md:grid-cols-2">
   {Object.entries(data.tables).map(([k,v]:any)=><div key={k} className="rounded-2xl border border-slate-200 bg-white p-4">
     <div className="text-sm font-semibold">{k}</div><div className="mt-2 text-2xl">{v.available?String(v.count):"PENDING"}</div>
   </div>)}
  </section>
  <p className="mt-5 text-xs text-slate-400">Checked {data.checkedAt}</p>
 </div></main></>;
}
function Card({t,v}:{t:string;v:string}){return <div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="text-xs uppercase tracking-[.14em] text-slate-400">{t}</div><div className="mt-2 text-2xl font-semibold">{v}</div></div>}
