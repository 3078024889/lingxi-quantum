import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import SasiAutonomousVideoStudio from "@/components/SasiAutonomousVideoStudio";
export const metadata:Metadata={title:"SASI 短剧｜灵犀场",description:"输入故事或剧本，自动整理镜头、字幕和时间线，并在浏览器生成可播放的视频初稿。基础制作无需连接外部模型。",alternates:{canonical:"/sasi/drama"}};
export default function SasiDramaPage(){return <><Nav/><main className="min-h-screen bg-[var(--lx-bg)]"><SasiAutonomousVideoStudio/><section className="mx-auto max-w-5xl px-5 pb-12"><div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><b className="text-[var(--lx-ink)]">需要从零生成真人或电影级新镜头？</b><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">这属于增强生成，不是基础短剧的前置条件。基础镜头规划、字幕、工程文件和视频初稿可以直接完成。</p><Link href="/sasi/connections" className="mt-3 inline-block text-sm text-[var(--lx-muted)] underline underline-offset-4">查看可选增强能力 →</Link></div></section></main><Footer/></>;}
