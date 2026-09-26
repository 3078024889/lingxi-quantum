export const SASI_COMPUTE_PROTOCOL_VERSION = "2026-09-26.v19";

export type NativeJobKind = "reason" | "image" | "video";
export type NativeJobState = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export type NativeArtifact = {
  id: string;
  kind: "text" | "json" | "image" | "video";
  mime: string;
  byteSize: number;
  sha256: string;
  storage: "r2" | "local";
  objectKey?: string | null;
  localId?: string | null;
};

export type NativeUsage = {
  wallMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  frames?: number;
  width?: number;
  height?: number;
};

export type NativeJobRequest = {
  protocolVersion: typeof SASI_COMPUTE_PROTOCOL_VERSION;
  requestId: string;
  taskId: string;
  ownerId: string;
  projectId?: string | null;
  kind: NativeJobKind;
  model: string;
  input: Record<string, unknown>;
};

export type NativeJobPublic = {
  id: string;
  requestId: string;
  taskId: string;
  ownerId: string;
  kind: NativeJobKind;
  model: string;
  state: NativeJobState;
  progress: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  result?: Record<string, unknown> | null;
  artifacts: NativeArtifact[];
  usage?: NativeUsage | null;
  error?: { code: string; message: string } | null;
};

export function isNativeJobPublic(value: unknown): value is NativeJobPublic {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string"
    && typeof row.taskId === "string"
    && typeof row.ownerId === "string"
    && typeof row.kind === "string"
    && typeof row.state === "string"
    && Array.isArray(row.artifacts);
}
