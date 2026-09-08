import Image from "next/image";
import Link from "next/link";
import Bi from "./Bi";

const channels = [
  { label: "微信服务号", href: "#wechat" },
  { label: "小红书", href: "https://xhslink.cn/m/8rig9AtdDvK" },
  { label: "Bilibili", href: "https://b23.tv/VhatqCq" },
  { label: "抖音", href: "https://v.douyin.com/WG4QmhbliNk" },
  { label: "X (Twitter)", href: "https://x.com/lingxifield?s=11" },
  { label: "YouTube", href: "https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X" },
];

export default function Footer() {
  return (
    <footer className="lx-footer" id="wechat">
      <div className="lx-footer-grid">
        <section className="lx-footer-brand">
          <div className="flex items-center gap-3">
            <Image src="/images/lingxifield-logo.png" alt="灵犀场" width={42} height={42} className="h-10 w-10" />
            <div><p className="font-display text-base tracking-[.12em] text-bone">灵犀场 SASI</p><p className="mt-1 text-[9px] uppercase tracking-[.12em] text-bone-soft">Lingxifield Sovereign AI Studio</p></div>
          </div>
          <p className="mt-4 max-w-sm text-[12px] leading-6 text-bone-dim">
            <Bi zh="一个想法，在这里变成网站、应用、短剧与视频。一键成片，一念即达，一念显化。SASI 统筹创作与构建，灵犀场承接意识显化、场域精测与修炼实践。" en="One idea becomes a website, app, drama or film here. SASI orchestrates creation and delivery while Lingxi Field holds manifestation, field insight and practice." />
          </p>
          <p className="mt-3 text-[11px] tracking-[.12em] text-lattice">lingxifield.com　·　lingxifield.cn</p>
        </section>

        <nav className="lx-footer-links" aria-label="Lingxi Field">
          <p className="lx-footer-title"><Bi zh="灵犀场" en="LINGXI FIELD" /></p>
          <Link href="/live-as"><Bi zh="意识显化" en="Manifestation" /></Link>
          <Link href="/field-tests"><Bi zh="场域精测" en="Field Insights" /></Link>
          <Link href="/practice"><Bi zh="修炼技术" en="Practices" /></Link>
          <Link href="/subconscious"><Bi zh="重塑潜意识" en="Rewrite Mind" /></Link>
          <Link href="/account"><Bi zh="我的场域" en="My Field" /></Link>
        </nav>

        <nav className="lx-footer-links" aria-label="SASI">
          <p className="lx-footer-title">SASI</p>
          <Link href="/"><Bi zh="创作首页" en="Creation Home" /></Link>
          <Link href="/?view=drama"><Bi zh="影像创作" en="Screen Studio" /></Link>
          <Link href="/?view=build"><Bi zh="产品构建" en="Build & Deliver" /></Link>
          <Link href="/?view=skills"><Bi zh="能力作品库" en="Capabilities" /></Link>
          <Link href="/?view=billing"><Bi zh="制作账户" en="Production Account" /></Link>
        </nav>

        <section className="lx-footer-links">
          <p className="lx-footer-title"><Bi zh="关注灵犀场" en="FOLLOW" /></p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2">
            {channels.map((channel) => channel.href.startsWith("#")
              ? <a key={channel.label} href={channel.href}>{channel.label}</a>
              : <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer">{channel.label} ↗</a>)}
          </div>
        </section>

        <section className="flex gap-3" aria-label="Official QR codes">
          <div className="lx-footer-qr"><Image src="/images/lingxifield-wechat-service-qr.jpg" alt="灵犀场服务号二维码" width={78} height={78} /><span><Bi zh="服务号" en="WeChat" /></span></div>
          <div className="lx-footer-qr"><Image src="/images/miniapp-qrcode.png" alt="灵犀场小程序二维码" width={78} height={78} /><span><Bi zh="小程序" en="Mini Program" /></span></div>
        </section>
      </div>

      <div className="lx-footer-legal">
        <strong><Bi zh="法律与规则" en="LEGAL" /></strong>
        <Link href="/terms"><Bi zh="用户服务协议" en="Terms" /></Link>
        <Link href="/privacy"><Bi zh="隐私政策" en="Privacy" /></Link>
        <Link href="/declaration"><Bi zh="系统声明" en="Declaration" /></Link>
        <Link href="/refunds"><Bi zh="制作结算与退回" en="Settlement & Returns" /></Link>
        <Link href="/legal/sasi"><Bi zh="SASI 创作规则" en="SASI Rules" /></Link>
        <a className="lx-icp-link" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" aria-label="前往工业和信息化部政务服务平台查询备案信息">湘ICP备2026031465号 ↗</a>
      </div>
    </footer>
  );
}
