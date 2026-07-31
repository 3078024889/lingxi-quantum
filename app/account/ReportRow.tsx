"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";

// 报告列表原来整行都是一个 <Link>，直接点哪里都会跳转。要加一个删除
// 按钮，就不能再让整行是个 <a> 标签了（<button> 嵌在 <a> 里是无效
// HTML）——改成这个客户端组件，链接和删除按钮各管各的区域。
export default function ReportRow({
  id,
  title,
  date,
}: {
  id: string;
  title: string | null;
  date: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    const res = await fetch("/api/lifemap/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-void-deep px-2 py-1">
      <Link href={`/life-map/full?id=${id}`} className="flex flex-1 items-center justify-between px-3 py-2 transition hover:opacity-80">
        <span className="font-display text-lattice">{title || <Bi zh="未命名报告" en="Untitled report" />}</span>
        <span className="text-xs text-bone-dim">{date}</span>
      </Link>
      {confirming ? (
        <div className="flex shrink-0 items-center gap-1.5 pr-1">
          <button
            onClick={doDelete}
            disabled={deleting}
            className="rounded-sm border border-rose/50 px-2 py-1 text-xs text-rose transition hover:bg-rose/10 disabled:opacity-50"
          >
            <Bi zh="确认删除" en="Confirm" />
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-sm border border-white/15 px-2 py-1 text-xs text-bone-dim transition hover:text-bone"
          >
            <Bi zh="取消" en="Cancel" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          aria-label="删除这份报告"
          title="删除这份报告"
          className="shrink-0 rounded-sm p-2 text-bone-soft transition hover:bg-rose/10 hover:text-rose"
        >
          {/* 删除图标——线条极简的垃圾桶，颜色跟在场域背景光里的其他
             图标一样，默认是低调的暗色，只有hover时才提示"危险动作" */}
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6M6 6l.6 10a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
