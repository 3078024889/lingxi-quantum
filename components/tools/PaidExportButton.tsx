"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {v104sText} from "@/lib/v104s-i18n";

export default function PaidExportButton({toolId,quantity,onUnlocked,label}:{toolId:string;quantity:number;onUnlocked:()=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>v104sText(lang,zh,en);
 const[quote,setQuote]=useState<any>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null);
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};
 async function unlock(id:string){if(processing.current===id)return;processing.current=id;stop();const c=await fetch("/api/tools/export/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:id})});if(!c.ok){const x=await c.json().catch(()=>({}));setMsg(x.error||t("导出权限确认失败","Could not confirm export permission"));processing.current=null;return}setMsg(t("支付已确认，正在生成文件…","Payment confirmed. Generating file…"));try{await onUnlocked();setMsg(t("已导出","Exported"))}finally{processing.current=null}}
 async function check(id:string){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)return false;const d=await r.json();if(!d.paid)return false;await unlock(id);return true}
 useEffect(()=>{const h=(e:MessageEvent)=>{if(e.origin!==window.location.origin)return;const d=e.data as any;if(d?.type==="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"&&d.quoteId&&d.quoteId===quote?.id)void unlock(d.quoteId)};window.addEventListener("message",h);return()=>{stop();window.removeEventListener("message",h)}},[quote?.id]);
 async function start(){setBusy(true);setMsg("");try{let q=quote;if(!q||Number(q.quantity)!==quantity){const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity})});const d=await r.json();if(!r.ok)throw new Error(d.error||t("无法创建报价","Could not create quote"));q=d;setQuote(d)}const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(q.id)}`,"lingxi_tool_pay","width=720,height=820");if(!w){setMsg(t("浏览器阻止了付款窗口，请允许本站弹窗后再试。","The browser blocked the payment window. Allow pop-ups and try again."));return}stop();timer.current=setInterval(()=>void check(q.id),2200);setMsg(`${lang==="zh"?"本次报价":"Quote"} ¥${q.amount_rmb}${lang==="zh"?"，付款完成后自动导出。":" · export starts automatically after payment."}`)}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div><button onClick={start} disabled={busy||quantity<=0} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">{busy?t("正在创建报价…","Creating quote…"):(label||t("付费并导出","Pay & export"))}</button>{quote&&<span className="ml-3 text-sm text-slate-500">¥{quote.amount_rmb}</span>}{msg&&<p className="mt-2 text-xs text-slate-500">{msg}</p>}</div>
}
