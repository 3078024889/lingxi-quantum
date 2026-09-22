"use client";
import { useEffect,useRef,useState } from "react";

type Quote={
  id:string; tool_id:string; quantity:number; unit_name:string;
  amount_rmb:number; expires_at:string;
};

export default function PaidActionButton({
  toolId,quantity,metadata,onPaid,label="继续",
}:{
  toolId:string;
  quantity:number;
  metadata?:Record<string,unknown>;
  onPaid:(quoteId:string)=>Promise<void>|void;
  label?:string;
}){
  const [quote,setQuote]=useState<Quote|null>(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const timer=useRef<ReturnType<typeof setInterval>|null>(null);
  const popup=useRef<Window|null>(null);

  useEffect(()=>()=>{if(timer.current)clearInterval(timer.current)},[]);

  async function checkPaid(id:string){
    const r=await fetch(`/api/tools/pay/status?quoteId=${encodeURIComponent(id)}`,{cache:"no-store"});
    if(!r.ok)return false;
    const d=await r.json();
    if(!d.paid)return false;
    if(timer.current)clearInterval(timer.current);
    setMsg("支付已确认，开始处理…");
    await onPaid(id);
    return true;
  }

  async function makeQuote(){
    setBusy(true);setMsg("");
    try{
      const r=await fetch("/api/tools/quote",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({toolId,quantity,metadata:metadata||{}}),
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"创建报价失败");
      setQuote(d);
      setMsg("价格已由服务器计算。确认后再调用付费模型。");
    }catch(e){setMsg(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  async function pay(){
    if(!quote)return;
    popup.current=window.open(`/tools/pay?quoteId=${encodeURIComponent(quote.id)}`,"lingxi_tool_pay","width=720,height=820");
    if(timer.current)clearInterval(timer.current);
    timer.current=setInterval(()=>checkPaid(quote.id),2200);
    setMsg("等待支付确认…");
  }

  const changed=quote && Number(quote.quantity)!==Number(quantity);
  return <div>
    {!quote||changed?
      <button onClick={makeQuote} disabled={busy||quantity<=0} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40">
        {busy?"正在计算价格…":label}
      </button>
      :
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-blue-900">
          本次 {quote.quantity} {quote.unit_name} · <b className="text-lg">¥{quote.amount_rmb}</b>
        </div>
        <button onClick={pay} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">确认并付款</button>
        <button onClick={()=>setQuote(null)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600">重新计算</button>
      </div>
    }
    {msg&&<p className="mt-2 text-xs leading-5 text-slate-500">{msg}</p>}
  </div>;
}
