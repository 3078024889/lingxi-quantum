export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RealityLoop from "./RealityLoop";
import AskLingxi from "./AskLingxi";
import { getAccess } from "@/lib/access";
import Bi from "@/components/Bi";
import CosmicField from "@/components/CosmicField";

export const metadata = {
  title: "显化活在此版本中的你 · 现实回路 | 灵犀 · Live as the You in This Version | Lingxi",
  description: "现实回路显化练习：每天 5–10 分钟，先在意识里活成「已经拥有」的版本，写下今日感受，让现实随之对齐。The Reality Loop manifestation practice — live as the version who already has it. | 灵犀 Lingxi",
  alternates: { canonical: "/live-as" },
};

export default async function LiveAsPage() {
  const { user, manifestActive } = await getAccess();

  return (
    <>
      <Nav />
      <main className="pt-16">
        <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25"><CosmicField className="h-full w-auto" /></div>
          <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
            <Bi zh="显化与梦境解读" en="Manifestation & Dream Interpretation" />
          </p>
          <h1 className="mt-6 font-display text-4xl font-light text-bone sm:text-5xl">
            <Bi zh="显化活在此版本中的你" en="Live as the you in this version" />
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-9 text-bone-dim">
            <Bi
              zh="潜意识分不清现实与想象。每天花 5–10 分钟，进入已经拥有的生活状态，写下今天的感受与你正在做的事——像它已经发生一样。不断重复，保持对齐、保持信任与连贯，直到某天，物质世界中早已对齐的指引来临。显化达成，感恩。"
              en="The subconscious cannot tell reality from imagination. Spend 5–10 minutes a day entering the state of already having it — write today's feelings and what you are doing, as if it has already happened. Repeat, stay aligned, keep trust and coherence, until one day the guidance already aligned in the material world arrives. Manifested, with gratitude."
            />
          </p>
          </div>
        </section>

        <section className="px-6 pb-28">
          <div className="mx-auto max-w-2xl space-y-16">
            {manifestActive ? (
              <RealityLoop />
            ) : (
              <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
                <p className="font-display text-2xl text-bone">
                  <Bi zh="开启「显化与梦境解读」以进入现实回路" en="Unlock Manifestation & Dream Interpretation to enter the Reality Loop" />
                </p>
                <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
                  <Bi
                    zh="现实回路是「显化与梦境解读」订阅模块的核心练习。订阅后，你的愿景与每日书写将在云端安全同步，换任何设备都能继续。"
                    en="The Reality Loop is the core practice of the Manifestation & Dream Interpretation module. Once subscribed, your vision and daily writing sync securely to the cloud, so you can continue on any device."
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

            {user ? (
              <AskLingxi />
            ) : (
              <div className="rounded-sm border border-white/10 bg-void-deep p-8 text-center">
                <p className="font-display text-xl text-bone">
                  <Bi zh="登录后即可提问灵犀" en="Sign in to ask Lingxi" />
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-bone-dim">
                  <Bi
                    zh="有任何关于多维叙事或修炼技术的疑问，登录后都可以在这里发问给灵犀场域，记录进你自己的日记。"
                    en="Any question about the narratives or practices — sign in to ask Lingxi here, recorded in your own journal."
                  />
                </p>
                <Link
                  href="/account"
                  className="mt-6 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-amber hover:text-amber"
                >
                  <Bi zh="进入场域" en="Enter the field" />
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
