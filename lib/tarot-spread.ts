import { TAROT_MAJOR_ARCANA, type TarotCard } from "./tarot-data";

// ────────────────────────────────────────────────────────────────────
// 灵犀量子塔罗 · 三张牌阵（过去/现在/未来）
// ────────────────────────────────────────────────────────────────────
// 付费版的抽牌，跟免费的"今日一卡"不一样——今日一卡是全场域共享同一张
// （靠日期哈希），这里是"这个人专属的三张牌"，靠的是这个人真实的命盘
// 数据（不是Math.random()纯随机）。理由：全站其余产品（韧性指数、
// 桃花磁场）都是"同一份出生数据，重新打开结果不变"，塔罗深度探索
// 作为付费产品，也应该遵守同一条原则——用户付费买的是"专属于我的
// 三张牌"，不是"每次点开都不一样的抽奖"，后者更像博彩感，不符合
// "确定性计算+AI叙事"这个贯穿全站的方法论。
//
// 三张牌分别取自命盘不同的切片：
//   过去 ← 年柱+月柱（出生更早期的时间维度，对应"从哪里来"）
//   现在 ← 日柱+太阳星座+月亮星座（日主/太阳月亮最贴近"这个人本身"）
//   未来 ← 时柱+五行分布里最旺的元素（时柱+当下能量趋势，指向"往哪走"）
function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export type TarotSpread = {
  past: TarotCard;
  present: TarotCard;
  future: TarotCard;
};

export function drawTarotSpread(input: {
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
  sunSignZh: string; moonSignZh: string;
  wuXingCount: Record<string, number>;
}): TarotSpread {
  const total = TAROT_MAJOR_ARCANA.length;
  const dominantElement =
    (Object.entries(input.wuXingCount).sort((a, b) => b[1] - a[1])[0] ?? ["", 0])[0];

  let pastIdx = hashToIndex(`past:${input.yearPillar}:${input.monthPillar}`, total);
  let presentIdx = hashToIndex(`present:${input.dayPillar}:${input.sunSignZh}:${input.moonSignZh}`, total);
  let futureIdx = hashToIndex(`future:${input.hourPillar ?? "notime"}:${dominantElement}`, total);

  // 三个哈希结果小概率会撞在一起（同一张牌出现两次，"过去现在未来
  // 都是这张牌"读起来会很奇怪）——撞了就顺移一位，直到三个都不重复，
  // 顺移量很小，不影响"由命盘决定"这个确定性本质。
  const used = new Set<number>();
  const resolve = (idx: number) => {
    let i = idx;
    while (used.has(i)) i = (i + 1) % total;
    used.add(i);
    return i;
  };
  pastIdx = resolve(pastIdx);
  presentIdx = resolve(presentIdx);
  futureIdx = resolve(futureIdx);

  return {
    past: TAROT_MAJOR_ARCANA[pastIdx],
    present: TAROT_MAJOR_ARCANA[presentIdx],
    future: TAROT_MAJOR_ARCANA[futureIdx],
  };
}
