import Link from "next/link";
import Bi from "./Bi";

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
            <Bi zh="创造源" en="Origin Field" />
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
        </div>
        {/* 免责声明——说清楚服务性质，不构成医疗/金融/法律等专业建议，
            这条不用Bi切换（两种语言都常驻显示），因为这是给所有访客
            看的合规声明，不只是给切换到对应语言的人看。 */}
        <div className="w-full border-t border-white/10 pt-6 text-center text-xs leading-6 text-bone-dim/85">
          <p>
            灵犀场是一款数字化自我探索平台，提供个性化生命结构分析、象征体系探索、创意叙事内容及数字报告服务。所有内容用于个人探索与反思体验，不构成医疗、金融、法律等专业建议。
          </p>
          <p className="mt-2">
            Lingxi Field is a digital self-exploration platform. We provide personalized symbolic analysis, reflection tools, creative narratives, and digital reports. Our services are designed for personal reflection and entertainment purposes only, and do not provide medical, financial, legal, or other professional advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
