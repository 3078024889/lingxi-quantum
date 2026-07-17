export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountButton from "./DeleteAccountButton";
import ReportRow from "./ReportRow";
import Bi from "@/components/Bi";
import CosmicField from "@/components/CosmicField";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "进入场域 | 灵犀 · Enter the Field | Lingxi" };

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let manifestUntil: string | null = null;
  let unlocks: string[] = [];
  if (user) {
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
  if (user) {
    const [{ data: reports }, { data: relReports }] = await Promise.all([
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
    ]);
    lifeMapReports = reports ?? [];
    relationshipReports = relReports ?? [];
  }

  const nameMap: Record<string, string> = {
    bundle: "四项合集",
    breath: "量子息法",
    intuition: "直觉丹道",
    "heart-reset": "归零心诀",
    "ascending-heart": "上升心经",
  };

  return (
    <>
      <Nav />
      <main className="pt-16">
        <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center opacity-20"><CosmicField className="h-full w-auto" /></div>
        <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-24 text-center">
          {user ? (
            <>
              <div className="bg-void-deep w-full rounded-sm px-8 py-10">
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
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
                    {unlocks.length
                      ? unlocks.map((id) => nameMap[id] || id).join("、")
                      : ""}
                    {!unlocks.length && <Bi zh="暂无" en="None yet" />}
                  </p>
                </div>
              </div>

              {lifeMapReports.length > 0 && (
                <div className="mt-3 w-full space-y-2 text-left">
                  <p className="px-1 text-sm text-bone-dim"><Bi zh="我的生命图谱报告" en="My Life Map Reports" /></p>
                  {/* 万一同一个人测过几十上百次，这个列表不能无限往下长，把
                     底下的修改密码/退出登录这些按钮越推越远——限定一个
                     最大高度，超出的部分自己滚动。 */}
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {lifeMapReports.map((r) => (
                    <ReportRow
                      key={r.id}
                      id={r.id}
                      title={r.core_type_name}
                      date={new Date(r.created_at).toLocaleDateString()}
                    />
                  ))}
                  </div>
                </div>
              )}

              {relationshipReports.length > 0 && (
                <div className="mt-3 w-full space-y-2 text-left">
                  <p className="px-1 text-sm text-bone-dim"><Bi zh="我的关系共振图谱" en="My Relationship Resonance Maps" /></p>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {relationshipReports.map((r) => (
                    <Link
                      key={r.id}
                      href={`/relationship/full?id=${r.id}`}
                      className="flex items-center justify-between rounded-sm border border-white/10 bg-void-deep px-5 py-3 transition hover:border-lattice/40"
                    >
                      <span className="font-display text-lattice">{r.name_a} × {r.name_b}</span>
                      <span className="text-xs text-bone-dim">{new Date(r.created_at).toLocaleDateString()}</span>
                    </Link>
                  ))}
                  </div>
                </div>
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
              <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
                <Bi zh="进入场域" en="Enter the field" />
              </p>
              <h1 className="mt-6 font-display text-4xl font-light text-bone">
                <Bi zh="连接到你的意识场" en="Connect to your field of consciousness" />
              </h1>
              <p className="mt-6 max-w-sm text-base leading-9 text-bone-dim">
                <Bi zh="用邮箱和密码登录或注册。验证后，你的现实回路、练习记录与显化轨迹，将在云端安全同步。" en="Sign in or register with email and password. Once verified, your Reality Loop, practice records, and manifestation trail sync securely to the cloud." />
              </p>
              <div className="mt-12 w-full">
                <LoginForm />
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
