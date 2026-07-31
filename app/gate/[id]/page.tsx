import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateVisual from "@/components/GateVisual";
import GateInvitations from "./GateInvitations";
import { gates, getGate } from "@/lib/gates";
import Bi from "@/components/Bi";

export function generateStaticParams() {
  return gates.map((g) => ({ id: g.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const gate = getGate(params.id);
  return { title: gate ? `${gate.title} ${gate.titleEn} · 重塑潜意识 Rewrite the Subconscious | 灵犀场 LingxiField` : "灵犀场 LingxiField" };
}

export default function GatePage({ params }: { params: { id: string } }) {
  const gate = getGate(params.id);
  if (!gate) notFound();

  return (
    <>
      <Nav />
      <main className="pt-16">
        {/* 头图 */}
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="flex h-full items-center justify-center opacity-50">
              <GateVisual id={gate.id} className="h-[120%] w-auto" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-void/30 via-void/15 to-void/40" />
          </div>
          <div>
            <span className="font-display text-6xl text-lattice">
              {gate.glyph}
            </span>
            <h1 className="mt-4 font-display text-5xl font-light text-bone sm:text-6xl">
              <Bi zh={gate.title} en={gate.titleEn} />
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-display text-xl leading-9 text-bone sm:text-2xl">
              <Bi zh={gate.line} en={gate.lineEn} />
            </p>
          </div>
        </section>

        {/* 引介 */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <div className="bg-reading-glass px-8 py-10">
            <p className="text-lg leading-10 text-bone-dim"><Bi zh={gate.intro} en={gate.introEn} /></p>

            <GateInvitations
              gateId={gate.id}
              gateTitle={gate.title}
              gateLine={gate.line}
              pool={gate.prompts}
              poolEn={gate.promptsEn}
            />
            </div>

            <div className="mt-16 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/live-as"
                className="bg-lattice px-8 py-4 text-center font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
              >
                <Bi zh="带着它进入现实回路" en="Carry it into the Reality Loop" />
              </Link>
              <Link
                href="/#gates"
                className="border border-white/15 px-8 py-4 text-center font-display text-sm uppercase tracking-widest2 text-bone-dim transition hover:border-lattice/40 hover:text-lattice"
              >
                <Bi zh="返回重塑潜意识" en="Back to Rewrite the Subconscious" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
