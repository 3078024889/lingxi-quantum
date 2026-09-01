import { ganZhi } from "@yhjs/bagua";
import { buildLiurenBoard } from "@yhjs/liuren";
import { Solar } from "lunar-javascript";
import type { LiurenChart, StellarAncientInput } from "../ancient/types";

const ZHIS = new Set(["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]);

function chinaCivilDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(value);
  const number = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return new Date(number("year"), number("month") - 1, number("day"), number("hour"), number("minute"), number("second"));
}

function dayGanZhiAt(date: Date) {
  const lunar: any = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()).getLunar();
  return lunar.getDayInGanZhiExact?.() ?? lunar.getDayInGanZhi?.() ?? "";
}

export function createLiurenProvider() {
  return async function liurenProvider(input: StellarAncientInput): Promise<LiurenChart | null> {
    if (input.targetKind === "animal") return null;
    const query = new Date(input.queryTime);
    if (Number.isNaN(query.getTime())) return null;
    const civil = chinaCivilDate(query);
    const dayGanZhi = dayGanZhiAt(civil);
    if (dayGanZhi.length !== 2) return null;

    const board = buildLiurenBoard({ datetime: civil, keyGanZhi: ganZhi(dayGanZhi) });
    const xuanwu = board.palaces.find((palace) => palace.guiGod?.name === "玄武");
    const xuanwuBranch = xuanwu?.zhi.name;
    if (!xuanwu || !xuanwuBranch || !ZHIS.has(xuanwuBranch)) return null;
    const transmissions = board.legend.ganLegend.map((item) => item.name) as [string, string, string];

    return {
      xuanwuBranch: xuanwuBranch as LiurenChart["xuanwuBranch"],
      transmissions, lessons: [], travelSignal: "unknown", environmentTags: [],
      decisionStatus: "complete", transmissionMethod: "干传",
      noteZh: `月将${board.meta.yuejiangZhi.name}加时；十二天将排定；玄武临地盘${xuanwuBranch}。`,
      debug: {
        engine: "@yhjs/liuren@1.0.0", timeZone: "Asia/Shanghai",
        meta: {
          datetime: board.meta.datetime,
          fourPillars: {
            year: board.meta.fourPillars.year.name, month: board.meta.fourPillars.month.name,
            day: board.meta.fourPillars.day.name, hour: board.meta.fourPillars.hour.name,
          },
          yuejiang: board.meta.yuejiangZhi.name, guiGodType: board.meta.guiGodType,
          isFuyin: board.meta.isFuyin,
        },
        xuanwuGroundBranch: xuanwuBranch, xuanwuHeavenBranch: xuanwu.tianpan.name,
        ganLegend: board.legend.ganLegend.map((item) => item.name),
        zhiLegend: board.legend.zhiLegend.map((item) => item.name),
        palaces: board.palaces.map((palace) => ({
          ground: palace.zhi.name, heaven: palace.tianpan.name,
          guiGod: palace.guiGod?.name ?? null, outerGan: palace.outerGan?.name ?? null,
          jianChu: palace.jianChu, twelvePalace: palace.twelvePalace,
        })),
      },
    };
  };
}
