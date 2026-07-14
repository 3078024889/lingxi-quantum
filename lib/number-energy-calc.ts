// 数字能量学 · 手机号/车牌号测试
//
// 说明范围：这是民俗数字学（把号码拆成两两一组的"数字组合"，每组组合对应
// 一句约定俗成的吉凶说法），不是天文/历法一类"可用公式复核"的计算，是
// 约定俗成的符号系统本身——跟星座、纳音性质类似，是一套"大家公认的
// 符号含义表"，不是我们生造的。这里用的是数字能量学里最常见、流传最广的
// 81数（九宫飞星/易经数）灵动数对照体系。

// 尾数两两分组，查"81数灵动数表"（1~81，逢0补10重复循环用最后两位数）
const LINGDONG: { range: [number, number]; level: "great" | "good" | "neutral" | "caution"; zh: string; en: string }[] = [
  { range: [1, 1], level: "great", zh: "太极之数，万物开泰，头脑清晰，天赋极佳", en: "The number of the great origin — clarity of mind, natural talent." },
  { range: [2, 2], level: "caution", zh: "分离之数，动摇不安，凡事宜稳", en: "The number of separation — restless, best paired with stability." },
  { range: [3, 3], level: "great", zh: "进取之数，如旭日升空，福禄自来", en: "The number of advance — like the rising sun, fortune follows naturally." },
  { range: [4, 4], level: "caution", zh: "破坏之数，凶变不测，宜谨慎行事", en: "The number of disruption — unpredictable turns; proceed with care." },
  { range: [5, 5], level: "good", zh: "定着之数，安稳厚重，宜守成", en: "The number of stability — steady and grounded; good for holding steady." },
  { range: [6, 6], level: "great", zh: "继承之数，天赋佳运，德望兼备", en: "The number of inheritance — good fortune and quiet authority." },
  { range: [7, 7], level: "good", zh: "独立之数，刚毅果断，白手可成", en: "The number of independence — resolute; can build from nothing." },
  { range: [8, 8], level: "great", zh: "开辟之数，努力不懈，终能大成", en: "The number of new ground — persistent effort leads to real achievement." },
  { range: [9, 9], level: "caution", zh: "穷极之数，起伏极大，宜谨慎理财", en: "The number of extremes — big swings; manage resources carefully." },
  { range: [10, 10], level: "caution", zh: "终结之数，凡事宜留余地，不宜冒进", en: "The number of ending — leave room to maneuver, avoid overreach." },
  { range: [11, 11], level: "great", zh: "更新之数，草木逢春，稳中有进", en: "The number of renewal — spring after winter, steady growth." },
  { range: [12, 12], level: "caution", zh: "薄弱之数，力不从心，宜量力而行", en: "The number of thin resources — pace yourself, don't overextend." },
  { range: [13, 13], level: "great", zh: "智略之数，聪明伶俐，善于应变", en: "The number of wit — clever, adaptable, quick on their feet." },
  { range: [14, 14], level: "caution", zh: "破财之数，家庭缘薄，宜多关照家人", en: "The number of scattering — give extra care to family and finances." },
  { range: [15, 15], level: "great", zh: "福寿之数，谦虚温和，众人扶持", en: "The number of grace — humble, well-supported by others." },
  { range: [16, 16], level: "great", zh: "厚德之数，贵人得助，能成大事", en: "The number of virtue — help arrives when needed; capable of big things." },
  { range: [17, 17], level: "good", zh: "刚强之数，勇往直前，需防固执", en: "The number of resolve — bold and driven; watch for stubbornness." },
  { range: [18, 18], level: "great", zh: "铁镜之数，才略奇特，能成非凡之业", en: "The number of sharp insight — unusual talent, capable of the exceptional." },
  { range: [19, 19], level: "caution", zh: "多难之数，虽有智谋，波折较多", en: "The number of trials — resourceful, but the road has more bumps." },
  { range: [20, 20], level: "caution", zh: "屋下藏金之数，外表平静，内藏波折", en: "Calm on the surface, more going on underneath — proceed thoughtfully." },
  { range: [21, 21], level: "great", zh: "明月中天之数，权威隆重，多受敬重", en: "The number of a bright moon — respected, carries quiet authority." },
  { range: [22, 22], level: "caution", zh: "秋草逢霜之数，多有阻碍，宜坚忍", en: "The number of frost on autumn grass — obstacles call for patience." },
  { range: [23, 23], level: "great", zh: "旭日升天之数，权势旺盛，功名可望", en: "The number of the rising sun — strong momentum, recognition follows." },
  { range: [24, 24], level: "great", zh: "家门余庆之数，白手成家，财源广进", en: "The number of a flourishing household — building wealth from scratch." },
  { range: [25, 25], level: "good", zh: "英俊之数，才华出众，性情稍偏刚硬", en: "The number of sharp talent — gifted, with a somewhat firm temperament." },
  { range: [26, 26], level: "caution", zh: "波澜之数，起伏跌宕，宜稳健应对", en: "The number of rough seas — ups and downs; steady footing matters." },
  { range: [27, 27], level: "caution", zh: "增长之数，中年后运，宜守正待时", en: "The number of gradual gain — momentum builds later; stay the course." },
  { range: [28, 28], level: "caution", zh: "阔水浮萍之数，飘泊无依，宜早立根基", en: "Duckweed on open water — build stable ground early." },
  { range: [29, 29], level: "good", zh: "智谋兼备之数，成功可期，宜防口舌", en: "The number of resourcefulness — success is likely; mind your words." },
  { range: [30, 30], level: "neutral", zh: "沉浮不定之数，吉凶参半，行事宜谨慎", en: "A number of mixed tides — outcomes vary; move carefully." },
];

function normalize81(n: number): number {
  let x = n;
  while (x > 30) x -= 30; // 超出表格范围的，循环取模，落在同一套含义区间内
  if (x <= 0) x = 30;
  return x;
}

function lookupLingdong(n: number) {
  const norm = normalize81(n);
  return LINGDONG.find((l) => norm >= l.range[0] && norm <= l.range[1]) ?? LINGDONG[LINGDONG.length - 1];
}

export type NumberEnergyResult = {
  raw: string;
  digitsOnly: string;
  totalSum: number;
  lingdong: ReturnType<typeof lookupLingdong>;
  pairBreakdown: { pair: string; sum: number; lingdong: ReturnType<typeof lookupLingdong> }[];
};

function analyzeDigits(raw: string): NumberEnergyResult {
  const digitsOnly = raw.replace(/\D/g, "");
  const digits = digitsOnly.split("").map(Number);
  const totalSum = digits.reduce((a, b) => a + b, 0);
  const pairBreakdown: NumberEnergyResult["pairBreakdown"] = [];
  for (let i = 0; i + 1 < digits.length; i++) {
    const pairSum = digits[i] + digits[i + 1];
    pairBreakdown.push({ pair: `${digits[i]}${digits[i + 1]}`, sum: pairSum, lingdong: lookupLingdong(pairSum) });
  }
  return { raw, digitsOnly, totalSum, lingdong: lookupLingdong(totalSum), pairBreakdown };
}

export function analyzePhoneNumber(phone: string): NumberEnergyResult {
  return analyzeDigits(phone);
}

// 车牌号：中文字母/汉字部分（省份简称+字母）不参与数字计算，只取数字部分
export function analyzePlateNumber(plate: string): NumberEnergyResult {
  return analyzeDigits(plate);
}
