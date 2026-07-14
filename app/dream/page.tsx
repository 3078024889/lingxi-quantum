export const dynamic = "force-dynamic";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DreamBackdrop from "@/components/diagrams/DreamBackdrop";
import DreamConsole from "./DreamConsole";
import { getAccess } from "@/lib/access";
import Link from "next/link";
import Bi from "@/components/Bi";

export const metadata = { title: "梦境解析 · 显化与梦境 | 灵犀 · Dream Interpretation | Lingxi", description: "记录并解析你的梦境，由灵犀以象征与心理的视角温柔解读反复出现的象征与线索。Record and interpret your dreams with Lingxi.", alternates: { canonical: "/dream" } };

export default async function DreamPage() {
  const { user, manifestActive } = await getAccess();

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <DreamBackdrop className="h-full w-full" />
          </div>
          <div className="bg-void-deep relative z-10 mx-auto max-w-2xl rounded-sm px-8 py-12">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="显化与梦境解读" en="Manifestation & Dream Interpretation" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="梦境解析" en="Dream Interpretation" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="梦，是场域与你对话的一种语言。记录它、凝视它，让那些浮现的象征被温柔地理解。心接收着来自自身未来环境的预知性印记——梦，常是其入口之一。"
              en="A dream is a language the Field uses to speak with you. Record it, gaze at it, and let the symbols that surface be gently understood. The heart receives premonitory impressions from its own future environment — and dreams are often one of the doorways in."
            />
          </p>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-2xl">
            {manifestActive ? (
              <DreamConsole />
            ) : (
              <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
                <p className="font-display text-2xl text-bone">
                  <Bi zh="开启「显化与梦境解读」以记录与解析梦境" en="Unlock Manifestation & Dream Interpretation to record and interpret dreams" />
                </p>
                <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
                  <Bi
                    zh="梦境解析属于「显化与梦境解读」订阅模块。订阅后，你的梦境记录将在云端安全同步，随时回看那些反复出现的象征与线索。"
                    en="Dream Interpretation belongs to the Manifestation & Dream Interpretation module. Once subscribed, your dream records sync securely to the cloud, so you can revisit recurring symbols and threads anytime."
                  />
                </p>
                <Link
                  href="/membership"
                  className="mt-8 inline-block bg-lattice px-10 py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
                >
                  {user ? <Bi zh="前往订阅" en="Go to subscribe" /> : <Bi zh="登录并订阅" en="Sign in & subscribe" />}
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
