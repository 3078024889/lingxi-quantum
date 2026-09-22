import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata:Metadata={title:"灵犀场｜今天想解决什么？",description:"从实用工具、书本智能体、AI 学习科研到 AI 创作与意识探索，一个入口开始。",alternates:{canonical:"/"}};

const cards=[
 ["/tools","实用工具","图片、PDF、OCR、二维码、隐私处理与更多本地工具。"],
 ["/ai-knowledge","书本智能体","把书本、论文和资料变成可检索、可追溯的私人知识。"],
 ["/sasi","AI 创作","从一个想法进入短剧、网站与应用等创作任务。"],
 ["/ai-learning","学习助手","围绕教材、笔记和错题，找到原文再解决问题。"],
 ["/ai-research","科研助手","围绕论文与实验资料比较证据、继续研究。"],
 ["/field-tests","场域精测","把生命图谱、关系、韧性与财富等测量集中到一个入口。"],
] as const;

export default function Home(){return <><Nav/><main className="lx10-page"><div className="lx10-wrap">
 <p className="lx10-kicker">LINGXIFIELD</p><h1 className="lx10-title">今天想解决什么？</h1><p className="lx10-lead">不用先理解工具。把问题带进来，灵犀场帮你找到对应入口，然后直接开始。</p>
 <div className="lx10-actions"><Link className="lx10-black" href="/tools">查看全部工具</Link><Link className="lx10-ghost" href="/sasi">开始 AI 创作</Link></div>
 <div className="lx10-divider"/><section className="lx10-grid">{cards.map(([href,title,text])=><Link href={href} key={href} className="lx10-card lg"><h2>{title}</h2><p>{text}</p><div className="meta">进入 →</div></Link>)}</section>
 <h2 className="lx10-section-title">继续探索</h2><div className="lx10-grid"><Link href="/live-as" className="lx10-card"><h3>意识显化</h3><p>把意图、现实验证与行动连接起来。</p></Link><Link href="/subconscious" className="lx10-card"><h3>潜意识重塑</h3><p>识别自动反应，建立新的内部路径。</p></Link><Link href="/practice" className="lx10-card"><h3>修炼技术</h3><p>呼吸、直觉、临在与持续练习。</p></Link></div>
 </div></main></>}
