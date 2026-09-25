"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";

const areas=[
  {href:"/sasi",icon:"✦",zh:"我有一个想法，想把它做出来",en:"I have an idea I want to make real",descZh:"进入 SASI，把想法继续推进到短剧、作品、资料智能体或下一步行动。",descEn:"Enter SASI and keep moving the idea toward a drama, creation, document agent or next action."},
  {href:"/tools",icon:"🛠️",zh:"我现在只想把一个文件处理好",en:"I just need to fix a file",descZh:"PDF、图片、视频、字幕、表格、网页、隐私文件，直接处理并拿走结果。",descEn:"Handle PDFs, images, video, subtitles, tables, web content and private files."},
  {href:"/ai-knowledge",icon:"📚",zh:"我想让一本书或一组资料活起来",en:"I want a book or source set to come alive",descZh:"让资料可以被持续追问，回答时还能回到原文。",descEn:"Keep questioning your sources while tracing answers back to the original text."},
  {href:"/ai-learning",icon:"🧠",zh:"我想真正学懂，而不是看过就忘",en:"I want to truly learn, not just read once",descZh:"把教材、笔记和复习材料放在一起，持续追问、整理和回看。",descEn:"Keep textbooks, notes and revision material together for continued learning."},
  {href:"/ai-research",icon:"🔬",zh:"我有一个问题，需要沿着证据往下研究",en:"I have a question that needs evidence",descZh:"把论文、笔记、证据与判断留在同一条研究脉络里。",descEn:"Keep papers, notes, evidence and judgments in one research thread."},
] as const;

export default function ProductCatalogClient(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  return <main className="lx11-page lx-product-v143">
    <div className="lx11-wrap py-16 sm:py-20">
      <section className="lx-v143-product-hero">
        <div>
          <p className="lx11-kicker">{zh?"灵犀场 · 从问题进入":"LINGXIFIELD · Start with the problem"}</p>
          <h1>{zh?"不用找功能，先说你想完成什么。":"Do not search for features. Start with what you want done."}</h1>
          <p>{zh?"灵犀场把入口按真实任务重新整理。你只需要从当前最接近的问题开始。":"LINGXIFIELD is organized around real tasks. Start from the problem closest to yours."}</p>
        </div>
        <span className="lx-v143-orbit">◌</span>
      </section>

      <section className="mt-12">
        <div className="lx-v143-product-grid">
          {areas.map((item,i)=><Link href={item.href} key={item.href} className={`lx-v143-product-card tone-${(i%3)+1}`}>
            <span className="lx-v143-icon">{item.icon}</span>
            <h3>{zh?item.zh:item.en}</h3>
            <p>{zh?item.descZh:item.descEn}</p>
            <b>{zh?"从这里开始":"Start here"} →</b>
          </Link>)}
        </div>
      </section>

      <section className="mt-12">
        <div className="lx-v143-section-title"><span>02</span><h2>{zh?"余额与记录":"Balance & records"}</h2></div>
        <div className="lx-v143-wallet-grid">
          <Link href="/ai-wallet"><span className="lx-v143-icon">💠</span><div><b>{zh?"AI 余额":"AI Balance"}</b><p>{zh?"充值后长期保留，只在真实使用时扣除。":"Top up once; balance remains until actually used."}</p></div><em>→</em></Link>
          <Link href="/account/withdrawals"><span className="lx-v143-icon">↩</span><div><b>{zh?"余额提现":"Withdraw balance"}</b><p>{zh?"不再使用时，未消耗的真实充值本金可按原支付渠道退回。":"Unused paid principal can return to the original payment method."}</p></div><em>→</em></Link>
        </div>
      </section>
    </div>
  </main>;
}
