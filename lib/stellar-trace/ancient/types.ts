export type AncientSystem = "qimen" | "liuren" | "taiyi" | "liuyao";
export type EvidenceConfidence = "text-attested" | "interpretive-normalization" | "calibrated";

export type DirectionBand = {
  centerDeg: number;
  sector: [number, number];
  labelZh: string;
};

export type DistanceBand = {
  normalizedBand: "near" | "medium" | "far" | "very_far" | "unknown";
  rawValue?: number;
  ancientUnit?: string;
  calibratedKm?: [number, number] | null;
};

export type RuleTrace = {
  ruleId: string;
  system: AncientSystem;
  sourceTitle: string;
  sourceChapter?: string;
  sourceUrl: string;
  sourceNoteZh: string;
  confidence: EvidenceConfidence;
  inputs: Record<string, string | number | boolean | null>;
  outputZh: string;
};

export type AncientTraceResult = {
  system: AncientSystem;
  status: "ok" | "partial" | "missing-input" | "unsupported";
  coverage: number;
  direction: DirectionBand | null;
  distance: DistanceBand | null;
  motion: { state: "stationary" | "moving" | "returning" | "redirecting" | "blocked" | "unknown"; noteZh?: string } | null;
  environmentZh: string[];
  evidence: RuleTrace[];
  warningsZh: string[];
};

export type LiuYaoCast = {
  movingLine: 1|2|3|4|5|6;
  movingBranch: "子"|"丑"|"寅"|"卯"|"辰"|"巳"|"午"|"未"|"申"|"酉"|"戌"|"亥";
  seasonalState: "旺"|"相"|"休"|"囚"|"死";
};

export type StellarAncientInput = {
  subjectName: string;
  birthDate: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  queryTime: string;
  lastContactAt?: string | null;
  lastKnownPlace?: string | null;
  lastKnownCoordinate?: { lat:number; lon:number; label?:string } | null;
  // Reality evidence is validation only. It MUST NOT seed ancient inference.
  reportedMovementBearing?: number | null;
  sex?: "female" | "male" | "unknown";
  liuyaoCast?: LiuYaoCast | null;
};

export type QimenChart = {
  lifeStem: string;
  lifeBranch: string;
  lifePalace: "坎"|"艮"|"震"|"巽"|"离"|"坤"|"兑"|"乾"|"中";
  starByPalace?: Partial<Record<"坎"|"艮"|"震"|"巽"|"离"|"坤"|"兑"|"乾"|"中", string>>;
  doorByPalace?: Partial<Record<"坎"|"艮"|"震"|"巽"|"离"|"坤"|"兑"|"乾"|"中", string>>;
  dun?: "阴遁" | "阳遁";
  ju?: number;
};

export type LiurenChart = {
  xuanwuBranch: "子"|"丑"|"寅"|"卯"|"辰"|"巳"|"午"|"未"|"申"|"酉"|"戌"|"亥";
  transmissions?: [string,string,string];
  lessons?: string[];
  travelSignal?: "near"|"far"|"unknown";
  environmentTags?: string[];
};

export type TaiyiChart = {
  directionPalace: "坎"|"艮"|"震"|"巽"|"离"|"坤"|"兑"|"乾"|"中";
  innerOuter: "inner"|"outer"|"unknown";
  travelSignal?: "near"|"medium"|"far"|"unknown";
};

export type AncientProviders = {
  qimen?: (input: StellarAncientInput)=>Promise<QimenChart|null>|QimenChart|null;
  liuren?: (input: StellarAncientInput)=>Promise<LiurenChart|null>|LiurenChart|null;
  taiyi?: (input: StellarAncientInput)=>Promise<TaiyiChart|null>|TaiyiChart|null;
};

export type LastKnownCoordinate = { lat: number; lon: number; label?: string };

export type AncientTraceEnvelope = {
  version: "lingxifield-ancient-trace-v1";
  generatedAt: string;
  results: AncientTraceResult[];
  fused: FusedAncientDirection;
  realityValidation: RealityValidation;
  candidateRegion: unknown;
  provenanceComplete: boolean;
  warningsZh: string[];
};

export type FusedAncientDirection = {
  qualified: boolean;
  primary: DirectionBand | null;
  resultantLength: number;
  dispersion: number;
  level: "divergent"|"weak"|"moderate"|"strong"|"high";
  modes: Array<{centerDeg:number;sector:[number,number];systems:AncientSystem[];mass:number}>;
  usedSystems: AncientSystem[];
  omittedSystems: AncientSystem[];
  rationaleZh: string;
};

export type RealityValidation = {
  status: "not-provided"|"consistent"|"tension"|"contradiction";
  reportedBearing: number|null;
  inferredBearing: number|null;
  angularDelta: number|null;
  noteZh: string;
};

