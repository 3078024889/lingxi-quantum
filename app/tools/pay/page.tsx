"use client";
import Link from "next/link";
import MiniPaymentBoundary from "@/components/MiniPaymentBoundary";
import {openMiniRecharge} from '@/lib/mini/payment-client';
import {TEMP_MAIL_BATCH_SALES_ENABLED} from '@/lib/tools/temp-mail-policy';
import {toolBalanceText} from '@/lib/tools/commerce/balance-copy';
import {quoteDisplay} from "@/lib/tools/commerce/quote-display";
import NextImage from "next/image";
import {Suspense,useEffect,useRef,useState} from "react";
import {useSearchParams} from "next/navigation";
import QRCode from "qrcode";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {accountText} from "@/lib/account-experience-i18n";
import {foodBillingText} from '@/lib/tools/food/billing-copy';

type Quote={id:string;tool_id?:string;metadata?:{foodRequestId?:string};quantity:number;unit_name:string;display_currency:"CNY"|"USD";display_amount:number;currency:"CNY"|"USD";expires_at?:string};
type Providers={wechat:boolean;alipay:boolean;paypal:boolean};type Provider=keyof Providers|"balance";
type CreatePaymentResponse={paid?:boolean;url?:string;codeUrl?:string;jsapi?:Record<string,unknown>;error?:string};
type WeixinBridge={invoke:(name:string,payload:Record<string,unknown>,cb:(res:{err_msg?:string})=>void)=>void};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const amount=(q:Quote)=>quoteDisplay(q).text;
function safeReturn(value:string|null){if(!value||!value.startsWith("/")||value.startsWith("//")||value.includes("\\")||/[\x00-\x1f]/.test(value))return "/tools";return value}

function Inner({balanceOnly=false}:{balanceOnly?:boolean}){
 const{lang}=useLingxiLang(),t=(k:string)=>accountText(lang,k),zh=lang==="zh",sp=useSearchParams()??new URLSearchParams(),quoteId=sp.get("quoteId")||"";
 const[needsLogin,setNeedsLogin]=useState(false);
 const[q,setQ]=useState<Quote|null>(null),[err,setErr]=useState(""),[busy,setBusy]=useState(false),[qr,setQr]=useState(""),[paid,setPaid]=useState(false),[providers,setProviders]=useState<Providers>({wechat:false,alipay:false,paypal:false});
 const foodReturn=q?.tool_id==='food-calorie'&&UUID.test(q.metadata?.foodRequestId||'')?`/tools/food-calorie?resumeDraft=${q.metadata!.foodRequestId}&resumeQuote=${quoteId}`:null;
 const batchPaused=q?.tool_id==='temp-mail-batch'&&!TEMP_MAIL_BATCH_SALES_ENABLED;
 const returnTo=safeReturn(sp.get('return')||foodReturn);
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),isWechat=!balanceOnly&&typeof navigator!=="undefined"&&/MicroMessenger/i.test(navigator.userAgent),code=sp.get("code")||undefined,state=sp.get("state")||undefined,valid=UUID.test(quoteId);

 async function refresh(){if(!valid)return;const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"});if(!r.ok)return;const d=await r.json() as{paid?:boolean};if(d.paid){setPaid(true);if(timer.current){clearInterval(timer.current);timer.current=null}}}

 const refreshRef=useRef(refresh);refreshRef.current=refresh;
 const payRef=useRef<(provider:Provider)=>Promise<void>>(async()=>{}); 
 useEffect(()=>{if(!valid){setErr("INVALID_QUOTE_ID");return}let alive=true;void fetch(`/api/tools/quote?id=${encodeURIComponent(quoteId)}`,{cache:"no-store"}).then(async r=>{if(r.status===401)setNeedsLogin(true);const d=await r.json();if(!r.ok)throw new Error(d.error||"QUOTE_LOAD_FAILED");return d as Quote}).then(d=>{if(alive)setQ(d)}).catch(e=>{if(alive)setErr(e instanceof Error?e.message:String(e))});if(!balanceOnly)void fetch("/api/pay/providers",{cache:"no-store"}).then(r=>r.json()).then((d:{wechat?:unknown;alipay?:unknown;paypal?:unknown})=>{if(alive)setProviders({wechat:Boolean(d.wechat),alipay:Boolean(d.alipay),paypal:Boolean(d.paypal)})}).catch(()=>{});void refreshRef.current();timer.current=setInterval(()=>void refreshRef.current(),2500);return()=>{alive=false;if(timer.current){clearInterval(timer.current);timer.current=null}}},[quoteId,valid,balanceOnly]);

 useEffect(()=>{if(!balanceOnly&&code&&state&&q&&!paid&&q.currency==="CNY")void payRef.current("wechat")},[code,state,q,paid,balanceOnly]);

 payRef.current=pay;

 function invoke(jsapi:Record<string,unknown>){const bridge=(window as Window&{WeixinJSBridge?:WeixinBridge}).WeixinJSBridge;const run=()=>{const current=(window as Window&{WeixinJSBridge?:WeixinBridge}).WeixinJSBridge;if(!current){setErr("WECHAT_BRIDGE_UNAVAILABLE");return}current.invoke("getBrandWCPayRequest",jsapi,res=>{if(res.err_msg==="get_brand_wcpay_request:ok")void refresh();else setErr(res.err_msg||"PAYMENT_NOT_COMPLETED")})};if(!bridge)document.addEventListener("WeixinJSBridgeReady",run,{once:true});else run()}

 async function pay(provider:Provider){
  if(batchPaused)return;
  if(balanceOnly&&provider!=="balance")return;
  if(!valid||!q||(provider!=="balance"&&!providers[provider])||busy)return;
  if(q.currency==="USD"&&provider!=="paypal"&&provider!=="balance")return;
  if(q.currency==="CNY"&&provider==="paypal")return;
  setBusy(true);setErr("");
  try{
   if(provider==="wechat"&&isWechat&&!code){const u=new URL(window.location.href);u.protocol="https:";u.hostname="lingxifield.cn";u.port="";const r=await fetch(`/api/pay/wechat/oauth-url?redirectUri=${encodeURIComponent(u.toString())}`),d=await r.json().catch(()=>({})) as{url?:string;error?:string};if(!r.ok||!d.url)throw new Error(d.error||"WECHAT_OAUTH_FAILED");window.location.href=d.url;return}
   const r=await fetch("/api/tools/pay/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,provider,code,state})});
   const d=await r.json().catch(()=>({})) as CreatePaymentResponse;
   if(r.status===401)setNeedsLogin(true);
   if(!r.ok)throw new Error(d.error==="SASI_BALANCE_INSUFFICIENT"?toolBalanceText(lang,"insufficient"):d.error||"PAYMENT_INIT_FAILED");
   if(d.paid){setPaid(true);return}
   if(balanceOnly)throw new Error("PAYMENT_RESPONSE_INCOMPLETE");
   if(d.url){window.location.href=d.url;return}
   if(d.codeUrl){setQr(await QRCode.toDataURL(d.codeUrl,{width:256,margin:1,errorCorrectionLevel:"M"}));return}
   if(d.jsapi){invoke(d.jsapi);return}
   throw new Error("PAYMENT_RESPONSE_INCOMPLETE")
  }catch(e){setErr(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }

 useEffect(()=>{if(!paid||!quoteId)return;try{window.opener?.postMessage({type:"LINGXIFIELD_TOOL_PAYMENT_CONFIRMED",quoteId},window.location.origin)}catch{}const back=setTimeout(()=>{if(window.opener&&!window.opener.closed){window.close()}else if(returnTo!=="/tools"){window.location.replace(returnTo)}},1800);return()=>clearTimeout(back)},[paid,quoteId,returnTo]);

 if(paid)return <div className="mx-auto max-w-xl px-6 py-24 text-center text-[var(--lx-ink)]"><div className="text-5xl">✓</div><h1 className="mt-5 text-2xl font-semibold">{t("payConfirmed")}</h1><p className="mt-3 text-[var(--lx-muted)]">{t("payConfirmedBody")}</p><button onClick={()=>{if(window.opener){window.close();return}window.location.replace(returnTo)}} className="mt-7 rounded-xl bg-[var(--lx-ink)] px-6 py-3 text-[var(--lx-bg)]">{zh?"返回继续处理":t("close")}</button></div>;

 return <div className="mx-auto max-w-xl px-6 py-20 text-[var(--lx-ink)]">
  <h1 className="text-3xl font-semibold">{t("payTitle")}</h1>
  {q&&<div className="mt-6 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <div className="text-sm text-[var(--lx-muted)]">{t("actualQty")}：{q.quantity} {q.tool_id==='food-calorie'?foodBillingText(lang,q.unit_name==='food'?'foodUnit':'imageUnit'):q.unit_name}</div>
   <div className="mt-3 text-3xl font-semibold">{amount(q)}</div>
   <div className="mt-2 text-xs text-[var(--lx-faint)]">{zh?"支付币种":"Payment currency"} · {q.currency}</div>
   {batchPaused?<p role="status" className="mt-6 text-sm">{zh?'批量邮箱暂不接受新的付费，请查看订单或使用每日免费邮箱。':'New batch mailbox purchases are paused. View existing orders or use your daily free inboxes.'}</p>:<button disabled={busy} onClick={()=>void pay("balance")} className="mt-6 w-full rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>{toolBalanceText(lang,"label")}</b></button>}
   {balanceOnly&&!batchPaused&&<button disabled={busy} onClick={()=>void openMiniRecharge().then(opened=>{if(!opened)setErr(zh?'暂时无法打开充值，请返回小程序首页重试。':'Unable to open top-up. Please return to the Mini Program home and retry.')})} className="mt-3 w-full rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40">{zh?'余额不足？打开账户充值':'Need more balance? Open account top-up'}</button>}
   {!balanceOnly&&!batchPaused&&(q.currency==="CNY"?<div className="mt-6 grid gap-3 sm:grid-cols-2">
    <button disabled={busy||!providers.wechat} onClick={()=>void pay("wechat")} className="rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>{t("wechat")}</b></button>
    <button disabled={busy||!providers.alipay} onClick={()=>void pay("alipay")} className="rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>{t("alipay")}</b></button>
   </div>:<div className="mt-6"><button disabled={busy||!providers.paypal} onClick={()=>void pay("paypal")} className="w-full rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>PayPal</b></button></div>)}
   <p className="mt-5 text-xs leading-5 text-[var(--lx-faint)]">{zh?"本次报价已锁定当前币种与价格。需要其他币种，请关闭后切换币种并重新确认价格。":"This quote is locked to the selected currency and price. To use another currency, close this window, switch currency, and request a new quote."}</p>
  </div>}
  {qr&&<div className="mt-6 text-center"><NextImage src={qr} alt="WeChat Pay QR" className="mx-auto h-64 w-64 rounded-xl bg-white p-2" width={600} height={600} unoptimized/></div>}
  {needsLogin&&<Link href={"/account?next="+encodeURIComponent("/tools/pay?quoteId="+quoteId+"&return="+encodeURIComponent(returnTo))} className="mt-5 inline-block rounded-xl border border-[var(--lx-line)] p-4">{zh?"登录后继续支付":"Sign in to continue payment"}</Link>}
  {err&&<p role="alert" className="mt-5 text-sm text-[var(--lx-danger)]">{err}</p>}
 </div>
}

export default function Page(){return <MiniPaymentBoundary miniChildren={<main className="min-h-screen bg-[var(--lx-bg)]"><Suspense fallback={<div className="p-20 text-center text-[var(--lx-muted)]">…</div>}><Inner balanceOnly/></Suspense></main>}><main className="min-h-screen bg-[var(--lx-bg)]"><Suspense fallback={<div className="p-20 text-center text-[var(--lx-muted)]">…</div>}><Inner/></Suspense></main></MiniPaymentBoundary>}
