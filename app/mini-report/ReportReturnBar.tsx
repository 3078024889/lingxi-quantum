"use client";

import Link from "next/link";

declare global {
  interface Window { wx?: { miniProgram?: { navigateBack?: (options?: { delta?: number }) => void } } }
}

export default function ReportReturnBar({ miniLabel = "返回八流进度", webHref = "/account" }: { miniLabel?: string; webHref?: string }) {
  const goBack = () => {
    if (window.wx?.miniProgram?.navigateBack) {
      window.wx.miniProgram.navigateBack({ delta: 1 });
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = webHref;
  };
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07102c]/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <button type="button" onClick={goBack} className="border border-lattice/45 bg-lattice/10 px-4 py-2 text-xs tracking-[.16em] text-lattice">← {miniLabel}</button>
        <Link href={webHref} className="text-xs tracking-[.16em] text-bone-dim">我的场域 · MY FIELD</Link>
      </div>
    </nav>
  );
}
