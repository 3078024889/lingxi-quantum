export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import EarthGrid from "@/components/EarthGrid";
import PlanButton from "./PlanButton";
import {
  cultivationProducts,
  manifestationProducts,
  type Product,
} from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import Bi from "@/components/Bi";

export const metadata = { title: "能量交换 | 灵犀 · Energy Exchange | Lingxi", description: "能量交换：解锁修炼技术（永久）与「显化与梦境解读」订阅模块。完成后场域自动开启。Unlock the practices and the Manifestation & Dream Interpretation module.", alternates: { canonical: "/membership" } };

function Card({
  product,
  loggedIn,
}: {
  product: Product;
  loggedIn: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-sm border p-8 ${
        product.highlight
          ? "border-amber/50 bg-amber/5"
          : "border-white/10 bg-void-deep"
      }`}
    >
      {product.highlight && (
        <span className="mb-4 inline-block w-fit rounded-sm bg-amber/20 px-3 py-1 font-display text-xs tracking-widest2 text-amber">
          <Bi zh="推荐" en="Recommended" />
        </span>
      )}
      <h3 className="font-display text-2xl text-bone"><Bi zh={product.name} en={product.nameEn} /></h3>
      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-4xl text-lattice">
          ${product.priceUsd}
        </span>
        <span className="mb-1.5 text-sm text-bone-dim">
          {product.type === "permanent" ? (
            <Bi zh="永久" en="lifetime" />
          ) : product.days === 1 ? (
            <Bi zh="/ 天" en="/ day" />
          ) : product.days === 30 ? (
            <Bi zh="/ 月" en="/ month" />
          ) : (
            <Bi zh="/ 年" en="/ year" />
          )}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-bone-dim">
        <Bi zh={product.note} en={product.noteEn} />
      </p>
      <div className="mt-8">
        <PlanButton
          productId={product.id}
          loggedIn={loggedIn}
          highlight={product.highlight}
        />
      </div>
    </div>
  );
}

export default async function MembershipPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25">
            <EarthGrid className="h-[520px] w-[520px]" />
          </div>
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="能量交换" en="Energy Exchange" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="能量交换" en="Energy Exchange" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi zh="完成能量交换后，场域将自动为你开启。" en="Once the energy exchange is complete, the Field opens for you automatically." />
          </p>
        </section>

        {/* 一、修炼技术 */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="一 · 修炼技术" en="I · Practices" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim">
                <Bi zh="单次能量交换，永久有效" en="A single energy exchange — yours forever" />
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cultivationProducts.map((p) => (
                <Card key={p.id} product={p} loggedIn={!!user} />
              ))}
            </div>
          </div>
        </section>

        {/* 二、显化与梦境解读 */}
        <section className="border-t border-white/5 px-6 py-16 pb-28">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-light text-bone">
                <Bi zh="二 · 显化与梦境解读" en="II · Manifestation & Dream Interpretation" />
              </h2>
              <p className="mt-3 text-sm text-bone-dim"><Bi zh="订阅制" en="Subscription" /></p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {manifestationProducts.map((p) => (
                <Card key={p.id} product={p} loggedIn={!!user} />
              ))}
            </div>
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-6 text-bone-dim/60">
            <Bi
              zh="能量交换完成后，场域将自动开启，无需等待人工确认。修炼技术永久有效；显化与梦境解读到期可续期，时间自动累加。"
              en="Once the energy exchange completes, the Field opens automatically — no manual confirmation needed. Practices are yours forever; Manifestation & Dream Interpretation can be renewed on expiry, with time added automatically."
            />
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
