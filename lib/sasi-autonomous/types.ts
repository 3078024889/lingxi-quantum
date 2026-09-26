export type Intelligence = "light" | "standard" | "high";
export type TaskKind = "knowledge" | "video" | "utility" | "file";
export type ExecutionMode = "autonomous" | "enhanced";

export type CapabilityId =
  | "knowledge.answer"
  | "knowledge.summary"
  | "video.plan"
  | "utility.text.organize"
  | "utility.text.stats";

export type SasiTask = {
  id: string;
  kind: TaskKind;
  action: string;
  input: unknown;
  intelligence?: Intelligence;
  mode?: ExecutionMode;
};

export type SasiArtifact = {
  type: "text" | "json" | "file" | "video" | "image";
  name?: string;
  mime?: string;
  value?: unknown;
  path?: string;
};

export type SasiExecutionEvent = {
  at: string;
  event: string;
  node?: string;
  attempt?: number;
  data?: Record<string, unknown>;
};

export type SasiResult = {
  ok: boolean;
  taskId: string;
  engine: "autonomous" | "optional-external";
  capability: CapabilityId;
  artifacts: SasiArtifact[];
  warnings?: string[];
  history?: SasiExecutionEvent[];
  error?: { code: string; message: string };
};

export type CapabilityContext = {
  now: () => Date;
  signal?: AbortSignal;
  log: (event: string, data?: Record<string, unknown>) => void;
};

export interface Capability {
  id: CapabilityId;
  canRun(task: SasiTask): boolean;
  run(task: SasiTask, ctx: CapabilityContext): Promise<SasiResult>;
}
