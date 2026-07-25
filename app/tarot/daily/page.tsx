import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { getTodaysCard } from "@/lib/tarot-daily";
import TarotReveal from "./TarotReveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "灵犀量子塔罗 · 免费每日一卡 | 灵犀 Lingxi Quantum Tarot — Free Daily Card | Lingxi",
  description: "灵犀场原创78张卡牌体系，每天一张，全球用户今天看到的是同一张牌，每日午夜更新，完全免费，不需要登录。Lingxi's original 78-card system — one shared card each day, free, no sign-in needed.",
  alternates: { canonical: "/tarot/daily" },
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
              <Bi zh="灵犀量子塔罗 · 今日一卡" en="Lingxi Quantum Tarot · Today's Card" />
            </p>
            <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
              <Bi zh="七十八张里，今天只有一张，被整个场域同时看见" en="Of 78 cards, only one is being seen by the entire field today" />
            </h1>
            <p className="mt-3 text-xs text-bone-dim/85">{todayLabel}</p>
            <p className="mt-4 text-base leading-8 text-bone-dim">
              <Bi
                zh="不是你抽到的，是场域今天正在显化的——此刻打开这个页面的每一个人，看见的都是同一个象征。它不会一直是这张。但今天，是。"
                en="Not one you drew — it's the one the field is manifesting today. Everyone who opens this page right now sees the same symbol. It won't always be this one. But today, it is."
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
