"use client";

import { useEffect, useState } from "react";

// 注销账户后会跳回首页——这个组件负责把 DeleteAccountButton 存进
// sessionStorage 的那句告别语，显示一次然后清掉，不会在之后的访问里
// 反复出现。
export default function FarewellBanner() {
  const [msg, setMsg] = useState<{ zh: string; en: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lx-farewell");
      if (raw) {
        setMsg(JSON.parse(raw));
        sessionStorage.removeItem("lx-farewell");
      }
    } catch {
      // ignore
    }
  }, []);

  if (!msg) return null;

  const isEn = typeof document !== "undefined" && document.documentElement.classList.contains("lang-en");

  return (
    <div className="fixed inset-x-0 top-20 z-50 mx-auto max-w-md px-6">
      <div className="bg-void-deep rounded-sm border border-lattice/30 px-6 py-4 text-center text-sm text-bone shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        {isEn ? msg.en : msg.zh}
      </div>
    </div>
  );
}
