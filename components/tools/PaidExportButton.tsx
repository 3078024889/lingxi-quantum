"use client";
import{useEffect,useRef,useState}from"react";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{usePreferredCurrency}from"@/components/CurrencyPreferenceProvider";
type Quote={id:string;tool_id?:string;quantity:number;amount_rmb:number;amount_usd:number;currency?:"CNY"|"USD";display_currency?:"CNY"|"USD";display_amount?:number;expires_at?:string;metadata?:Record<string,unknown>};
const POLL_MS=1800,MAX_POLL_FAILURES=4;
function key(toolId:string){return`lingxifield:paid-export:quote:${toolId}`}
function save(toolId:string,q:Quote,draftId?:string){try{localStorage.setItem(key(toolId),JSON.stringify({id:q.id,toolId,quantity:q.quantity,currency:q.currency,expiresAt:q.expires_at,draftId:draftId||""}))}catch{}}
function clear(toolId:string){try{localStorage.removeItem(key(toolId))}catch{}}
function isMini(){try{return new URLSearchParams(location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}}
async function openMiniPay(id:string){return new Promise<boolean>(resolve=>{let done=false;const finish=(v:boolean)=>{if(done)return;done=true;resolve(v)},go=()=>{const wx=(window as any).wx;if(!wx?.miniProgram?.navigateTo){finish(false);return}wx.miniProgram.navigateTo({url:`/pages/pay/index?quoteId=${encodeURIComponent(id)}`,success:()=>finish(true),fail:()=>finish(false)})};if((window as any).wx?.miniProgram){go();return}const s=document.createElement("script");s.src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js";s.async=true;s.onload=go;s.onerror=()=>finish(false);document.head.appendChild(s);setTimeout(()=>finish(false),3500)})}
export default function PaidExportButton({toolId,quantity,onUnlocked,label,draftId,metadata}:{toolId:string;quantity:number;onUnlocked:()=>Promise<void>|void;label?:string;draftId?:string;metadata?:Record<string,unknown>}){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const t=(zh:string,en:string)=>lang==="zh"?zh:en;
 const[quote,setQuote]=useState<Quote|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),processing=useRef<string|null>(null),fails=useRef(0);
 const stop=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}fails.current=0};
 async function unlock(id:string){
  if(processing.current===id)return;processing.current=id;stop();
  try{
   setMsg(t("支付已确认，正在恢复并生成文件…","Payment confirmed. Restoring and generating your file…"));
   // Deliver first. A paid customer must never lose the entitlement because local generation failed.
   await onUnlocked();
   const c=await fetch("/api/tools/export/consume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:id,draftId:draftId||null})});
   if(!c.ok&&c.status!==409){const x=await c.json().catch(()=>({})) as{error?:string};setMsg(`${t("文件已生成，但订单记录同步稍有延迟。","File generated; order sync is slightly delayed.")}${x.error?` · ${x.error}`:""}`)}
   else setMsg(t("文件已生成。你也可以在「账户 → 订单与使用记录」查看这次任务。","File generated. This task also remains in Account → Orders & usage."));
   clear(toolId);
  }catch(e){setMsg(`${t("支付已确认，但文件还没有生成成功。不会要求你重复付款，可从订单继续这次任务。","Payment is confirmed, but file generation did not finish. You will not be charged again; resume it from Orders.")}${e instanceof Error?` · ${e.message}`:""}`)}
  finally{processing.current=null}
 }
 async function check(id:string){try{const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});if(!r.ok)throw new Error();const d=await r.json();fails.current=0;if(d?.paid){const q=d.quote as Quote|undefined;if(q)setQuote(q);await unlock(id);return true}return false}catch{fails.current++;if(fails.current>=MAX_POLL_FAILURES){stop();setMsg(t("暂时无法确认支付状态。请到「账户 → 订单与使用记录」继续，不要重复付款。","Payment status is temporarily unavailable. Resume from Account → Orders & usage; do not pay again."))}return false}}
 const checkRef=useRef(check);checkRef.current=check;
 useEffect(()=>{const wake=()=>{if(document.visibilityState==="visible"&&quote?.id)void checkRef.current(quote.id)};window.addEventListener("pageshow",wake);document.addEventListener("visibilitychange",wake);return()=>{window.removeEventListener("pageshow",wake);document.removeEventListener("visibilitychange",wake);if(timer.current){clearInterval(timer.current);timer.current=null}}},[quote?.id]);
 useEffect(()=>{
  let id=new URLSearchParams(location.search).get("resumeQuote")||"";
  if(!id){try{const raw=localStorage.getItem(key(toolId));if(raw){const x=JSON.parse(raw);if(Number(x.quantity)===Number(quantity)&&(x.currency===currency||!x.currency)&&(x.draftId===draftId||!x.draftId||!draftId))id=String(x.id||"")}}catch{}}
  if(id)void checkRef.current(id);
 },[toolId,quantity,currency,draftId]);
 async function start(){
  setBusy(true);setMsg("");
  try{
   let q=quote;
   if(!q||Number(q.quantity)!==quantity||(q.expires_at&&new Date(q.expires_at).getTime()<=Date.now())){
    const r=await fetch("/api/tools/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({toolId,quantity,currency,metadata:{...(metadata||{}),draftId:draftId||undefined,returnPath:location.pathname}})});
    const d=await r.json().catch(()=>({})) as Quote&{error?:string};if(!r.ok||!d.id)throw new Error(d.error||t("无法确认本次价格","Could not confirm this price"));q=d;setQuote(q);
   }
   save(toolId,q,draftId);
   if(isMini()&&currency==="CNY"){setMsg(t("正在打开微信支付…","Opening WeChat payment…"));if(await openMiniPay(q.id)){stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS);return}}
   const u=new URL(location.href);if(draftId)u.searchParams.set("resumeDraft",draftId);u.searchParams.set("resumeQuote",q.id);
   const payUrl=`/tools/pay?quoteId=${encodeURIComponent(q.id)}&return=${encodeURIComponent(u.pathname+u.search)}`;
   const w=window.open(payUrl,"lingxi_tool_pay","width=720,height=820");
   if(w){stop();timer.current=setInterval(()=>void check(q!.id),POLL_MS);setMsg(t("支付窗口已打开，当前任务会留在这里。","Payment opened separately. Your current task stays here."));return}
   if(draftId){location.assign(payUrl);return}
   setMsg(t("为了保留当前文件和编辑结果，请允许浏览器打开支付窗口后再继续。","Allow the payment window to preserve your current files and edits."));
  }catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 const amount=quote?(quote.display_currency==="USD"||currency==="USD"?`$${Number(quote.display_amount??quote.amount_usd).toFixed(2)}`:`¥${Number(quote.display_amount??quote.amount_rmb).toFixed(2)}`):"";
 return <div><button onClick={start} disabled={busy||quantity<=0} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{busy?t("正在确认价格…","Confirming price…"):(label||t("确认价格并导出","Confirm price & export"))}</button>{amount&&<span className="ml-3 text-sm text-[var(--lx-muted)]">{amount}</span>}{msg&&<p className="mt-2 text-xs leading-5 text-[var(--lx-muted)]">{msg}</p>}</div>
}
