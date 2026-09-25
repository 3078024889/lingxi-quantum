"use client";
import {useEffect,useMemo,useState} from "react";

type Order={id:string;product_id:string;provider:string|null;amount_rmb:number|null;amount_usd:number|null;created_at:string};
type Withdrawal={id:string;order_id:string;provider:string;currency:string;provider_currency:string;amount_minor:number;provider_amount_minor:number;status:string;provider_status:string|null;failure_code:string|null;created_at:string;completed_at:string|null};
type Data={orders:Order[];withdrawals:Withdrawal[]};

function isUsdWallet(productId:string){return productId.includes("-usd-balance-")}
function walletAmount(order:Order){return isUsdWallet(order.product_id)?Number(order.amount_usd||0):Number(order.amount_rmb||0)}
function walletSymbol(order:Order){return isUsdWallet(order.product_id)?"$":"¥"}
function providerText(order:Order){
  if(order.provider==="paypal")return `PayPal · $${Number(order.amount_usd||0).toFixed(2)} USD`;
  return `${order.provider==="wechat"?"微信支付":"支付宝"} · ¥${Number(order.amount_rmb||0).toFixed(2)}`;
}
function label(status:string){
  if(status==="completed")return"已原路退回";
  if(status==="processing")return"退款处理中";
  if(status==="requested")return"已提交";
  if(status==="failed")return"失败，余额已释放";
  return status;
}

export default function BalanceWithdrawalPanel(){
  const[data,setData]=useState<Data|null>(null);
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState<string|null>(null);
  const[amounts,setAmounts]=useState<Record<string,string>>({});

  async function load(){
    const r=await fetch("/api/account/withdrawals",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.ok)setData(d);else setMsg(d.error||"读取失败");
  }
  useEffect(()=>{void load()},[]);

  const activeByOrder=useMemo(()=>{
    const out=new Set<string>();
    for(const w of data?.withdrawals||[])if(["requested","processing"].includes(w.status))out.add(w.order_id);
    return out;
  },[data]);

  async function submit(order:Order){
    const max=walletAmount(order);
    const amount=Number(amounts[order.id]||max);
    if(!Number.isFinite(amount)||amount<=0||amount>max){setMsg("请输入不超过该订单充值本金的有效金额。");return}
    if(!confirm(`确认申请退回 ${walletSymbol(order)}${amount.toFixed(2)} 的未使用充值本金？退款会回到原支付渠道。`))return;
    setBusy(order.id);setMsg("");
    try{
      const r=await fetch("/api/account/withdrawals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:order.id,amount})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok){setMsg(d.error||"提现申请失败");return}
      setMsg(d.status==="completed"?"退款已经由原支付渠道确认完成。":"退款已提交，申请金额已冻结，正在等待支付渠道确认。");
      await load();
    }finally{setBusy(null)}
  }

  if(!data)return <div className="rounded-2xl border p-6">{msg||"正在读取可提现余额…"}</div>;

  return <div className="space-y-8">
    {msg&&<p role="status" className="rounded-2xl border p-4 text-sm">{msg}</p>}
    <section>
      <h2 className="text-xl font-semibold">可申请原路退款的充值订单</h2>
      <p className="mt-2 text-sm leading-7 opacity-70">只退未使用的真实充值本金。赠送额度、邀请奖励、已消耗金额和任务中冻结的金额不能提现。</p>
      <div className="mt-5 space-y-3">
        {data.orders.length===0&&<p className="rounded-2xl border p-5 text-sm">当前没有可申请提现的已支付余额充值订单。</p>}
        {data.orders.map(o=>{
          const max=walletAmount(o),active=activeByOrder.has(o.id);
          return <article key={o.id} className="rounded-2xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <b>{walletSymbol(o)}{max.toFixed(2)} 余额本金</b>
                <p className="mt-1 text-xs opacity-60">{providerText(o)} · {new Date(o.created_at).toLocaleString()}</p>
              </div>
              <span className="text-sm opacity-60">{o.product_id}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <input aria-label="提现金额" className="min-w-40 rounded-xl border px-4 py-2" inputMode="decimal" value={amounts[o.id]??String(max)} onChange={e=>setAmounts(x=>({...x,[o.id]:e.target.value}))}/>
              <button disabled={active||busy===o.id} onClick={()=>void submit(o)} className="rounded-xl border px-5 py-2 disabled:opacity-50">{active?"退款处理中":busy===o.id?"正在提交…":"原路退回"}</button>
            </div>
          </article>
        })}
      </div>
    </section>

    <section>
      <h2 className="text-xl font-semibold">提现记录</h2>
      <div className="mt-5 space-y-3">
        {data.withdrawals.length===0&&<p className="rounded-2xl border p-5 text-sm">还没有提现记录。</p>}
        {data.withdrawals.map(w=><article key={w.id} className="rounded-2xl border p-5">
          <div className="flex flex-wrap justify-between gap-3"><b>{w.currency==="USD"?"$":"¥"}{(Number(w.amount_minor)/100).toFixed(2)}</b><span>{label(w.status)}</span></div>
          <p className="mt-2 text-xs opacity-60">{w.provider}{w.provider_currency&&w.provider_currency!==w.currency?` · 原路退款 ${w.provider_currency} ${(Number(w.provider_amount_minor)/100).toFixed(2)}`:""} · {new Date(w.created_at).toLocaleString()}</p>
        </article>)}
      </div>
    </section>
  </div>;
}
