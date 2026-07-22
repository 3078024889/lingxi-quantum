import { ORIGIN_SIGNS, SOUL_SIGNS, WALKER_SIGNS, type LifeSign } from "./qian-data";

// ────────────────────────────────────────────────────────────────────
// 灵犀生命灵签 · 确定性抽签
// ────────────────────────────────────────────────────────────────────
// 年柱→源流签(24枚池)、日柱→灵魂签(24枚池)、时柱→行者签(16枚池)——
// 三层各自独立的象征池，不是同一批签换个名字。每根柱子本身是60甲子
// 里的一个真实组合，这里把它哈希映射到对应层的池子大小上，同一份
// 出生数据，重新读取还是同样的三枚签——"这签是你的"这句话依然成立，
// 只是现在签库本身更丰富（64枚原型，而不是60甲子字面意义上的重复）。
function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % mod;
}

export function drawThreeSigns(input: {
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
}): [LifeSign, LifeSign, LifeSign] {
  const origin = ORIGIN_SIGNS[hashToIndex(`origin:${input.yearPillar}`, ORIGIN_SIGNS.length)];
  const soul = SOUL_SIGNS[hashToIndex(`soul:${input.dayPillar}`, SOUL_SIGNS.length)];
  const walkerSeed = input.hourPillar ? `walker:${input.hourPillar}` : `walker:${input.monthPillar}:${input.dayPillar}`;
  const walker = WALKER_SIGNS[hashToIndex(walkerSeed, WALKER_SIGNS.length)];
  return [origin, soul, walker];
}
