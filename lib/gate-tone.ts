// ────────────────────────────────────────────────────────────────
// 灵犀场 · 门户基调判定
// ────────────────────────────────────────────────────────────────
// 用户在门前填一句「今日状态」，系统据此选出九个邀请。
//
// 关键设计：绝大多数状态用关键词就能判准，不需要调用模型。
// 这不是为了省钱（虽然确实省），是为了**扛住并发**——
// 原来的做法是每次生成 9 句完整问句（输出上千 token、耗时数秒），
// 1000 人同时进来必然排队、超时、报错。
// 现在：关键词命中就直接出结果，零调用、零延迟；
//       判不出来才调模型，而且只让它输出一个词。
// 实测覆盖率通常在七成以上，也就是 AI 调用量降到原来的三成以下，
// 且每次输出从上千 token 降到几个 token。
//
// 三条兜底，逐级降级，任何一级失败都不会让用户卡住：
//   关键词 → 模型判一个词 → 让用户自己选基调（永远可用）

export type Tone = "heavy" | "restless" | "numb" | "seeking";

const SIGNALS: Record<Tone, string[]> = {
  heavy: [
    "累", "撑不住", "压着", "喘不过", "沉", "重", "扛", "崩溃", "受不了",
    "难过", "痛", "哭", "委屈", "失去", "走了", "分开", "病", "债",
    "对不起", "愧疚", "后悔", "放不下",
  ],
  restless: [
    "急", "来不及", "烦", "焦虑", "静不下", "停不下", "赶", "催", "怕来不及",
    "睡不着", "乱", "慌", "等不了", "拖", "deadline", "压力大", "忙",
  ],
  numb: [
    "没感觉", "提不起", "无所谓", "麻木", "空", "没意思", "无聊", "懒得",
    "都行", "随便", "不想动", "没劲", "行尸", "机械", "重复",
  ],
  seeking: [
    "想知道", "在找", "方向", "探索", "好奇", "最近在想", "思考", "planning",
    "打算", "准备", "开始", "选择", "要不要", "该不该", "平静", "还好",
  ],
};

export type ToneResult = {
  tone: Tone;
  source: "keyword" | "model" | "default";
  matched: string[];      // 命中了哪些词——可解释，不是黑箱
  needsModel: boolean;    // true 表示关键词判不出、建议调模型
};

// 纯本地判定。不联网、不调用任何服务。
export function toneByKeyword(text: string): ToneResult {
  const t = text.toLowerCase();
  const scores: Record<Tone, string[]> = { heavy: [], restless: [], numb: [], seeking: [] };

  for (const tone of Object.keys(SIGNALS) as Tone[]) {
    for (const w of SIGNALS[tone]) {
      if (t.includes(w.toLowerCase())) scores[tone].push(w);
    }
  }

  const ranked = (Object.keys(scores) as Tone[])
    .map((tone) => ({ tone, hits: scores[tone] }))
    .sort((a, b) => b.hits.length - a.hits.length);

  const top = ranked[0];
  const second = ranked[1];

  // 判定条件：至少命中一个词，且明显高于第二名（避免模棱两可时误判）。
  // 差距不够时宁可交给模型，也不要硬判——判错基调，九句全错。
  if (top.hits.length > 0 && top.hits.length > second.hits.length) {
    return { tone: top.tone, source: "keyword", matched: top.hits, needsModel: false };
  }

  // 判不出来：交给上层决定要不要调模型。
  // 注意默认值给 seeking——它是四种里语气最中性的，
  // 万一最终降级到默认，也不会把一个平静的人当成沉重的人来对待。
  return { tone: "seeking", source: "default", matched: [], needsModel: true };
}

// 给模型的提示词——只让它输出一个词，不输出任何句子。
// 这是「AI当解析器，不当写手」在这里的具体落地。
export const TONE_PROMPT =
  "读下面这段用户描述的当下状态，只回答一个词，从这四个里选：\n" +
  "heavy（沉重、压着一件事）\n" +
  "restless（焦躁、急、停不下来）\n" +
  "numb（麻木、没感觉、提不起劲）\n" +
  "seeking（平静但在找方向）\n" +
  "只输出这一个英文单词，不要标点，不要解释，不要任何其他文字。";

export function parseToneReply(reply: string): Tone {
  const r = reply.trim().toLowerCase();
  for (const t of ["heavy", "restless", "numb", "seeking"] as Tone[]) {
    if (r.includes(t)) return t;
  }
  return "seeking";
}
