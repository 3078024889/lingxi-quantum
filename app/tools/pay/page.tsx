"use client";
import NextImage from "next/image";
import {Suspense,useEffect,useRef,useState} from "react";
import {useSearchParams} from "next/navigation";
import QRCode from "qrcode";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {accountText} from "@/lib/account-experience-i18n";

type Quote={id:string;quantity:number;unit_name:string;display_currency:"CNY"|"USD";display_amount:number;currency:"CNY"|"USD";expires_at?:string};
type Providers={wechat:boolean;alipay:boolean;paypal:boolean};type Provider=keyof Providers;
type CreatePaymentResponse={paid?:boolean;url?:string;codeUrl?:string;jsapi?:Record<string,unknown>;error?:string};
type WeixinBridge={invoke:(name:string,payload:Record<string,unknown>,cb:(res:{err_msg?:string})=>void)=>void};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const amount=(q:Quote)=>q.display_currency==="CNY"?`¥${Number(q.display_amount).toFixed(2)}`:`$${Number(q.display_amount).toFixed(2)} USD`;

function Inner(){
 const{lang}=useLingxiLang(),t=(k:string)=>accountText(lang,k),zh=lang==="zh",sp=useSearchParams()??new URLSearchParams(),quoteId=sp.get("quoteId")||"";
 const[q,setQ]=useState<Quote|null>(null),[err,setErr]=useState(""),[busy,setBusy]=useState(false),[qr,setQr]=useState(""),[paid,setPaid]=useState(false),[providers,setProviders]=useState<Providers>({wechat:false,alipay:false,paypal:false});
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),isWechat=typeof navigator!=="undefined"&&/MicroMessenger/i.test(navigator.userAgent),code=sp.get("code")||undefined,state=sp.get("state")||undefined,valid=UUID.test(quoteId);

 async function refresh(){if(!valid)return;const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"});if(!r.ok)return;const d=await r.json() as{paid?:boolean};if(d.paid){setPaid(true);if(timer.current){clearInterval(timer.current);timer.current=null}}}

 useEffect(()=>{if(!valid){setErr("INVALID_QUOTE_ID");return}let alive=true;void fetch(`/api/tools/quote?id=${encodeURIComponent(quoteId)}`,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"QUOTE_LOAD_FAILED");return d as Quote}).then(d=>{if(alive)setQ(d)}).catch(e=>{if(alive)setErr(e instanceof Error?e.message:String(e))});void fetch("/api/pay/providers",{cache:"no-store"}).then(r=>r.json()).then((d:{wechat?:unknown;alipay?:unknown;paypal?:unknown})=>{if(alive)setProviders({wechat:Boolean(d.wechat),alipay:Boolean(d.alipay),paypal:Boolean(d.paypal)})}).catch(()=>{});void refresh();timer.current=setInterval(()=>void refresh(),2500);return()=>{alive=false;if(timer.current){clearInterval(timer.current);timer.current=null}}},[quoteId,valid]);

 useEffect(()=>{if(code&&state&&q&&!paid&&q.currency==="CNY")void pay("wechat")},[code,state,Boolean(q),paid]);

 function invoke(jsapi:Record<string,unknown>){const bridge=(window as Window&{WeixinJSBridge?:WeixinBridge}).WeixinJSBridge;const run=()=>{const current=(window as Window&{WeixinJSBridge?:WeixinBridge}).WeixinJSBridge;if(!current){setErr("WECHAT_BRIDGE_UNAVAILABLE");return}current.invoke("getBrandWCPayRequest",jsapi,res=>{if(res.err_msg==="get_brand_wcpay_request:ok")void refresh();else setErr(res.err_msg||"PAYMENT_NOT_COMPLETED")})};if(!bridge)document.addEventListener("WeixinJSBridgeReady",run,{once:true});else run()}

 async function pay(provider:Provider){
  if(!valid||!q||!providers[provider]||busy)return;
  if(q.currency==="USD"&&provider!=="paypal")return;
  if(q.currency==="CNY"&&provider==="paypal")return;
  setBusy(true);setErr("");
  try{
   if(provider==="wechat"&&isWechat&&!code){const u=new URL(window.location.href);u.protocol="https:";u.hostname="lingxifield.com";u.port="";const r=await fetch(`/api/pay/wechat/oauth-url?redirectUri=${encodeURIComponent(u.toString())}`),d=await r.json().catch(()=>({})) as{url?:string;error?:string};if(!r.ok||!d.url)throw new Error(d.error||"WECHAT_OAUTH_FAILED");window.location.href=d.url;return}
   const r=await fetch("/api/tools/pay/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,provider,code,state})});
   const d=await r.json().catch(()=>({})) as CreatePaymentResponse;
   if(!r.ok)throw new Error(d.error||"PAYMENT_INIT_FAILED");
   if(d.paid){setPaid(true);return}
   if(d.url){window.location.href=d.url;return}
   if(d.codeUrl){setQr(await QRCode.toDataURL(d.codeUrl,{width:256,margin:1,errorCorrectionLevel:"M"}));return}
   if(d.jsapi){invoke(d.jsapi);return}
   throw new Error("PAYMENT_RESPONSE_INCOMPLETE")
  }catch(e){setErr(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }

 useEffect(()=>{if(!paid||!quoteId)return;try{window.opener?.postMessage({type:"LINGXIFIELD_TOOL_PAYMENT_CONFIRMED",quoteId},window.location.origin)}catch{}},[paid,quoteId]);

 if(paid)return <div className="mx-auto max-w-xl px-6 py-24 text-center text-[var(--lx-ink)]"><div className="text-5xl">✓</div><h1 className="mt-5 text-2xl font-semibold">{t("payConfirmed")}</h1><p className="mt-3 text-[var(--lx-muted)]">{t("payConfirmedBody")}</p><button onClick={()=>window.close()} className="mt-7 rounded-xl bg-[var(--lx-ink)] px-6 py-3 text-[var(--lx-bg)]">{t("close")}</button></div>;

 return <div className="mx-auto max-w-xl px-6 py-20 text-[var(--lx-ink)]">
  <h1 className="text-3xl font-semibold">{t("payTitle")}</h1>
  {q&&<div className="mt-6 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <div className="text-sm text-[var(--lx-muted)]">{t("actualQty")}：{q.quantity} {q.unit_name}</div>
   <div className="mt-3 text-3xl font-semibold">{amount(q)}</div>
   <div className="mt-2 text-xs text-[var(--lx-faint)]">{zh?"支付币种":"Payment currency"} · {q.currency}</div>
   {q.currency==="CNY"?<div className="mt-6 grid gap-3 sm:grid-cols-2">
    <button disabled={busy||!providers.wechat} onClick={()=>void pay("wechat")} className="rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>{t("wechat")}</b></button>
    <button disabled={busy||!providers.alipay} onClick={()=>void pay("alipay")} className="rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>{t("alipay")}</b></button>
   </div>:<div className="mt-6"><button disabled={busy||!providers.paypal} onClick={()=>void pay("paypal")} className="w-full rounded-xl border border-[var(--lx-line)] p-4 disabled:opacity-40"><b>PayPal</b></button></div>}
   <p className="mt-5 text-xs leading-5 text-[var(--lx-faint)]">{zh?"本次报价已锁定当前币种与价格。需要其他币种，请关闭后切换币种并重新确认价格。":"This quote is locked to the selected currency and price. To use another currency, close this window, switch currency, and request a new quote."}</p>
  </div>}
  {qr&&<div className="mt-6 text-center"><NextImage src={qr} alt="WeChat Pay QR" className="mx-auto h-64 w-64 rounded-xl bg-white p-2" width={600} height={600} unoptimized/></div>}
  {err&&<p role="alert" className="mt-5 text-sm text-[var(--lx-danger)]">{err}</p>}
 </div>
}

export default function Page(){return <main className="min-h-screen bg-[var(--lx-bg)]"><Suspense fallback={<div className="p-20 text-center text-[var(--lx-muted)]">…</div>}><Inner/></Suspense></main>}
