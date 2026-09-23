import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import {
  recordLearningFeedback,
  type SasiLearningFeedbackSignal,
} from "@/lib/sasi/integration/feedback-repository";

export const runtime = "nodejs";

const SIGNALS = new Set<SasiLearningFeedbackSignal>([
  "helpful",
  "not-helpful",
  "incorrect",
  "insufficient-evidence",
]);

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const learningEventId = String(body.learningEventId ?? "").trim();
  const signal = String(body.signal ?? "") as SasiLearningFeedbackSignal;
  const note = String(body.note ?? "");

  if (!/^[0-9a-f-]{36}$/i.test(learningEventId)) {
    return NextResponse.json({ error: "Invalid learning event." }, { status: 400 });
  }
  if (!SIGNALS.has(signal)) {
    return NextResponse.json({ error: "Invalid feedback signal." }, { status: 400 });
  }

  try {
    await recordLearningFeedback({
      userId: user.id,
      learningEventId,
      signal,
      note,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[SASI learning feedback]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "反馈保存失败。" }, { status: 500 });
  }
}
