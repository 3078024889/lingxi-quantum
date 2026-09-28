import type {Metadata} from "next";
import Link from "next/link";
import {SHARE_IMAGES,SHARE_IMAGE_URL} from "@/lib/share-image";
const url="https://lingxifield.com/share/20260928";
export const metadata:Metadata={title:"灵犀场 · 一键创造，一念即达",description:"处理文件、整理资料、创作图片与视频。找到帮你省下一步的工具。",alternates:{canonical:url},openGraph:{url,title:"灵犀场 · 一键创造，一念即达",images:SHARE_IMAGES},twitter:{card:"summary_large_image",title:"灵犀场 · 一键创造，一念即达",images:[SHARE_IMAGE_URL]}};
export default function Page(){return <main className="mx-auto max-w-5xl space-y-6 p-6"><h1 className="text-3xl font-semibold">一键创造，一念即达。</h1><img src={SHARE_IMAGE_URL} alt="灵犀场：创作与实用工具" width={1200} height={630} className="h-auto w-full rounded-2xl"/><p>把重复的步骤交给工具，把时间留给你的想法。</p><div className="flex gap-5"><Link href="/tools" className="rounded-xl border p-4">找一个实用工具</Link><Link href="/sasi/drama" className="rounded-xl border p-4">开始视频创作</Link><Link href="/" className="rounded-xl border p-4">进入灵犀场</Link></div></main>;}
