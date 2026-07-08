export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";
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

  const nameMap: Record<string, string> = {
    bundle: "四项合集",
    breath: "量子呼吸",
    intuition: "直觉智能",
    "heart-reset": "心的重置",
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
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
