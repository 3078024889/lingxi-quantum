import type { ReactNode } from "react";
import Link from "next/link";
import Bi from "./Bi";
import PracticeJournal from "@/app/practice/PracticeJournal";
import "./practice-workspace.css";

type Practice = "breath" | "intuition" | "heart-reset" | "ascending-heart";
const GUIDANCE: Record<Practice,string[]> = {"breath":["先明确本次练习的方向：照顾自己，或把理解与善意给予某段关系。让目的在第一口气息前安定下来。","以舒适节奏体验吸气、停留、呼气与静置。让注意力回到身体，不必制造特别的感受。","吸气时觉察垂直的连接，呼气时觉察向外展开的连接。只需温柔地专注，不追求清晰影像。","选择赞赏、慈悲、宽恕、谦逊、理解或勇气中的一种，把这份品质也给予自己。","回收整次体验，睁开眼睛，放下对结果的预设。带着开放的状态回到生活。"],"intuition":["放下外界的声音，安静观察此刻的内在感受。留意温柔的指引与紧张的催促有什么不同。","给感受留出空间，让它自然安顿。不急于解释，也不以影像是否清晰评价练习。","松开对答案的控制，让已有的理解在安静中沉淀。允许此刻仍然不知道。","把觉察带回身体与现实关系，以一个细小行动核对它是否让自己更清晰、更平衡。"],"heart-reset":["闭眼片刻，感受呼吸与身体的支撑，让注意力从外界缓缓回到心的中央。","回想一份温暖或感激，允许它停留。无需强迫自己改变情绪，先感受一点点柔和。","如你愿意，想象柔和的绿色光意象，为内在留出恢复与生长的空间。","睁开眼睛，看看熟悉的世界。留意自己的回应是否多了一点温暖与清晰。"],"ascending-heart":["以平稳呼吸作为入口，觉察内在的连接。让身体舒适，让注意力有一个可以回归的位置。","随呼气允许温暖与善意向外展开，把内在觉察与真实的关系和行动连接。","在练习中反复辨认自己的状态，找到可以承载清晰与平衡的节律。","让心的觉察与呼吸相互配合。练习结束后，以温和、持续的行动回应生活。"]};
type Chapter = { id: string; zh: string; en: string; level: string };

export default function PracticeWorkspace({ practice, steps, hero, children }: {
  practice: Practice; steps: Chapter[]; hero: ReactNode; children: ReactNode;
}) {
  const exercises = steps.filter(step => step.level === "h3").slice(0, practice === "breath" ? 5 : 4);
  const start = exercises[0] || steps[0];
  return <main className="practice-workspace" data-practice={practice}>
    <div className="practice-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(249,250,255,.96),rgba(249,250,255,.15)),url(/images/practice/v2/${practice}.webp)`}}>{hero}</div>
    <div className="practice-layout">
      <div className="min-w-0">
        <section className="practice-route" aria-label="练习路径">
          <div className="practice-section-title"><h2><Bi zh="循序展开，回到自己的节律" en="Unfold at your own pace" /></h2><Link href="/practice"><Bi zh="四项修炼 →" en="All four practices →" /></Link></div>
          <div className="practice-step-grid">{exercises.map((step, i) => <a href={`#${step.id}`} key={step.id}>
            <div className="practice-step-art" style={{backgroundImage:`url(/images/practice/v2/${practice}.webp)`,backgroundPosition: `${45+i*12}% 55%`,backgroundSize:"cover"}} />
            <div><small>{String(i + 1).padStart(2, "0")} · FREE</small><h3><Bi zh={step.zh} en={step.en} /></h3><p className="practice-step-description">{GUIDANCE[practice][i]}</p><span><Bi zh="完整引导与练习 →" en="Read the guidance and begin →" /></span></div>
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
