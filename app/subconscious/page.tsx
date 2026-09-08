import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GateVisual from "@/components/GateVisual";
import Bi from "@/components/Bi";
import { gates } from "@/lib/gates";
import { ConsoleCard, ConsolePanel, ConsoleSectionTitle, ConsoleStatus, FieldConsole } from "@/components/FieldConsole";

export const metadata: Metadata = {
  title: "重塑潜意识 FREE｜灵犀场 LINGXIFIELD",
  description: "通过六道自我观察入口，看见反复出现的信念、关系与选择模式。",
  alternates: { canonical: "/subconscious" },
};

export default function SubconsciousPage() {
  return <><Nav /><FieldConsole eyebrow="重塑潜意识 · FREE" eyebrowEn="REWRITE THE SUBCONSCIOUS · FREE" title="改变内在程序，创造新的现实" titleEn="Rewrite inner patterns, create new reality" description="你的外在经验，会映照长期形成的信念与选择方式。以六道观察入口看见、理解、松动，并写下新的内在脚本。" descriptionEn="Outer experience can reflect long-formed beliefs and choices. Six free observation gates help you see, understand and loosen old patterns before writing a new inner script." heroArtwork="platform-subconscious" features={[{zh:"结构化自省",en:"Structured reflection",glyph:"✧"},{zh:"深度陪伴",en:"Guided depth",glyph:"◉"},{zh:"隐私优先",en:"Privacy first",glyph:"▣"},{zh:"全部免费",en:"Completely free",glyph:"♧"}]} aside={<><ConsoleStatus title="重塑不是删除" titleEn="Rewriting is not erasing"><p className="mt-3"><Bi zh="这套路径不诊断、不治疗，也不替你定义经历。它帮助你辨认反复出现的信念、触发与选择，在理解之后获得新的行动空间。" en="This path does not diagnose, treat or define your experience. It helps you notice recurring beliefs, triggers and choices, creating room for a different action after understanding." /></p></ConsoleStatus><ConsoleStatus glyph="✦" title="建议次序" titleEn="Suggested sequence" tone="gold"><ul><li><Bi zh="从一件具体事件开始" en="Begin with one concrete event" /></li><li><Bi zh="分开事实与解释" en="Separate fact from interpretation" /></li><li><Bi zh="辨认身体与情绪反应" en="Notice body and emotion" /></li><li><Bi zh="写下更具主权的选择" en="Name a more sovereign choice" /></li></ul></ConsoleStatus></>}>
    <ConsolePanel><p className="text-xs font-semibold uppercase tracking-[.18em] text-lattice"><Bi zh="内在脚本工作台" en="INNER SCRIPT WORKSPACE" /></p><h2 className="mt-3 text-2xl font-semibold text-bone"><Bi zh="你想重新理解哪一种反复？" en="What recurring pattern do you want to understand anew?" /></h2><p className="mt-3 max-w-3xl text-sm leading-7 text-bone-dim"><Bi zh="选择最贴近当下的一道入口。每道入口都是完整的自我观察练习，全部免费开放；需要专业心理或医疗帮助时，请优先联系合格专业人士。" en="Choose the gate closest to the present. Every entrance is a complete, free self-reflection practice. If professional mental-health or medical help is needed, contact a qualified practitioner first." /></p></ConsolePanel>
    <ConsoleSectionTitle zh="六道观察入口" en="Six observation gates" />
    <div className="lx-console-card-grid">{gates.map((gate,index)=><Link key={gate.id} href={`/gate/${gate.id}`} className="lx-console-card group"><div className="h-[118px] overflow-hidden"><GateVisual id={gate.id} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="lx-console-card-copy"><span className="lx-console-card-badge">FREE · 0{index+1}</span><h3><Bi zh={gate.title} en={gate.titleEn} /></h3><p className="lx-console-card-en">{gate.titleEn}</p><p><Bi zh={gate.line} en={gate.lineEn} /></p><span className="lx-console-card-arrow">→</span></div></Link>)}</div>
    <ConsoleSectionTitle zh="重塑路径" en="Rewriting path" />
    <div className="lx-console-card-grid"><ConsoleCard href={`/gate/${gates[0]?.id}`} artwork="platform-subconscious" title="信念扫描" titleEn="Belief Scan" description="辨认限制性信念如何进入当下解释。" descriptionEn="See how limiting beliefs shape present interpretation."/><ConsoleCard href={`/gate/${gates[1]?.id}`} artwork="field-mirror" title="触发点识别" titleEn="Trigger Detection" description="从身体、情绪与事件中找到启动点。" descriptionEn="Locate activation through body, emotion and event."/><ConsoleCard href={`/gate/${gates[2]?.id}`} artwork="platform-practice" title="旧模式轨迹" titleEn="Old Pattern Loop" description="追溯反复选择，理解它曾经保护什么。" descriptionEn="Trace recurring choices and what they once protected."/><ConsoleCard href={`/gate/${gates[3]?.id}`} artwork="platform-manifestation" title="新指令植入" titleEn="New Script Installation" description="用可执行的新选择替代抽象肯定。" descriptionEn="Replace abstract affirmation with an actionable choice."/></div>
  </FieldConsole><Footer /></>;
}
