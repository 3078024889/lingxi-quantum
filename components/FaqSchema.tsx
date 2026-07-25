// ────────────────────────────────────────────────────────────────────
// FAQ结构化数据（schema.org FAQPage）——供各核心产品页面复用
// ────────────────────────────────────────────────────────────────────
// 这是专门给搜索引擎和AI抓取器（ChatGPT/Perplexity/Google AI Overview/
// 百度这些）看的结构化数据，不是给真人看的可见文字（虽然下面也会把
// 同样的问答内容渲染成真人能看到的FAQ区块，两边共用同一份数据源，
// 不用维护两份内容）。写法上刻意让每个答案都能"独立成句"——第一句
// 话就直接给出关键结论，不是先绕一圈背景介绍才说重点，这样AI抓取
// 摘录的时候，就算只截取第一句也能读懂、能直接引用。
export type FaqItem = { q: string; a: string };

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export default function FaqSchema({ items }: { items: FaqItem[] }) {
  const jsonLd = buildFaqSchema(items);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
