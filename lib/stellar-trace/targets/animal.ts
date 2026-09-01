import { calculateAncientTrace } from "../ancient/engine";
import type { StellarAncientInput } from "../ancient/types";
import { createQimenProvider } from "../providers/qimen-provider";
import type {
  AnimalTraceInput,
  TargetRealityHints,
  TargetTraceOptions,
  TargetTraceResult,
} from "./types";

function practicalAnimalHints(input: AnimalTraceInput): TargetRealityHints {
  const priority: string[] = [];
  const environment: string[] = [];
  const stops: string[] = [
    "一旦出现监控、目击、芯片登记、GPS项圈、兽医或收容机构等现实证据，立即以现实证据覆盖术数候选顺序。",
    "若动物可能受伤、被困或处于高温/低温危险环境，应优先联系当地动物救援、兽医或相关机构。",
  ];

  switch (input.animalKind) {
    case "cat":
      priority.push(
        "先查最后目击点周边近距离隐蔽空间：车底、楼梯间、地下室、灌木、设备间、停车区。",
        "夜间或清晨安静时段重复搜索，并优先核对最后目击方向上的封闭/半封闭藏身处。",
      );
      environment.push("隐蔽", "低处", "狭窄空间", "建筑边缘");
      break;
    case "dog":
      priority.push(
        "优先查沿道路、熟悉路线、食物点、常去公园与主人气味路径。",
        "同步核对宠物医院、收容机构、社区群与交通监控。",
      );
      environment.push("道路", "开放空间", "熟悉路线", "人群活动区");
      break;
    case "bird":
      priority.push(
        "先查高处、树冠、屋檐、电线与最后飞离方向的连续落脚点。",
        "扩大搜索时按视线与风向分层，而不是只按地面直线距离。",
      );
      environment.push("高处", "树木", "屋檐", "开阔视域");
      break;
    case "livestock":
      priority.push(
        "优先核对围栏缺口、水源、饲料点、道路与群体移动路径。",
      );
      environment.push("水源", "围栏边界", "农路", "群体路径");
      break;
    default:
      priority.push(
        "先依据该动物习性建立近域藏身点、食物点、水源与熟悉路线清单。",
      );
      environment.push("近域藏身点", "食物源", "水源");
  }

  if (input.temperament === "timid") {
    priority.unshift("性情胆小：优先近域静默藏匿点，不要把远距离迁移假设放在第一位。");
  }
  if (input.temperament === "social") {
    priority.unshift("性情亲人：优先核对有人活动处、门卫/店铺/居民目击和临时收留。");
  }
  if (input.microchipped) {
    priority.unshift("已植入芯片：立即同步芯片登记平台、兽医和收容系统信息。");
  }

  return {
    searchPriorityZh: priority,
    likelyEnvironmentZh: environment,
    stopConditionsZh: stops,
  };
}

export async function calculateAnimalTrace(
  input: AnimalTraceInput,
  options: TargetTraceOptions = {},
): Promise<TargetTraceResult> {
  const ancientInput: StellarAncientInput = {
    targetKind: "animal",
    targetSubtype: input.animalKind,
    subjectName: input.targetName,
    birthDate: "1900-01-01", // Not used by animal/object ancient modules unless a provider explicitly requires it.
    birthTime: null,
    birthPlace: null,
    queryTime: input.queryTime,
    lastContactAt: input.lastSeenAt ?? null,
    lastKnownPlace: input.lastKnownPlace ?? null,
    lastKnownCoordinate: input.lastKnownCoordinate ?? null,
    reportedMovementBearing: input.reportedMovementBearing ?? null,
    sex: input.sex ?? "unknown",
    liuyaoCast: input.liuyaoCast ?? null,
  };

  const ancient = await calculateAncientTrace(
    ancientInput,
    options.providers ?? (["dog","livestock"].includes(input.animalKind)?{qimen:createQimenProvider()}:{}),
    { calibratedDistanceKm: options.calibratedDistanceKm ?? null },
  );

  return {
    version: "lingxifield-target-trace-v1",
    targetKind: "animal",
    targetName: input.targetName,
    generatedAt: new Date().toISOString(),
    ancient,
    realityHints: practicalAnimalHints(input),
    notesZh: [
      ["dog","livestock"].includes(input.animalKind)?"犬与明确牲畜门类已进入《占走失六畜》奇门证；没有第二套真实起局输入时，只交付单证方位，不伪称多证主向。":"猫、泛称鸟类与其他动物尚无适用的奇门六畜用神；没有真实六爻起卦时继续止于证界，只交付现实行为搜索次序。",
      "动物习性只进入现实搜索优先级，不反向污染古法方位。",
    ],
  };
}
