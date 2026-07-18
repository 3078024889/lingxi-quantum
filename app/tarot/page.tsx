import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { getTodaysCard } from "@/lib/tarot-daily";
import TarotReveal from "./TarotReveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "今日塔罗牌 · 免费每日一卡 | 灵犀 Tarot Card of the Day — Free | Lingxi",
  description: "每天一张塔罗大阿尔卡那牌，全球用户今天看到的是同一张牌，每日午夜更新，完全免费，不需要登录。One shared tarot card each day, free, no sign-in needed, refreshes at midnight.",
  alternates: { canonical: "/tarot" },
};

export default function TarotPage() {
  const card = getTodaysCard();
  const todayLabel = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <Nav />
      <main className="pt-24">
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="rounded-sm border border-white/10 bg-void-deep p-6 sm:p-8">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
              <Bi zh="灵犀 · 今日塔罗" en="Lingxi · Tarot Card of the Day" />
            </p>
            <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
              <Bi zh="今天，全场域共享同一张牌" en="Today, everyone shares the same card" />
            </h1>
            <p className="mt-3 text-xs text-bone-dim/70">{todayLabel}</p>
            <p className="mt-4 text-base leading-8 text-bone-dim">
              <Bi
                zh="不是每人各抽各的——今天所有打开这个页面的人，看到的都是同一张牌，明天午夜会自动换一张。免费，不需要登录。"
                en="Not a personal draw — everyone who opens this page today sees the same card. It changes automatically at midnight. Free, no sign-in needed."
              />
            </p>
          </div>

          <div className="mt-8">
            <TarotReveal card={card} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
