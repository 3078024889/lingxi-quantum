import type {Metadata} from "next";
import Link from "next/link";
import {SHARE_IMAGES,SHARE_IMAGE_URL} from "@/lib/share-image";
const url="https://lingxifield.com/share/20260928";
const title="灵犀场 LINGXIFIELD｜全球 SIAI 排行榜 · SASI 智能软件市场 · 100+ 实用工具";
const description="全球 SIAI 排行榜比较模型能力、价格、免费额度、地区与商用条件；SASI 智能软件市场提供 MT5 EA、量化交易软件与源码授权；100+ 在线实用工具覆盖日常文件处理。";
export const metadata:Metadata={title,description,alternates:{canonical:url},openGraph:{url,title,description,images:SHARE_IMAGES},twitter:{card:"summary_large_image",title,description,images:[SHARE_IMAGE_URL]}};
export default function Page(){return <main className="mx-auto max-w-5xl space-y-6 p-6"><h1 className="text-3xl font-semibold">全球智能服务与实用工具平台</h1><img src={SHARE_IMAGE_URL} alt="灵犀场全球 SIAI 排行榜、SASI 智能软件市场、MT5 EA 与100+在线实用工具" width={800} height={420} className="h-auto w-full rounded-2xl"/><p>全球 SIAI 排行榜、SASI 智能软件市场与 100+ 在线实用工具，从智能服务比较到软件交易，再到日常文件处理，形成完整使用入口。</p><div className="flex flex-wrap gap-5"><Link href="/siai" className="rounded-xl border p-4">浏览全球 SIAI 排行榜</Link><Link href="/sasi" className="rounded-xl border p-4">进入 SASI 智能软件市场</Link><Link href="/tools" className="rounded-xl border p-4">使用 100+ 在线实用工具</Link></div></main>;}
