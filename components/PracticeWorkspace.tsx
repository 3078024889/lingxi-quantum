import type { ReactNode } from "react";
import Link from "next/link";
import Bi from "./Bi";
import PracticeJournal from "@/app/practice/PracticeJournal";
import "./practice-workspace.css";

type Practice = "breath" | "intuition" | "heart-reset" | "ascending-heart";
type Chapter = { id: string; zh: string; en: string; level: string };

export default function PracticeWorkspace({ practice, steps, hero, children }: {
  practice: Practice; steps: Chapter[]; hero: ReactNode; children: ReactNode;
}) {
  const exercises = steps.filter(step => step.level === "h3");
  const start = exercises[0] || steps[0];
  return <main className="practice-workspace" data-practice={practice}>
    <div className="practice-hero">{hero}</div>
    <div className="practice-layout">
      <div className="min-w-0">
        <section className="practice-route" aria-label="练习路径">
          <div className="practice-section-title"><h2><Bi zh="循序展开，回到自己的节律" en="Unfold at your own pace" /></h2><Link href="/practice"><Bi zh="四项修炼 →" en="All four practices →" /></Link></div>
          <div className="practice-step-grid">{exercises.map((step, i) => <a href={`#${step.id}`} key={step.id}>
            <div className="practice-step-art" style={{backgroundPosition: `${(i % 4) * 33.333}% 100%`}} />
            <div><small>{String(i + 1).padStart(2, "0")} · FREE</small><h3><Bi zh={step.zh} en={step.en} /></h3><span><Bi zh="阅读引导，进入练习 →" en="Read the guidance and begin →" /></span></div>
          </a>)}</div>
        </section>
        <div className="practice-reading">{children}</div>
        <section id="practice-journal" className="practice-journal"><h2><Bi zh="今天的练习记录" en="Today's practice journal" /></h2><p><Bi zh="写下真实感受，把练习中的理解带回生活。" en="Record what you felt and carry the understanding into daily life." /></p><PracticeJournal initialPractice={practice} /></section>
      </div>
      <aside className="practice-sidebar">
        <section><small>YOUR PRACTICE</small><h2><Bi zh="从此刻开始" en="Begin from here" /></h2><p><Bi zh="先读懂步骤，再以舒适的节奏体验。不追赶进度，也不要求某一种感受。" en="Read the steps, then explore at a comfortable pace. There is no deadline or required feeling." /></p>{start && <a className="practice-start" href={`#${start.id}`}><Bi zh="开始今日练习 →" en="Begin today's practice →" /></a>}</section>
        <nav aria-label="本页阅读目录"><h2><Bi zh="阅读与练习目录" en="Reading and practice" /></h2>{steps.map(step => <a key={step.id} href={`#${step.id}`} data-level={step.level}><Bi zh={step.zh} en={step.en} /></a>)}</nav>
        <section><h2><Bi zh="把清晰带回日常" en="Bring clarity into daily life" /></h2><p><Bi zh="练习后的一个小行动，也值得被记录。你的记录会保存在自己的场域中。" en="One small action after practice is worth recording. Your entries belong to your personal field." /></p><a href="#practice-journal"><Bi zh="记录这次练习 →" en="Record this practice →" /></a></section>
      </aside>
    </div>
  </main>;
}
