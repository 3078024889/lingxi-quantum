"use client";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {getProduct} from "@/lib/plans";
import {productCatalogText} from "@/lib/product-catalog-i18n";

const ITEMS=[
  {id:"life-map-report",href:"/life-map",zh:"生命图谱完整报告",en:"Full Life Map Report",kind:"report" as const},
  {id:"relationship-resonance",href:"/relationship",zh:"关系共振图谱",en:"Relationship Resonance Map",kind:"report" as const},
  {id:"qian-reading",href:"/qian",zh:"生命灵签 · 场域解读",en:"Life Oracle · Field Reading",kind:"report" as const},
  {id:"tarot-reading",href:"/mirror",zh:"量子生命镜像 · 深度解读",en:"Quantum Life Mirror · Deep Reading",kind:"report" as const},
  {id:"resilience-report",href:"/resilience",zh:"生命韧性指数 · 完整档案",en:"Life Resilience Index · Full Archive",kind:"report" as const},
  {id:"romance-report",href:"/romance",zh:"桃花磁场指数 · 完整档案",en:"Romance Resonance Index · Full Archive",kind:"report" as const},
  {id:"daily-tide-report",href:"/daily",zh:"今日潮汐 · 深度报告",en:"Today’s Tide · Deep Report",kind:"report" as const},
  {id:"wealth-report",href:"/wealth",zh:"财富创造地图 · 完整档案",en:"Wealth Creation Map · Full Archive",kind:"report" as const},
  {id:"day",href:"/membership#manifestation",zh:"一念显化 · 单日体验",en:"Manifestation · One-Day Pass",kind:"access" as const},
  {id:"month",href:"/membership#manifestation",zh:"一念显化 · 月度服务",en:"Manifestation · Monthly",kind:"access" as const},
  {id:"year",href:"/membership#manifestation",zh:"一念显化 · 年度服务",en:"Manifestation · Yearly",kind:"access" as const},
];

export default function ProductCatalogClient(){
 const{lang}=useLingxiLang();
 const t=(k:Parameters<typeof productCatalogText>[1])=>productCatalogText(lang,k);
 return <main className="lx-products-page">
  <section className="lx-products-hero">
   <p>{t("kicker")}</p><h1>{t("title")}</h1><div>{t("lead")}</div>
  </section>
  <section className="lx-products-wrap">
   <div className="lx-products-heading"><h2>{t("catalog")}</h2><p>{t("notice")}</p></div>
   <div className="lx-products-grid">
    {ITEMS.map(item=>{const p=getProduct(item.id);if(!p)return null;return <article key={item.id} className="lx-product-card">
      <div className="lx-product-card-top"><div><small>DIGITAL SERVICE</small><h3>{lang==="zh"?item.zh:item.en}</h3></div><strong>¥{p.priceRmb}</strong></div>
      <p>{lang==="zh"?p.note:p.noteEn}</p>
      <dl><div><dt>{t("price")}</dt><dd>¥{p.priceRmb}</dd></div><div><dt>{t("delivery")}</dt><dd>{item.kind==="access"?t("deliveryAccess"):t("deliveryReport")}</dd></div></dl>
      <Link href={item.href}>{t("enter")} →</Link>
    </article>})}
   </div>
   <aside className="lx-products-policy"><h2>{t("refund")}</h2><p>{t("support")}</p><div><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link><Link href="/privacy">Privacy</Link><Link href="/account/orders">Orders</Link></div></aside>
  </section>
 </main>
}
