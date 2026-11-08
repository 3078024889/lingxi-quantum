"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import styles from "./SasiSoftwareMarket.module.css";

type Readiness={products?:Record<string,{available:boolean}>;payment?:{wechat:boolean;alipay:boolean;paypal:boolean}};
const labels={
 zh:{eyebrow:"SASI · INTELLIGENT SOFTWARE",title:"智能软件与自动化系统",subtitle:"自主研发的软件，透明的授权和价格，按订单安全交付。先看产品与模拟账户，再决定是否购买。",status:"正在完成交付与支付验收",price:"正式定价",included:"交付内容",notice:"产品正式销售将在安装包、商户支付及订单自动交付全部完成验收后开放。历史 SASI 创作订单、作品和权益继续保留。",demo:"模拟账户 · 只读观察",ready:"购买并自动交付",legacy:"历史订单与作品",policy:"数字软件仅在核验付款及交付包后发货；售后处理依法依约进行，不承诺交易盈利。",cta:"查看交付说明"},
 en:{eyebrow:"SASI · INTELLIGENT SOFTWARE",title:"Intelligent software & autonomous systems",subtitle:"Independent software, clear license terms and secure order-based delivery. Review the demo before purchase.",status:"Delivery and payment acceptance in progress",price:"Listed price",included:"Package includes",notice:"Purchases open only after package validation, merchant payment and automated fulfillment pass acceptance. Past SASI orders and created work remain accessible.",demo:"Demo account · read-only",ready:"Purchase & download",legacy:"Past orders and creations",policy:"Downloads unlock only after verified payment and package checks. Statutory rights apply. Trading results are not guaranteed.",cta:"Delivery details"}
} as const;
export default function SasiSoftwareMarket(){
 const {lang}=useLingxiLang(); const c=lang==="zh"?labels.zh:labels.en;
 const [state,setState]=useState<Readiness|null>(null);
 useEffect(()=>{let live=true;fetch("/api/sasi/software/catalog",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(v=>{if(live&&v)setState(v)}).catch(()=>{});return()=>{live=false}},[]);
 return <main className={styles.main}><div className={styles.wrap}>
  <section className={styles.hero}><div className={styles.heroCopy}>
   <small>{c.eyebrow}</small><h1>{c.title}</h1><p>{c.subtitle}</p>
   <div className={styles.links}><Link href="/siai">SIAI Rankings ↗</Link><Link href="/tools/pass">100+ Tools ↗</Link><Link href="/account/orders">{c.legacy} ↗</Link></div>
  </div><div className={styles.heroViz} aria-hidden="true"><span>SASI</span><strong>SOFTWARE</strong><i>MT5 · SYSTEMS · TOOLS</i><div className={styles.orbits}></div></div></section>
  <div id="products" className={styles.sectionTitle}><div><span>01 / SASI SOFTWARE</span><h2>{lang==="zh"?"产品与授权":"Products & licensing"}</h2></div><span className={styles.state}>{c.status}</span></div>
  <div className={styles.products}>{SASI_SOFTWARE_CATALOG.map((p,i)=>{
   const available=state?.products?.[p.id]?.available===true;
   return <article className={styles.product} key={p.id}><div className={styles.top}><span className={styles.symbol}>{i===0?"SI":"</>"}</span><span className={styles.tag}>{lang==="zh"?p.tagZh:p.tagEn}</span></div>
    <h3>{lang==="zh"?p.titleZh:p.titleEn}</h3><div className={styles.price}><strong>¥{p.priceCny.toLocaleString("en-US")}</strong><span>USD ${p.priceUsd.toLocaleString("en-US")}</span></div>
    <p className={styles.desc}><b>{c.included}</b> · {lang==="zh"?p.featureZh:p.featureEn}</p>
    <div className={styles.bottom}><Link href="/sasi/delivery">{c.cta} ↗</Link>{available?<Link className={styles.buy} href={`/checkout?productId=${encodeURIComponent(p.id)}&redirect=%2Faccount%2Fsoftware`}>{c.ready}</Link>:<span className={styles.disabled}>{c.status}</span>}</div>
   </article>
  })}</div>
  <section className={styles.information}><div><span>02 / PRODUCT DEMONSTRATION</span><h2>{c.demo}</h2><p>{lang==="zh"?"演示账户只提供策略运行记录观察权限，不提供交易、修改参数或提取资金权限。演示服务器与只读登录资料在核实后公开展示。":"Demonstration access is for observing strategy history only, with no trading, configuration or withdrawal permissions."}</p></div><div><span>03 / FULFILLMENT & SUPPORT</span><h2>{lang==="zh"?"付款核验后自动交付":"Verified payment → secure delivery"}</h2><p>{c.policy}</p></div></section>
  <p className={styles.note}>{c.notice}</p>
 </div></main>;
}
