"use client";
import Image from "next/image";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {productCatalogText} from "@/lib/product-catalog-i18n";

const channels=[["微信服务号","#wechat"],["小红书","https://xhslink.cn/m/8rig9AtdDvK"],["Bilibili","https://b23.tv/VhatqCq"],["抖音","https://v.douyin.com/WG4QmhbliNk"],["X","https://x.com/lingxifield?s=11"],["YouTube","https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X"]] as const;

export default function Footer(){
  const{t,lang}=useLingxiLang();
  const zh=lang==="zh";
  return <footer className="lx11-footer" id="wechat">
    <div className="lx11-footer-grid">
      <section className="lx11-footer-brand">
        <div className="lx11-footer-logo"><Image src="/images/lingxifield-logo.png" alt="" width={40} height={40}/><div><b>{t("brand")}</b><small>LINGXIFIELD</small></div></div>
        <p className="lx11-footer-brand-lead">{zh?"一个会随着你的问题、资料与创作继续生长的场智能体。":"A living field intelligence that keeps growing with your questions, sources and creations."}</p>
        <div className="lx11-footer-capability"><b>{zh?"处理眼前的问题":"Handle what is in front of you"}</b><p>{zh?"PDF、图片、视频、字幕、表格、网页和隐私文件，直接处理并拿到结果。":"Handle PDFs, images, video, subtitles, tables, web content and private files."}</p></div>
        <div className="lx11-footer-capability"><b>{zh?"继续重要的创作":"Keep important work moving"}</b><p>{zh?"短剧、书本、资料、学习与科研，不必每次从零开始。":"Drama, books, sources, learning and research do not have to restart from zero."}</p></div>
        <p className="lx11-footer-closing">{zh?"从一个文件、一个问题，到一个还没成形的念头，都可以从灵犀场开始。":"From one file or question to an unfinished idea, you can start with LINGXIFIELD."}</p>
        <span>lingxifield.com · lingxifield.cn</span>
      </section>

      <nav><b>{t("start")}</b><Link href="/products">{productCatalogText(lang,"title")}</Link><Link href="/tools">{t("tools")}</Link><Link href="/sasi">{t("studio")}</Link><Link href="/ai-knowledge">{t("books")}</Link><Link href="/ai-learning">{t("learning")}</Link><Link href="/ai-research">{t("research")}</Link><Link href="/ai-wallet">{t("wallet")}</Link></nav>

      <nav><b>{zh?"常用入口":"Useful links"}</b><Link href="/account">{zh?"我的账户":"My account"}</Link><Link href="/account/orders">{zh?"订单与任务":"Orders & tasks"}</Link><Link href="/account/withdrawals">{zh?"余额提现":"Withdraw balance"}</Link><Link href="/refunds">{zh?"退款说明":"Refunds"}</Link><Link href="/sasi/connections">{zh?"连接我的 AI":"Connect my AI"}</Link></nav>

      <section><b>{t("follow")}</b><div className="lx11-footer-social">{channels.map(([l,h])=>h.startsWith("#")?<a key={l} href={h}>{l}</a>:<a key={l} href={h} target="_blank" rel="noreferrer">{l} ↗</a>)}</div></section>
      <section className="lx11-footer-qrs"><div><Image src="/images/lingxifield-wechat-service-qr.jpg" alt="" width={74} height={74}/><span>{t("service")}</span></div><div><Image src="/images/miniapp-qrcode.png" alt="" width={74} height={74}/><span>{t("miniapp")}</span></div></section>
    </div>
    <div className="lx11-footer-legal"><span>© {t("brandFull")}</span><Link href="/terms">{t("terms")}</Link><Link href="/privacy">{t("privacy")}</Link><Link href="/declaration">{t("declaration")}</Link><Link href="/refunds">{t("refunds")}</Link><Link href="/legal/sasi">{t("sasiRules")}</Link><a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">湘ICP备2026031465号 ↗</a></div>
  </footer>;
}
