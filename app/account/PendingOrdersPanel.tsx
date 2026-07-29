"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";
import { getProduct } from "@/lib/plans";

// v252：万一微信支付弹窗在等待确认的过程中意外被关掉（比如误触背景、
// 或者中途换了设备），之前完全没有一个"事后还能找回来确认"的地方——
// 用户只知道自己付过钱，却不知道该去哪里再查一次。这个组件专门解决
// 这个问题：列出这个人名下所有"生成过二维码、但还没被确认为已支付"
// 的订单，每一笔都能单独点一次"查询这笔订单"，重新问一次微信这笔钱
// 到底到账了没有——查到了就直接解锁，不用重新付一次。
export default function PendingOrdersPanel({
  orders,
}: {
  orders: { id: string; product_id: string; created_at: string; amount_usd: number }[];
}) {
  const router = useRouter();
  const [checking, setChecking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, "paid" | "not-paid" | "error">>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const checkOne = async (orderId: string) => {
    setChecking(orderId);
    try {
      const res = await fetch(`/api/pay/wechat/query?orderId=${orderId}`);
      const data = await res.json();
      if (data.paid) {
        setResults((r) => ({ ...r, [orderId]: "paid" }));
        router.refresh();
      } else {
        setResults((r) => ({ ...r, [orderId]: "not-paid" }));
      }
    } catch {
      setResults((r) => ({ ...r, [orderId]: "error" }));
    } finally {
      setChecking(null);
    }
  };

  const deleteOne = async (orderId: string) => {
    if (!window.confirm("确定要删除这笔待确认订单吗？删除后无法恢复——如果你已经付过款，请先点「查询」确认，不要直接删除。")) return;
    setDeleting(orderId);
    try {
      const res = await fetch("/api/pay/order/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        setRemovedIds((s) => new Set(s).add(orderId));
      }
    } catch {
      // 删除失败就留着，用户可以再试一次
    } finally {
      setDeleting(null);
    }
  };

  const visibleOrders = orders.filter((o) => !removedIds.has(o.id));
  if (visibleOrders.length === 0) return null;

  return (
    <div className="mt-3 w-full space-y-2 text-left">
      <p className="px-1 text-sm text-bone-dim">
        <Bi zh="待解锁订单" en="Orders Awaiting Confirmation" />
      </p>
      <p className="px-1 text-xs text-bone-dim/70">
        <Bi
          zh="如果你已经完成支付，但页面没有自动跳转解锁，点下面对应订单的「查询」，重新确认一次；如果这笔订单你从没真正付过款，可以直接删除。"
          en="If you already paid but the page didn't unlock automatically, tap Check to re-confirm. If you never actually paid for an order, you can delete it."
        />
      </p>
      <div className="space-y-2">
        {visibleOrders.map((o) => {
          const product = getProduct(o.product_id);
          const result = results[o.id];
          return (
            <div key={o.id} className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-void-deep px-4 py-3">
              <div>
                <p className="font-display text-sm text-lattice">{product?.name ?? o.product_id}</p>
                <p className="text-xs text-bone-dim">{new Date(o.created_at).toLocaleString()}</p>
                {result === "not-paid" && (
                  <p className="mt-1 text-xs text-bone-dim/70"><Bi zh="还没查到支付记录，如果你还没付款，可以忽略这条。" en="No payment found yet — if you haven't paid, you can ignore this." /></p>
                )}
                {result === "error" && (
                  <p className="mt-1 text-xs text-rose"><Bi zh="查询出错，请稍后再试。" en="Check failed — please try again." /></p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => checkOne(o.id)}
                  disabled={checking === o.id}
                  className="border border-lattice/40 px-4 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice disabled:opacity-50"
                >
                  {checking === o.id ? <Bi zh="查询中…" en="Checking…" /> : <Bi zh="查询" en="Check" />}
                </button>
                <button
                  onClick={() => deleteOne(o.id)}
                  disabled={deleting === o.id}
                  className="border border-rose/30 px-3 py-2 text-xs text-rose/80 transition hover:border-rose hover:text-rose disabled:opacity-50"
                >
                  {deleting === o.id ? "…" : <Bi zh="删除" en="Delete" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
