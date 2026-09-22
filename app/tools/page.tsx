import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { CATEGORY_LABEL, TOOLS } from "@/lib/tools/registry";
import type { ToolMeta } from "@/lib/tools/types";
export const metadata:Metadata={title:"灵犀场实用工具",description:"图片、文件、二维码、PDF 与本地隐私处理工具。",alternates:{canonical:"/tools"}};
const ORDER:ToolMeta["category"][]=["image","file","utility","qr","pdf","field"];
export default function ToolsHubPage(){return <><Nav/><main className="lx10-page"><div className="lx10-wrap"><p className="lx10-kicker">实用工具</p><h1 className="lx10-title">把问题丢进来，直接处理。</h1><p className="lx10-lead">优先在浏览器本地完成。能不上传服务器的文件，就不上传。</p>{ORDER.map(cat=>{const list=TOOLS.filter(t=>t.category===cat);if(!list.length)return null;const label=CATEGORY_LABEL[cat];return <section key={cat}><h2 className="lx10-section-title">{label.zh}</h2><div className="lx10-grid">{list.map(t=><Link key={t.slug} href={`/tools/${t.slug}`} className="lx10-card"><h3>{t.titleZh}</h3><p>{t.oneLinerZh}</p><div className="meta">{t.status==="live"?"可使用":"即将开放"}</div></Link>)}</div></section>})}</div></main></>}
