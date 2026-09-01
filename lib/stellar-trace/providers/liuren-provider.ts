import { Solar } from "lunar-javascript";
import type { LiurenChart, StellarAncientInput } from "../ancient/types";

const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
type Zhi = typeof ZHI[number];
const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
type Gan = typeof GAN[number];

const STEM_LODGE: Record<Gan,Zhi> = {
  甲:"寅",乙:"辰",丙:"巳",丁:"未",戊:"巳",己:"未",庚:"申",辛:"戌",壬:"亥",癸:"丑"
};

// 中气月将
const MONTH_GENERAL_BY_QI: Record<string,Zhi> = {
  "雨水":"亥","春分":"戌","谷雨":"酉","小满":"申","夏至":"未","大暑":"午",
  "处暑":"巳","秋分":"辰","霜降":"卯","小雪":"寅","冬至":"丑","大寒":"子"
};

const NOBLE_DAY: Record<Gan,Zhi> = {
  甲:"丑",乙:"子",丙:"亥",丁:"亥",戊:"丑",己:"子",庚:"丑",辛:"午",壬:"巳",癸:"巳"
};
const NOBLE_NIGHT: Record<Gan,Zhi> = {
  甲:"未",乙:"申",丙:"酉",丁:"酉",戊:"未",己:"申",庚:"未",辛:"寅",壬:"卯",癸:"卯"
};
const GENERALS = ["贵人","螣蛇","朱雀","六合","勾陈","青龙","天空","白虎","太常","玄武","太阴","天后"] as const;

function chinaParts(d:Date){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(d);
  const value=(type:string)=>Number(parts.find(part=>part.type===type)?.value??0);
  return{year:value("year"),month:value("month"),day:value("day"),hour:value("hour"),minute:value("minute"),second:value("second")};
}

function lunarAt(d:Date) {
  const p=chinaParts(d);
  const s = Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,p.second);
  const l:any = (s as any).getLunar();
  return {
    dayGz: l.getDayInGanZhiExact?.() ?? l.getDayInGanZhi?.() ?? "",
    timeGz: l.getTimeInGanZhi?.() ?? "",
    prevQi: l.getPrevQi?.(true) ?? l.getPrevJieQi?.(true) ?? null,
  };
}

function findMonthGeneral(d:Date): Zhi {
  const p=chinaParts(d);
  const solar = Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,p.second);
  const lunar:any = (solar as any).getLunar();

  // Prefer exact previous 中气. Walk back through available qi list if present.
  const q = lunar.getPrevQi?.(true);
  const qn = q?.getName?.();
  if (qn && MONTH_GENERAL_BY_QI[qn]) return MONTH_GENERAL_BY_QI[qn];

  // Fallback by solar term month windows; still deterministic.
  const m = p.month;
  const approx = [
    ["大寒","雨水"],["雨水","春分"],["春分","谷雨"],["谷雨","小满"],
    ["小满","夏至"],["夏至","大暑"],["大暑","处暑"],["处暑","秋分"],
    ["秋分","霜降"],["霜降","小雪"],["小雪","冬至"],["冬至","大寒"]
  ];
  const term = approx[(m+10)%12][0];
  return MONTH_GENERAL_BY_QI[term] ?? "亥";
}

function heavenPlate(monthGeneral:Zhi, hourBranch:Zhi) {
  const result:Record<Zhi,Zhi> = {} as any;
  const offset = ZHI.indexOf(monthGeneral) - ZHI.indexOf(hourBranch);
  ZHI.forEach((earth,i)=>{
    result[earth] = ZHI[(i+offset+120)%12];
  });
  return result;
}

function upperOfBranch(earth:Zhi, hp:Record<Zhi,Zhi>) {
  return hp[earth];
}

function upperOfStem(stem:Gan, hp:Record<Zhi,Zhi>) {
  return hp[STEM_LODGE[stem]];
}

function elementOfStem(g:Gan) {
  if (["甲","乙"].includes(g)) return "木";
  if (["丙","丁"].includes(g)) return "火";
  if (["戊","己"].includes(g)) return "土";
  if (["庚","辛"].includes(g)) return "金";
  return "水";
}
function elementOfBranch(z:Zhi) {
  if (["寅","卯"].includes(z)) return "木";
  if (["巳","午"].includes(z)) return "火";
  if (["辰","戌","丑","未"].includes(z)) return "土";
  if (["申","酉"].includes(z)) return "金";
  return "水";
}
const OVERCOMES:Record<string,string> = {木:"土",土:"水",水:"火",火:"金",金:"木"};

type Lesson = {lower:string; upper:Zhi; lowerElement:string; upperElement:string};

function fourLessons(dayGan:Gan, dayZhi:Zhi, hp:Record<Zhi,Zhi>): Lesson[] {
  const oneUpper = upperOfStem(dayGan,hp);
  const twoUpper = upperOfBranch(oneUpper,hp);
  const threeUpper = upperOfBranch(dayZhi,hp);
  const fourUpper = upperOfBranch(threeUpper,hp);
  return [
    {lower:dayGan, upper:oneUpper, lowerElement:elementOfStem(dayGan), upperElement:elementOfBranch(oneUpper)},
    {lower:oneUpper, upper:twoUpper, lowerElement:elementOfBranch(oneUpper), upperElement:elementOfBranch(twoUpper)},
    {lower:dayZhi, upper:threeUpper, lowerElement:elementOfBranch(dayZhi), upperElement:elementOfBranch(threeUpper)},
    {lower:threeUpper, upper:fourUpper, lowerElement:elementOfBranch(threeUpper), upperElement:elementOfBranch(fourUpper)},
  ];
}

function directKe(lessons:Lesson[]) {
  const zei = lessons.filter(l => OVERCOMES[l.upperElement] === l.lowerElement); // 上克下
  const ke = lessons.filter(l => OVERCOMES[l.lowerElement] === l.upperElement);  // 下克上
  return {zei,ke};
}

function yinYangOfBranch(z:Zhi) { return ZHI.indexOf(z)%2===0 ? "阳":"阴"; }
function yinYangOfStem(g:Gan) { return GAN.indexOf(g)%2===0 ? "阳":"阴"; }

function selectInitial(dayGan:Gan, lessons:Lesson[]): {method:string; initial:Zhi}|null {
  const {zei,ke} = directKe(lessons);
  const pool = zei.length ? zei : ke;
  if (pool.length===1) return {method:"贼克", initial:pool[0].upper};
  if (pool.length>1) {
    const yg = yinYangOfStem(dayGan);
    const same = pool.filter(x=>yinYangOfBranch(x.upper)===yg);
    if (same.length===1) return {method:"比用", initial:same[0].upper};
    if (same.length>1) return {method:"涉害", initial:same[0].upper}; // TODO: 深浅涉害 fixture 再细化
    return {method:"涉害", initial:pool[0].upper};
  }
  // 遥克：无贼克时，取上神与日干隔课相克
  const dayEl = elementOfStem(dayGan);
  const remote = lessons.filter(l => OVERCOMES[l.upperElement]===dayEl || OVERCOMES[dayEl]===l.upperElement);
  if (remote.length) return {method:"遥克", initial:remote[0].upper};
  return null;
}

function nextTransmission(z:Zhi, hp:Record<Zhi,Zhi>) { return hp[z]; }

function isDaytime(hourBranch:Zhi) {
  return ["卯","辰","巳","午","未","申"].includes(hourBranch);
}

function placeGenerals(dayGan:Gan,hourBranch:Zhi) {
  const noble = (isDaytime(hourBranch)?NOBLE_DAY:NOBLE_NIGHT)[dayGan];
  const nobleIndex = ZHI.indexOf(noble);
  // 贵人临地盘亥至辰顺行，巳至戌逆行（常用规则）
  const forward = ["亥","子","丑","寅","卯","辰"].includes(noble);
  const result:Record<Zhi,string> = {} as any;
  GENERALS.forEach((gen,i)=>{
    const idx = forward ? (nobleIndex+i)%12 : (nobleIndex-i+120)%12;
    result[ZHI[idx]] = gen;
  });
  return result;
}

export function createLiurenProvider() {
  return async function liurenProvider(input:StellarAncientInput):Promise<LiurenChart|null>{
    const query = new Date(input.queryTime);
    if (Number.isNaN(query.getTime())) return null;
    const l = lunarAt(query);
    const dayGan = l.dayGz.slice(0,1) as Gan;
    const dayZhi = l.dayGz.slice(1,2) as Zhi;
    const hourZhi = l.timeGz.slice(1,2) as Zhi;
    if (!GAN.includes(dayGan) || !ZHI.includes(dayZhi) || !ZHI.includes(hourZhi)) return null;

    const monthGeneral = findMonthGeneral(query);
    const hp = heavenPlate(monthGeneral,hourZhi);
    const lessons = fourLessons(dayGan,dayZhi,hp);
    let sel = selectInitial(dayGan,lessons);

    // For the remaining special methods (昴星/别责/八专/伏吟/返吟),
    // we preserve explicit method state and avoid fabricating a branch.
    if (!sel) {
      const isFuYin = ZHI.every(z=>hp[z]===z);
      const isFanYin = ZHI.every(z=> hp[hp[z]]===z && hp[z]!==z);
      if (isFuYin) sel = {method:"伏吟", initial:lessons[0].upper};
      else if (isFanYin) sel = {method:"返吟", initial:lessons[0].upper};
      else return {
        transmissions:["","",""],
        lessons: lessons.map(x=>`${x.lower}->${x.upper}`),
        travelSignal:"unknown",
        environmentTags:[],
        decisionStatus:"special-method-unverified",
        noteZh:"三传进入昴星/别责/八专特殊课，当前 provider 保持未完全决课；不得伪造玄武方位。",
      };
    }

    const initial = sel.initial;
    const middle = nextTransmission(initial,hp);
    const final = nextTransmission(middle,hp);

    const generals = placeGenerals(dayGan,hourZhi);
    const xuanwuBranch = (Object.entries(generals).find(([,g])=>g==="玄武")?.[0] ?? "子") as Zhi;

    return {
      xuanwuBranch,
      transmissions:[initial,middle,final],
      lessons:lessons.map(x=>`${x.lower}->${x.upper}`),
      travelSignal:"unknown",
      environmentTags:[],
      decisionStatus:"complete",
      transmissionMethod:sel.method,
      debug:{monthGeneral,hourBranch:hourZhi,dayStem:dayGan,dayBranch:dayZhi,heavenPlate:hp,fourLessons:lessons,generals},
      noteZh:[
        `月将:${monthGeneral}`,
        `占时:${hourZhi}`,
        `日:${dayGan}${dayZhi}`,
        `三传法:${sel.method}`,
        `初:${initial} 中:${middle} 末:${final}`,
        `玄武:${xuanwuBranch}`,
      ].join("；"),
    };
  };
}
