import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { generateStaticLifeMapReport } from "@/lib/lifemap-knowledge";

export const runtime = "nodejs";
export const maxDuration = 30;

type RequestBody = {
  id?: string;
  lang?: "zh" | "en";
  regenerate?: boolean;
};

function countSections(report: string): number {
  return (report.match(/===\s*\d+\s*===/g) ?? []).length;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!REVIEW_MODE && !user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "zh";
  const admin = createAdminClient();
  const { data: submission, error: submissionError } = await admin
    .from("life_map_submissions")
    .select("*")
    .eq("id", body.id)
    .single();

  if (submissionError || !submission) {
    if (submissionError) {
      console.error("[lifemap] 读取提交记录失败:", submissionError, "submission id:", body.id);
    }
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows, error: unlockError } = await admin
      .from("unlocks")
      .select("product_id, expires_at")
      .eq("user_id", user!.id);

    if (unlockError) {
      console.error("[lifemap] 查询解锁状态失败:", unlockError, "user id:", user!.id);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }

    const now = Date.now();
    const unlocked = (unlockRows ?? []).some(
      (unlock: { product_id: string; expires_at: string | null }) =>
        (unlock.product_id === "life-map-report" || unlock.product_id === "everything") &&
        (!unlock.expires_at || new Date(unlock.expires_at).getTime() > now),
    );

    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
    }
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  const cached = submission[cachedField];
  const isCurrentStaticReport =
    typeof cached === "string" &&
    countSections(cached) === 15 &&
    (cached.includes("结构证据：") || cached.includes("Structural evidence:"));

  if (isCurrentStaticReport && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, cached: true });
  }

  try {
    const facts = submission.facts as Record<string, unknown>;
    const vector = computeLifeVector(facts as LifeVectorInput);
    const seed = createHash("sha256")
      .update(JSON.stringify({
        submissionId: body.id,
        lang,
        vector,
        focus: submission.focus,
        currentState: submission.current_state,
      }))
      .digest("hex");

    const report = generateStaticLifeMapReport({
      facts,
      vector,
      submission: {
        id: submission.id,
        core_type_name: submission.core_type_name,
        energy_level: submission.energy_level,
        clarity_level: submission.clarity_level,
        alignment_level: submission.alignment_level,
        focus: submission.focus,
        current_state: submission.current_state,
        name: submission.name,
      },
      seed,
      lang,
    });

    if (countSections(report.fullReport) !== 15 || report.traces.length !== 15) {
      throw new Error("Static life-map report did not produce exactly 15 chapters.");
    }

    const { error: updateError } = await admin
      .from("life_map_submissions")
      .update({ [cachedField]: report.fullReport })
      .eq("id", body.id)
      .eq("user_id", submission.user_id);

    if (updateError) {
      console.error("[lifemap] 报告缓存失败:", updateError, "submission id:", body.id);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport: report.fullReport,
      resilienceScore: report.resilience.score,
      resilienceBreakdown: report.resilience.breakdown,
      romanceScore: report.romance.score,
      romanceStyle: report.romance.style,
      hasTaoHua: report.romance.taoHua.hasTaoHua,
      knowledgeVersion: report.knowledgeVersion,
      activatedNodeIds: report.activatedNodeIds,
      cached: false,
    });
  } catch (error) {
    console.error("[lifemap] 本地知识引擎生成失败:", error, "submission id:", body.id);
    return NextResponse.json({ error: "生命图谱计算未能完成，请稍后再试。" }, { status: 422 });
  }
}
