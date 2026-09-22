"use client";
import { Suspense,useEffect,useRef,useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import Nav from "@/components/Nav";

function Inner(){
 const sp=useSearchParams()??new URLSearchParams(); const quoteId=sp.get("quoteId")||"";
 const [q,setQ]=useState<any>(null),[err,setErr]=useState(""),[busy,setBusy]=useState(false),[qr,setQr]=useState(""),[paid,setPaid]=useState(false);
 const timer=useRef<ReturnType<typeof setInterval>|null>(null);
 const isWechat=typeof navigator!=="undefined"&&/MicroMessenger/i.test(navigator.userAgent);
 const code=sp.get("code")||undefined,state=sp.get("state")||undefined;

 async function refresh(){const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(quoteId)}`,{cache:"no-store"});if(r.ok){const d=await r.json();if(d.paid){setPaid(true);if(timer.current)clearInterval(timer.current);}}}
 useEffect(()=>{if(!quoteId)return;fetch(`/api/tools/quote?id=${encodeURIComponent(quoteId)}`,{cache:"no-store"}).then(r=>r.json()).then(d=>d.error?setErr(d.error):setQ(d));refresh();timer.current=setInterval(refresh,2500);return()=>{if(timer.current)clearInterval(timer.current)}},[quoteId]);
 useEffect(()=>{if(code&&state&&q&&!paid)pay("wechat")},[code,state,!!q]);

 function invoke(jsapi:any){const w=window as any;const run=()=>w.WeixinJSBridge.invoke("getBrandWCPayRequest",jsapi,(res:any)=>{if(res.err_msg==="get_brand_wcpay_request:ok")refresh();else setErr(res.err_msg||"微信支付未完成")});if(!w.WeixinJSBridge)document.addEventListener("WeixinJSBridgeReady",run,{once:true} as any);else run();}
 async function pay(provider:"wechat"|"alipay"|"paypal"){
  setBusy(true);setErr("");
  try{
   if(provider==="wechat"&&isWechat&&!code){
    const u=new URL(window.location.href);u.protocol="https:";u.hostname="lingxifield.cn";u.port="";
    const r=await fetch(`/api/pay/wechat/oauth-url?redirectUri=${encodeURIComponent(u.toString())}`);const d=await r.json();if(!r.ok)throw new Error(d.error||"微信授权失败");window.location.href=d.url;return;
   }
   const r=await fetch("/api/tools/pay/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,provider,code,state})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"创建支付失败");
   if(d.paid){setPaid(true);return} if(d.url){window.location.href=d.url;return} if(d.codeUrl){setQr(await QRCode.toDataURL(d.codeUrl,{width:256,margin:1,errorCorrectionLevel:"M"}));return} if(d.jsapi){invoke(d.jsapi);return}
  }catch(e){setErr(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 if(paid)return <div className="mx-auto max-w-xl px-6 py-24 text-center"><div className="text-5xl">✓</div><h1 className="mt-5 text-2xl font-semibold">支付已确认</h1><p className="mt-3 text-slate-500">回到刚才的工具页，导出按钮会自动解锁。</p><button onClick={()=>window.close()} className="mt-7 rounded-full bg-blue-600 px-6 py-3 text-white">关闭付款页</button></div>;
 return <div className="mx-auto max-w-xl px-6 py-20"><h1 className="text-3xl font-semibold">确认工具导出</h1>{q&&<div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><div className="text-sm text-slate-500">{q.tool_id}</div><div className="mt-2 text-4xl font-semibold">¥{q.amount_rmb}</div><div className="mt-2 text-sm text-slate-500">实际计费数量：{q.quantity} {q.unit_name}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><button disabled={busy} onClick={()=>pay("wechat")} className="rounded-xl border border-slate-200 px-4 py-3">微信支付</button><button disabled={busy} onClick={()=>pay("alipay")} className="rounded-xl border border-slate-200 px-4 py-3">支付宝</button><button disabled={busy} onClick={()=>pay("paypal")} className="rounded-xl border border-slate-200 px-4 py-3">PayPal</button></div></div>}{qr&&<div className="mt-6 text-center"><img src={qr} alt="微信支付二维码" className="mx-auto h-64 w-64 rounded-xl bg-white p-2"/><p className="mt-2 text-sm text-slate-500">使用另一台设备的微信扫一扫</p></div>}{err&&<p className="mt-5 text-sm text-rose-600">{err}</p>}</div>
}
export default function Page(){return <><Nav/><main className="min-h-screen bg-[#fbfcfe] "><Suspense fallback={<div className="p-20 text-center">…</div>}><Inner/></Suspense></main></>}
