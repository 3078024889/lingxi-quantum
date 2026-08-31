import type {
  AncientProviders,
  AncientTraceEnvelope,
  LastKnownCoordinate,
  LiuYaoCast,
} from "../ancient/types";

export type TraceTargetKind = "person" | "animal" | "object";

export type AnimalKind =
  | "cat"
  | "dog"
  | "bird"
  | "livestock"
  | "other";

export type ObjectKind =
  | "keys"
  | "phone"
  | "wallet"
  | "document"
  | "jewelry"
  | "bag"
  | "vehicle"
  | "other";

export type SharedTraceTargetInput = {
  targetKind: TraceTargetKind;
  targetName: string;

  queryTime: string;
  lastKnownPlace?: string | null;
  lastKnownCoordinate?: LastKnownCoordinate | null;
  lastSeenAt?: string | null;

  // Reality evidence only; never seeds the ancient inference.
  reportedMovementBearing?: number | null;
  context?: string | null;

  liuyaoCast?: LiuYaoCast | null;
};

export type AnimalTraceInput = SharedTraceTargetInput & {
  targetKind: "animal";
  animalKind: AnimalKind;
  sex?: "female" | "male" | "unknown";
  ageYears?: number | null;
  microchipped?: boolean | null;
  indoorOutdoor?: "indoor" | "outdoor" | "mixed" | "unknown";
  temperament?: "timid" | "social" | "territorial" | "unknown";
  escapeMode?: "door" | "window" | "yard" | "transport" | "unknown";
};

export type ObjectTraceInput = SharedTraceTargetInput & {
  targetKind: "object";
  objectKind: ObjectKind;
  container?: string | null;
  ownerRelation?: string | null;
  lastHandledBy?: string | null;
  likelyTransport?: "carried" | "vehicle" | "mail" | "unknown";
};

export type TargetTraceInput = AnimalTraceInput | ObjectTraceInput;

export type TargetRealityHints = {
  searchPriorityZh: string[];
  likelyEnvironmentZh: string[];
  stopConditionsZh: string[];
};

export type TargetTraceResult = {
  version: "lingxifield-target-trace-v1";
  targetKind: "animal" | "object";
  targetName: string;
  generatedAt: string;

  ancient: AncientTraceEnvelope;

  // Non-divinatory, practical search layer.
  realityHints: TargetRealityHints;

  notesZh: string[];
};

export type TargetTraceOptions = {
  providers?: AncientProviders;
  calibratedDistanceKm?: [number, number] | null;
};


