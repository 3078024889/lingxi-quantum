"use client";
import {useEffect,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
type Legacy={id:string;order_id:string;amount_fen:number;status:string;created_at:string};
export default function LegacyRefundMigrationPanel(){
 const{lang}=useLingxiLang();const zh=lang==="zh";const[items,setItems]=useState<Legacy[]>([]),[busy,setBusy]=useState<string|null>(null),[msg,setMsg]=useState("");
 async function load(){try{const r=await fetch("/api/account/withdrawals/legacy",{cache:"no-store"});if(r.status===401){setItems([]);return}const d=await r.json().catch(()=>({}));setItems(r.ok&&Array.isArray(d.items)?d.items:[])}catch{setItems([])}}
 useEffect(()=>{void load()},[]);
 async function migrate(x:Legacy){const a=`¥${(Number(x.amount_fen)/100).toFixed(2)}`;if(!confirm(zh?`确认将旧退款申请 ${a} 转入自动原路退款？确认后会实际发起退款。`:`Move the legacy ${a} request into automatic provider refunding?`))return;setBusy(x.id);setMsg("");try{const r=await fetch("/api/account/withdrawals/legacy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({requestId:x.id})});const d=await r.json().catch(()=>({}));if(!r.ok){setMsg(String(d.error||"处理没有完成"));return}setMsg(d.status==="completed"?(zh?"原支付渠道已确认退款。":"Refund confirmed."):(zh?"已进入原路退款流程。":"Refund is processing."));await load()}finally{setBusy(null)}}
 if(!items.length)return null;
 return <section className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h2 className="text-lg font-semibold">{zh?"旧退款申请":"Legacy refund requests"}</h2><p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"旧版人工申请可逐笔转入现在的自动原路退款。只有你确认后才会真的发起退款。":"Legacy requests can be moved into automatic provider refunds."}</p><div className="mt-4 space-y-3">{items.map(x=><div key={x.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--lx-soft)] px-4 py-3"><div><b>¥{(Number(x.amount_fen)/100).toFixed(2)}</b><div className="text-xs text-[var(--lx-faint)]">{new Date(x.created_at).toLocaleString()}</div></div><button disabled={busy===x.id} onClick={()=>void migrate(x)} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">{busy===x.id?(zh?"正在处理…":"Processing…"):(zh?"转入原路退款":"Move to provider refund")}</button></div>)}</div>{msg&&<p className="mt-4 text-sm text-[var(--lx-muted)]">{msg}</p>}</section>
}
