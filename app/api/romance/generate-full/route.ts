import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { calculateRomance } from "@/lib/romance-calc";
import { generateStaticRomanceReport } from "@/lib/romance-knowledge";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 30;

type RequestBody = {
  id?: string;
  lang?: "zh" | "en";
  regenerate?: boolean;
};

function countSections(report: string): number {
  return report
    .split(/===\s*(?:\d+|SECTION)\s*===/)
    .map((section) => section.trim())
    .filter(Boolean).length;
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
    return NextResponse.json({ error: "缺少 submission id。" }, { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "zh";
  const admin = createAdminClient();
  const { data: submission, error: submissionError } = await admin
    .from("romance_submissions")
    .select("*")
    .eq("id", body.id)
    .single();

  if (submissionError || !submission) {
    if (submissionError) {
      console.error("[romance] 读取提交记录失败:", submissionError, "submission id:", body.id);
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
      console.error("[romance] 查询解锁状态失败:", unlockError, "user id:", user!.id);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }

    const unlocked = (unlockRows ?? []).some(
      (unlock: { product_id: string; expires_at: string | null }) =>
        unlock.product_id === "romance-report" &&
        (!unlock.expires_at || new Date(unlock.expires_at) > new Date()),
    );

    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
    }
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  const cachedReport = submission[cachedField];

  if (typeof cachedReport === "string" && !body.regenerate && countSections(cachedReport) === 11) {
    return NextResponse.json({ fullReport: cachedReport, cached: true });
  }

  try {
    const facts = submission.facts as LifeVectorInput & {
      yearPillar: string;
      monthPillar: string;
      dayPillar: string;
      hourPillar: string | null;
    };
    const vector = computeLifeVector(facts);
    const profile = calculateRomance(vector, {
      yearPillar: facts.yearPillar,
      monthPillar: facts.monthPillar,
      dayPillar: facts.dayPillar,
      hourPillar: facts.hourPillar,
    });
    const seed = createHash("sha256")
      .update(JSON.stringify({ submissionId: body.id, lang, profile }))
      .digest("hex");
    const report = generateStaticRomanceReport({ profile, seed, lang });

    if (countSections(report.fullReport) !== 11 || report.traces.length !== 11) {
      throw new Error("Static romance report did not produce exactly 11 chapters.");
    }

    const { error: updateError } = await admin
      .from("romance_submissions")
      .update({ [cachedField]: report.fullReport })
      .eq("id", body.id)
      .eq("user_id", submission.user_id);

    if (updateError) {
      console.error("[romance] 报告缓存失败:", updateError, "submission id:", body.id);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport: report.fullReport,
      knowledgeVersion: report.knowledgeVersion,
      activatedNodeIds: report.activatedNodeIds,
      cached: false,
    });
  } catch (error) {
    console.error("[romance] 本地知识引擎生成失败:", error, "submission id:", body.id);
    return NextResponse.json({ error: "场域计算未能完成，请稍后再试。" }, { status: 422 });
  }
}
