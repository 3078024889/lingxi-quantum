import "server-only";

export function operatorEmails() {
  return new Set(
    (process.env.SASI_OPERATOR_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isSasiOperator(email: string | null | undefined) {
  if (!email) return false;
  return operatorEmails().has(email.trim().toLowerCase());
}
