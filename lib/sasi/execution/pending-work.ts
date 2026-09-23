import type { SasiPaidIntent } from "@/lib/sasi/execution/intent-policy";

export type SasiPendingExternalWork = {
  id: string;
  userId?: string | null;
  intent: SasiPaidIntent;
  reason: string;
  payloadRef?: string | null;
  state:
    | "pending-user-trigger"
    | "triggered"
    | "completed"
    | "failed"
    | "expired";
  createdAt: string;
  expiresAt?: string | null;
};

export function createPendingExternalWork(input: {
  id: string;
  userId?: string | null;
  intent: SasiPaidIntent;
  reason: string;
  payloadRef?: string | null;
  expiresAt?: string | null;
}): SasiPendingExternalWork {
  if (!input.reason.trim()) throw new Error("PENDING_WORK_REASON_REQUIRED");

  return {
    ...input,
    state: "pending-user-trigger",
    createdAt: new Date().toISOString(),
  };
}

export function mayExecutePendingWork(input: {
  work: SasiPendingExternalWork;
  triggeringUserId: string;
}) {
  if (input.work.state !== "pending-user-trigger") {
    throw new Error("PENDING_WORK_NOT_EXECUTABLE");
  }

  if (input.work.userId && input.work.userId !== input.triggeringUserId) {
    throw new Error("PENDING_WORK_OWNER_MISMATCH");
  }

  if (
    input.work.expiresAt &&
    Date.parse(input.work.expiresAt) <= Date.now()
  ) {
    throw new Error("PENDING_WORK_EXPIRED");
  }

  return true;
}
