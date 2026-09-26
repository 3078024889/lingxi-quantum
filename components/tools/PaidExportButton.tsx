"use client";
import {useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {v104sText} from "@/lib/v104s-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";

type Quote={id:string;quantity:number;amount_rmb:number;amount_usd:number;currency?:"CNY"|"USD";display_currency?:"CNY"|"USD";display_amount?:number;expires_at?:string};
const POLL_MS=1800,MAX_POLL_FAILURES=4;
function isMini(){try{return new URLSearchParams(location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}}
async function openMiniPay(id:string){
 return new Promise<boolean>(resolve=>{
  let done=false;const finish=(v:boolean)=>{if(done)return;done=true;resolve(v)};
  const go=()=>{const wx=(window as any).wx;if(!wx?.miniProgram?.navigateTo){finish(false);return}wx.miniProgram.navigateTo({url:`/pages/pay/index?quoteId=${encodeURIComponent(id)}`,success:()=>finish(true),fail:()=>finish(false)})};
  if((window as any).wx?.miniProgram){go();return}
  const s=document.createElement("script");s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>finish(false);document.head.appendChild(s);setTimeout(()=>finish(false),3500);
 })
}
export default function PaidExportButton({toolId,quantity,onUnlocked,label}:{toolId:string;quantity:number;onUnlocked:()=>Promise<void>|void;label?:string}){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const t=(zh:string,en:string)=>v104sText(lang,zh,en);
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),fails=useRef(0);
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}fails.current=0};
 async function unlock(id:string){if(processing.current===id)return;processing.current=id;stop();try{
  const c=await fetch("/api/tools/export/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:id})});
  if(!c.ok){const x=await c.json().catch(()=>({})) as{error?:string};setMsg(x.error||t("导出权限确认失败","Could not confirm export permission"));return}
  setMsg(t("支付已确认，正在生成文件…","Payment confirmed. Generating file…"));
  await onUnlocked();setMsg(t("文件已生成。","File generated."));
 }catch(e){setMsg(`${t("支付已确认，但文件生成没有完成。可从订单记录继续处理。","Payment is confirmed, but file generation did not finish.")}${e instanceof Error?` · ${e.message}`:""}`)}
 finally{processing.current=null}}
 async function check(id:string){try{const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)throw new Error();const d=await r.json();fails.current=0;if(d?.paid){await unlock(id);return true}return false}catch{fails.current++;if(fails.current>=MAX_POLL_FAILURES){stop();setMsg(t("暂时无法确认支付状态，可从订单记录继续确认。","Payment status is temporarily unavailable."))}return false}}
 useEffect(()=>{const wake=()=>{if(document.visibilityState==="visible"&&quote?.id)void check(quote.id)};window.addEventListener("pageshow",wake);document.addEventListener("visibilitychange",wake);return()=>{window.removeEventListener("pageshow",wake);document.removeEventListener("visibilitychange",wake);stop()}},[quote?.id]);
 async function start(){
  setBusy(true);setMsg("");
  try{
   let q=quote;
   if(!q||Number(q.quantity)!==quantity||(q.expires_at&&new Date(q.expires_at).getTime()<=Date.now())){
    const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency})});
    const d=await r.json().catch(()=>({})) as Quote&{error?:string};
    if(!r.ok||!d.id)throw new Error(d.error||t("无法确认本次价格","Could not confirm this price"));
    q=d;setQuote(q);
   }
   if(isMini()&&currency==="CNY"){
    setMsg(t("正在打开微信支付…","Opening WeChat payment…"));
    if(await openMiniPay(q.id)){stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS);return}
   }
   const returnTo=location.pathname+location.search;
   location.assign(`/tools/pay?quoteId=${encodeURIComponent(q.id)}&return=${encodeURIComponent(returnTo)}`);
  }catch(e){setMsg(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }
 const amount=quote?(quote.display_currency==="USD"||currency==="USD"?`$${Number(quote.display_amount??quote.amount_usd).toFixed(2)}`:`¥${Number(quote.display_amount??quote.amount_rmb).toFixed(2)}`):"";
 return <div><button onClick={start} disabled={busy||quantity<=0} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t("正在确认价格…","Confirming price…"):(label||t("确认价格并导出","Confirm price & export"))}</button>{amount&&<span className="ml-3 text-sm text-[var(--lx-muted)]">{amount}</span>}{msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}</div>
}
