"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";

export default function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const check = async () => {
    setChecking(true);
    setMessage("");
    try {
      const res = await fetch(`/api/pay/wechat/query?orderId=${orderId}`);
      const data = await res.json();
      if (data.paid) {
        router.refresh();
      } else if (data.unlockError) {
        setMessage(`支付已确认，但解锁出现问题：${data.unlockError}`);
      } else {
        setMessage("还没查到支付记录。");
      }
    } catch {
      setMessage("查询出错，请稍后再试。");
    } finally {
      setChecking(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("确定要删除这笔待支付订单吗？删除后无法恢复——如果你已经付过款，请先点「查询」确认，不要直接删除。")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/pay/order/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) router.refresh();
      else setMessage("删除失败，请稍后再试。");
    } catch {
      setMessage("删除失败，请稍后再试。");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
      <button
        onClick={check}
        disabled={checking}
        className="border border-lattice/40 px-4 py-1.5 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice disabled:opacity-50"
      >
        {checking ? <Bi zh="查询中…" en="Checking…" /> : <Bi zh="查询这笔订单" en="Check This Order" />}
      </button>
      <button
        onClick={remove}
        disabled={deleting}
        className="border border-rose/30 px-3 py-1.5 text-xs text-rose/80 transition hover:border-rose hover:text-rose disabled:opacity-50"
      >
        {deleting ? "…" : <Bi zh="删除" en="Delete" />}
      </button>
      {message && <p className="w-full text-xs text-bone-dim">{message}</p>}
    </div>
  );
}
