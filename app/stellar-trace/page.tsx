import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "星迹已停止开放 | Lingxi Field",
  description: "灵犀场星迹已停止新增购买与推演。",
  robots: { index: false, follow: false },
};

export default function StellarTraceRetiredPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-40 text-bone">
        <p className="text-xs tracking-[.28em] text-amber">PRODUCT RETIRED</p>
        <h1 className="mt-5 font-display text-4xl leading-tight">星迹已停止开放</h1>
        <div className="mt-8 border border-bone/15 bg-bone/[.04] p-6 text-sm leading-8 text-bone-dim">
          <p>经复核，现有奇门与六壬计算链尚不足以形成我们愿意负责的寻人、寻物或寻动物结论。</p>
          <p className="mt-4">因此本产品不再接受新购买，也不再生成新的方向报告。历史订单与档案记录会继续保留；如需处理已付款但未获得有效交付的订单，请通过账户页联系客服。</p>
          <p className="mt-4">涉及人员或动物安全，请立即使用警方、通信、交通、监控、动物救助与紧急救援渠道。</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/account/orders" className="border border-lattice/50 px-5 py-3 text-sm text-lattice">查看历史订单</Link>
          <Link href="/" className="border border-bone/20 px-5 py-3 text-sm text-bone-dim">返回灵犀场</Link>
        </div>
      </main>
    </>
  );
}
