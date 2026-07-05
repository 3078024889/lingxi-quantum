import Link from "next/link";
import Bi from "./Bi";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="font-display text-sm tracking-widest2 text-bone-dim/70">
          <Bi zh="灵犀 LINGXI · 一道活的意识场" en="LINGXI · A Living Field of Consciousness" />
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] text-bone-dim/70">
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
        </div>
      </div>
    </footer>
  );
}
