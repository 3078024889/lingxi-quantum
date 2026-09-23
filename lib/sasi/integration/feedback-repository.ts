import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type SasiLearningFeedbackSignal =
  | "helpful"
  | "not-helpful"
  | "incorrect"
  | "insufficient-evidence";

export async function recordLearningFeedback(input: {
  userId: string;
  learningEventId: string;
  signal: SasiLearningFeedbackSignal;
  note?: string;
}) {
  const admin = createAdminClient();

  const { data: event, error: eventError } = await admin
    .from("sasi_runtime_learning_events")
    .select("id,user_id")
    .eq("id", input.learningEventId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (eventError) throw new Error("SASI_FEEDBACK_EVENT_LOOKUP_FAILED");
  if (!event) throw new Error("SASI_FEEDBACK_EVENT_NOT_FOUND");

  const { error } = await admin
    .from("sasi_user_learning_feedback")
    .upsert(
      {
        user_id: input.userId,
        learning_event_id: input.learningEventId,
        signal: input.signal,
        note: (input.note ?? "").trim().slice(0, 1200),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,learning_event_id" },
    );

  if (error) throw new Error("SASI_FEEDBACK_WRITE_FAILED");
  return { ok: true as const };
}
