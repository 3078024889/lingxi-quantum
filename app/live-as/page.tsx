export const dynamic = "force-dynamic";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RealityLoop from "./RealityLoop";
import AskLingxi from "./AskLingxi";
import { ManifestationChapters, ManifestationEntrances } from "./ManifestationGuide";
import { getAccess } from "@/lib/access";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import { FieldConsole } from "@/components/FieldConsole";

const LIVE_AS_FAQ: BilingualFaqItem[] = [
  {
    qZh: "意识显化是在等待愿望自动发生吗？",
    qEn: "Is manifestation about waiting for a wish to happen?",
    aZh: "不是。灵犀场把意识显化设计成一条可以每天实践和回看的现实回路：澄清愿景、进入更稳定的内在状态、写下此刻的行动与感受，再回到现实继续行动。它不会预测或保证任何特定结果。",
    aEn: "No. Lingxi Field treats Manifestation as a Reality Loop you can practise and review each day: clarify a vision, enter a steadier inner state, record present action and feeling, then return to real life and act. It does not predict or guarantee a particular outcome.",
  },
  {
    qZh: "每天需要做多久？",
    qEn: "How long does the daily practice take?",
    aZh: "5–10 分钟就够。比一次写很多更重要的，是每天回到同一个愿景和感受基调，写下真实而具体的行动，并持续形成自己的记录。",
    aEn: "Five to ten minutes is enough. More important than writing a lot at once is returning to the same vision and emotional baseline, recording a real action, and building your own history over time.",
  },
  {
    qZh: "哪些内容免费，哪些需要激活？",
    qEn: "What is open and what requires access?",
    aZh: "六个阶段的方向简介免费可见。登录并激活意识显化后，可展开六章完整方法、每日愿景与行动记录、签到回看、场域回应及提问灵犀场。页面不会用示例数字冒充你的真实进度。",
    aEn: "The six stage introductions are open. After signing in and activating Manifestation, you can access the complete six-chapter method, daily vision and action records, check-in history, field responses and Ask Lingxi Field. The page never presents example numbers as your progress.",
  },
];

export const metadata = {
  title: "意识显化 · 每日现实回路 | 灵犀场 Lingxi Field",
  description: "每天 5–10 分钟，进入已经拥有的状态，写下行动与感受，持续返回灵犀场，建立可回看的现实回路。",
  alternates: { canonical: "/live-as" },
};

export default async function LiveAsPage() {
  const { user, manifestActive } = await getAccess();

  return (
    <>
      <Nav />
      <FieldConsole
        className="mf-page"
        eyebrow={manifestActive ? "意识显化 · MANIFESTATION" : "意识显化 · REALITY LOOP"}
        eyebrowEn={manifestActive ? "MANIFESTATION · DAILY CONNECTION" : "MANIFESTATION · REALITY LOOP"}
        title={manifestActive ? "今日与灵犀场连接" : "意识显化"}
        titleEn={manifestActive ? "Connect with Lingxi Field today" : "Manifestation"}
        description={manifestActive ? "持续的连接，会让你在日常中看见更多可能。" : "进入状态，写下今天，让行动与感受一起发生；每天回来，与正在成为的自己重新相遇。"}
        descriptionEn={manifestActive ? "A continuing connection helps you notice more possibilities in everyday life." : "Enter the state, write today, and let action and feeling move together. Return each day to meet the self you are becoming."}
        heroImage="/images/manifestation/hero-v2.png"
        features={[
          { zh: "进入已拥有状态", en: "Enter the state", glyph: "◎" },
          { zh: "用现在时书写", en: "Write in the present", glyph: "▤" },
          { zh: "行动与感受同行", en: "Action + feeling", glyph: "↗" },
          { zh: "每天持续返回", en: "Return daily", glyph: "∞" },
        ]}
      >
        {!manifestActive ? (
          <>
            <section className="mf-return-panel">
              <div className="mf-orbit" aria-hidden="true">∞</div>
              <div>
                <p className="mf-kicker"><Bi zh="连接，比一次完美的书写更重要" en="CONNECTION OVER PERFECTION" /></p>
                <h2><Bi zh="每天回到同一个愿景，与更高版本的自己重新相遇" en="Return to one vision and meet the clearer version of yourself again" /></h2>
                <p><Bi zh="每天留出 5–10 分钟，不急着证明结果，只写下正在发生的行动与感受。一次次真实返回，会让变化有迹可循。" en="Set aside five to ten minutes each day. Do not rush to prove an outcome; record the action and feeling already present. Each honest return leaves a trace of change." /></p>
              </div>
              <div className="mf-return-action"><span /><p><Bi zh={user ? "你的个人空间已连接" : "从今天，留下第一条真实记录"} en={user ? "Your personal space is connected" : "Leave your first real record today"} /></p><Link href={user ? "/membership#manifestation" : "/account"}><Bi zh={user ? "开启意识显化" : "进入我的场域"} en={user ? "Open Manifestation" : "Enter My Field"} /> →</Link></div>
            </section>

            <header className="mf-section-head"><div><span /><h2><Bi zh="六段显化路径" en="Six-part manifestation path" /></h2></div><p><Bi zh="从安静下来，到把愿景写进今天，再以行动、感受与持续回看来照见变化。" en="From stillness to writing the vision into today, then noticing change through action, feeling and continued return." /></p></header>
            <ManifestationEntrances unlocked={false} signedIn={!!user} />
          </>
        ) : (
          <>
            <section id="daily-connection" className="mf-daily-panel">
              <RealityLoop />
            </section>

            <header className="mf-section-head"><div><span /><h2><Bi zh="意识显化完整方法" en="The complete manifestation method" /></h2></div><p><Bi zh="先读懂六段方法，再把它们带回今天的书写。" en="Understand the six parts, then bring them into today's writing." /></p></header>
            <div className="mf-practice-note"><span>✦</span><p><Bi zh="这是自我观察与行动练习。现实变化仍由你的选择、行动、时间与条件共同形成。" en="This is a reflective action practice. Real change still forms through your choices, actions, time and circumstances." /></p></div>
            <ManifestationEntrances unlocked signedIn />
            <ManifestationChapters />

            <header className="mf-final-head">
              <p><Bi zh="终章 · 继续深挖" en="FINAL CHAPTER · GO DEEPER" /></p>
              <h2><Bi zh="方法走完之后，把不确定的地方交给灵犀场" en="After the method, bring what remains uncertain to Lingxi Field" /></h2>
              <span><Bi zh="先完成六段方法与今日记录，再提出一个具体、可回到现实验证的问题。" en="Complete the path and today&apos;s record first, then ask one concrete question you can test in reality." /></span>
            </header>
            <section className="mf-support-grid"><div><AskLingxi /></div></section>
            <div className="mf-faq mf-faq-final"><FaqSection items={LIVE_AS_FAQ} /></div>
          </>
        )}

        {!manifestActive && <div className="mf-faq"><FaqSection items={LIVE_AS_FAQ} /></div>}
      </FieldConsole>
      <Footer />
    </>
  );
}
