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
          zh="不是临场编的。灵犀场底层是一套「生命向量引擎」——先用真实天文数据（此刻行星在黄道上的精确位置）和真实历法数据（你的四柱八字），算出一组固定的数字，人格倾向、情感深度、社交驱动这些维度，全部是先算出分数，灵犀才根据这些已经算好的数字去写解读，不是灵犀自己决定要不要说你「压力恢复能力强」。同一份出生数据，任何时候重新算，前面的分数都是一样的——这是它跟一般算命网站最大的不同：别的网站是「直接问、直接给答案」，这里是「先算出结构，灵犀只负责讲清楚这个结构」。"
          en="This isn't improvised on the spot. Underneath, Lingxi Field runs a Life Vector Engine — real astronomical data (the exact position of the planets right now) and real calendrical data (your bazi pillars) get computed into a fixed set of numbers first. Traits like stress recovery or social drive are scored before any writing happens — Lingxi explains a structure that's already been calculated, it doesn't decide on its own whether to call you resilient. Run the same birth data again, and the underlying scores come out identical. That's the core difference from a typical horoscope site: most just ask and answer directly; this computes the structure first, and only asks Lingxi to explain it clearly."
        />
      </p>
    </div>
  );
}
