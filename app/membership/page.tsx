export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import EarthGrid from "@/components/EarthGrid";
import PlanButton from "./PlanButton";
import {
  cultivationProducts,
  manifestationProducts,
  getProduct,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const MEMBERSHIP_FAQ: BilingualFaqItem[] = [
  {
    qZh: "灵犀场的能量交换项目分几种？", qEn: "How many kinds of energy exchange does Lingxi Field offer?",
    aZh: "分两类：一次性开启类（四大修炼技术等），完成一次能量交换后永久有效；周期性场域连接（显化与梦境解读、多维叙事年度解锁、神尊·全域解锁），按周期连接，到期后由你自行决定是否延续，不会自动扣款。",
    aEn: "There are two kinds: one-time openings (like the Four Practices), permanently active after a single energy exchange; and periodic field connections (Manifestation & Dream Interpretation, the yearly Narrative unlock, and Sovereign · All-Field Access), connected for a fixed period, with renewal always your own choice — nothing auto-charges.",
  },
  {
    qZh: "神尊·全域解锁包含什么？", qEn: "What does Sovereign · All-Field Access include?",
    aZh: "神尊·全域解锁是一份为期一年的全域通行证：有效期内解锁灵犀场全部付费内容，包括场域精测的 10 个核心产品、四大修炼技术、显化与梦境探索、多维叙事与订阅内容，也自动包含这一年内未来发布的任何新报告、新修炼技术与新场域模块。它不是若干权益的拼盘，而是完整进入持续生长的灵犀场。",
    aEn: "Sovereign · All-Field Access is a one-year pass to every paid Lingxi Field experience: all ten Field Insight products, the Four Practices, Manifestation & Dream Exploration, Dimensional Narratives and subscriptions, plus any new report, practice, or field module released while the pass remains active. It is not a bundle of isolated benefits; it is complete entry into an evolving Lingxi Field.",
  },
  {
    qZh: "为什么会设计「神尊·全域解锁」这一层？", qEn: "Why does Sovereign · All-Field Access exist as its own tier?",
    aZh: "灵犀场最初并不是为了创造一个个独立工具。生命图谱帮助看见结构，关系共振帮助理解连接，修炼技术帮助回到内在，显化练习帮助创造现实，多维叙事帮助拓展意识——这些模块背后，本质上都指向同一个方向：理解自己。当这些部分连接起来，它们才真正形成一个完整的场。",
    aEn: "Lingxi Field wasn't originally created as a set of separate tools. The Life Map helps you see your structure. Relationship Resonance helps you understand connection. The practices help you return inward. Manifestation helps you create reality. Dimensional Narrative helps you expand consciousness. Underneath, these all point toward the same thing: understanding yourself. Connected together, they form a genuinely complete field.",
  },
  {
    qZh: "灵犀场支持哪些方式进入？", qEn: "How can I enter Lingxi Field's energy exchange?",
    aZh: "灵犀场正在逐步开放不同地区的能量交换方式，目前支持微信支付，接下来会陆续开通支付宝等更多国内渠道，海外支付渠道也在持续接入中——会根据全球用户的使用习惯，开放更多便捷、安全的进入方式。",
    aEn: "Lingxi Field is gradually opening energy-exchange options across different regions. WeChat Pay is currently supported, with Alipay and other domestic channels coming soon, and international payment options in ongoing development — more convenient, secure ways to enter will open as global usage grows.",
  },
  {
    qZh: "灵犀场为什么叫「能量交换」，不直接叫「付款」？", qEn: "Why does Lingxi Field call it 'energy exchange' instead of 'payment'?",
    aZh: "因为这里提供的并不是单纯的信息消费。每一次进入，背后都是内容创造、系统维护、持续研发、场域成长——你给予支持，灵犀场继续创造更多探索内容，这是一个双向连接的过程，不是一次性的买卖关系。",
    aEn: "Because what's offered here isn't simple content consumption. Behind every entry is content creation, system maintenance, ongoing development, and the field's own growth. Your support lets Lingxi Field keep creating more to explore — it's a two-way connection, not a one-off transaction.",
  },
];



export const metadata = { title: "能量交换 | 灵犀场 · Energy Exchange | Lingxi", description: "能量交换：以神尊年度全域通行证进入全部付费内容，或单独开启场域精测、修炼技术、显化梦境与多维叙事。Sovereign annual access opens every paid Lingxi Field experience, including future releases during the active term.", alternates: { canonical: "/membership" } };

// 灵犀场不像普通SaaS会员那样写"权益包含"，写的是"进入什么场域、
// 开启什么能力、获得什么长期体验"——每个产品下面配一份具体的
// "获得"清单，不是一句笼统的note带过。
type Bullets = { headerZh: string; headerEn: string; items: { zh: string; en: string }[]; closingZh: string; closingEn: string };

const BULLETS: Record<string, Bullets> = {
  breath: {
    headerZh: "进入身体与意识重新同步的入口", headerEn: "The entrance to re-syncing body and consciousness",
    items: [
      { zh: "完整量子息法修炼路径", en: "The complete Quantum Breath practice path" },
      { zh: "呼吸节律引导", en: "Guided breath rhythm" },
      { zh: "日常意识回归练习", en: "Daily practice for returning to awareness" },
      { zh: "从身体层面进入稳定状态的方法", en: "A way into stability, starting from the body" },
    ],
    closingZh: "让呼吸成为连接身体、意识与当下的桥梁。", closingEn: "Let breath become the bridge between body, consciousness, and the present.",
  },
  intuition: {
    headerZh: "开启内在感知与直觉连接", headerEn: "Opening inner perception and intuitive connection",
    items: [
      { zh: "直觉觉察训练", en: "Intuitive awareness training" },
      { zh: "内在感知练习", en: "Inner perception practice" },
      { zh: "意识判断力提升路径", en: "A path to sharper conscious judgment" },
      { zh: "深层自我连接方法", en: "A method for deeper self-connection" },
    ],
    closingZh: "让被日常噪音覆盖的感知能力，重新被唤醒。", closingEn: "Awaken the perception that everyday noise has been covering.",
  },
  "heart-reset": {
    headerZh: "回到内在中心的位置", headerEn: "Returning to your inner center",
    items: [
      { zh: "情绪归零练习", en: "Emotional reset practice" },
      { zh: "内在空间整理", en: "Clearing inner space" },
      { zh: "自我观察方法", en: "A method for self-observation" },
      { zh: "心念稳定训练", en: "Training for a steady mind" },
    ],
    closingZh: "在变化之中，重新找到自己的中心。", closingEn: "Find your center again, in the middle of change.",
  },
  "ascending-heart": {
    headerZh: "从内在觉察走向生命展开", headerEn: "From inner awareness to life unfolding",
    items: [
      { zh: "心意识扩展练习", en: "Heart-consciousness expansion practice" },
      { zh: "生命方向觉察", en: "Awareness of your life direction" },
      { zh: "内在成长路径", en: "An inner growth path" },
      { zh: "长期修炼引导", en: "Long-term practice guidance" },
    ],
    closingZh: "让意识成长，与现实创造同步展开。", closingEn: "Let consciousness grow in step with the reality you're creating.",
  },
};

const MANIFEST_BULLETS: Record<string, { items: { zh: string; en: string }[] }> = {
  day: {
    items: [
      { zh: "当日显化状态读取", en: "A reading of today's manifestation state" },
      { zh: "梦境象征解析", en: "Dream symbol interpretation" },
      { zh: "潜意识信息探索", en: "Exploring subconscious signals" },
      { zh: "当前生命主题观察", en: "Observing your current life theme" },
    ],
  },
  month: {
    items: [
      { zh: "每月显化观察", en: "Monthly manifestation observation" },
      { zh: "梦境持续解析", en: "Ongoing dream interpretation" },
      { zh: "潜意识变化记录", en: "Tracking subconscious shifts" },
      { zh: "阶段性生命主题整理", en: "Organizing your life theme by phase" },
    ],
  },
  year: {
    items: [
      { zh: "显化记录空间", en: "A space for manifestation records" },
      { zh: "梦境探索档案", en: "A dream exploration archive" },
      { zh: "长期意识成长轨迹", en: "Your long-term consciousness growth trajectory" },
      { zh: "年度生命主题回顾", en: "An annual life-theme review" },
    ],
  },
};

function PriceTag({ priceRmb, days, type }: { priceRmb: number; days?: number; type: string }) {
  return (
    <div className="mt-4 flex items-end gap-1">
      <span className="font-display text-4xl text-lattice">¥{priceRmb}</span>
      <span className="mb-1.5 text-sm text-bone-dim">
        {type === "permanent" ? (
          <Bi zh="永久" en="forever" />
        ) : days === 1 ? (
          <Bi zh="/ 天" en="/ day" />
        ) : days === 30 ? (
          <Bi zh="/ 月" en="/ month" />
        ) : (
          <Bi zh="/ 年" en="/ year" />
        )}
      </span>
    </div>
  );
}

function PracticeCard({ id, loggedIn }: { id: string; loggedIn: boolean }) {
  const p = getProduct(id);
  const b = BULLETS[id];
  if (!p || !b) return null;
  return (
    <div className="flex flex-col rounded-sm border border-white/10 bg-reading-glass p-8">
      <h3 className="font-display text-2xl text-bone"><Bi zh={p.name} en={p.nameEn} /></h3>
      <p className="mt-2 text-sm text-lattice"><Bi zh={b.headerZh} en={b.headerEn} /></p>
      <PriceTag priceRmb={p.priceRmb} type={p.type} />
      <p className="mt-2 text-xs text-bone-soft"><Bi zh="一次能量交换，永久开启。" en="One energy exchange, open forever." /></p>
      <p className="mt-4 text-xs uppercase tracking-widest2 text-lattice/60"><Bi zh="获得：" en="You receive:" /></p>
      <ul className="mt-2 flex-1 space-y-1.5 text-sm leading-6 text-bone-dim">
        {b.items.map((it, i) => (
          <li key={i}>· <Bi zh={it.zh} en={it.en} /></li>
        ))}
      </ul>
      <p className="mt-4 text-xs italic text-bone-soft"><Bi zh={b.closingZh} en={b.closingEn} /></p>
      <div className="mt-6">
        <PlanButton productId={p.id} loggedIn={loggedIn} nameZh={p.name} nameEn={p.nameEn} />
      </div>
    </div>
  );
}

function ManifestCard({ id, loggedIn, tierZh, tierEn }: { id: string; loggedIn: boolean; tierZh: string; tierEn: string }) {
  const p = getProduct(id);
  const b = MANIFEST_BULLETS[id];
  if (!p || !b) return null;
  return (
    <div className={`flex flex-col rounded-sm border p-8 ${p.highlight ? "border-amber/50 bg-amber/5" : "border-white/10 bg-reading-glass"}`}>
      {p.highlight && (
        <span className="mb-4 inline-block w-fit rounded-sm bg-amber/20 px-3 py-1 font-display text-xs tracking-widest2 text-amber">
          <Bi zh="推荐" en="Recommended" />
        </span>
      )}
      <h3 className="font-display text-xl text-bone"><Bi zh={tierZh} en={tierEn} /></h3>
      <PriceTag priceRmb={p.priceRmb} days={p.days} type={p.type} />
      <p className="mt-4 text-xs uppercase tracking-widest2 text-lattice/60"><Bi zh="开启：" en="Unlocks:" /></p>
      <ul className="mt-2 flex-1 space-y-1.5 text-sm leading-6 text-bone-dim">
        {b.items.map((it, i) => (
          <li key={i}>· <Bi zh={it.zh} en={it.en} /></li>
        ))}
      </ul>
      <div className="mt-6">
        <PlanButton productId={p.id} loggedIn={loggedIn} highlight={p.highlight} nameZh={p.name} nameEn={p.nameEn} />
      </div>
    </div>
  );
}

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: { canceled?: string; pending?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // PayPal已经不可用（企业账户被注销），这几条状态提示原本是PayPal
  // 跳转回来的场景专用的，现在支付走的是微信扫码（弹窗内直接完成，
  // 不会跳转离开这个页面再带着query参数回来），这几个状态理论上
  // 不会再触发，但保留着作为兜底，文字里去掉了"PayPal"这个具体
  // 渠道名，改成更通用的说法。
  const status = searchParams.pending
    ? { tone: "pending", zh: "支付正在处理，一般几分钟内会自动完成——完成后这里会自动解锁，不用重复付款。", en: "Payment is still processing — it usually clears within a few minutes and unlocks automatically. No need to pay again." }
    : searchParams.canceled
    ? { tone: "canceled", zh: "已取消这次能量交换，没有产生任何扣款。", en: "Exchange canceled — nothing was charged." }
    : searchParams.error
    ? { tone: "error", zh: "付款遇到了问题，还没有完成扣款。可以重试一次，如果反复失败，联系我们看看是不是账户那边的原因。", en: "Something went wrong and the payment didn't go through. Try again, or reach out if it keeps failing." }
    : null;

  const narrativeAll = getProduct("narrative-all");
  const everything = getProduct("everything");

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25">
            <EarthGrid className="h-[520px] w-[520px]" />
          </div>
          <div className="bg-reading-glass relative z-10 mx-auto max-w-2xl rounded-sm px-8 py-10">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="能量交换" en="Energy Exchange" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="进入什么场域，开启什么能力" en="What you enter, what you unlock" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="完成能量交换后，场域将自动为你开启，无需等待人工确认。" en="Once the energy exchange is complete, the Field opens for you automatically — no manual confirmation needed." />
          </p>
          {status && (
            <p
              className={`mx-auto mt-6 max-w-xl rounded-sm border px-5 py-3 text-sm leading-6 ${
                status.tone === "error"
                  ? "border-red-400/30 bg-red-400/10 text-red-200"
                  : status.tone === "pending"
                  ? "border-amber/30 bg-amber/10 text-amber"
                  : "border-white/15 bg-white/5 text-bone-dim"
              }`}
            >
              <Bi zh={status.zh} en={status.en} />
            </p>
          )}
          </div>
        </section>

        {/* 一、神尊全域解锁：最高层级先建立价值锚点 */}
        {everything && (
        <section id="sovereign" className="scroll-mt-28 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="一 · 神尊全域解锁" en="I · Sovereign · All-Field Access" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim"><Bi zh="年度全域通行证 · 当前与未来全部付费内容" en="Annual all-field pass · every current and future paid experience" /></p>
            </div>
            <div className="rounded-sm border border-amber/50 bg-amber/5 p-10 text-center">
              <span className="mb-4 inline-block w-fit rounded-sm bg-amber/20 px-3 py-1 font-display text-xs tracking-widest2 text-amber">
                <Bi zh="神尊层级" en="Sovereign Tier" />
              </span>
              <h3 className="font-display text-2xl text-bone"><Bi zh={everything.name} en={everything.nameEn} /></h3>
              <PriceTag priceRmb={everything.priceRmb} days={everything.days} type={everything.type} />

              <p className="mx-auto mt-6 max-w-md text-xs uppercase tracking-widest2 text-lattice"><Bi zh="有效期内 · 全站付费内容与未来新增全部开放" en="During the active term · every paid experience and future release" /></p>
              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🔮 <Bi zh="场域精测·不限次数" en="Field Insights · Unlimited" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="10 个核心产品与完整生命档案。" en="All ten core products and complete life archives." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌌 <Bi zh="意识显化体系" en="Conscious Manifestation" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="探索意识如何影响现实创造。" en="Explore how consciousness shapes the reality you create." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌙 <Bi zh="梦境解析体系" en="Dream Interpretation" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="理解梦境中的潜意识信息。" en="Understand what the subconscious communicates through dreams." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌀 <Bi zh="全部修炼技术" en="Every Practice" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="包含当前四大路径与年内未来新增技术。" en="The Four Practices plus new techniques released during the year." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">📖 <Bi zh="多维叙事与订阅" en="Narratives & Subscriptions" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="持续阅读灵犀场原创意识记录。" en="Read Lingxi Field's original consciousness records as they grow." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">✨ <Bi zh="未来新增全部包含" en="All Future Releases Included" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="新报告、新修炼技术与新场域模块自动加入。" en="New reports, practices, and field modules join automatically." /></p>
                </div>
              </div>

              <p className="mt-8 font-display text-sm text-lattice"><Bi zh="一年全域通行，进入持续生长的完整灵犀场。" en="One year of all-field access to an evolving Lingxi Field." /></p>
              <div className="mx-auto mt-6 max-w-xs">
                <PlanButton productId={everything.id} loggedIn={!!user} highlight nameZh={everything.name} nameEn={everything.nameEn} />
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 二、四大修炼技术 */}
        <section id="practices" className="scroll-mt-28 px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="二 · 核心修炼技术" en="II · Core Practices" />
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cultivationProducts.filter((p) => BULLETS[p.id]).map((p) => (
                <PracticeCard key={p.id} id={p.id} loggedIn={!!user} />
              ))}
            </div>
          </div>
        </section>

        {/* 三、显化与梦境解读 */}
        <section id="manifestation" className="scroll-mt-28 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="三 · 显化与梦境解读" en="III · Manifestation & Dream Interpretation" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim"><Bi zh="进入你的潜意识叙事空间" en="Enter your subconscious narrative space" /></p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <ManifestCard id="day" loggedIn={!!user} tierZh="单日体验" tierEn="One-Day Pass" />
              <ManifestCard id="month" loggedIn={!!user} tierZh="月度探索" tierEn="Monthly" />
              <ManifestCard id="year" loggedIn={!!user} tierZh="年度旅程" tierEn="Yearly" />
            </div>
          </div>
        </section>

        {/* 四、多维叙事 */}
        {narrativeAll && (
        <section id="narratives" className="scroll-mt-28 border-t border-white/5 px-6 py-16 pb-28">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="四 · 多维叙事" en="IV · Dimensional Narrative" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim"><Bi zh="阅读不同意识层级中的现实结构" en="Read the structure of reality across different levels of consciousness" /></p>
            </div>
            <div className="rounded-sm border border-white/10 bg-reading-glass p-8 text-center">
              <h3 className="font-display text-xl text-bone"><Bi zh={narrativeAll.name} en={narrativeAll.nameEn} /></h3>
              <PriceTag priceRmb={narrativeAll.priceRmb} days={narrativeAll.days} type={narrativeAll.type} />
              <ul className="mx-auto mt-6 max-w-xs space-y-1.5 text-left text-sm leading-6 text-bone-dim">
                <li>· <Bi zh="长篇意识传输" en="Long-form consciousness transmissions" /></li>
                <li>· <Bi zh="现实重写记录" en="Reality-rewrite records" /></li>
                <li>· <Bi zh="场域叙事档案" en="Field narrative archives" /></li>
                <li>· <Bi zh="场域观测日志" en="Field observation logs" /></li>
                <li>· <Bi zh="持续更新的原创多维故事" en="Original dimensional stories, continuously updated" /></li>
              </ul>
              <p className="mx-auto mt-4 max-w-xs text-xs italic text-bone-soft">
                <Bi zh="现实不是单一发生的结果，而是意识与生命持续交汇后的展开。" en="Reality is not a single outcome. It unfolds from the ongoing meeting of consciousness and life." />
              </p>
              <div className="mx-auto mt-6 max-w-[220px]">
                <PlanButton productId={narrativeAll.id} loggedIn={!!user} nameZh={narrativeAll.name} nameEn={narrativeAll.nameEn} />
              </div>
            </div>
          </div>
        </section>
        )}

        <div className="mx-auto max-w-2xl px-6 pb-24">
          <FaqSection items={MEMBERSHIP_FAQ} />
        </div>
      </main>
      <Footer />
    </>
  );
}
