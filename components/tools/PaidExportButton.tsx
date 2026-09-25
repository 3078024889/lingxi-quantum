"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {v104sText} from "@/lib/v104s-i18n";

type Quote={id:string;quantity:number;amount_rmb:number;amount_usd:number;expires_at?:string};
type PaymentMessage={type?:unknown;quoteId?:unknown};
const POLL_MS=2200;
const MAX_POLL_FAILURES=3;

export default function PaidExportButton({toolId,quantity,onUnlocked,label}:{toolId:string;quantity:number;onUnlocked:()=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const t=(zh:string,en:string)=>v104sText(lang,zh,en);
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),pollFailures=useRef(0);
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}pollFailures.current=0};

 async function unlock(id:string){
  if(processing.current===id)return;
  processing.current=id;stop();
  try{
   const c=await fetch("/api/tools/export/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:id})});
   if(!c.ok){
    const x=await c.json().catch(()=>({})) as {error?:string};
    setMsg(x.error||t("导出权限确认失败","Could not confirm export permission"));
    return;
   }
   setMsg(t("支付已确认，正在生成文件…","Payment confirmed. Generating file…"));
   try{
    await onUnlocked();
    setMsg(t("文件已生成。","File generated."));
   }catch(e){
    setMsg(`${t("支付已确认，但文件生成失败。请保留订单记录并从订单中心恢复。","Payment is confirmed, but file generation failed. Keep the order record and resume from Orders.")}${e instanceof Error?` · ${e.message}`:""}`);
   }
  }finally{processing.current=null}
 }
 async function check(id:string){
  try{
   const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});
   if(!r.ok)throw new Error(`STATUS_${r.status}`);
   const d=await r.json() as {paid?:boolean};
   pollFailures.current=0;
   if(!d.paid)return false;
   await unlock(id);return true;
  }catch{
   pollFailures.current++;
   if(pollFailures.current>=MAX_POLL_FAILURES){
    stop();setMsg(t("暂时无法确认支付状态。不会重复创建订单，请从订单中心继续确认。","Payment status could not be confirmed. No new order will be created; continue from Orders."));
   }
   return false;
  }
 }
 useEffect(()=>{
  const h=(e:MessageEvent)=>{
   if(e.origin!==window.location.origin)return;
   const raw=e.data as unknown;
   if(!raw||typeof raw!=="object")return;
   const d=raw as PaymentMessage;
   if(d.type==="LINGXIFIELD_TOOL_PAYMENT_CONFIRMED"&&typeof d.quoteId==="string"&&d.quoteId===quote?.id)void unlock(d.quoteId);
  };
  window.addEventListener("message",h);
  return()=>{stop();window.removeEventListener("message",h)}
 },[quote?.id,lang]);

 async function start(){
  setBusy(true);setMsg("");
  try{
   let q=quote;
   if(!q||Number(q.quantity)!==quantity||(q.expires_at&&new Date(q.expires_at).getTime()<=Date.now())){
    const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity})});
    const d=await r.json().catch(()=>({})) as Partial<Quote>&{error?:string};
    if(!r.ok||typeof d.id!=="string")throw new Error(d.error||t("无法创建报价","Could not create quote"));
    q={id:d.id,quantity:Number(d.quantity),amount_rmb:Number(d.amount_rmb),amount_usd:Number(d.amount_usd),expires_at:d.expires_at};
    setQuote(q);
   }
   const w=window.open(`/tools/pay?quoteId=${encodeURIComponent(q.id)}`,"lingxi_tool_pay","width=720,height=820");
   if(!w){setMsg(t("浏览器阻止了付款窗口，请允许本站弹窗后再试。","The browser blocked the payment window. Allow pop-ups and try again."));return}
   stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS);
   setMsg(`${lang==="zh"?"本次报价":"Quote"} ¥${q.amount_rmb}${lang==="zh"?"，付款完成后自动导出。":" · export starts automatically after payment."}`);
  }catch(e){setMsg(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 return <div>
  <button onClick={start} disabled={busy||quantity<=0} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t("正在创建报价…","Creating quote…"):(label||t("付费并导出","Pay & export"))}</button>
  {quote&&<span className="ml-3 text-sm text-[var(--lx-muted)]">¥{quote.amount_rmb}</span>}
  {msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}
 </div>
}
