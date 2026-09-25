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
        {zh?<>
          <p className="lx11-footer-brand-lead"><b>一键创造，一念即达。</b></p>
          <p>一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。</p>
          <p>从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从灵犀场开始。</p>
          <div className="lx11-footer-capability"><b>免费实用工具</b><p>面向 PDF、图片、视频、字幕、网页、表格、文件隐私与日常识别、AI证件等高频需求，提供一组打开就能用、处理完就能得到结果的实用工具。</p><p>包括 PDF 编辑、签名盖章、骑缝章、图片修复与高清放大、图片与视频去水印、图片压缩与格式转换、视频转文字、字幕翻译、网页内容提取、表格转 Excel、合同与 PDF 对比、卡路里识别、临时邮箱、阅后即焚等。创作无限，工具不上限。</p></div>
          <div className="lx11-footer-capability"><b>SASI 创作与构建</b><p>从 AI 短剧生成、网站构建，到书本 SASI、学习 SASI、科研 SASI、资料整理让知识活化起来的智能创作，SASI 帮你把模糊的想法逐步理解、展开、组织并构建成真正可以使用的结果。可使用，可发布，也可继续迭代。</p></div>
          <p className="lx11-footer-closing">从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从这里开始。</p>
        </>:<>
          <p className="lx11-footer-brand-lead">LINGXIFIELD turns files, media, knowledge and ideas into usable results.</p>
          <div className="lx11-footer-capability"><b>Practical tools</b><p>PDF, images, video, subtitles, tables, privacy and everyday file tasks.</p></div>
          <div className="lx11-footer-capability"><b>SASI creation & building</b><p>AI drama, website building, Book SASI, Learning SASI, Research SASI and knowledge activation.</p></div>
        </>}
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
