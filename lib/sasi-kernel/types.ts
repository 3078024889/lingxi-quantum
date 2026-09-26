export type SasiIntelligence = "light" | "standard" | "high";
export type SasiExecutionMode = "autonomous" | "enhanced";
export type SasiTaskKind = "knowledge" | "image" | "video" | "utility" | "file" | "document" | "audio" | "website" | "code";
export type SasiTaskState = "created" | "planning" | "queued" | "running" | "validating" | "succeeded" | "failed" | "cancelled";
export type SasiExecutionClass = "deterministic" | "local-ml" | "procedural" | "semantic-generation";
export type SasiRuntimeTarget = "browser" | "server" | "worker" | "external";

export type SasiArtifact = {
  type: "text" | "json" | "file" | "video" | "image" | "audio" | "archive";
  name?: string;
  mime?: string;
  value?: unknown;
  path?: string;
  sha256?: string;
  byteSize?: number;
  metadata?: Record<string, unknown>;
};

export type SasiExecutionEvent = {
  at: string;
  event: string;
  node?: string;
  attempt?: number;
  data?: Record<string, unknown>;
};

export type SasiKernelTask = {
  id: string;
  ownerId?: string | null;
  projectId?: string | null;
  kind: SasiTaskKind;
  action: string;
  input: unknown;
  constraints?: Record<string, unknown>;
  intelligence?: SasiIntelligence;
  mode?: SasiExecutionMode;
  createdAt?: string;
};

export type SasiCapabilityManifest = {
  id: string;
  version: string;
  executionClass: SasiExecutionClass;
  runtimeTargets: readonly SasiRuntimeTarget[];
  localFirst: boolean;
  deterministic: boolean;
  browserEligible: boolean;
  externalOptional: boolean;
  fallbackIds: readonly string[];
  resources: { cpu: "light" | "medium" | "heavy"; memoryMb: number; gpu: "none" | "optional" | "required" };
};

export type SasiCapabilityContext = {
  now: () => Date;
  signal?: AbortSignal;
  log: (event: string, data?: Record<string, unknown>) => void;
};

export type SasiCapability = {
  manifest: SasiCapabilityManifest;
  canRun(task: SasiKernelTask): boolean;
  execute(task: SasiKernelTask, ctx: SasiCapabilityContext): Promise<SasiKernelResult>;
};

export type SasiKernelResult = {
  ok: boolean;
  taskId: string;
  engine: "sasi-kernel" | "external-enhancement";
  capability: string;
  artifacts: SasiArtifact[];
  history?: SasiExecutionEvent[];
  warnings?: string[];
  error?: { code: string; message: string };
};

export type SasiPlanNode = {
  id: string;
  capabilityId: string;
  dependsOn: string[];
  timeoutMs: number;
  maxRetries: number;
};

export type SasiTaskPlan = {
  id: string;
  taskId: string;
  executionClass: SasiExecutionClass;
  externalModelRequired: boolean;
  nodes: SasiPlanNode[];
  createdAt: string;
};

// Source-compatible aliases for code migrated from the pre-kernel runtime.
export type Intelligence=SasiIntelligence;
export type TaskKind=SasiTaskKind;
export type ExecutionMode=SasiExecutionMode;
export type CapabilityId=string;
export type SasiTask=SasiKernelTask;
export type SasiResult=SasiKernelResult;
export type CapabilityContext=SasiCapabilityContext;
export type Capability=SasiCapability;
