export type SasiExternalCallTrigger =
  | "user-action"
  | "operator-approved"
  | "background"
  | "system-test";

export type SasiExecutionContext = {
  trigger: SasiExternalCallTrigger;
  userId?: string | null;
  requestId: string;
  initiatedAt: string;
  interactive: boolean;
};

export function assertExternalPaidCallAllowed(context: SasiExecutionContext) {
  if (!context.requestId.trim()) {
    throw new Error("SASI_EXECUTION_REQUEST_ID_REQUIRED");
  }

  if (context.trigger === "background") {
    throw new Error("SASI_BACKGROUND_PAID_CALL_FORBIDDEN");
  }

  if (context.trigger === "system-test") {
    throw new Error("SASI_TEST_PAID_CALL_FORBIDDEN");
  }

  if (context.trigger === "user-action") {
    if (!context.userId) {
      throw new Error("SASI_USER_TRIGGER_REQUIRES_USER");
    }
    if (!context.interactive) {
      throw new Error("SASI_USER_TRIGGER_MUST_BE_INTERACTIVE");
    }
    return;
  }

  if (context.trigger === "operator-approved") return;

  throw new Error("SASI_EXTERNAL_CALL_TRIGGER_DENIED");
}
