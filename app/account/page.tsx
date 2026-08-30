export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountButton from "./DeleteAccountButton";
import MiniAccountLinkPanel from "./MiniAccountLinkPanel";
import RelationshipReportRow from "./RelationshipReportRow";
import ReportRow from "./ReportRow";
import QianReportRow from "./QianReportRow";
import TarotReadingReportRow from "./TarotReadingReportRow";
import SimpleReportRow from "./SimpleReportRow";
import PendingOrdersPanel from "./PendingOrdersPanel";
import CollapsibleSection from "./CollapsibleSection";
import { NARRATIVES } from "@/lib/narratives";
import Bi from "@/components/Bi";
import CosmicField from "@/components/CosmicField";
import { createClient, getServerUser, isSupabasePublicConfigured } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { ensureLifeArchetype } from "@/lib/mini/life-archetype";
import { MINI_LIFE_ARCHETYPE_ALGORITHM } from "@/lib/mini/dendrite-engine";
import { ensureAuditAccountAccess } from "@/lib/audit-access";

export const metadata = { title: "进入场域 | 灵犀 · Enter the Field | Lingxi" };

export default async function AccountPage({ searchParams }: { searchParams?: { miniLink?: string } }) {
  const miniLink = typeof searchParams?.miniLink === "string" && searchParams.miniLink.length <= 2048
    ? searchParams.miniLink
    : null;
  const supabase = isSupabasePublicConfigured() ? createClient() : null;
  const user = supabase ? await getServerUser(supabase) : null;

  let manifestUntil: string | null = null;
  let unlocks: string[] = [];
  if (user && supabase) {
    // The owner's exact review account receives one idempotent all-content grant
    // before this page reads entitlements, so /account itself is the recovery path.
    await ensureAuditAccountAccess(user).catch((error) => console.error("[audit access]", error));
    if (isSupabaseAdminConfigured()) await ensureLifeArchetype(user.id).catch(() => null);
    const { data: profile } = await supabase
      .from("profiles")
      .select("manifest_until")
      .eq("id", user.id)
      .single();
    manifestUntil = profile?.manifest_until ?? null;
    const { data: u } = await supabase
      .from("unlocks")
      .select("product_id")
      .eq("user_id", user.id);
    unlocks = (u ?? []).map((r: { product_id: string }) => r.product_id);
  }
  const manifestActive = manifestUntil && new Date(manifestUntil) > new Date();

  // 之前账户页只显示"生命图谱已解锁"这个笼统的状态，没有列出具体报告——
  // 如果同一个人测过不止一次（不同的出生信息、或者重新测过一次），
  // 付款完成后要是没跳转成功、或者关掉了标签页，就完全没有入口能再找
  // 回那份报告，只能干着急。这里补上一份列表，直接链到每一份报告。
  let lifeMapReports: { id: string; core_type_name: string | null; created_at: string }[] = [];
  // 之前只查了 life_map_submissions 这一张表——关系共振图谱用的是另一张
  // 独立的表（relationship_submissions），场域入口这边完全没去查过，
  // 所以测完关系共振，账户页里理所当然什么都看不到，不是漏了什么
  // 判断逻辑，是压根没写查这张表的代码。这里补上，跟生命图谱报告
  // 用同一套列表样式展示。
  let relationshipReports: { id: string; name_a: string; name_b: string; created_at: string }[] = [];
  // 同样的道理，生命灵签和塔罗生命镜像各自也是独立的表，之前场域
  // 入口完全没查过这两张——这次一起补上，跟前两个用同一套列表样式。
  let qianReports: { id: string; name: string | null; created_at: string }[] = [];
  let tarotReadingReports: { id: string; name: string | null; created_at: string }[] = [];
  // 生命韧性、桃花磁场、今日运势潮汐、财富创造地图——同样的道理，之前
  // 场域入口完全没查过这四张表，这次一起补上。
  let resilienceReports: { id: string; name: string | null; created_at: string }[] = [];
  let romanceReports: { id: string; name: string | null; created_at: string }[] = [];
  let dailyTideReports: { id: string; name: string | null; generated_date: string; created_at: string }[] = [];
  let wealthReports: { id: string; name: string | null; created_at: string }[] = [];
  let lifeArchetypeReports: { id: string; created_at: string; input: { name?: string; identityVerified?: boolean } | null }[] = [];
  // v252：生成过二维码、但还没被确认为已支付的订单——万一支付弹窗
  // 中途意外关闭（误触背景、或者用户直接切走了），这里给一条"事后
  // 还能回来确认"的路。只列最近的、状态还不是paid的订单，付过的和
  // 从没生成过订单的都不会出现在这里。
  let pendingOrders: { id: string; product_id: string; created_at: string; amount_usd: number }[] = [];
  if (user && supabase) {
    const [
      { data: reports }, { data: relReports }, { data: qReports }, { data: trReports },
      { data: resReports }, { data: romReports }, { data: dtReports }, { data: wReports },
      { data: archetypeReports }, { data: poReports },
    ] = await Promise.all([
      supabase
        .from("life_map_submissions")
        .select("id, core_type_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("relationship_submissions")
        .select("id, name_a, name_b, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("qian_submissions")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("tarot_reading_submissions")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("resilience_submissions")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("romance_submissions")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("daily_tide_submissions")
        .select("id, name, generated_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("wealth_submissions")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("mini_dendrite_assessments")
        .select("id, created_at, input")
        .eq("user_id", user.id)
        .eq("product_id", "life-archetype")
        .eq("algorithm_version", MINI_LIFE_ARCHETYPE_ALGORITHM)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("orders")
        .select("id, product_id, created_at, amount_usd")
        .eq("user_id", user.id)
        .eq("provider", "wechat")
        .neq("status", "paid")
        .not("provider_payment_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    lifeMapReports = reports ?? [];
    relationshipReports = relReports ?? [];
    qianReports = qReports ?? [];
    tarotReadingReports = trReports ?? [];
    resilienceReports = resReports ?? [];
    romanceReports = romReports ?? [];
    dailyTideReports = dtReports ?? [];
    wealthReports = wReports ?? [];
    lifeArchetypeReports = ((archetypeReports ?? []) as typeof lifeArchetypeReports).filter((report)=>report.input?.identityVerified===true);
    pendingOrders = poReports ?? [];
  }

  const nameMap: Record<string, string> = {
    bundle: "四项合集",
    breath: "量子息法",
    intuition: "直觉丹道",
    "heart-reset": "归零心诀",
    "ascending-heart": "上升心经",
  };
  // v251：之前这里把"多维叙事"解锁也混进这份纯文字列表，只显示标题、
  // 点不进去——用户付了钱买一篇文章的永久阅读权，却只能在这里看见
  // 一串没有链接的文字，找不到真正的文章在哪。这里单独把叙事类的
  // unlock挑出来，做成可以直接点进去的链接；另外这几个"XX-report"
  // 类型的unlock，已经各自有自己的报告列表区块了，这里不用重复显示，
  // 过滤掉，不然同一份东西会在页面上出现两次、显示成一串没意义的
  // 原始ID字符串。
  const narrativeMap = new Map(NARRATIVES.map((n) => [n.slug, n.title]));
  const REPORT_PRODUCT_IDS = new Set([
    "life-map-report", "relationship-resonance", "qian-reading", "tarot-reading",
    "resilience-report", "romance-report", "wealth-report", "daily-tide-report", "life-archetype",
  ]);
  const narrativeUnlocks = unlocks.filter((id) => narrativeMap.has(id));
  const plainUnlocks = unlocks.filter((id) => !narrativeMap.has(id) && !REPORT_PRODUCT_IDS.has(id));

  return (
    <>
      <Nav />
      <main className="pt-16">
        <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center opacity-20"><CosmicField className="h-full w-auto" /></div>
        <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-24 text-center">
          {user ? (
            <>
              {miniLink && <MiniAccountLinkPanel ticket={miniLink} />}
              <div className="bg-void-deep w-full rounded-sm px-8 py-10">
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
                <Bi zh="你已连接至场域" en="You are connected to the field" />
              </p>
              <h1 className="mt-6 font-display text-4xl font-light text-bone">
                <Bi zh="欢迎回来" en="Welcome back" />
              </h1>
              <p className="mt-4 text-base text-bone-dim">{user.email}</p>
              <p className="mt-6 max-w-sm text-base leading-9 text-bone-dim">
                <Bi zh="你的现实回路与练习记录，已在云端安全同步。" en="Your Reality Loop and practice records are synced securely to the cloud." />
              </p>
              </div>

              {/* 会员状态 */}
              <div className="mt-8 w-full space-y-3 text-left">
                <div className="rounded-sm border border-white/10 bg-void-deep px-5 py-4">
                  <p className="text-sm text-bone-dim"><Bi zh="显化与梦境解读" en="Manifestation & Dream Interpretation" /></p>
                  <p className="mt-1 font-display text-lg text-lattice">
                    {manifestActive ? (
                      <>
                        <Bi zh="有效至 " en="Active until " />
                        {new Date(manifestUntil!).toLocaleDateString()}
                      </>
                    ) : (
                      <Bi zh="未订阅" en="Not subscribed" />
                    )}
                  </p>
                </div>
                <div className="rounded-sm border border-white/10 bg-void-deep px-5 py-4">
                  <p className="text-sm text-bone-dim"><Bi zh="已激活的修炼技术" en="Activated practices" /></p>
                  <p className="mt-1 font-display text-lg text-lattice">
                    {plainUnlocks.length
                      ? plainUnlocks.map((id) => nameMap[id] || id).join("、")
                      : ""}
                    {!plainUnlocks.length && <Bi zh="暂无" en="None yet" />}
                  </p>
                </div>
              </div>

              <Link
                href="/account/orders"
                className="mt-4 flex w-full items-center justify-center gap-2 border border-lattice bg-lattice/10 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:bg-lattice hover:text-void-deep"
              >
                <Bi zh="查看场域订单（订单号 · 金额 · 状态 · 有效期）→" en="View Field Orders (No. · Amount · Status · Expiry) →" />
              </Link>

              <PendingOrdersPanel orders={pendingOrders} />

              {narrativeUnlocks.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 多维叙事" titleEn="Unlocked · Narrative" count={narrativeUnlocks.length}>
                  {narrativeUnlocks.map((slug) => (
                    <SimpleReportRow key={slug} href={`/narrative/${slug}`} title={narrativeMap.get(slug) ?? slug} date="" />
                  ))}
                </CollapsibleSection>
              )}

              {lifeMapReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 生命图谱" titleEn="Unlocked · Life Map" count={lifeMapReports.length}>
                  {lifeMapReports.map((r) => (
                    <ReportRow
                      key={r.id}
                      id={r.id}
                      title={r.core_type_name}
                      date={new Date(r.created_at).toLocaleDateString()}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {relationshipReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 关系共振" titleEn="Unlocked · Relationship Resonance" count={relationshipReports.length}>
                  {relationshipReports.map((r) => (
                    <RelationshipReportRow
                      key={r.id}
                      id={r.id}
                      title={`${r.name_a} × ${r.name_b}`}
                      date={new Date(r.created_at).toLocaleDateString()}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {qianReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 生命灵签" titleEn="Unlocked · Life Oracle" count={qianReports.length}>
                  {qianReports.map((r) => (
                    <QianReportRow
                      key={r.id}
                      id={r.id}
                      title={r.name}
                      date={new Date(r.created_at).toLocaleDateString()}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {tarotReadingReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 量子生命镜像" titleEn="Unlocked · Quantum Life Mirror" count={tarotReadingReports.length}>
                  {tarotReadingReports.map((r) => (
                    <TarotReadingReportRow
                      key={r.id}
                      id={r.id}
                      title={r.name}
                      date={new Date(r.created_at).toLocaleDateString()}
                    />
                  ))}
                </CollapsibleSection>
              )}

              {resilienceReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 生命韧性指数" titleEn="Unlocked · Life Resilience" count={resilienceReports.length}>
                  {resilienceReports.map((r) => (
                    <SimpleReportRow key={r.id} href={`/resilience/full?id=${r.id}`} title={r.name} date={new Date(r.created_at).toLocaleDateString()} />
                  ))}
                </CollapsibleSection>
              )}

              {romanceReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 桃花磁场指数" titleEn="Unlocked · Romance Resonance Index" count={romanceReports.length}>
                  {romanceReports.map((r) => (
                    <SimpleReportRow key={r.id} href={`/romance/full?id=${r.id}`} title={r.name} date={new Date(r.created_at).toLocaleDateString()} />
                  ))}
                </CollapsibleSection>
              )}

              {dailyTideReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 今日潮汐" titleEn="Unlocked · Today’s Tide" count={dailyTideReports.length}>
                  {dailyTideReports.map((r) => (
                    <SimpleReportRow key={r.id} href={`/daily/full?id=${r.id}`} title={r.name || r.generated_date} date={new Date(r.created_at).toLocaleDateString()} />
                  ))}
                </CollapsibleSection>
              )}

              {wealthReports.length > 0 && (
                <CollapsibleSection titleZh="已解锁订单 · 财富创造地图" titleEn="Unlocked · Wealth Creation Map" count={wealthReports.length}>
                  {wealthReports.map((r) => (
                    <SimpleReportRow key={r.id} href={`/wealth/full?id=${r.id}`} title={r.name} date={new Date(r.created_at).toLocaleDateString()} />
                  ))}
                </CollapsibleSection>
              )}

              {lifeArchetypeReports.length > 0 && (
                <CollapsibleSection titleZh="生命原型 · 八流归一" titleEn="Life Archetype · Eight-stream Convergence" count={lifeArchetypeReports.length}>
                  {lifeArchetypeReports.map((r) => (
                    <SimpleReportRow key={r.id} href={`/mini-report?id=${r.id}`} title={r.input?.name || "当前生命原型档案"} date={new Date(r.created_at).toLocaleDateString()} />
                  ))}
                </CollapsibleSection>
              )}

              <div className="mt-8 flex w-full flex-col gap-4">
                <Link
                  href="/live-as"
                  className="w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
                >
                  <Bi zh="进入我的现实回路" en="Enter my Reality Loop" />
                </Link>
                <Link
                  href="/membership"
                  className="w-full border border-amber/40 py-4 font-display text-sm uppercase tracking-widest2 text-amber transition hover:bg-amber/10"
                >
                  <Bi zh="能量交换 / 续期" en="Energy Exchange / Renew" />
                </Link>
                <ChangePasswordForm />
                <SignOutButton />
                <DeleteAccountButton />
              </div>
            </>
          ) : (
            <>
              <div className="bg-void-deep w-full rounded-sm px-8 py-10">
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
                <Bi zh="进入场域" en="Enter the field" />
              </p>
              <h1 className="mt-6 font-display text-4xl font-light text-bone">
                <Bi zh="连接到你的意识场" en="Connect to your field of consciousness" />
              </h1>
              <p className="mt-6 max-w-sm text-base leading-9 text-bone-dim">
                <Bi zh="用邮箱和密码登录或注册。验证后，你的现实回路、练习记录与显化轨迹，将在云端安全同步。" en="Sign in or register with email and password. Once verified, your Reality Loop, practice records, and manifestation trail sync securely to the cloud." />
              </p>
              <div className="mt-12 w-full">
                <LoginForm afterAuthPath={miniLink ? `/account?miniLink=${encodeURIComponent(miniLink)}` : "/live-as"} />
              </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
