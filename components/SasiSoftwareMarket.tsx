"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import styles from "./SasiSoftwareMarket.module.css";

type Readiness={products?:Record<string,{available:boolean}>;payment?:{wechat:boolean;alipay:boolean;paypal:boolean}};
const steps=[
 ["01","填写商品资料","名称、介绍、运行环境、授权说明","Describe software, system requirements and license"],
 ["02","上传私有源码包","ZIP 与封面、详情图；私有存储等待审核","Upload source ZIP and reviewed photos"],
 ["03","内部模拟订单","检查商品、权限、测试支付回执与发货记录","Simulate order and delivery without a charge"],
 ["04","真实收款后交付","只在商户回调、文件和订单授权核验完成后启用","Enable after payment and private delivery checks"]
] as const;
export default function SasiSoftwareMarket(){
 const {lang}=useLingxiLang();const zh=lang==="zh";
 const [state,setState]=useState<Readiness|null>(null);
 useEffect(()=>{let live=true;fetch("/api/sasi/software/catalog",{cache:"no-store"})
  .then(r=>r.ok?r.json():null).then(v=>{if(live&&v)setState(v)})
  .catch(()=>{});return()=>{live=false}},[]);
 const product=SASI_SOFTWARE_CATALOG[0];
 const ready=state?.products?.[product.id]?.available===true;
 return <main className={styles.main}><div className={styles.wrap}>
  <section className={styles.hero}>
   <div className={styles.heroCopy}><small>LINGXIFIELD / SASI SOFTWARE</small>
    <h1>{zh?"SASI 智能软件市场":"SASI Software Marketplace"}</h1>
    <p>{zh?"源码授权 · 开发者发布 · 安全交付。产品资料清晰、发布流程简洁，软件由作者自主上传。":"Source-code licensing, developer publishing and verified digital delivery. Built for transparent, independently uploaded software."}</p>
    <div className={styles.links}>
     <a className={styles.primaryLink} href="#products">{zh?"查看源码软件":"Explore source software"}</a>
     <Link href="/sasi/marketplace#sell">{zh?"发布软件":"Publish software"}</Link>
     <Link href="/account/software">{zh?"我的软件":"My software"}</Link>
    </div>
   </div>
   <div className={styles.heroViz} aria-hidden="true">
    <div className={styles.monitor}><div className={styles.monitorTop}><i/><i/><i/> <span>SI9.5 / SOURCE</span></div>
     <div className={styles.codeRows}><span/><span/><span/><span/><span/><span/></div></div>
    <div className={styles.floatCode}>{"</>"}</div><div className={styles.floatShield}>✓</div>
    <div className={styles.monitorStand}/>
   </div>
  </section>
  <nav className={styles.tabs} aria-label={zh?"软件市场导航":"Software marketplace navigation"}>
   <a className={styles.activeTab} href="#products">{zh?"精选软件":"Featured software"}</a>
   <Link href="/sasi/marketplace">{zh?"软件作品市场":"Community software"}</Link>
   <Link href="/sasi/marketplace#sell">{zh?"发布产品":"Publish a product"}</Link>
   <Link href="/account/software">{zh?"订单与授权":"Orders & licenses"}</Link>
  </nav>
  <div id="products" className={styles.sectionTitle}><div><span>01 / SOURCE CODE LICENSE</span>
   <h2>{zh?"源码软件与授权":"Source software & license"}</h2></div>
   <span className={styles.state}>{ready?(zh?"已完成交付验收":"Delivery verified"):(zh?"待完成支付与交付验收":"Payment & delivery pending")}</span>
  </div>
  <article className={styles.product}>
   <div className={styles.productArtwork} aria-hidden="true"><div className={styles.orbit}/><span>Copernicus</span><strong>SI 9.5</strong><small>MT5 SOURCE LICENSE</small></div>
   <div className={styles.productCopy}><div className={styles.productTag}>{zh?"源码授权 · 仅此一种":"Source code only"}</div>
    <h3>{zh?product.titleZh:product.titleEn}</h3>
    <p>{zh?product.featureZh:product.featureEn}</p>
    <div className={styles.featureTags}><span>MT5</span><span>{zh?"源码文件":"Source files"}</span><span>{zh?"安装说明":"Documentation"}</span><span>{zh?"只读模拟观察":"Read-only demo"}</span></div>
   </div>
   <div className={styles.price}><strong>¥{product.priceCny.toLocaleString("en-US")}</strong><span>USD ${product.priceUsd.toLocaleString("en-US")}</span>
    <Link href="/sasi/delivery">{zh?"交付与授权说明":"Terms & delivery"}</Link>
    {ready?<Link className={styles.buy} href={`/checkout?productId=${encodeURIComponent(product.id)}&redirect=%2Faccount%2Fsoftware`}>{zh?"安全购买":"Secure checkout"}</Link>
     :<span className={styles.disabled}>{zh?"正式支付功能待验收":"Checkout not yet enabled"}</span>}
   </div>
  </article>
  <div className={styles.sectionTitle}><div><span>02 / SELLER WORKSPACE</span><h2>{zh?"软件发布与交付工作台":"Seller workspace"}</h2></div><span className={styles.miniNote}>{zh?"内部测试不产生真实收款":"Test mode never takes a real payment"}</span></div>
  <div className={styles.workflow}>{steps.map(([n,title,desc,en])=><div className={styles.step} key={n}><b>{n}</b><h3>{zh?title:["Product details","Private source upload","Test order","Verified delivery"][Number(n)-1]}</h3><p>{zh?desc:en}</p></div>)}
   <aside className={styles.releaseChecklist}><strong>{zh?"发布检查清单":"Publication checklist"}</strong>
    <ul><li>{zh?"源码包完整性与病毒扫描":"Package integrity and malware scanning"}</li>
     <li>{zh?"授权条款与安装说明":"License terms and installation guide"}</li>
     <li>{zh?"沙盒订单与访问权限":"Sandbox order and access checks"}</li>
     <li>{zh?"商户付款回执与自动交付":"Merchant confirmation and fulfillment"}</li></ul>
    <Link href="/sasi/marketplace#sell">{zh?"进入卖家发布工作台":"Open seller studio"} →</Link>
   </aside></div>
  <div className={styles.information}>
   <div><span>03 / DEMONSTRATION</span><h2>{zh?"模拟账户 · 只读观察":"Read-only demonstration"}</h2>
    <p>{zh?"演示账户的服务器与只读登录资料将在核实后提供，仅供观察，不开放交易或修改权限。":"Verified demo credentials will be displayed for observation only, without trading or settings permissions."}</p></div>
   <div><span>04 / VERIFIED FULFILLMENT</span><h2>{zh?"付款核验后交付源码":"Source files after verified payment"}</h2>
    <p>{zh?"文件存放在私有空间，系统对已付款订单核验授权后才生成有时效的下载链接。软件不承诺交易收益。":"Files remain private and download entitlements require verified payment. No trading profit is guaranteed."}</p></div>
  </div>
 </div></main>;
}
