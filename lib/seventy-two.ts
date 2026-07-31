// ────────────────────────────────────────────────────────────────
// 灵犀场 · 七十二变合成器
// ────────────────────────────────────────────────────────────────
// 取法《易经》：64 卦不是有人写了 64 段，是 8 经卦两两相重，义自然生。
// 这里是 8 情绪相 × 9 场域位 = 72 变。
//
// 关键在于它是**合成**，不是穷举：
//   基底只有 8 + 9 = 17 段，加上每个符号自己的核心义，
//   就能生出 72 种读法。加一个新符号，立刻多 72 变，
//   不需要为它写 72 段文字。
//
// 但纯机械合成会有机械感——这一点《易经》也早就解决了：64 卦各有
// 卦辞，不只是两卦相加。所以这里保留 overrides：某一格如果有手写
// 内容，用手写的；没有，才用合成的。手写优先，合成兜底。
//
// 这就是"变数"的真正来源——不是随机（随机会毁掉可复算），
// 是结构本身能生。

export type EmotionKey =
  | "curiosity" | "fear" | "calm" | "grief"
  | "anger" | "longing" | "unease" | "relief";

export type PositionKey =
  | "origin" | "approach" | "threshold" | "inside"
  | "depth" | "turn" | "return" | "residue" | "release";

type Axis = { key: string; zh: string; en: string; stanceZh: string; stanceEn: string };

export type Axes = { emotions: Axis[]; positions: Axis[] };

export type Symbol = {
  id: string;
  symbolZh: string;
  symbolEn: string;
  corePattern: string;           // 这个符号的核心义（写作用，不直出）
  coreZh: string;                // 直出：这个符号在场域里代表什么
  coreEn: string;
  readings?: { emotion: string; fieldText: { zh: string; en: string } }[]; // 旧结构，兼容
};

// 手写覆盖：某一格（符号+情绪+位）如果值得单独写，就写在这里。
// 相当于《易经》的卦辞——最有分量的那些格，不交给合成。
export type Override = {
  symbol: string;
  emotion: EmotionKey;
  position: PositionKey;
  fieldText: { zh: string; en: string };
};

function find(list: Axis[], key: string): Axis | undefined {
  return list.find((a) => a.key === key);
}

export type Reading = {
  cell: string;                       // 例如 "snake·fear·depth"
  source: "authored" | "composed";    // 手写的还是合成的
  zh: string;
  en: string;
};

// ── 合成一格 ──
// 合成规则不是把三段话拼起来（那样一定读着像拼的），而是让三者
// 各司其职：符号给"是什么"，位给"在哪一段"，情绪给"你正怎样面对它"。
// 三句合起来是一个完整的判断，不是三个碎片。
export function compose(
  sym: Symbol,
  emotion: EmotionKey,
  position: PositionKey,
  axes: Axes,
  overrides: Override[] = []
): Reading {
  const cell = `${sym.id.replace("dream.sym.", "")}·${emotion}·${position}`;

  const hit = overrides.find(
    (o) => sym.id.endsWith(o.symbol) && o.emotion === emotion && o.position === position
  );
  if (hit) return { cell, source: "authored", zh: hit.fieldText.zh, en: hit.fieldText.en };

  const e = find(axes.emotions, emotion);
  const p = find(axes.positions, position);
  if (!e || !p) {
    return { cell, source: "composed", zh: sym.coreZh, en: sym.coreEn };
  }

  const zh =
    `${sym.coreZh}` +
    `这一次它出现在「${p.zh}」——${p.stanceZh}。` +
    `而你当时的位置是${e.zh}：${e.stanceZh}。` +
    `把这两件事放在一起看，比单独看符号本身要准得多——` +
    `同一个符号，在不同的位置、不同的面对方式里，说的从来不是同一件事。`;

  const en =
    `${sym.coreEn} ` +
    `This time it appears at the ${p.en} — ${p.stanceEn}. ` +
    `And where you stood was ${e.en}: ${e.stanceEn}. ` +
    `Reading those two together is far more accurate than reading the symbol alone — ` +
    `the same symbol, at a different position and met in a different way, is never saying the same thing.`;

  return { cell, source: "composed", zh, en };
}

// 列出一个符号的全部 72 变（用于后台校对：看哪些格值得手写覆盖）
export function allCells(sym: Symbol, axes: Axes, overrides: Override[] = []): Reading[] {
  const out: Reading[] = [];
  for (const e of axes.emotions) {
    for (const p of axes.positions) {
      out.push(compose(sym, e.key as EmotionKey, p.key as PositionKey, axes, overrides));
    }
  }
  return out;
}

// 覆盖率统计——告诉你 72 格里有多少已经手写、多少还在吃合成兜底。
// 这个数字就是这个符号的"成熟度"。
export function coverage(sym: Symbol, axes: Axes, overrides: Override[]) {
  const cells = allCells(sym, axes, overrides);
  const authored = cells.filter((c) => c.source === "authored").length;
  return { total: cells.length, authored, composed: cells.length - authored,
           percent: Math.round((authored / cells.length) * 100) };
}
