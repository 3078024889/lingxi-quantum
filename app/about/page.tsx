import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata={title:"关于灵犀场 | LINGXIFIELD",description:"灵犀场是一个把想法、资料和日常问题真正处理起来的场智能数字空间。",alternates:{canonical:"/about"}};

export default function AboutPage(){return <><Nav/><main className="lx11-page"><div className="lx11-wrap py-16 sm:py-20">
<section className="max-w-4xl"><p className="lx11-kicker">LINGXIFIELD · 活的意识流</p><h1 className="mt-4 font-display text-4xl font-light text-[var(--lx-ink)] sm:text-5xl">一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。</h1><p className="mt-6 text-lg leading-9 text-[var(--lx-muted)]">一键即达，开始创造。</p></section>

<section className="mt-14 grid gap-5 md:grid-cols-2">
<article className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7"><span className="lx-v143-icon">🧰</span><h2 className="mt-4 font-display text-2xl text-[var(--lx-ink)]">免费实用工具</h2><p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">面向 PDF、图片、视频、字幕、网页、表格、文件隐私与日常识别等高频需求，提供一组可以直接上手、直接得到结果的实用工具。包括 PDF编辑、签名盖章、骑缝章、图片修复与高清放大、图片与视频去水印、图片压缩与格式转换、视频转文字、字幕翻译、网页内容提取、表格转Excel、合同与PDF对比、卡路里识别、临时邮箱、阅后即焚等，并会继续增加更多实用能力。</p><Link href="/tools" className="mt-5 inline-block text-sm font-semibold">进入工具 →</Link></article>
<article className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-7"><span className="lx-v143-icon">✦</span><h2 className="mt-4 font-display text-2xl text-[var(--lx-ink)]">SASI 创作与构建</h2><p className="mt-4 text-sm leading-8 text-[var(--lx-muted)]">从一个想法出发，继续完成 AI短剧生成、网站构建、资料整理、学习研究与智能创作，让灵感不只停留在想法里，而是一步步成为可使用、可发布、可持续迭代的结果。</p><Link href="/sasi" className="mt-5 inline-block text-sm font-semibold">进入 SASI →</Link></article>
</section>

<section className="mt-14 rounded-2xl border border-[var(--lx-line)] p-7"><p className="text-lg leading-9 text-[var(--lx-ink)]">从一个文件、一张图片、一段视频、一顿饭，到一个还没理清的念头，都可以从灵犀场开始。</p><p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]">灵犀场不是一个堆满入口的工具列表。它更像一条持续工作的流：看见问题，找到合适能力，处理资料，生成结果，再继续修改、验证与推进。</p></section>

<section className="mt-10 text-sm leading-7 text-[var(--lx-muted)]"><p>support@lingxifield.com · business@lingxifield.com · contact@lingxifield.com</p></section>
</div></main><Footer/></>;}
