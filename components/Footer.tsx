"use client";
import Image from "next/image";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {productCatalogText} from "@/lib/product-catalog-i18n";
import {brandText} from "@/lib/brand-system-i18n";
const channels=[["微信服务号","#wechat"],["小红书","https://xhslink.cn/m/8rig9AtdDvK"],["Bilibili","https://b23.tv/VhatqCq"],["抖音","https://v.douyin.com/WG4QmhbliNk"],["X","https://x.com/lingxifield?s=11"],["YouTube","https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X"]] as const;

export default function Footer(){
 const{t,lang}=useLingxiLang();const b=(k:Parameters<typeof brandText>[1])=>brandText(lang,k);
 return <footer className="lx11-footer" id="wechat">
  <div className="lx11-footer-grid">
   <section className="lx11-footer-brand">
    <div className="lx11-footer-logo"><Image src="/images/lingxifield-logo.png" alt="" width={40} height={40}/><div><b>{t("brand")}</b><small>LINGXIFIELD</small></div></div>
    <p className="lx11-footer-brand-lead">{b("brandLead")} <strong>{b("brandTagline")}</strong></p>
    <div className="lx11-footer-capability"><b>{b("toolsTitle")}</b><p>{b("toolsBody")}</p></div>
    <div className="lx11-footer-capability"><b>{b("aiTitle")}</b><p>{b("aiBody")}</p></div>
    <div className="lx11-footer-capability"><b>{b("exploreTitle")}</b><p>{b("exploreBody")}</p></div>
    <p className="lx11-footer-closing">{b("closing")}</p>
    <span>lingxifield.com · lingxifield.cn</span>
   </section>
   <nav><b>{t("start")}</b><Link href="/products">{productCatalogText(lang,"title")}</Link><Link href="/tools">{t("tools")}</Link><Link href="/learn">{b("exploreNav")}</Link><Link href="/sasi">{t("studio")}</Link><Link href="/ai-knowledge">{t("books")}</Link><Link href="/ai-learning">{t("learning")}</Link><Link href="/ai-research">{t("research")}</Link></nav>
   <nav><b>{t("fieldGroup")}</b><Link href="/field-tests">{t("field")}</Link><Link href="/life-map">{lang==="zh"?"生命图谱":"Life Map"}</Link><Link href="/live-as">{t("manifest")}</Link><Link href="/subconscious">{t("subconscious")}</Link><Link href="/practice">{t("practice")}</Link><Link href="/ai-wallet">{t("wallet")}</Link></nav>
   <section><b>{t("follow")}</b><div className="lx11-footer-social">{channels.map(([l,h])=>h.startsWith("#")?<a key={l} href={h}>{l}</a>:<a key={l} href={h} target="_blank" rel="noreferrer">{l} ↗</a>)}</div></section>
   <section className="lx11-footer-qrs"><div><Image src="/images/lingxifield-wechat-service-qr.jpg" alt="" width={74} height={74}/><span>{t("service")}</span></div><div><Image src="/images/miniapp-qrcode.png" alt="" width={74} height={74}/><span>{t("miniapp")}</span></div></section>
  </div>
  <div className="lx11-footer-legal"><span>© {t("brandFull")}</span><Link href="/terms">{t("terms")}</Link><Link href="/privacy">{t("privacy")}</Link><Link href="/declaration">{t("declaration")}</Link><Link href="/refunds">{t("refunds")}</Link><Link href="/legal/sasi">{t("sasiRules")}</Link><a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">湘ICP备2026031465号 ↗</a></div>
 </footer>
}
