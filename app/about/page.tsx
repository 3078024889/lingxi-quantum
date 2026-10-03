import type { Metadata } from "next";
import {pageGeoFact} from "@/lib/seo/site-facts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const aboutFact=pageGeoFact("about","zh");
export const metadata:Metadata={title:aboutFact.title,description:aboutFact.description,alternates:{canonical:"/about"}};

export default function AboutPage(){return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
<section className="max-w-4xl">
 <p className="lx11-kicker">LINGXIFIELD</p>
 <h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">让想法被理解，让问题被处理，让结果真正发生。</h1>
 <p className="mt-6 text-lg leading-9 text-[var(--lx-muted)]">从一个文件、一张图片、一段视频、一本书，到一个还没理清的想法，都可以从灵犀场开始。</p>
</section>
<section className="mt-14 grid gap-5 md:grid-cols-3">
 <article className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7"><h2 className="font-display text-2xl text-[var(--lx-ink)]">实用工具</h2><p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">PDF、图片、视频、字幕、OCR、格式转换、临时邮箱、阅后即焚等高频任务，能在浏览器或确定性流程里完成的，优先直接完成。</p><Link href="/tools" className="mt-5 inline-block text-sm font-semibold">进入工具 →</Link></article>
 <article className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7"><h2 className="font-display text-2xl text-[var(--lx-ink)]">SASI 创作与构建</h2><p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">SASI 按预充值余额使用，不是会员。短剧、导演和网站构建还不是已完成的产品。</p><Link href="/sasi" className="mt-5 inline-block text-sm font-semibold">进入 SASI →</Link></article>
 <article className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7"><h2 className="font-display text-2xl text-[var(--lx-ink)]">资料知识</h2><p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">把书本、论文和资料整理成可检索、可追溯、能继续学习与研究的工作空间，回答尽量回到来源。</p><Link href="/ai-knowledge" className="mt-5 inline-block text-sm font-semibold">进入资料知识 →</Link></article>
</section>
<section className="mt-14 rounded-2xl border border-[var(--lx-line)] p-7">
 <h2 className="font-display text-2xl text-[var(--lx-ink)]">能直接完成的，就直接完成。</h2>
 <p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">从文件与日常处理，到创作、学习和研究，每一项能力都围绕你真正想得到的结果展开。你只需要带着问题或想法进来，再把可以继续使用的结果带走。</p>
</section>
<section className="mt-10 text-sm leading-7 text-[var(--lx-muted)]"><p>support@lingxifield.com · business@lingxifield.com · contact@lingxifield.com</p></section>
</div></main><Footer/></>;}
