import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/plans";
import OrderActions from "../OrderActions";

export const metadata = {
  title: "场域订单 | 灵犀场 Lingxi Field",
  robots: { index: false, follow: false },
};

type OrderRow = {
  id: string;
  product_id: string;
  product_type: string;
  amount_rmb: number | null;
  amount_usd: number;
  status: string;
  submission_id: string | null;
  submission_name: string | null;
  created_at: string;
  paid_at: string | null;
};

// v255：这是这次新加的"场域订单"页——按你的要求，做成阿里云/域名
// 注册那种订单列表的样子：商品名称、订单号、金额、状态、有效期，
// 点商品名称能直接跳到对应内容。orders表里已经存了submission_id和
// submission_name（之前几版加的），这次不用再去猜"这条订单具体对应
// 哪一份报告"，直接读出来就有。
//
// 每个product_id对应的"点开去哪"，映射规则写在下面这个函数里——
// 报告类产品要带上submission_id才能跳到具体那一份；叙事单篇要跳到
// 对应文章；修炼技术、显化订阅、叙事年度解锁这些没有"某一份具体
// 报告"的产品，跳到对应的功能入口页。
function resolveDestination(order: OrderRow): { href: string; labelZh: string; labelEn: string } | null {
  const REPORT_BASE: Record<string, string> = {
    "life-map-report": "/life-map/full",
    "relationship-resonance": "/relationship/full",
    "qian-reading": "/qian/full",
    "tarot-reading": "/tarot/reading/full",
    "resilience-report": "/resilience/full",
    "romance-report": "/romance/full",
    "daily-tide-report": "/daily/full",
    "wealth-report": "/wealth/full",
  };
  if (REPORT_BASE[order.product_id]) {
    if (!order.submission_id) return null; // 极老的订单可能没存这一列，没法精确跳转
    return { href: `${REPORT_BASE[order.product_id]}?id=${order.submission_id}`, labelZh: "查看报告 / 下载PDF", labelEn: "View Report / Download PDF" };
  }
  const PRACTICE_BASE: Record<string, string> = {
    breath: "/practice/breath", intuition: "/practice/intuition",
    "heart-reset": "/practice/heart-reset", "ascending-heart": "/practice/ascending-heart",
  };
  if (PRACTICE_BASE[order.product_id]) {
    return { href: PRACTICE_BASE[order.product_id], labelZh: "开始修炼", labelEn: "Begin Practice" };
  }
  if (order.product_id === "bundle") return { href: "/practice", labelZh: "查看全部修炼技术", labelEn: "View All Practices" };
  if (["day", "month", "year"].includes(order.product_id)) return { href: "/live-as", labelZh: "进入意识显化", labelEn: "Enter Manifestation" };
  if (order.product_id === "narrative-all") return { href: "/narrative", labelZh: "浏览全部多维叙事", labelEn: "Browse All Narratives" };
  if (order.product_id === "everything") return { href: "/narrative", labelZh: "浏览多维叙事与修炼技术", labelEn: "Browse Narratives & Practices" };
  // 剩下的都是多维叙事单篇——product_id本身就是文章slug
  return { href: `/narrative/${order.product_id}`, labelZh: "阅读全文", labelEn: "Read Full Piece" };
}

export default async function FieldOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orders: OrderRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("orders")
      .select("id, product_id, product_type, amount_rmb, amount_usd, status, submission_id, submission_name, created_at, paid_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    orders = (data as OrderRow[]) ?? [];
  }

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-display text-3xl font-light text-bone">
              <Bi zh="场域订单" en="Field Orders" />
            </h1>
            <Link href="/account" className="text-xs uppercase tracking-widest2 text-lattice hover:text-amber">
              <Bi zh="← 返回场域入口" en="← Back to Account" />
            </Link>
          </div>

          {!user && (
            <p className="text-center text-sm text-bone-dim">
              <Bi zh="请先登录查看你的场域订单。" en="Please log in to view your field orders." />
            </p>
          )}

          {user && orders.length === 0 && (
            <p className="text-center text-sm text-bone-dim">
              <Bi zh="还没有任何订单——完成一次能量交换后，会出现在这里。" en="No orders yet — they'll appear here once you complete an exchange." />
            </p>
          )}

          <div className="space-y-3">
            {orders.map((o) => {
              const product = getProduct(o.product_id);
              const dest = resolveDestination(o);
              const isPaid = o.status === "paid";
              const amount = o.amount_rmb ?? (o.amount_usd ? `$${o.amount_usd}` : "—");
              const amountDisplay = o.amount_rmb ? `¥${o.amount_rmb}` : amount;

              // 有效期——只有已支付、且是有到期时间的订阅制产品才需要算。
              let expiryLabel: string | null = null;
              if (isPaid && o.paid_at && product?.type === "subscription" && product.days) {
                const expiry = new Date(new Date(o.paid_at).getTime() + product.days * 86400000);
                const expired = expiry < new Date();
                expiryLabel = `${expired ? "已于" : "有效至"} ${expiry.toLocaleDateString()}${expired ? "过期" : ""}`;
              }

              return (
                <div key={o.id} className="rounded-sm border border-white/10 bg-void-deep p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-widest2 text-bone-dim/60">
                        <Bi zh="订单号" en="Order No." /> {o.id}
                      </p>
                      {dest ? (
                        <Link href={dest.href} className="mt-1 block font-display text-lg text-lattice hover:text-amber">
                          {product?.name ?? o.product_id}
                          {o.submission_name ? ` · ${o.submission_name}` : ""}
                        </Link>
                      ) : (
                        <p className="mt-1 font-display text-lg text-bone">
                          {product?.name ?? o.product_id}
                          {o.submission_name ? ` · ${o.submission_name}` : ""}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-bone-dim">
                        <Bi zh="下单时间" en="Ordered" />：{new Date(o.created_at).toLocaleString()}
                        {o.paid_at && <> · <Bi zh="支付时间" en="Paid" />：{new Date(o.paid_at).toLocaleString()}</>}
                      </p>
                      {expiryLabel && (
                        <p className="mt-1 text-xs text-amber/80">{expiryLabel}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-xl text-bone">{amountDisplay}</p>
                      <p className="text-xs text-bone-dim">× 1</p>
                      <p className={`mt-2 inline-block rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-widest2 ${isPaid ? "border border-lattice/40 text-lattice" : "border border-amber/40 text-amber"}`}>
                        {isPaid ? <Bi zh="已支付" en="Paid" /> : <Bi zh="待支付" en="Pending" />}
                      </p>
                    </div>
                  </div>

                  {dest && (
                    <Link
                      href={dest.href}
                      className="mt-4 inline-block border border-lattice/30 px-4 py-1.5 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice"
                    >
                      <Bi zh={dest.labelZh} en={dest.labelEn} />
                    </Link>
                  )}

                  {!isPaid && <OrderActions orderId={o.id} />}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
