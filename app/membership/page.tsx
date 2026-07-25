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

export const metadata = { title: "能量交换 | 灵犀场 · Energy Exchange | Lingxi", description: "能量交换：进入灵犀场的四大修炼技术、显化与梦境解读、多维叙事，或一次性开启全构造。完成后场域自动开启。Enter Lingxi Field's practices, manifestation module, narratives, or unlock everything at once.", alternates: { canonical: "/membership" } };

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
      <p className="mt-2 text-sm text-lattice/80"><Bi zh={b.headerZh} en={b.headerEn} /></p>
      <PriceTag priceRmb={p.priceRmb} type={p.type} />
      <p className="mt-2 text-xs text-bone-dim/70"><Bi zh="一次能量交换，永久开启。" en="One energy exchange, open forever." /></p>
      <p className="mt-4 text-xs uppercase tracking-widest2 text-lattice/60"><Bi zh="获得：" en="You receive:" /></p>
      <ul className="mt-2 flex-1 space-y-1.5 text-sm leading-6 text-bone-dim">
        {b.items.map((it, i) => (
          <li key={i}>· <Bi zh={it.zh} en={it.en} /></li>
        ))}
      </ul>
      <p className="mt-4 text-xs italic text-bone-dim/60"><Bi zh={b.closingZh} en={b.closingEn} /></p>
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
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
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

        {/* 一、四大修炼技术 */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="一 · 四大修炼技术" en="I · The Four Practices" />
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cultivationProducts.filter((p) => BULLETS[p.id]).map((p) => (
                <PracticeCard key={p.id} id={p.id} loggedIn={!!user} />
              ))}
            </div>
          </div>
        </section>

        {/* 二、显化与梦境解读 */}
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="二 · 显化与梦境解读" en="II · Manifestation & Dream Interpretation" />
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

        {/* 三、多维叙事 */}
        {narrativeAll && (
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="三 · 多维叙事" en="III · Dimensional Narrative" />
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
              <p className="mx-auto mt-4 max-w-xs text-xs italic text-bone-dim/60">
                <Bi zh="现实不是单一发生的结果，而是意识与生命持续交汇后的展开。" en="Reality is not a single outcome. It unfolds from the ongoing meeting of consciousness and life." />
              </p>
              <div className="mx-auto mt-6 max-w-[220px]">
                <PlanButton productId={narrativeAll.id} loggedIn={!!user} nameZh={narrativeAll.name} nameEn={narrativeAll.nameEn} />
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 四、灵犀场全构造解锁（核心会员） */}
        {everything && (
        <section className="border-t border-white/5 px-6 py-16 pb-28">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="四 · 灵犀场全构造解锁" en="IV · Lingxi Field · Everything Unlocked" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim"><Bi zh="进入灵犀场完整体验层" en="Enter the full experience layer of Lingxi Field" /></p>
            </div>
            <div className="rounded-sm border border-amber/50 bg-amber/5 p-10 text-center">
              <span className="mb-4 inline-block w-fit rounded-sm bg-amber/20 px-3 py-1 font-display text-xs tracking-widest2 text-amber">
                <Bi zh="神尊层级" en="Sovereign Tier" />
              </span>
              <h3 className="font-display text-2xl text-bone"><Bi zh={everything.name} en={everything.nameEn} /></h3>
              <PriceTag priceRmb={everything.priceRmb} days={everything.days} type={everything.type} />

              <p className="mx-auto mt-6 max-w-md text-xs uppercase tracking-widest2 text-lattice/70"><Bi zh="全站能量交换项目 · 开放全部" en="Every energy exchange on the site · fully open" /></p>
              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌌 <Bi zh="意识显化体系" en="Conscious Manifestation" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="探索意识如何影响现实创造。" en="Explore how consciousness shapes the reality you create." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌙 <Bi zh="梦境解析体系" en="Dream Interpretation" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="理解梦境中的潜意识信息。" en="Understand what the subconscious communicates through dreams." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🌀 <Bi zh="修炼技术体系" en="The Practices" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="完整进入四大修炼路径。" en="Full access to all four practice paths." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">📖 <Bi zh="多维叙事体系" en="Dimensional Narrative" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="持续阅读灵犀场原创意识记录。" en="Read Lingxi Field's original consciousness records, as they grow." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">🔮 <Bi zh="场域精测·不限次数" en="Field Insights · Unlimited" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="生命图谱、关系共振、生命灵签、量子塔罗，不限次数深度解析。" en="Life Map, Relationship Resonance, Life Oracle, Quantum Tarot — unlimited deep readings." /></p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep p-4">
                  <p className="text-sm text-bone">✨ <Bi zh="后续新增内容" en="Everything added later" /></p>
                  <p className="mt-1 text-xs text-bone-dim"><Bi zh="未来开放的新场域模块，同步体验。" en="New field modules, as they open, included automatically." /></p>
                </div>
              </div>

              <p className="mt-8 font-display text-sm text-lattice"><Bi zh="一次进入，开启完整灵犀场体验路径。" en="One entry. The full path through Lingxi Field opens." /></p>
              <div className="mx-auto mt-6 max-w-xs">
                <PlanButton productId={everything.id} loggedIn={!!user} highlight nameZh={everything.name} nameEn={everything.nameEn} />
              </div>
            </div>
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-6 text-bone-dim/60">
            <Bi
              zh="能量交换完成后，场域自动开启，无需等待人工确认。四大修炼技术永久有效；显化与梦境解读、多维叙事、全构造解锁到期可续期，时间自动累加。"
              en="Once the energy exchange completes, the Field opens automatically — no manual confirmation needed. The Four Practices are yours forever; Manifestation & Dream Interpretation, Dimensional Narrative, and Everything Unlocked can be renewed on expiry, with time added automatically."
            />
          </p>
        </section>
        )}
      </main>
      <Footer />
    </>
  );
}
