"use client";

import { useState } from "react";
import Bi from "./Bi";
import FaqSchema, { type FaqItem } from "./FaqSchema";

// GEO的一个重要原则：结构化数据和页面上真人能看到的内容，最好是
// 同一份，不要只在看不见的schema里塞一堆关键词、页面上却什么都
// 没有——这种"藏起来的结构化数据"，搜索引擎和AI都会打折扣甚至
// 判定为垃圾信息。这个组件把FAQ同时渲染成真人可读的手风琴列表 +
// 对应的schema标记，一份数据源，两种呈现。
export type BilingualFaqItem = { qZh: string; qEn: string; aZh: string; aEn: string };

export default function FaqSection({
  items,
  titleZh = "常见问题",
  titleEn = "Frequently Asked Questions",
}: {
  items: BilingualFaqItem[];
  titleZh?: string;
  titleEn?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const zhItems: FaqItem[] = items.map((it) => ({ q: it.qZh, a: it.aZh }));
  const enItems: FaqItem[] = items.map((it) => ({ q: it.qEn, a: it.aEn }));

  return (
    <section className="mt-10">
      <FaqSchema items={[...zhItems, ...enItems]} />
      <h2 className="font-display text-2xl font-light text-bone">
        <Bi zh={titleZh} en={titleEn} />
      </h2>
      <div className="mt-6 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-sm border border-white/10 bg-void-deep">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <span className="font-display text-base text-bone">
                <Bi zh={item.qZh} en={item.qEn} />
              </span>
              <span className="shrink-0 text-lattice">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <p className="px-6 pb-5 text-sm leading-7 text-bone-dim">
                <Bi zh={item.aZh} en={item.aEn} />
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
