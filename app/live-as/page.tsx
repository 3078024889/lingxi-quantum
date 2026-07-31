export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RealityLoop from "./RealityLoop";
import AskLingxi from "./AskLingxi";
import { getAccess } from "@/lib/access";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";

const LIVE_AS_FAQ: BilingualFaqItem[] = [
  {
    qZh: "显化在灵犀场里是如何运作的？", qEn: "How does manifestation work on Lingxi Field?",
    aZh: "显化，并不是简单地等待某件事发生，而是意识、选择与现实行动逐渐形成一致。你相信什么、你关注什么、你如何选择、你如何行动，都在不断影响你正在创造的生活版本。灵犀场中的显化练习，通过意识聚焦（让你清晰看见真正想创造的方向）、状态连接（进入那个已经与目标产生共振的自己）、行动对齐（让每天的选择逐渐靠近你想体验的现实）——当内在频率、意识方向与现实行动开始一致，很多过去看似遥远的目标，会逐渐出现新的路径：新的机会，新的关系，新的创造方式，也包括意识本身的持续扩展。显化不是逃避现实，而是成为那个能够承载你想要现实的自己。",
    aEn: "Manifestation isn't simply waiting for something to happen — it's the gradual alignment of consciousness, choice, and real-world action. What you believe, what you focus on, how you choose, and how you act all keep shaping the version of life you're creating. The manifestation practice on Lingxi Field works through focused awareness (seeing clearly what you truly want to create), state connection (entering the version of yourself already resonating with that goal), and action alignment (letting daily choices move closer to the reality you want). When inner frequency, conscious direction, and real action begin to align, goals that once felt distant tend to open new paths — new opportunities, new relationships, new ways of creating, and an ongoing expansion of consciousness itself. Manifestation isn't escaping reality — it's becoming the self able to carry the reality you want.",
  },
  {
    qZh: "显化练习如何帮助自己？", qEn: "How does the manifestation practice help me?",
    aZh: "灵犀场显化练习，不是要求你幻想一个不存在的世界，它更像是一种意识训练——帮助你发现哪些信念正在限制自己、哪些旧模式正在重复、哪些选择正在远离真正想要的人生。通过持续觉察，你会越来越清楚什么是恐惧驱动的选择，什么是真正来自内心的创造。当意识发生改变，现实也会开始出现新的展开方式。",
    aEn: "The Lingxi Field manifestation practice doesn't ask you to imagine a world that doesn't exist — it's closer to a form of consciousness training, helping you discover which beliefs are limiting you, which old patterns keep repeating, and which choices are pulling you away from the life you actually want. Through ongoing awareness, you become increasingly clear on what's a fear-driven choice versus what truly comes from creation within. As consciousness shifts, reality tends to open new ways of unfolding too.",
  },
];


import CosmicField from "@/components/CosmicField";

export const metadata = {
  title: "显化活在此版本中的你 · 现实回路 | 灵犀 · Live as the You in This Version | Lingxi",
  description: "现实回路显化练习：每天 5–10 分钟，先在意识里活成「已经拥有」的版本，写下今日感受，让现实随之对齐。The Reality Loop manifestation practice — live as the version who already has it. | 灵犀场 LingxiField",
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
          <div className="bg-void-deep mx-auto max-w-3xl rounded-sm px-8 py-12">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
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
        <div className="mx-auto max-w-2xl px-6 pb-24">
          <FaqSection items={LIVE_AS_FAQ} />
        </div>
      </main>
      <Footer />
    </>
  );
}
