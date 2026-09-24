"use client";
import {Suspense,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {getUsdBalanceProduct} from "@/lib/usd-products";
import {createClient} from "@/lib/supabase/client";

function payText(lang:string){
 return lang==="zh"?"使用 PayPal 支付":lang==="ja"?"PayPalで支払う":lang==="ko"?"PayPal로 결제":lang==="fr"?"Payer avec PayPal":lang==="de"?"Mit PayPal bezahlen":lang==="es"?"Pagar con PayPal":lang==="pt"?"Pagar com PayPal":lang==="ar"?"الدفع عبر PayPal":"Pay with PayPal";
}
function Inner(){
 const sp=useSearchParams()??new URLSearchParams();const{lang}=useLingxiLang();
 const product=useMemo(()=>getUsdBalanceProduct(sp.get("productId")||""),[sp]);
 const[buyer,setBuyer]=useState(""),[busy,setBusy]=useState(false),[ready,setReady]=useState<boolean|null>(null),[error,setError]=useState("");
 useEffect(()=>{const s=createClient();s.auth.getUser().then(({data})=>setBuyer(data.user?.email||""));fetch("/api/pay/providers",{cache:"no-store"}).then(r=>r.json()).then(d=>setReady(Boolean(d?.paypal))).catch(()=>setReady(false))},[]);
 async function pay(){
  if(!product||!ready)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/pay/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({productId:product.id,returnPath:product.wallet==="ai"?"/ai-wallet":"/sasi/pricing"})});
   const d=await r.json().catch(()=>({}));
   if(r.status===401){location.href=`/account?next=${encodeURIComponent(location.pathname+location.search)}`;return}
   if(!r.ok||!d.url)throw new Error(d.error||"PAYPAL_CREATE_FAILED");
   location.assign(d.url);
  }catch{setError(lang==="zh"?"暂时无法打开 PayPal，请稍后再试。":"Unable to open PayPal right now.")}finally{setBusy(false)}
 }
 if(!product)return <main className="mx-auto max-w-xl px-6 py-24 text-center">USD product not found.</main>;
 const zh=lang==="zh";
 return <main className="mx-auto max-w-xl px-6 py-16"><section className="rounded-3xl border border-slate-200 bg-white p-7">
  <p className="text-xs tracking-[.2em] text-slate-500">LINGXIFIELD · USD</p>
  <h1 className="mt-3 text-3xl font-semibold text-slate-950">{zh?"美元数字服务订单":"USD Digital Service Order"}</h1>
  <p className="mt-3 text-sm leading-6 text-slate-600">{zh?"美元充值进入独立 USD 余额，不与人民币余额换算或合并。":"USD top-ups are credited to a separate USD balance and are not converted into RMB."}</p>
  <div className="mt-7 rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-4"><div><b className="text-lg text-slate-950">{zh?product.nameZh:product.nameEn}</b><p className="mt-2 text-sm text-slate-500">{product.wallet==="ai"?(zh?"AI USD余额":"AI USD Balance"):(zh?"SASI USD创作余额":"SASI USD Creation Balance")}</p>{buyer&&<p className="mt-2 text-xs text-slate-400">{buyer}</p>}</div><strong className="text-3xl text-slate-950">${product.amountUsd.toFixed(2)}</strong></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm text-slate-500">{zh?"应付总额":"Total"}</span><b className="text-xl">${product.amountUsd.toFixed(2)} USD</b></div></div>
  <div className="mt-5 rounded-2xl border border-[#0070ba]/20 bg-[#0070ba]/5 p-4"><b>PayPal</b><p className="mt-1 text-xs leading-5 text-slate-500">{zh?"通过 PayPal 安全结算美元订单。":"Secure USD checkout with PayPal."}</p></div>
  <button disabled={busy||ready!==true} onClick={pay} className="mt-6 w-full rounded-xl bg-[#0070ba] px-5 py-4 font-semibold text-white disabled:opacity-40">{busy?(zh?"正在连接 PayPal…":"Opening PayPal…"):payText(lang)}</button>
  {ready===false&&<p className="mt-3 text-sm text-amber-700">{zh?"PayPal 正在完成商户接入，暂未开放付款。":"PayPal merchant activation is still in progress."}</p>}
  {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
 </section></main>;
}
export default function Page(){return <><Nav/><div className="pt-24"><Suspense fallback={<div className="p-20 text-center">…</div>}><Inner/></Suspense></div><Footer/></>}
