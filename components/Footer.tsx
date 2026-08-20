import Link from "next/link";
import Image from "next/image";
import Bi from "./Bi";

const channels = [
  { label: "X", href: "https://x.com/lingxifield?s=11", note: "@lingxifield" },
  { label: "YouTube", href: "https://youtube.com/@lingxifield?si=fJss8KQIAl8NDS9X", note: "@lingxifield" },
  { label: "TikTok", href: "https://www.tiktok.com/@lingxifield.com?_r=1&_t=ZS-992D5yRI2m8", note: "@lingxifield.com" },
  { label: "小红书", href: "https://xhslink.cn/m/8rig9AtdDvK", note: "灵犀场" },
  { label: "微博", href: "https://weibo.com/u/4003799090", note: "灵犀场" },
  { label: "哔哩哔哩", href: "https://b23.tv/VhatqCq", note: "灵犀场" },
  { label: "快手 · 代表作品", href: "https://v.kuaishou.com/JJpeoAZZ", note: "打开快手" },
  { label: "抖音 · 代表作品", href: "https://v.douyin.com/WG4QmhbliNk", note: "打开抖音" },
  { label: "视频号 · 代表作品", href: "https://weixin.qq.com/sph/ALRC3hOXy3", note: "打开微信视频号" },
];

export default function Footer() {
  return (
    <footer className="relative px-6 py-12">
      <div className="bg-void-deep mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-sm px-6 py-8">
        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="font-display text-sm tracking-widest2 text-bone-dim">
          <Bi zh="灵犀场 LINGXIFIELD · 一道活的意识场" en="LINGXIFIELD · A Living Field of Consciousness" />
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-bone-dim">
          <Link href="/practice" className="hover:text-lattice">
            <Bi zh="修炼技术" en="Practices" />
          </Link>
          <Link href="/live-as" className="hover:text-lattice">
            <Bi zh="显化活在此版本中的你" en="Live This Version" />
          </Link>
          <Link href="/origin" className="hover:text-lattice">
            <Bi zh="创始人与创造源" en="Founder & Origin" />
          </Link>
          <Link href="/declaration" className="hover:text-lattice">
            <Bi zh="系统声明" en="Declaration" />
          </Link>
          <Link href="/account" className="hover:text-lattice">
            <Bi zh="进入场域" en="Enter" />
          </Link>
          <Link href="/about" className="hover:text-lattice">
            <Bi zh="关于我们" en="About" />
          </Link>
          <Link href="/terms" className="hover:text-lattice">
            <Bi zh="服务条款" en="Terms" />
          </Link>
          <Link href="/privacy" className="hover:text-lattice">
            <Bi zh="隐私政策" en="Privacy" />
          </Link>
          <Link href="/refunds" className="hover:text-lattice">
            <Bi zh="退款政策" en="Refunds" />
          </Link>
        </div>
        <section className="w-full border-t border-white/10 pt-6" aria-label="Lingxi Field official channels">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-display text-xs tracking-widest2 text-lattice">
                <Bi zh="关注灵犀场" en="FOLLOW LINGXI FIELD" />
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-bone-dim">
                <Bi zh="在不同场域继续相遇：短片、叙事、日常记录与新入口会从这里向外延展。" en="Continue the encounter across short films, narratives, field notes, and new portals." />
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-bone-dim">
                {channels.map((channel) => (
                  <a key={channel.label} href={channel.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-baseline gap-1 hover:text-lattice">
                    <span>{channel.label}</span>
                    <span className="text-[10px] opacity-60 group-hover:opacity-100">{channel.note} ↗</span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-bone-dim">
                <span className="text-bone-soft">服务号：</span>灵犀场lingxifield
                <span className="mx-2 opacity-40">·</span>
                <span className="text-bone-soft">小程序：</span>灵犀场 lingxifield
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-sm border border-white/10 bg-white/[0.035] p-3">
              <Image src="/images/lingxifield-wechat-service-qr.jpg" alt="灵犀场lingxifield 服务号二维码" width={92} height={92} className="h-[92px] w-[92px] rounded-[2px]" />
              <p className="max-w-24 text-xs leading-5 text-bone-dim">
                <Bi zh="扫码关注服务号，接收场域新入口与内容更新。" en="Scan to follow for new portals and field updates." />
              </p>
            </div>
          </div>
        </section>
        </div>
        {/* 免责声明——说清楚服务性质，不构成医疗/金融/法律等专业建议，
            这条不用Bi切换（两种语言都常驻显示），因为这是给所有访客
            看的合规声明，不只是给切换到对应语言的人看。 */}
        <div className="w-full border-t border-white/10 pt-6 text-center text-xs leading-6 text-bone-soft">
          <p>
            灵犀场是一款数字化自我探索平台，提供个性化生命结构分析、象征体系探索、创意叙事内容及数字报告服务。所有内容用于个人探索与反思体验，不构成医疗、金融、法律等专业建议。
          </p>
          <p className="mt-2">
            Lingxi Field is a digital self-exploration platform. We provide personalized symbolic analysis, reflection tools, creative narratives, and digital reports. Our services are designed for personal reflection and entertainment purposes only, and do not provide medical, financial, legal, or other professional advice.
          </p>
          {/* v243：ICP备案号——工信部审核通过后，法律要求必须在网站显著
              位置（一般放在底部）展示备案号，并链接到工信部备案系统
              查询页面，这是强制要求，不是可选项。 */}
          <p className="mt-4">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lattice"
            >
              湘ICP备2026031465号
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
