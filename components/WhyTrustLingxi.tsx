"use client";

import Bi from "@/components/Bi";

// 为什么信这份报告——GPT那份V4方案里提到的一个真实存在的缺口：
// 之前免费测试和付费报告，都是"直接给结果"，从没花一句话解释过
// "这个分数是怎么算出来的、凭什么信"。放在免费测试结果页、CTA
// 按钮前面——用户刚看完一个具体分数、正在决定"要不要继续看更深的"，
// 这个时机讲清楚方法论，比放在别处更有说服力。
export default function WhyTrustLingxi() {
  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-void-deep p-6">
      <p className="text-xs uppercase tracking-widest2 text-bone-soft">
        <Bi zh="这个分数是怎么来的" en="How This Score Was Actually Computed" />
      </p>
      <p className="mt-3 text-sm leading-7 text-bone-dim">
        <Bi
          zh="解读来自可复算的出生坐标与本地知识体系。系统先形成探索维度，再结合这些维度展开说明，帮助你观察连接方式、内在需要与行动习惯。同一组输入与计算时点会得到一致的结果；这些分数是自我探索的参照，不决定一个人的价值或未来。"
          en="This isn't improvised on the spot. Underneath, Lingxi Field runs a Life Vector Engine — real astronomical data (the exact position of the planets right now) and real calendrical data (your bazi pillars) get computed into a fixed set of numbers first. Traits like stress recovery or social drive are scored before any writing happens — Lingxi explains a structure that's already been calculated, it doesn't decide on its own whether to call you resilient. Run the same birth data again, and the underlying scores come out identical. That's the core difference from a typical horoscope site: most just ask and answer directly; this computes the structure first, and only asks Lingxi to explain it clearly."
        />
      </p>
    </div>
  );
}
