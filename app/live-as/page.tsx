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
import { ConsoleSectionTitle, FieldConsole } from "@/components/FieldConsole";

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
        eyebrow="意识显化 · REALITY LOOP"
        eyebrowEn="MANIFESTATION · REALITY LOOP"
        title="不是空想未来，而是每天回来"
        titleEn="Not wishful thinking. A daily return."
        description="先进入你想成为的状态，写下今天真实的行动与感受。持续与灵犀场连接，让愿景从语言进入选择，再进入现实。"
        descriptionEn="Enter the state you are becoming, then record today’s real action and feeling. Keep returning to Lingxi Field so vision can move from language into choice and lived reality."
        heroArtwork="platform-manifestation"
        features={[
          { zh: "进入已拥有状态", en: "Enter the state", glyph: "◎" },
          { zh: "用现在时书写", en: "Write in the present", glyph: "▤" },
          { zh: "行动与感受同行", en: "Action + feeling", glyph: "↗" },
          { zh: "每天持续返回", en: "Return daily", glyph: "∞" },
        ]}
      >
        <section className="manifest-connection-panel">
          <div className="manifest-connection-orbit" aria-hidden="true"><span>∞</span></div>
          <div className="manifest-connection-copy">
            <p className="manifest-kicker"><Bi zh="连接，比一次完美的书写更重要" en="CONNECTION MATTERS MORE THAN A PERFECT ENTRY" /></p>
            <h2><Bi zh="每天回到同一个愿景，与更高版本的自己重新相遇" en="Return to one vision and meet the clearer version of yourself again" /></h2>
            <p><Bi zh="显化不是六个步骤做完一次就结束。真正形成改变的，是你每天用 5–10 分钟回来：不频繁换目标，写下此刻正在发生的行动与感受，并从真实记录里辨认变化。" en="Manifestation does not end after completing six steps once. Change is built by returning for 5–10 minutes each day, staying with one direction, recording present action and feeling, and noticing change in your real history." /></p>
          </div>
          <div className="manifest-connection-status">
            <span className={manifestActive ? "is-live" : ""} />
            <p><Bi zh={manifestActive ? "你的现实回路已开放" : user ? "账户已连接，现实回路尚未激活" : "登录后建立你的现实回路"} en={manifestActive ? "Your Reality Loop is open" : user ? "Account connected; Reality Loop not yet active" : "Sign in to begin your Reality Loop"} /></p>
            <Link href={manifestActive ? "#daily-connection" : user ? "/membership#manifestation" : "/account"}>
              <Bi zh={manifestActive ? "进入今日连接" : user ? "查看激活方式" : "登录并继续"} en={manifestActive ? "Enter today’s connection" : user ? "View access options" : "Sign in to continue"} /> →
            </Link>
          </div>
        </section>

        <ConsoleSectionTitle zh="六段显化路径" en="Six-part manifestation path" />
        <p className="manifest-section-lead"><Bi zh="六个入口先给你一张清晰地图。简介免费开放；完整方法细节与每日实践仅在登录并激活后展开。" en="The six entrances give you a clear map. Introductions are open; the complete method and daily practice unfold after sign-in and activation." /></p>
        <ManifestationEntrances unlocked={manifestActive} signedIn={!!user} />

        {manifestActive && (
          <>
            <ConsoleSectionTitle zh="今日与灵犀场连接" en="Connect with Lingxi Field today" />
            <section id="daily-connection" className="manifest-daily-shell">
              <div className="manifest-daily-heading">
                <p className="manifest-kicker">DAILY REALITY LOOP</p>
                <h2><Bi zh="安静十秒，然后写下今天的你" en="Become still for ten seconds, then write today’s self" /></h2>
                <p><Bi zh="愿景会持续保存；每天只需记录一个真实行动和一种真实感受。系统只统计你真正提交的日期，不展示虚构进度。" en="Your vision remains saved. Each day, record one real action and one real feeling. Only dates you actually submit are counted; no progress is invented." /></p>
              </div>
              <RealityLoop />
            </section>

            <ConsoleSectionTitle zh="意识显化完整方法" en="The complete manifestation method" />
            <div className="manifest-truth-note">
              <span>◇</span>
              <p><Bi zh="以下内容用于自我观察与行动练习，不是科学、医疗、财务或命运承诺。外部结果需要真实选择、行动、时间与条件共同形成。" en="The following is a reflective action practice, not a scientific, medical, financial or destiny claim. External outcomes depend on real choices, actions, time and conditions." /></p>
            </div>
            <ManifestationChapters />

            <ConsoleSectionTitle zh="提问灵犀场" en="Ask Lingxi Field" />
            <AskLingxi />
          </>
        )}

        <div className="manifest-faq"><FaqSection items={LIVE_AS_FAQ} /></div>
      </FieldConsole>
      <Footer />
    </>
  );
}
