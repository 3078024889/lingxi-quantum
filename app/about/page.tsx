import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata={title:"关于灵犀场 | LINGXIFIELD",alternates:{canonical:"/about"}};

export default function AboutPage(){return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
<section className="max-w-3xl"><p className="lx11-kicker">LINGXIFIELD</p><h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">一个把想法、资料和日常问题真正处理起来的场智能数字空间。</h1><p className="mt-6 text-base leading-8 text-[var(--lx-muted)]">从 AI 短剧生成、SASI 创作，到 PDF、图片、视频、OCR、字幕、文件处理，再到把书本、论文和资料变成可以继续追问的知识工作区，灵犀场围绕“把事情做完”持续构建。</p></section>
<section className="mt-12 grid gap-4 md:grid-cols-3"><Link href="/tools" className="rounded-2xl border p-6"><b>实用工具</b><p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">处理文件、图片、视频与日常数字任务。</p></Link><Link href="/sasi" className="rounded-2xl border p-6"><b>SASI</b><p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">把故事、目标与素材推进成作品。</p></Link><Link href="/ai-knowledge" className="rounded-2xl border p-6"><b>AI 工作区</b><p className="mt-3 text-sm leading-7 text-[var(--lx-muted)]">围绕书本、学习和科研继续工作。</p></Link></section>
<section className="mt-12 rounded-2xl border p-6"><h2 className="font-display text-2xl text-[var(--lx-ink)]">系统说明</h2><p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">灵犀场当前提供的是软件、AI、内容处理与创作服务。旧版个人探索、显化、修炼与测评类产品已停止提供，不再接受新订单。AI 与自动化结果需要用户在重要使用前自行检查。</p></section>
<section className="mt-12 text-sm leading-7 text-[var(--lx-muted)]"><p>support@lingxifield.com · business@lingxifield.com · contact@lingxifield.com</p></section>
</div></main><Footer/></>;}
