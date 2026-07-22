import { QIAN_SIGNS, type QianSign } from "./qian-data";

// ────────────────────────────────────────────────────────────────────
// 摇签 · 确定性抽签
// ────────────────────────────────────────────────────────────────────
// 摇出的3支签，来自这个人真实的四柱——年柱、日柱、时柱本身，就是
// 六十甲子里的3个真实组合，直接摇出这个人自己的柱，比另外用哈希算
// 3个不相干的签更贴合"这签是你的"这件事本身。没有出生时间的人，
// 时柱缺失，第三支签改用"日柱+月柱地支"合成的一个确定性索引代替。
function ganzhiToIndex(ganzhi: string): number {
  const idx = QIAN_SIGNS.findIndex((s) => s.ganzhi === ganzhi);
  return idx >= 0 ? idx : 0;
}

function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % mod;
}

export function drawThreeSigns(input: {
  yearPillar: string; monthPillar: string; dayPillar: string; hourPillar: string | null;
}): [QianSign, QianSign, QianSign] {
  const first = QIAN_SIGNS[ganzhiToIndex(input.yearPillar)];
  const second = QIAN_SIGNS[ganzhiToIndex(input.dayPillar)];
  const thirdIdx = input.hourPillar
    ? ganzhiToIndex(input.hourPillar)
    : hashToIndex(`third:${input.monthPillar}:${input.dayPillar}`, 60);
  const third = QIAN_SIGNS[thirdIdx];
  return [first, second, third];
}
