import { calculateAncientTrace } from "../ancient/engine";
import type { StellarAncientInput } from "../ancient/types";
import type {
  ObjectTraceInput,
  TargetRealityHints,
  TargetTraceOptions,
  TargetTraceResult,
} from "./types";

function practicalObjectHints(input: ObjectTraceInput): TargetRealityHints {
  const priority: string[] = [
    "先复原最后一次确认物品仍在手中/容器中的时间点与地点。",
    "按时间倒序核对最后接触者、容器、交通工具、支付/门禁/监控等现实记录。",
  ];
  const environment: string[] = [];
  const stops: string[] = [
    "一旦现实记录确认物品去向，应立即停止用术数结果扩大搜索范围。",
    "若涉及银行卡、证件、手机或密钥，应同步执行挂失、冻结、远程锁定等安全措施。",
  ];

  switch (input.objectKind) {
    case "keys":
      priority.push("优先查门口、桌面、衣袋、包袋夹层、车内与最后一次开锁/关锁位置。");
      environment.push("入口", "桌面", "衣袋", "车内");
      break;
    case "phone":
      priority.push("先使用官方查找设备功能、运营商/账号安全工具和最后联网位置。");
      environment.push("充电点", "座椅缝", "车内", "最后联网区域");
      break;
    case "wallet":
      priority.push("优先查付款点、包袋、衣袋、车辆座椅与最后一次取用后的连续动作路径。");
      environment.push("付款点", "衣袋", "包袋", "车内");
      break;
    case "document":
      priority.push("优先查文件夹、打印/复印点、办公桌、收纳柜与最近办理业务地点。");
      environment.push("文件夹", "办公桌", "柜体", "办事窗口");
      break;
    case "jewelry":
      priority.push("优先查更衣、洗浴、床边、梳妆台、衣物褶皱与排水口附近。");
      environment.push("更衣区", "床边", "洗浴区", "衣物");
      break;
    case "bag":
      priority.push("优先核对座位、交通工具、寄存点、前台以及最后一次放下包的位置。");
      environment.push("座位", "寄存点", "交通工具", "前台");
      break;
    case "vehicle":
      priority.push("先核对停车记录、ETC/收费、定位设备、拖车记录与停车场监控。");
      environment.push("停车场", "道路", "出入口", "维修/拖移点");
      break;
    default:
      priority.push("把搜索拆成“最后确认点 → 最后接触者 → 容器 → 移动路径 → 临时放置点”五层。");
      environment.push("最后确认点", "容器", "移动路径");
  }

  if (input.container) {
    priority.unshift(`优先完整检查关联容器“${input.container}”及其所有夹层、相邻收纳位置。`);
  }
  if (input.lastHandledBy) {
    priority.unshift(`先复核最后接触者“${input.lastHandledBy}”之后的动作链，不把人物信息用于术数计算。`);
  }

  return {
    searchPriorityZh: priority,
    likelyEnvironmentZh: environment,
    stopConditionsZh: stops,
  };
}

export async function calculateObjectTrace(
  input: ObjectTraceInput,
  options: TargetTraceOptions = {},
): Promise<TargetTraceResult> {
  const ancientInput: StellarAncientInput = {
    subjectName: input.targetName,
    birthDate: "1900-01-01", // Placeholder only; object trace providers must not consume birth fields.
    birthTime: null,
    birthPlace: null,
    queryTime: input.queryTime,
    lastContactAt: input.lastSeenAt ?? null,
    lastKnownPlace: input.lastKnownPlace ?? null,
    lastKnownCoordinate: input.lastKnownCoordinate ?? null,
    reportedMovementBearing: input.reportedMovementBearing ?? null,
    sex: "unknown",
    liuyaoCast: input.liuyaoCast ?? null,
  };

  const ancient = await calculateAncientTrace(
    ancientInput,
    options.providers ?? {},
    { calibratedDistanceKm: options.calibratedDistanceKm ?? null },
  );

  return {
    version: "lingxifield-target-trace-v1",
    targetKind: "object",
    targetName: input.targetName,
    generatedAt: new Date().toISOString(),
    ancient,
    realityHints: practicalObjectHints(input),
    notesZh: [
      "失物属于你提供的古籍材料明确覆盖的门类之一；但每一条具体断法仍必须通过独立规则库和来源ID接入，不能把寻人规则直接偷换成失物规则。",
      "现实接触链、容器、监控、设备定位等信息只进入现实核验与搜索顺序，不反向改写原典主向。",
    ],
  };
}


