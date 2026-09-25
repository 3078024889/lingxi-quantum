"use client";
import {Suspense,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {getProduct} from "@/lib/plans";
import {createClient} from "@/lib/supabase/client";

function Inner(){
  const sp=useSearchParams()??new URLSearchParams();
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  const product=useMemo(()=>{
    const found=getProduct(sp.get("productId")||"");
    return found&&["ai","production"].includes(found.group)?found:null;
  },[sp]);
  const[buyer,setBuyer]=useState("");
  const[busy,setBusy]=useState(false);
  const[ready,setReady]=useState<boolean|null>(null);
  const[error,setError]=useState("");

  useEffect(()=>{
    const s=createClient();
    void s.auth.getUser().then(({data})=>setBuyer(data.user?.email||""));
    void fetch("/api/pay/providers",{cache:"no-store"})
      .then(r=>r.json())
      .then(d=>setReady(Boolean(d?.paypal)))
      .catch(()=>setReady(false));
  },[]);

  async function pay(){
    if(!product||ready!==true)return;
    setBusy(true);setError("");
    try{
      const returnPath=product.group==="ai"?"/ai-wallet":"/sasi/pricing";
      const r=await fetch("/api/pay/create",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({productId:product.id,returnPath}),
      });
      const d=await r.json().catch(()=>({}));
      if(r.status===401){
        location.href=`/account?next=${encodeURIComponent(location.pathname+location.search)}`;
        return;
      }
      if(!r.ok||!d.url)throw new Error(d.error||"PAYPAL_CREATE_FAILED");
      location.assign(d.url);
    }catch{
      setError(zh?"暂时无法打开 PayPal，请稍后再试。":"Unable to open PayPal right now.");
    }finally{setBusy(false)}
  }

  if(!product)return <><Nav/><main className="mx-auto max-w-xl px-6 py-24 text-center text-sm">找不到这个充值套餐。</main><Footer/></>;

  return <><Nav/><main className="mx-auto max-w-xl px-6 py-16 pt-28">
    <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7">
      <p className="text-sm text-[var(--lx-faint)]">PayPal · USD</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--lx-ink)]">{zh?"美元支付充值":"USD payment"}</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">
        {zh
          ?"PayPal 用 USD 结算；支付成功后，按下方套餐金额记入同一个可实际消费的 CNY 余额，不再产生第二套不能使用的 USD 钱包。"
          :"PayPal settles in USD. After payment, the selected CNY balance is credited to the same spendable wallet."}
      </p>

      <div className="mt-7 rounded-2xl border border-[var(--lx-line)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <b className="text-base text-[var(--lx-ink)]">{zh?product.name:product.nameEn}</b>
            <p className="mt-2 text-sm text-[var(--lx-muted)]">{zh?`到账 CNY 余额 ¥${product.priceRmb}`:`Credits ¥${product.priceRmb} CNY balance`}</p>
            {buyer&&<p className="mt-2 text-xs text-[var(--lx-faint)]">{buyer}</p>}
          </div>
          <strong className="text-3xl text-[var(--lx-ink)]">${product.priceUsd.toFixed(2)}</strong>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--lx-line)] pt-4 text-sm">
          <span className="text-[var(--lx-muted)]">{zh?"PayPal 应付":"PayPal total"}</span>
          <b>${product.priceUsd.toFixed(2)} USD</b>
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--lx-faint)]">
        {zh?"如果你的 PayPal 账户主要使用 EUR、GBP 等币种，PayPal 会在付款页处理换汇；灵犀场只按订单核验 USD 金额。":"PayPal can handle buyer-side currency conversion; LINGXIFIELD verifies the USD order amount."}
      </p>

      <button disabled={busy||ready!==true} onClick={pay} className="mt-6 w-full rounded-xl bg-[#0070ba] px-5 py-4 text-sm font-semibold text-white disabled:opacity-40">
        {busy?(zh?"正在连接 PayPal…":"Opening PayPal…"):(zh?`使用 PayPal 支付 $${product.priceUsd.toFixed(2)}`:`Pay $${product.priceUsd.toFixed(2)} with PayPal`)}
      </button>
      {ready===false&&<p className="mt-3 text-sm text-amber-700">{zh?"PayPal 当前不可用。":"PayPal is currently unavailable."}</p>}
      {error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}
    </section>
  </main><Footer/></>;
}

export default function Page(){
  return <Suspense fallback={<div className="p-20 text-center">…</div>}><Inner/></Suspense>;
}
