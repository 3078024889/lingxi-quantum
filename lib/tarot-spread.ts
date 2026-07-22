import { TAROT_MAJOR_ARCANA, type TarotCard } from "./tarot-data";

// ────────────────────────────────────────────────────────────────────
// 灵犀量子塔罗 · 三张牌阵（隐藏模式/当下共振/未来方向）
// ────────────────────────────────────────────────────────────────────
// 跟全站其余付费产品同一条原则：由这个人真实的命盘数据确定性算出，
// 不是Math.random()纯随机——同一份出生数据，重新打开还是同样三张牌。
// 三张牌分别取自命盘不同切片：
//   隐藏模式 ← 年柱+月柱（更早的时间维度，对应"你携带而来、未必
//              自知的模式"）
//   当下共振 ← 日柱+太阳+月亮（最贴近"这个人此刻本身"）
//   未来方向 ← 时柱+命盘里最旺的五行元素（当下能量趋势，指向
//              "可以主动把握的方向"，不是宿命预言）
function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

export type TarotSpread = {
  hidden: TarotCard;
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

  let hiddenIdx = hashToIndex(`hidden:${input.yearPillar}:${input.monthPillar}`, total);
  let presentIdx = hashToIndex(`present:${input.dayPillar}:${input.sunSignZh}:${input.moonSignZh}`, total);
  let futureIdx = hashToIndex(`future:${input.hourPillar ?? "notime"}:${dominantElement}`, total);

  // 三个哈希结果小概率撞在一起，撞了就顺移一位，直到三个都不重复。
  const used = new Set<number>();
  const resolve = (idx: number) => {
    let i = idx;
    while (used.has(i)) i = (i + 1) % total;
    used.add(i);
    return i;
  };
  hiddenIdx = resolve(hiddenIdx);
  presentIdx = resolve(presentIdx);
  futureIdx = resolve(futureIdx);

  return {
    hidden: TAROT_MAJOR_ARCANA[hiddenIdx],
    present: TAROT_MAJOR_ARCANA[presentIdx],
    future: TAROT_MAJOR_ARCANA[futureIdx],
  };
}
