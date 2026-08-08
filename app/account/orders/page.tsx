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

// v265：场域订单中心按你要的结构重做——不再是一条时间线糊到底的
// 流水账，按产品性质分三类摆清楚：场域精测（8项，各自一次性解锁）、
// 修炼技术与会员（9项，含4项修炼技术+3档显化订阅+2档合集/全构造，
// 订阅类要把到期时间和具体权益写清楚，不能只有一句笼统的话）、
// 多维叙事（长短篇小说，每篇各自的slug就是product_id，数量不固定，
// 单独分组显示）。
const FIELD_TEST_IDS = [
  "life-map-report", "relationship-resonance", "qian-reading", "tarot-reading",
  "resilience-report", "romance-report", "daily-tide-report", "wealth-report",
];
const MEMBERSHIP_IDS = [
  "breath", "intuition", "heart-reset", "ascending-heart",
  "narrative-all", "everything", "day", "month", "year",
];

// 订阅/合集类产品——按年月付的这几档，之前订单卡上只有product.note
// 那一句概括，这次按你的要求把具体权益拆成清单列出来，买之前买之后
// 都能一眼看清楚"这次交换到底换到了什么"，不是一句模糊的话带过去。
const BENEFIT_DETAIL: Record<string, { zh: string[]; en: string[] }> = {
  day: {
    zh: ["1天内不限次数使用「意识显化」功能", "1天内不限次数使用「梦境智能」解读", "到期后自动锁定，不会继续扣费"],
    en: ["Unlimited use of Manifestation for 1 day", "Unlimited use of Dream Intelligence for 1 day", "Locks automatically at expiry — no recurring charge"],
  },
  month: {
    zh: ["30天内不限次数使用「意识显化」功能", "30天内不限次数使用「梦境智能」解读", "到期后自动锁定，不会继续扣费，可随时重新购买续期"],
    en: ["Unlimited use of Manifestation for 30 days", "Unlimited use of Dream Intelligence for 30 days", "Locks automatically at expiry — no recurring charge, renew anytime"],
  },
  year: {
    zh: ["365天内不限次数使用「意识显化」功能", "365天内不限次数使用「梦境智能」解读", "到期后自动锁定，不会继续扣费", "单价比月度更划算"],
    en: ["Unlimited use of Manifestation for 365 days", "Unlimited use of Dream Intelligence for 365 days", "Locks automatically at expiry — no recurring charge", "Best per-day value of the three tiers"],
  },
  "narrative-all": {
    zh: ["365天内解锁全部多维叙事长篇与短篇", "有效期内新增的篇目自动包含，不用额外付费", "到期后需续期才能继续阅读已发布的新篇目（到期前已读过的篇目仍可回看历史记录）"],
    en: ["365 days of access to every narrative, short and long", "Newly published pieces during your access window are included automatically", "Renewal required after expiry to keep reading new pieces going forward"],
  },
  everything: {
    zh: ["365天内解锁全部多维叙事（长篇+短篇，含日后新增）", "365天内解锁全部4项修炼技术：量子息法、直觉丹道、归零心诀、上升心经", "覆盖范围最广的一档，不含8项场域精测（精测按次单独购买）"],
    en: ["365 days of access to every narrative, including all future additions", "365 days of access to all 4 practice techniques: Quantum Breath, The Intuitive Way, Heart Reset, Ascending Heart", "The broadest tier — does not include the 8 Field Insight tests, which are purchased individually"],
  },
  breath: { zh: ["一次能量交换，永久开启，随时可练习"], en: ["One exchange, open forever — practice anytime"] },
  intuition: { zh: ["一次能量交换，永久开启，随时可练习"], en: ["One exchange, open forever — practice anytime"] },
  "heart-reset": { zh: ["一次能量交换，永久开启，随时可练习"], en: ["One exchange, open forever — practice anytime"] },
  "ascending-heart": { zh: ["一次能量交换，永久开启，随时可练习"], en: ["One exchange, open forever — practice anytime"] },
};

function categoryOf(productId: string): "field-test" | "membership" | "narrative" {
  if (FIELD_TEST_IDS.includes(productId)) return "field-test";
  if (MEMBERSHIP_IDS.includes(productId)) return "membership";
  return "narrative";
}

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

function OrderCard({ o }: { o: OrderRow }) {
  const product = getProduct(o.product_id);
  const dest = resolveDestination(o);
  const isPaid = o.status === "paid";
  const amount = o.amount_rmb ?? (o.amount_usd ? `$${o.amount_usd}` : "—");
  const amountDisplay = o.amount_rmb ? `¥${o.amount_rmb}` : amount;

  // 有效期——只有已支付、且是有到期时间的订阅制产品才需要算。
  let expiryLabel: string | null = null;
  let expiryLabelEn: string | null = null;
  if (isPaid && o.paid_at && product?.type === "subscription" && product.days) {
    const expiry = new Date(new Date(o.paid_at).getTime() + product.days * 86400000);
    const expired = expiry < new Date();
    expiryLabel = `${expired ? "已于" : "有效至"} ${expiry.toLocaleDateString()}${expired ? "过期" : ""}`;
    expiryLabelEn = `${expired ? "Expired" : "Valid until"} ${expiry.toLocaleDateString()}`;
  }

  const benefits = BENEFIT_DETAIL[o.product_id];

  return (
    <div className="lx-glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest2 text-bone-mute">
            <Bi zh="场域订单号" en="Field Order No." /> {o.id}
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
            <p className="mt-1 text-xs text-amber/80">
              <Bi zh={expiryLabel} en={expiryLabelEn ?? expiryLabel} />
            </p>
          )}
          {isPaid && product?.type === "permanent" && (
            <p className="mt-1 text-xs text-lattice">
              <Bi zh="永久有效，不设到期时间" en="Permanent access, no expiry" />
            </p>
          )}

          {/* v265：权益写清楚——订阅/合集类产品之前只有product.note这一句
              概括，这次凡是有BENEFIT_DETAIL的（会员/订阅类），改成逐条
              列出来，一次交换具体换到了什么，透明可查，不是一句模糊的话。
              没有配清单的（场域精测这些一次性报告类），仍然用原来的
              note描述，够用，不用为了统一硬凑清单。 */}
          {isPaid && benefits ? (
            <ul className="mt-2 space-y-1 text-xs leading-6 text-bone-soft">
              {(benefits.zh).map((line, i) => (
                <li key={i}>· <Bi zh={line} en={benefits.en[i]} /></li>
              ))}
            </ul>
          ) : isPaid && product ? (
            <p className="mt-1 text-xs leading-6 text-bone-soft">
              <Bi zh="获得权益" en="Benefits" />：<Bi zh={product.note} en={product.noteEn} />
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl text-bone">{amountDisplay}</p>
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

  const fieldTestOrders = orders.filter((o) => categoryOf(o.product_id) === "field-test");
  const membershipOrders = orders.filter((o) => categoryOf(o.product_id) === "membership");
  const narrativeOrders = orders.filter((o) => categoryOf(o.product_id) === "narrative");

  const SECTIONS: { key: string; titleZh: string; titleEn: string; hintZh: string; hintEn: string; rows: OrderRow[] }[] = [
    {
      key: "field-test", titleZh: "场域精测", titleEn: "Field Insight Tests",
      hintZh: "生命图谱、关系共振、生命韧性、桃花磁场、财富地图、今日运势、量子生命镜像、生命灵签——每项各自一次性解锁，永久保存。",
      hintEn: "Life Map, Relationship Resonance, Resilience, Romance, Wealth, Daily Tide, Tarot, Life Oracle — each unlocked once, permanently.",
      rows: fieldTestOrders,
    },
    {
      key: "membership", titleZh: "修炼技术与会员", titleEn: "Practices & Membership",
      hintZh: "4项修炼技术（永久）+ 显化订阅（单日/月度/年度）+ 多维叙事年度解锁/全构造解锁（按天数计有效期）。",
      hintEn: "4 practice techniques (permanent) + Manifestation passes (day/month/year) + Narrative/Everything bundles (time-limited).",
      rows: membershipOrders,
    },
    {
      key: "narrative", titleZh: "多维叙事", titleEn: "Narratives",
      hintZh: "按篇购买的长篇与短篇小说，每篇解锁一年；若已购「多维叙事年度解锁」或「全构造解锁」，覆盖范围内的篇目不用单独购买。",
      hintEn: "Individually purchased short and long narrative pieces, each unlocked for one year; already covered if you hold the Narrative or Everything bundle.",
      rows: narrativeOrders,
    },
  ];

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="font-display text-3xl font-light text-bone">
              <Bi zh="场域订单" en="Field Orders" />
            </h1>
            <Link href="/account" className="text-xs uppercase tracking-widest2 text-lattice hover:text-amber">
              <Bi zh="← 返回场域入口" en="← Back to Account" />
            </Link>
          </div>
          <p className="mb-8 text-xs text-bone-mute">
            <Bi zh="按类别查看每一次能量交换的详情、有效期与具体权益。" en="Every exchange, grouped by kind, with its expiry and exact benefits." />
          </p>

          {!user && (
            <p className="lx-glass p-8 text-center text-sm text-bone-soft">
              <Bi zh="请先登录查看你的场域订单。" en="Please log in to view your field orders." />
            </p>
          )}

          {user && orders.length === 0 && (
            <p className="lx-glass p-8 text-center text-sm text-bone-soft">
              <Bi zh="还没有任何订单——完成一次能量交换后，会出现在这里。" en="No orders yet — they'll appear here once you complete an exchange." />
            </p>
          )}

          {user && orders.length > 0 && (
            <div className="space-y-10">
              {SECTIONS.filter((s) => s.rows.length > 0).map((s) => (
                <div key={s.key}>
                  <h2 className="font-display text-lg text-lattice">
                    <Bi zh={s.titleZh} en={s.titleEn} />
                  </h2>
                  <p className="mt-1 text-xs leading-6 text-bone-mute">
                    <Bi zh={s.hintZh} en={s.hintEn} />
                  </p>
                  <div className="mt-4 space-y-3">
                    {s.rows.map((o) => <OrderCard key={o.id} o={o} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
