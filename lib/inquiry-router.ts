// ────────────────────────────────────────────────────────────────
// 灵犀场 · 提问路由
// ────────────────────────────────────────────────────────────────
// 用户问一个问题，系统要判断的是：他真正在问的是哪一类事。
// 判断依据有两个，加权合并：
//   1. 关键词信号——他说了什么
//   2. 浏览轨迹信号——他最近打开过哪些页面
// 第二个信号常常比第一个准。一个人反复看重塑潜意识那几页，
// 然后问「我为什么总是这样」，他要的不是解释，是那条路径。
//
// 三条硬规矩，写在代码里而不是靠人记得：
// 1. 先把问题答好，再谈引导。绝不为了转化而把答案留一半——
//    那会让整套体系变成话术，而话术是留不住人的。
// 2. 免费的东西要明说免费（重塑潜意识）。藏起来等用户自己发现，
//    是把信任换成一次转化，换亏了。
// 3. 出现真实的痛苦信号时，一律不引导任何付费产品。
//    这一条优先级最高，压过所有其他判断。

import intentsData from "@/knowledge/inquiry/intents.json";

export type IntentKey =
  | "manifest_outcome" | "stuck_pattern" | "future_fate" | "dream"
  | "relationship" | "meaning" | "read_story";

type Intent = {
  key: string; zh: string; en: string;
  keywords: string[];
  pageSignals: string[];
  route: { primary: string; secondary: string | null };
  cautionZh: string; frameZh: string; frameEn: string;
};

const INTENTS = intentsData.intents as Intent[];

// 需要优先处理的信号——出现这些词时，不做任何产品引导。
// 这不是关键词过滤，是判断"此刻这个人需要的不是产品"。
const DISTRESS = [
  "活不下去", "不想活", "撑不住了", "没意义了", "结束这一切",
  "伤害自己", "everything is pointless", "want to die",
];

export type RouteResult = {
  intent: IntentKey | null;
  confidence: number;        // 0–1
  matchedBy: string[];       // 命中了什么——必须能解释，不能是黑箱
  route: { primary: string; secondary: string | null } | null;
  frameZh: string;
  frameEn: string;
  cautionZh: string;
  suppressRouting: boolean;  // true 时：只回应，不引导任何产品
};

export function routeInquiry(
  question: string,
  recentPages: string[] = []
): RouteResult {
  const q = question.toLowerCase();

  // 最高优先级：真实痛苦信号。压过一切意图判断。
  if (DISTRESS.some((w) => q.includes(w.toLowerCase()))) {
    return {
      intent: null, confidence: 1, matchedBy: ["distress-signal"],
      route: null, suppressRouting: true,
      cautionZh: "此刻不引导任何产品。先回应人，不回应问题。若对方处在持续的痛苦里，平常地提一句：跟专业的人或信任的人聊一聊是值得的。不渲染，不惊吓，也不假装自己能替代任何专业支持。",
      frameZh: "先让对方知道这句话被听见了。不急着分析，不给方案，不推任何东西。",
      frameEn: "Let the person know the sentence was heard. Don't rush to analyze, don't offer a plan, don't suggest anything.",
    };
  }

  const scored = INTENTS.map((it) => {
    const matched: string[] = [];
    let score = 0;

    for (const k of it.keywords) {
      if (q.includes(k.toLowerCase())) { score += 2; matched.push(`词:${k}`); }
    }
    // 浏览轨迹权重更高——人做过什么，比人说过什么更准
    for (const p of it.pageSignals) {
      if (recentPages.some((rp) => rp.startsWith(p))) { score += 3; matched.push(`轨迹:${p}`); }
    }
    return { it, score, matched };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top || top.score === 0) {
    return {
      intent: null, confidence: 0, matchedBy: [], route: null, suppressRouting: false,
      cautionZh: "没有识别出明确意图。不要硬套一个产品——宁可只答问题。",
      frameZh: "直接回答问题本身。答完之后，如果确实有相关的东西，用一句话提一下就够；没有就不提。",
      frameEn: "Answer the question itself. If something related genuinely exists, one sentence is enough; if not, say nothing.",
    };
  }

  // 置信度：8分及以上算高。用于决定引导的力度——
  // 低置信度时只答不引，避免把人推到不相干的地方。
  const confidence = Math.min(1, top.score / 8);

  return {
    intent: top.it.key as IntentKey,
    confidence,
    matchedBy: top.matched,
    route: confidence >= 0.5 ? top.it.route : null,
    frameZh: top.it.frameZh,
    frameEn: top.it.frameEn,
    cautionZh: top.it.cautionZh,
    suppressRouting: false,
  };
}
