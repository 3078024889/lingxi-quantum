import { Solar } from "lunar-javascript";
import type { QimenChart, StellarAncientInput } from "../ancient/types";

type Palace = "坎"|"艮"|"震"|"巽"|"离"|"坤"|"兑"|"乾"|"中";

const PALACE_ORDER_YANG: Palace[] = ["坎","坤","震","巽","中","乾","兑","艮","离"];
const PALACE_ORDER_YIN: Palace[] = [...PALACE_ORDER_YANG].reverse();

const JIE_QI_JU: Record<string, { upper:number; middle:number; lower:number }> = {
  "冬至": { upper:1, middle:7, lower:4 },
  "小寒": { upper:2, middle:8, lower:5 },
  "大寒": { upper:3, middle:9, lower:6 },
  "立春": { upper:8, middle:5, lower:2 },
  "雨水": { upper:9, middle:6, lower:3 },
  "惊蛰": { upper:1, middle:7, lower:4 },
  "春分": { upper:3, middle:9, lower:6 },
  "清明": { upper:4, middle:1, lower:7 },
  "谷雨": { upper:5, middle:2, lower:8 },
  "立夏": { upper:4, middle:1, lower:7 },
  "小满": { upper:5, middle:2, lower:8 },
  "芒种": { upper:6, middle:3, lower:9 },
  "夏至": { upper:9, middle:3, lower:6 },
  "小暑": { upper:8, middle:2, lower:5 },
  "大暑": { upper:7, middle:1, lower:4 },
  "立秋": { upper:2, middle:5, lower:8 },
  "处暑": { upper:1, middle:4, lower:7 },
  "白露": { upper:9, middle:3, lower:6 },
  "秋分": { upper:7, middle:1, lower:4 },
  "寒露": { upper:6, middle:9, lower:3 },
  "霜降": { upper:5, middle:8, lower:2 },
  "立冬": { upper:6, middle:9, lower:3 },
  "小雪": { upper:5, middle:8, lower:2 },
  "大雪": { upper:4, middle:7, lower:1 },
};

const SIX_YI = ["戊","己","庚","辛","壬","癸"];
const THREE_QI = ["丁","丙","乙"];
const NINE_STARS = ["天蓬","天芮","天冲","天辅","天禽","天心","天柱","天任","天英"];
const EIGHT_DOORS = ["休","生","伤","杜","景","死","惊","开"];

function chinaParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Shanghai", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23" }).formatToParts(d);
  const value = (type:string) => Number(parts.find(part=>part.type===type)?.value ?? 0);
  return {year:value("year"),month:value("month"),day:value("day"),hour:value("hour"),minute:value("minute"),second:value("second")};
}

function getLunarParts(d: Date) {
  const p = chinaParts(d);
  const solar = Solar.fromYmdHms(
    p.year, p.month, p.day, p.hour, p.minute, p.second
  );
  const lunar:any = (solar as any).getLunar();
  return {
    yearGz: lunar.getYearInGanZhiExact?.() ?? lunar.getYearInGanZhi?.() ?? "",
    dayGz: lunar.getDayInGanZhiExact?.() ?? lunar.getDayInGanZhi?.() ?? "",
    timeGz: lunar.getTimeInGanZhi?.() ?? "",
    jieQi: lunar.getJieQi?.() || null,
    prevJieQi: lunar.getPrevJieQi?.(true) || null,
  };
}

function getEffectiveSolarTerm(d: Date): string {
  const p = getLunarParts(d);
  if (p.jieQi && JIE_QI_JU[p.jieQi]) return p.jieQi;
  const name = p.prevJieQi?.getName?.();
  if (name && JIE_QI_JU[name]) return name;
  throw new Error("无法取得有效节气");
}

function isYangDun(term: string): boolean {
  const order = [
    "冬至","小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种",
    "夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪"
  ];
  const i = order.indexOf(term);
  return i >= 0 && i < 12;
}

const YUAN_BY_BRANCH: Record<string,"upper"|"middle"|"lower"> = {
  子:"upper", 午:"upper", 卯:"upper", 酉:"upper",
  寅:"middle", 申:"middle", 巳:"middle", 亥:"middle",
  辰:"lower", 戌:"lower", 丑:"lower", 未:"lower"
};

function nearestFuTouBranch(d: Date): string {
  // 回溯至最近甲日或己日，取其日支作为符头。
  for (let i=0;i<10;i++){
    const x = new Date(d.getTime()-i*86400000);
    const { dayGz } = getLunarParts(x);
    const gan = dayGz.slice(0,1);
    if (gan === "甲" || gan === "己") return dayGz.slice(1,2);
  }
  throw new Error("未找到甲己符头");
}

function yuanFor(d: Date) {
  return YUAN_BY_BRANCH[nearestFuTouBranch(d)] ?? "upper";
}

function palaceByJuStart(ju:number, dun:"阳遁"|"阴遁") {
  // 洛书宫数 -> palace
  const LUO: Record<number,Palace> = {1:"坎",2:"坤",3:"震",4:"巽",5:"中",6:"乾",7:"兑",8:"艮",9:"离"};
  const seq:number[] = [];
  if (dun === "阳遁") {
    for(let i=0;i<9;i++) seq.push(((ju-1+i)%9)+1);
  } else {
    for(let i=0;i<9;i++) seq.push(((ju-1-i+90)%9)+1);
  }
  return seq.map(n=>LUO[n]);
}

function earthPlate(ju:number, dun:"阳遁"|"阴遁") {
  const seq = palaceByJuStart(ju,dun);
  const stems = [...SIX_YI, ...THREE_QI];
  const result: Partial<Record<Palace,string>> = {};
  seq.forEach((p,i)=> result[p]=stems[i]);
  return result;
}

function xunHeadFromTimeGz(timeGz:string) {
  // 六甲遁六仪：甲子戊、甲戌己、甲申庚、甲午辛、甲辰壬、甲寅癸
  const pairs: Array<[string,string]> = [
    ["甲子","戊"],["甲戌","己"],["甲申","庚"],["甲午","辛"],["甲辰","壬"],["甲寅","癸"]
  ];
  const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const [g,z] = [timeGz.slice(0,1),timeGz.slice(1,2)];
  const idxG = GAN.indexOf(g), idxZ = ZHI.indexOf(z);
  // 回溯天干至甲，并同步回溯地支
  const back = (idxG - 0 + 10) % 10;
  const zHead = ZHI[(idxZ - back + 120)%12];
  const head = "甲"+zHead;
  return pairs.find(([h])=>h===head)?.[1] ?? "戊";
}

function palaceOfStem(plate:Partial<Record<Palace,string>>, stem:string): Palace {
  const found = Object.entries(plate).find(([,v])=>v===stem)?.[0] as Palace|undefined;
  if (!found) throw new Error(`地盘未找到旬首仪 ${stem}`);
  return found;
}

function palaceIndex(p:Palace) {
  const order:Palace[] = ["坎","艮","震","巽","离","坤","兑","乾"];
  return order.indexOf(p);
}

function rotate<T>(arr:T[], offset:number){
  return arr.map((_,i)=> arr[(i-offset+arr.length)%arr.length]);
}

export function createQimenProvider() {
  return async function qimenProvider(input: StellarAncientInput): Promise<QimenChart|null> {
    // 《占走失六畜》可覆盖犬与明确的牲畜门类。猫、泛称鸟类和
    // “其他动物”不因现代习性相似而被偷换进六畜用神。
    if(input.targetKind==="animal"&&!new Set(["dog","livestock"]).has(input.targetSubtype??""))return null;
    const query = new Date(input.queryTime);
    if (Number.isNaN(query.getTime())) return null;

    const term = getEffectiveSolarTerm(query);
    const dun:"阳遁"|"阴遁" = isYangDun(term) ? "阳遁" : "阴遁";
    const yuan = yuanFor(query);
    const ju = JIE_QI_JU[term][yuan];

    const lunar = getLunarParts(query);
    const plate = earthPlate(ju,dun);
    const xunYi = xunHeadFromTimeGz(lunar.timeGz);
    const chiefPalace = palaceOfStem(plate,xunYi);

    const birth = new Date(`${input.birthDate}T${input.birthTime || "12:00"}:00+08:00`);
    const birthLunar = getLunarParts(birth);
    const lifeStem = birthLunar.yearGz.slice(0,1);
    const lifeBranch = birthLunar.yearGz.slice(1,2);

    // 年命以年干落地盘。若地盘不含年干（甲），用甲所遁之仪。
    const lifeSearchStem = lifeStem === "甲" ? xunYi : lifeStem;
    let lifePalace: Palace = Object.entries(plate).find(([,v])=>v===lifeSearchStem)?.[0] as Palace;
    if (!lifePalace) {
      // 乙丙丁属于三奇，六仪/三奇均应存在；其余年干可能为甲，已转换。
      lifePalace = chiefPalace;
    }

    const eightPalaces:Palace[] = ["坎","艮","震","巽","离","坤","兑","乾"];
    const chiefIdx = palaceIndex(chiefPalace);
    const timeGan = lunar.timeGz.slice(0,1);
    const timeSearchStem = timeGan==="甲" ? xunYi : timeGan;
    const timePalace = Object.entries(plate).find(([,v])=>v===timeSearchStem)?.[0] as Palace|undefined;

    const starByPalace:Partial<Record<Palace,string>> = {};
    const doorByPalace:Partial<Record<Palace,string>> = {};

    const starRotation = dun==="阳遁" ? rotate(NINE_STARS.filter(s=>s!=="天禽"), chiefIdx<0?0:chiefIdx) : rotate(NINE_STARS.filter(s=>s!=="天禽").reverse(), chiefIdx<0?0:chiefIdx);
    const doorRotation = dun==="阳遁" ? rotate(EIGHT_DOORS, chiefIdx<0?0:chiefIdx) : rotate([...EIGHT_DOORS].reverse(), chiefIdx<0?0:chiefIdx);

    eightPalaces.forEach((p,i)=>{
      starByPalace[p]=starRotation[i%starRotation.length];
      doorByPalace[p]=doorRotation[i%doorRotation.length];
    });

    let targetRuleId:QimenChart["targetRuleId"]="QM-XR-NM-001";
    if(input.targetKind==="object"){
      lifePalace=palaceOfStem(plate,"戊");
      targetRuleId="QM-OBJECT-001";
    }else if(input.targetKind==="animal"){
      const animalPalace=Object.entries(doorByPalace).find(([,door])=>door==="死")?.[0] as Palace|undefined;
      if(!animalPalace)return null;
      lifePalace=animalPalace;
      targetRuleId="QM-ANIMAL-001";
    }

    return {
      lifeStem,
      lifeBranch,
      lifePalace,
      starByPalace,
      doorByPalace,
      dun,
      ju,
      targetRuleId,
      debug:{queryTime:input.queryTime,timeZone:"Asia/Shanghai",solarTerm:term,dun,yuan,ju,earthPlate:plate,xunHeadYi:xunYi,chiefPalace,timePalace:timePalace??null,lifeStem,lifeBranch,lifePalace,starByPalace,doorByPalace},
      noteZh: [
        `节气:${term}`,
        `三元:${yuan}`,
        `局:${ju}`,
        `旬首所遁六仪:${xunYi}`,
        `值符宫:${chiefPalace}`,
        `时干宫:${timePalace ?? "未定"}`,
      ].join("；"),
    };
  };
}
