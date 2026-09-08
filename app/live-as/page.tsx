export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RealityLoop from "./RealityLoop";
import AskLingxi from "./AskLingxi";
import { getAccess } from "@/lib/access";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole } from "@/components/FieldConsole";

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
      <FieldConsole
        eyebrow="意识显化 · REALITY ALIGNMENT" eyebrowEn="MANIFESTATION · REALITY ALIGNMENT"
        title="把意图，变成真实的现实" titleEn="Turn intention into lived reality"
        description="从一个清晰的想法开始，让觉察、选择与行动彼此对齐，把你想要的生活显化为看得见的结果。"
        descriptionEn="Begin with a clear intention, then align awareness, choice and action until the life you imagine becomes a visible result."
        heroArtwork="platform-manifestation"
        features={[{zh:"意图澄明",en:"Clear intention",glyph:"✧"},{zh:"现实校准",en:"Reality alignment",glyph:"◎"},{zh:"灵感行动",en:"Inspired action",glyph:"↗"},{zh:"持续回看",en:"Ongoing reflection",glyph:"◌"}]}
        aside={<>
          <ConsoleStatus title="你的显化空间" titleEn="Your manifestation space"><p className="mt-3"><Bi zh={user ? (manifestActive ? "现实回路已开启，你可以继续今日记录。" : "你的账户已连接；开启意识显化后即可同步完整现实回路。") : "登录后，你的意图、观察与行动记录会进入个人场域。"} en={user ? (manifestActive ? "Your Reality Loop is active. Continue today's entry." : "Your account is connected. Unlock Manifestation to sync the full Reality Loop.") : "Sign in to carry intentions, reflections and actions into your private field."} /></p><Link href={user ? (manifestActive ? "#reality-loop" : "/membership") : "/account"} className="mt-4 inline-flex text-xs text-lattice"><Bi zh={user && manifestActive ? "继续现实回路 →" : "进入个人场域 →"} en={user && manifestActive ? "Continue the loop →" : "Enter your field →"} /></Link></ConsoleStatus>
          <ConsoleStatus glyph="☀" title="今日指引" titleEn="Today’s orientation" tone="gold"><p className="mt-3"><Bi zh="先写清真正想创造的经验，再选择今天能够完成的一步。现实校准从可验证的行动开始。" en="Name the experience you truly want, then choose one action possible today. Alignment begins with verifiable action." /></p></ConsoleStatus>
        </>}
      >
        <div id="reality-loop">
          <ConsolePanel>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-lattice"><Bi zh="意图工作台" en="INTENTION WORKSPACE" /></p>
            <h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="你想让什么，开始进入现实？" en="What do you want to bring into reality?" /></h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-bone-dim"><Bi zh="每天用 5–10 分钟写下愿景、今天真实的状态和下一步行动。系统保留原有的完整现实回路，不用虚拟进度替代真实记录。" en="Spend 5–10 minutes naming your vision, current state and next action. Your complete Reality Loop remains here, with real records rather than invented progress." /></p>
          </ConsolePanel>
          <div className="mt-4">
            {manifestActive ? (
              <RealityLoop />
            ) : (
              <div className="rounded-sm border border-lattice/20 bg-lattice/5 p-8 text-center">
                <p className="font-display text-2xl text-bone">
                  <Bi zh="开启「意识显化」以进入现实回路" en="Unlock Manifestation to enter the Reality Loop" />
                </p>
                <p className="mx-auto mt-4 max-w-md text-base leading-8 text-bone-dim">
                  <Bi
                    zh="现实回路是「意识显化」订阅模块的核心练习。订阅后，你的愿景、观察与每日行动记录将在云端安全同步，换任何设备都能继续。"
                    en="The Reality Loop is the core practice of the Manifestation subscription. Once subscribed, your vision, observations and daily actions sync securely to the cloud, so you can continue on any device."
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
          <ConsoleSectionTitle zh="显化路径" en="Manifestation path" />
          <div className="lx-console-card-grid">
            <ConsoleCard href="/learn/manifestation-journal" artwork="platform-knowledge" title="愿景输入" titleEn="Goal Intention" description="写下内心真正渴望的经验，让意图拥有清晰边界。" descriptionEn="Give your desired experience a clear and honest boundary." />
            <ConsoleCard href="/learn/manifestation-methods" artwork="platform-manifestation" title="显化蓝图" titleEn="Manifestation Blueprint" description="把愿景拆解为状态、选择、资源与行动。" descriptionEn="Translate vision into state, choice, resources and action." />
            <ConsoleCard href="/daily" artwork="field-tide" title="现实校准" titleEn="Reality Alignment" description="对齐内在信念与外在行动，校准当下。" descriptionEn="Align inner belief and outer action in the present." />
            <ConsoleCard href="/learn/manifestation-signs" artwork="field-resilience" title="进程回看" titleEn="Progress Reflection" description="从真实记录中看见变化，而不是追逐虚构征兆。" descriptionEn="Witness change through your records, not invented signs." />
          </div>
          <div className="mt-8">
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
        </div>
        <div className="mt-10">
          <FaqSection items={LIVE_AS_FAQ} />
        </div>
      </FieldConsole>
      <Footer />
    </>
  );
}
