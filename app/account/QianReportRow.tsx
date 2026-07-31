"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Bi from "@/components/Bi";

// 跟 ReportRow.tsx（生命图谱那份）是同一套交互，换成生命灵签对应的
// 接口和链接。
export default function QianReportRow({
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
    const res = await fetch("/api/qian/delete", {
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
      <Link href={`/qian/full?id=${id}`} className="flex flex-1 items-center justify-between px-3 py-2 transition hover:opacity-80">
        <span className="font-display text-lattice">{title || <Bi zh="未命名记录" en="Untitled reading" />}</span>
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
          aria-label="删除这份记录"
          title="删除这份记录"
          className="shrink-0 rounded-sm p-2 text-bone-soft transition hover:bg-rose/10 hover:text-rose"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6M6 6l.6 10a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
