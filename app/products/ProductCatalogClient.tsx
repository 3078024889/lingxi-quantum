"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";

const areas=[
  {href:"/sasi",icon:"sasi" as LingxiIconName,zh:"从一个想法到可用结果",en:"From idea to usable result",descZh:"短剧、网站、资料智能体与持续创作，从想法直接进入构建。",descEn:"Move ideas into drama, websites, document agents and continued creation."},
  {href:"/tools",icon:"tools" as LingxiIconName,zh:"处理一个文件，直接得到结果",en:"Process a file and get the result",descZh:"PDF、图片、视频、字幕、表格、网页与隐私文件，打开即可处理。",descEn:"Handle PDFs, images, video, subtitles, tables, web content and private files."},
  {href:"/ai-knowledge",icon:"book" as LingxiIconName,zh:"让书本与资料持续可用",en:"Turn books and sources into active knowledge",descZh:"资料可持续追问，答案可回到原文与来源。",descEn:"Keep sources queryable with answers traceable to the original material."},
  {href:"/ai-learning",icon:"learning" as LingxiIconName,zh:"从看过到真正学懂",en:"From reading to real understanding",descZh:"教材、笔记与复习材料集中整理、追问与回看。",descEn:"Keep study material together for review, questions and source recall."},
  {href:"/ai-research",icon:"research" as LingxiIconName,zh:"沿着证据继续研究",en:"Research along the evidence",descZh:"论文、笔记、证据与判断保持在同一条研究脉络中。",descEn:"Keep papers, notes, evidence and conclusions in one research thread."},
] as const;

export default function ProductCatalogClient(){
  const{lang}=useLingxiLang();
  const zh=lang==="zh";
  return <main className="lx11-page lx-product-v143">
    <div className="lx11-wrap py-16 sm:py-20">
      <section className="lx-v143-product-hero">
        <div>
          <p className="lx11-kicker">{zh?"灵犀场 · 从问题进入":"LINGXIFIELD · Start with the problem"}</p>
          <h1>{zh?"从需求出发，直接进入结果。":"Do not search for features. Start with what you want done."}</h1>
          <p>{zh?"灵犀场按真实任务整理入口，文件处理、知识活化、研究与创作各自直达。":"LINGXIFIELD is organized around real tasks. Start from the problem closest to yours."}</p>
        </div>
        <LingxiMiniIcon name="products" size="title" className="lx-v143-orbit"/>
      </section>

      <section className="mt-12">
        <div className="lx-v143-product-grid">
          {areas.map((item,i)=><Link href={item.href} key={item.href} className={`lx-v143-product-card tone-${(i%3)+1}`}>
            <LingxiMiniIcon name={item.icon} size="card" className="lx-v143-icon"/>
            <h3>{zh?item.zh:item.en}</h3>
            <p>{zh?item.descZh:item.descEn}</p>
            <b>{zh?"从这里开始":"Start here"} →</b>
          </Link>)}
        </div>
      </section>

      <section className="mt-12">
        <div className="lx-v143-section-title"><span>02</span><h2>{zh?"余额与记录":"Balance & records"}</h2></div>
        <div className="lx-v143-wallet-grid">
          <Link href="/ai-wallet"><LingxiMiniIcon name="wallet" size="card" className="lx-v143-icon"/><div><b>{zh?"AI 余额":"AI Balance"}</b><p>{zh?"充值后长期保留，只在真实使用时扣除。":"Top up once; balance remains until actually used."}</p></div><em>→</em></Link>
          <Link href="/account/withdrawals"><LingxiMiniIcon name="refund" size="card" className="lx-v143-icon"/><div><b>{zh?"余额退款":"Withdraw balance"}</b><p>{zh?"不再使用时，未消耗的真实充值本金可按原支付渠道退回。":"Unused paid principal can return to the original payment method."}</p></div><em>→</em></Link>
        </div>
      </section>
    </div>
  </main>;
}
