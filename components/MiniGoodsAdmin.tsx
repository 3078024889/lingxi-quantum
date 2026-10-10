"use client";
import { useEffect, useRef, useState } from "react";
type Good = { skuId: string; name: string; unitPriceFen: number };
export default function MiniGoodsAdmin() {
  const [goods, setGoods] = useState<Good[]>([]), [completed, setCompleted] = useState<string[]>([]);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("正在读取道具清单…");
  const stop = useRef(false);
  useEffect(() => {
    let active = true;
    void fetch("/api/account/mini-goods", { cache: "no-store" }).then(async r => {
      if (!r.ok) throw new Error("请用管理员账户登录后查看。");
      const result = await r.json();
      if (active) { setGoods(result.goods); setCompleted(result.completed); setMessage("道具创建后仍需单独审核、验收和发布。"); }
    }).catch(e => { if (active) setMessage(e.message); });
    return () => { active = false; stop.current = true; };
  }, []);
  async function operate(skuId: string, action: string) {
    const r = await fetch("/api/account/mini-goods", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ skuId, action }) });
    const result = await r.json();
    if (!r.ok && !(r.status === 409 && result.pending)) throw new Error(`${result.error} (${result.code || r.status})`);
    return result;
  }
  async function createAll() {
    if (busy) return;
    stop.current = false; setBusy(true);
    try {
      for (const item of goods) {
        if (stop.current) break;
        if (completed.includes(item.skuId)) continue;
        setMessage(`正在创建：${item.name}`);
        let result = await operate(item.skuId, "create");
        for (let attempt = 0; !result.done && attempt < 8; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          if (stop.current) break;
          result = await operate(item.skuId, "status");
          if (!result.pending && !result.done) throw new Error(`${item.name}未完成，请核对微信后台。`);
        }
        if (stop.current) break;
        if (!result.done) throw new Error("微信仍在处理，请稍后继续。");
        setCompleted(current => [...new Set([...current, item.skuId])]);
      }
      setMessage(stop.current ? "已停止，已创建道具会保留。" : "清单中的道具已创建。尚未发布，实际收款仍关闭。");
    } catch (e) { setMessage(e instanceof Error ? e.message : "配置未完成。"); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-6xl px-6 py-24"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">小程序商品道具</h1><p className="mt-3 text-sm text-[var(--lx-muted)]">充值：10、88、666、888 和自定义。按既有工具价格计费，创建不会自动开启收款。</p></div><button disabled={busy || !goods.length} onClick={() => void createAll()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)] disabled:opacity-40">{busy ? "正在配置" : "创建剩余道具"}</button>{busy && <button onClick={() => { stop.current = true; }} className="rounded-xl border px-4 py-3">停止</button>}</div><p role="status" className="my-6 rounded-xl bg-[var(--lx-soft)] p-4">{message}</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">商品</th><th className="p-3">道具编号</th><th className="p-3">计费单价</th><th className="p-3">创建状态</th></tr></thead><tbody>{goods.map(item => <tr key={item.skuId} className="border-b border-[var(--lx-line)]"><td className="p-3">{item.name}</td><td className="p-3">{item.skuId}</td><td className="p-3">¥{(item.unitPriceFen / 100).toFixed(2)}</td><td className="p-3">{completed.includes(item.skuId) ? "已创建，待发布" : "待创建"}</td></tr>)}</tbody></table></div></main>;
}
