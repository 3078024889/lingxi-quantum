import type {Metadata} from "next";
import Link from "next/link";
export const metadata:Metadata={
 title:"全球 SIAI 排行榜 Telegram 官方社区｜加入灵犀场",
 description:"加入全球 SIAI 官方 Telegram 群组，了解 AI/SI 工具比较、免费额度、PDF 视频图片教程与 SASI 创作实践。欢迎真实用户交流。",
 alternates:{canonical:"https://lingxifield.com/community"},
 keywords:["全球SIAI排行榜群组","灵犀场社区","Telegram AI工具交流","SIAI工具比较","免费PDF在线工具","SASI创作"],
 robots:{index:true,follow:true},
};
export default function CommunityPage(){
 return <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-10 text-slate-900">
  <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
   <p className="text-sm font-bold tracking-wide text-indigo-700">LINGXIFIELD · 全球 SIAI 排行榜</p>
   <h1 className="mt-3 text-3xl font-bold">加入全球 SIAI 官方社区</h1>
   <p className="mt-4 text-base leading-8 text-slate-700">面对全球海量 SI/AI 工具，不知道哪个适合自己？群里每天精选工具对比、免费额度说明、PDF/图片/视频操作教程，并欢迎交流真实体验。无需为入群支付费用。</p>
   <a href="https://t.me/globalsiai" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-2xl bg-indigo-700 px-6 py-4 text-lg font-bold text-white hover:bg-indigo-800">加入 Telegram 官方群组</a>
   <p className="mt-3 break-all text-base text-slate-600">群组：https://t.me/globalsiai</p>
   <section className="mt-10 grid gap-4 sm:grid-cols-3">
    <div className="rounded-2xl bg-indigo-50 p-4"><h2 className="text-lg font-bold">工具比较</h2><p className="mt-2 text-base leading-7">公开资料、功能、地区与商用条件，优先提供可核验信息。</p></div>
    <div className="rounded-2xl bg-sky-50 p-4"><h2 className="text-lg font-bold">操作教程</h2><p className="mt-2 text-base leading-7">从 PDF 编辑到图片处理、视频字幕，解决实际问题。</p></div>
    <div className="rounded-2xl bg-violet-50 p-4"><h2 className="text-lg font-bold">智能创作</h2><p className="mt-2 text-base leading-7">交流脚本、分镜和视频制作，了解 SASI 创作工具。</p></div>
   </section>
   <div className="mt-8 flex flex-wrap gap-3">
    <Link href="/siai" className="rounded-xl border border-indigo-300 px-4 py-3 text-base font-semibold text-indigo-800">先查看全球 SIAI 排行榜</Link>
    <Link href="/tools" className="rounded-xl border border-indigo-300 px-4 py-3 text-base font-semibold text-indigo-800">试用在线工具</Link>
    <Link href="/sasi" className="rounded-xl border border-indigo-300 px-4 py-3 text-base font-semibold text-indigo-800">探索 SASI</Link>
   </div>
   <p className="mt-10 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-600">社区不收取入群费用。请勿发布垃圾广告、诈骗链接、未经证实的收益承诺或索取他人密钥。群组讨论与网站付费服务互相独立。</p>
  </div>
 </main>;
}
