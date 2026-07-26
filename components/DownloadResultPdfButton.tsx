"use client";

import { useState } from "react";
import Bi from "./Bi";

// 给服务端渲染的页面（今日运势、今日塔罗这类）用的下载按钮——这些
// 页面本身没有客户端state，没法用React ref拿到要截图的区域，改成
// 传一个DOM id，点击的时候用document.getElementById现查，效果
// 一样，但不需要把整个页面改成客户端组件。
export default function DownloadResultPdfButton({
  targetId,
  fileName,
  bgColorRgb,
  bgColorHex,
  colorClass = "border-lattice/40 text-lattice hover:border-lattice hover:bg-lattice/10",
}: {
  targetId: string;
  fileName: string;
  bgColorRgb: [number, number, number];
  bgColorHex: string;
  colorClass?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setDownloading(true);
    try {
      const { exportSimplePdf } = await import("@/lib/pdf-export");
      await exportSimplePdf({ containerRef: el, fileName, bgColorRgb, bgColorHex });
    } catch (e) {
      console.error("PDF 生成失败:", e);
      alert("PDF 生成失败，请稍后再试。 / PDF generation failed — please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={downloading}
      className={`rounded-sm border px-6 py-3 font-display text-sm uppercase tracking-widest2 transition disabled:opacity-50 ${colorClass}`}
    >
      {downloading ? <Bi zh="正在生成 PDF…" en="Generating PDF…" /> : <Bi zh="下载 PDF" en="Download PDF" />}
    </button>
  );
}
