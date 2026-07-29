"use client";

import { useState } from "react";
import Bi from "@/components/Bi";

// v253：已解锁订单的区块越来越多（8个报告类产品 + 多维叙事），
// 场域入口页面变得很长——照导航菜单那种"点标题展开/收起"的方式，
// 做成可折叠的区块，默认收起，点了才展开，不用一进页面就看一整屏
// 的列表。
export default function CollapsibleSection({
  titleZh,
  titleEn,
  count,
  defaultOpen = false,
  children,
}: {
  titleZh: string;
  titleEn: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 w-full text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-sm border border-white/10 bg-void-deep px-4 py-3 text-left transition hover:border-lattice/40"
      >
        <span className="text-sm text-bone-dim">
          <Bi zh={titleZh} en={titleEn} /> <span className="text-lattice">({count})</span>
        </span>
        <span className={`text-lattice transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}
