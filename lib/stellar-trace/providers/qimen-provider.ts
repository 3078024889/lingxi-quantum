import { Solar } from "lunar-javascript";
import type { QimenChart, StellarAncientInput } from "../ancient/types";

type PalaceName = QimenChart["lifePalace"];
type DunjiaPalace = {
  name: string; position: number; groundGan: string; groundExtraGan: string | null;
  skyGan: string; skyExtraGan: string | null;
  star: { name: string; shortName: string } | null;
  door: { name: string; shortName: string } | null;
  god: { name: string } | null;
};
type DunjiaBoard = {
  meta: { yinyang: "阴" | "阳"; juNumber: number; solarTerm: string; xunHead: string; xunHeadGan: string; [key: string]: unknown };
  palace: (index: number) => DunjiaPalace;
};
// The package currently ships a valid runtime export but an empty top-level declaration.
// Keep the adapter typed here until the upstream declaration is corrected.
const { TimeDunjia } = require("@yhjs/dunjia") as { TimeDunjia: { create: (options: { datetime: Date; type: "hour" }) => DunjiaBoard } };

const GANS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHIS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const XUN_HEAD_YI: Record<string, string> = {
  甲子: "戊", 甲戌: "己", 甲申: "庚", 甲午: "辛", 甲辰: "壬", 甲寅: "癸",
};

function chinaCivilDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(value);
  const number = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return new Date(number("year"), number("month") - 1, number("day"), number("hour"), number("minute"), number("second"));
}

function lunarYearGanZhi(birthDate: string, birthTime?: string | null) {
  const match = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return "";
  const [hour, minute] = (birthTime || "12:00").split(":").map(Number);
  const lunar: any = Solar.fromYmdHms(Number(match[1]), Number(match[2]), Number(match[3]), hour || 0, minute || 0, 0).getLunar();
  return lunar.getYearInGanZhiExact?.() ?? lunar.getYearInGanZhi?.() ?? "";
}

function hiddenYiForJia(ganZhi: string) {
  const ganIndex = GANS.indexOf(ganZhi.slice(0, 1));
  const zhiIndex = ZHIS.indexOf(ganZhi.slice(1, 2));
  if (ganIndex < 0 || zhiIndex < 0) return null;
  return XUN_HEAD_YI[`甲${ZHIS[(zhiIndex - ganIndex + 120) % 12]}`] ?? null;
}

function containsStem(palace: DunjiaPalace, stem: string) {
  return [palace.groundGan, palace.groundExtraGan].includes(stem);
}

function findPalaceByGroundStem(palaces: DunjiaPalace[], stem: string) {
  return palaces.find((palace) => containsStem(palace, stem));
}

export function createQimenProvider() {
  return async function qimenProvider(input: StellarAncientInput): Promise<QimenChart | null> {
    const query = new Date(input.queryTime);
    if (Number.isNaN(query.getTime())) return null;

    // The cited rule explicitly covers cattle/sheep through the Death Door.
    // Cats, dogs and birds are not silently folded into that category.
    if (input.targetKind === "animal" && input.targetSubtype !== "livestock") return null;

    const board = TimeDunjia.create({ datetime: chinaCivilDate(query), type: "hour" });
    const palaces = Array.from({ length: 9 }, (_, index) => board.palace(index));
    let targetPalace: DunjiaPalace | undefined;
    let lifeStem = "";
    let lifeBranch = "";
    let targetRuleId: QimenChart["targetRuleId"] = "QM-XR-NM-001";

    if (input.targetKind === "object") {
      targetPalace = findPalaceByGroundStem(palaces, "戊");
      targetRuleId = "QM-OBJECT-001";
    } else if (input.targetKind === "animal") {
      targetPalace = palaces.find((palace) => palace.door?.shortName === "死");
      targetRuleId = "QM-ANIMAL-001";
    } else {
      const birthGanZhi = lunarYearGanZhi(input.birthDate, input.birthTime);
      lifeStem = birthGanZhi.slice(0, 1);
      lifeBranch = birthGanZhi.slice(1, 2);
      const targetStem = lifeStem === "甲" ? hiddenYiForJia(birthGanZhi) : lifeStem;
      if (!targetStem) return null;
      targetPalace = findPalaceByGroundStem(palaces, targetStem);
    }

    if (!targetPalace) return null;
    const starByPalace: QimenChart["starByPalace"] = {};
    const doorByPalace: QimenChart["doorByPalace"] = {};
    for (const palace of palaces) {
      const name = palace.name as PalaceName;
      if (palace.star) starByPalace[name] = palace.star.shortName;
      if (palace.door) doorByPalace[name] = palace.door.shortName;
    }

    return {
      lifeStem,
      lifeBranch,
      lifePalace: targetPalace.name as PalaceName,
      starByPalace,
      doorByPalace,
      dun: board.meta.yinyang === "阳" ? "阳遁" : "阴遁",
      ju: board.meta.juNumber,
      targetRuleId,
      noteZh: `时家奇门 ${board.meta.yinyang}遁${board.meta.juNumber}局；节气${board.meta.solarTerm}；旬首${board.meta.xunHead}遁${board.meta.xunHeadGan}。`,
      debug: {
        engine: "@yhjs/dunjia@1.0.1", timeZone: "Asia/Shanghai", meta: board.meta,
        targetPalace: targetPalace.name,
        palaces: palaces.map((palace) => ({
          name: palace.name, position: palace.position, groundGan: palace.groundGan,
          groundExtraGan: palace.groundExtraGan, skyGan: palace.skyGan,
          skyExtraGan: palace.skyExtraGan, star: palace.star?.name ?? null,
          door: palace.door?.name ?? null, god: palace.god?.name ?? null,
        })),
      },
    };
  };
}
