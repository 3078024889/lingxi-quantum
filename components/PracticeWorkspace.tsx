import type { ReactNode } from "react";
import Link from "next/link";
import Bi from "./Bi";
import PracticeChart from "./PracticeChart";
import PracticeJournal from "@/app/practice/PracticeJournal";
import "./practice-workspace.css";

type Practice = "breath" | "intuition" | "heart-reset" | "ascending-heart";
type GuidanceItem={zh:string;en:string};
const GUIDANCE:Record<Practice,GuidanceItem[]>={
 breath:[
  {zh:"先明确本次练习的方向：照顾自己，或把理解与善意给予某段关系。让目的在第一口气息前安定下来。",en:"Set the direction of this practice first: care for yourself, or bring understanding and goodwill to a relationship. Let the intention settle before the first breath."},
  {zh:"以舒适节奏体验吸气、停留、呼气与静置。让注意力回到身体，不必制造特别的感受。",en:"Explore inhale, pause, exhale and stillness at a comfortable pace. Bring attention back to the body without manufacturing a special feeling."},
  {zh:"吸气时觉察垂直的连接，呼气时觉察向外展开的连接。只需温柔地专注，不追求清晰影像。",en:"Notice vertical connection on the inhale and outward connection on the exhale. Stay gently attentive without chasing vivid imagery."},
  {zh:"选择赞赏、慈悲、宽恕、谦逊、理解或勇气中的一种，把这份品质也给予自己。",en:"Choose appreciation, compassion, forgiveness, humility, understanding or courage, and offer that quality to yourself as well."},
  {zh:"回收整次体验，睁开眼睛，放下对结果的预设。带着开放的状态回到生活。",en:"Gather the experience, open your eyes, and release expectations about the outcome. Return to life with openness."}
 ],
 intuition:[
  {zh:"放下外界的声音，安静观察此刻的内在感受。留意温柔的指引与紧张的催促有什么不同。",en:"Set outside voices aside and quietly observe what you feel within. Notice the difference between gentle guidance and tense urgency."},
  {zh:"给感受留出空间，让它自然安顿。不急于解释，也不以影像是否清晰评价练习。",en:"Give the feeling room to settle naturally. Do not rush to explain it or judge the practice by how vivid imagery appears."},
  {zh:"松开对答案的控制，让已有的理解在安静中沉淀。允许此刻仍然不知道。",en:"Release control over the answer and let existing understanding settle in quiet. Allow yourself not to know yet."},
  {zh:"把觉察带回身体与现实关系，以一个细小行动核对它是否让自己更清晰、更平衡。",en:"Bring awareness back to the body and real relationships, then test it with one small action that supports greater clarity and balance."}
 ],
 "heart-reset":[
  {zh:"闭眼片刻，感受呼吸与身体的支撑，让注意力从外界缓缓回到心的中央。",en:"Close your eyes briefly, feel the support of breath and body, and gently bring attention from the outside world back to the center of the heart."},
  {zh:"回想一份温暖或感激，允许它停留。无需强迫自己改变情绪，先感受一点点柔和。",en:"Recall a sense of warmth or gratitude and let it remain. Do not force an emotional shift; begin with a little softness."},
  {zh:"如你愿意，想象柔和的绿色光意象，为内在留出恢复与生长的空间。",en:"If you wish, imagine a gentle green light and leave inner space for recovery and growth."},
  {zh:"睁开眼睛，看看熟悉的世界。留意自己的回应是否多了一点温暖与清晰。",en:"Open your eyes and look at the familiar world. Notice whether your response now carries a little more warmth and clarity."}
 ],
 "ascending-heart":[
  {zh:"以平稳呼吸作为入口，觉察内在的连接。让身体舒适，让注意力有一个可以回归的位置。",en:"Use steady breathing as an entry point and notice inner connection. Let the body be comfortable and give attention a place to return."},
  {zh:"随呼气允许温暖与善意向外展开，把内在觉察与真实的关系和行动连接。",en:"With the exhale, let warmth and goodwill expand outward, connecting inner awareness with real relationships and actions."},
  {zh:"在练习中反复辨认自己的状态，找到可以承载清晰与平衡的节律。",en:"Repeatedly notice your state during practice and find a rhythm that can carry clarity and balance."},
  {zh:"让心的觉察与呼吸相互配合。练习结束后，以温和、持续的行动回应生活。",en:"Let heart awareness and breath work together. After practice, respond to life with gentle, consistent action."}
 ]};
type Chapter={id:string;zh:string;en:string;level:string};

export default function PracticeWorkspace({practice,steps,hero,children}:{practice:Practice;steps:Chapter[];hero:ReactNode;children:ReactNode}){
 const exercises=steps.filter(step=>step.level==="h3").slice(0,practice==="breath"?5:4);
 const start=exercises[0]||steps[0];
 return <main className="practice-workspace" data-practice={practice}>
  <div className="practice-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(249,250,255,.96),rgba(249,250,255,.15)),url(/images/practice/v2/${practice}.webp)`}}>{hero}</div>
  <div className="practice-layout">
   <div className="min-w-0">
    <section className="practice-route" aria-label="Practice path">
     <div className="practice-section-title"><h2><Bi zh="循序展开，回到自己的节律" en="Unfold at your own pace"/></h2><Link href="/practice"><Bi zh="四项修炼 →" en="All four practices →"/></Link></div>
     <div className="practice-step-grid">{exercises.map((step,i)=>{const g=GUIDANCE[practice][i];return <a href={`#${step.id}`} key={step.id}>
      <div className="practice-step-art" style={{backgroundImage:`url(/images/practice/v2/${practice}.webp)`,backgroundPosition:`${45+i*12}% 55%`,backgroundSize:"cover"}}/>
      <div><small>{String(i+1).padStart(2,"0")} · FREE</small><h3><Bi zh={step.zh} en={step.en}/></h3>{g&&<p className="practice-step-description"><Bi zh={g.zh} en={g.en}/></p>}<span><Bi zh="完整引导与练习 →" en="Read the guidance and begin →"/></span></div>
     </a>})}</div>
    </section>
    <section className="practice-original-chart" aria-label="Practice method chart"><h2><Bi zh="把这份练习带在身边" en="Keep this practice with you"/></h2><PracticeChart src={practice==="breath"?"/images/practice/quantum-breath-chart.png":`/images/practice/${practice}-chart.jpg`} alt="Practice method chart · complete steps"/></section>
    <div className="practice-reading">{children}</div>
    <section id="practice-journal" className="practice-journal"><h2><Bi zh="今天的练习记录" en="Today's practice journal"/></h2><p><Bi zh="写下真实感受，把练习中的理解带回生活。" en="Record what you felt and carry the understanding into daily life."/></p><PracticeJournal initialPractice={practice}/></section>
   </div>
   <aside className="practice-sidebar">
    <section><small>YOUR PRACTICE</small><h2><Bi zh="从此刻开始" en="Begin from here"/></h2><p><Bi zh="先读懂步骤，再以舒适的节奏体验。不追赶进度，也不要求某一种感受。" en="Read the steps, then explore at a comfortable pace. There is no deadline or required feeling."/></p>{start&&<a className="practice-start" href={`#${start.id}`}><Bi zh="开始今日练习 →" en="Begin today's practice →"/></a>}</section>
    <nav aria-label="Reading and practice"><h2><Bi zh="阅读与练习目录" en="Reading and practice"/></h2>{steps.map(step=><a key={step.id} href={`#${step.id}`} data-level={step.level}><Bi zh={step.zh} en={step.en}/></a>)}</nav>
    <section><h2><Bi zh="把清晰带回日常" en="Bring clarity into daily life"/></h2><p><Bi zh="练习后的一个小行动，也值得被记录。你的记录会保存在自己的场域中。" en="One small action after practice is worth recording. Your entries belong to your personal field."/></p><a href="#practice-journal"><Bi zh="记录这次练习 →" en="Record this practice →"/></a></section>
   </aside>
  </div>
 </main>;
}
