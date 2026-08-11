import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeTodayTransit, tideLevel, nextTidePeak, elementRelation,
  computeRetrogrades, dayRuler, tideTrajectory,
} from "@/lib/daily-transit";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { generateStaticDailyTideReport } from "@/lib/daily-tide-knowledge";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 30;

type RequestBody = { id?: string; lang?: "zh" | "en"; regenerate?: boolean };

function parseSnapshotDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T12:00:00.000Z");
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function sectionCount(report: string): number {
  return report.split("===SECTION===").map(part => part.trim()).filter(Boolean).length;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!REVIEW_MODE && !user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "zh";

  const admin = createAdminClient();
  const { data: submission, error: submissionError } = await admin
    .from("daily_tide_submissions").select("*").eq("id", body.id).single();
  if (submissionError || !submission) {
    if (submissionError) console.error("[daily-tide] 读取提交失败:", submissionError, "submission id:", body.id);
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows, error: unlockError } = await admin
      .from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    if (unlockError) {
      console.error("[daily-tide] 查询解锁状态失败:", unlockError, "user id:", user!.id);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }
    const now = Date.now();
    const unlocked = (unlockRows ?? []).some((row: { product_id: string; expires_at: string | null }) =>
      (row.product_id === "daily-tide-report" || row.product_id === "everything") &&
      (!row.expires_at || new Date(row.expires_at).getTime() > now)
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const snapshotDate = parseSnapshotDate(submission.generated_date);
  if (!snapshotDate) {
    console.error("[daily-tide] 快照日期损坏:", submission.generated_date, "submission id:", body.id);
    return NextResponse.json({ error: "报告日期数据不完整，请重新创建。" }, { status: 422 });
  }

  try {
    const facts = submission.facts as LifeVectorInput & {
      sunSignZh: string; sunSignEn: string; dayMasterElement: string; sunElement: "fire" | "earth" | "air" | "water";
    };
    const vector = computeLifeVector(facts);
    const transit = computeTodayTransit(snapshotDate);
    const relation = elementRelation(transit.moonElement, facts.sunElement);
    const tide = tideLevel(transit.moonPhaseAngle);
    const retrogrades = computeRetrogrades(snapshotDate);
    const ruler = dayRuler(snapshotDate);
    const nextTurningPoint = nextTidePeak(snapshotDate);
    const trajectories = {
      day7: tideTrajectory(7, snapshotDate),
      day30: tideTrajectory(30, snapshotDate),
      day90: tideTrajectory(90, snapshotDate),
    };
    const seed = createHash("sha256")
      .update(JSON.stringify({ id: body.id, lang, date: submission.generated_date, vector, transit }))
      .digest("hex");

    const report = generateStaticDailyTideReport({
      lang, seed, generatedDate: submission.generated_date,
      sunSignZh: facts.sunSignZh, sunSignEn: facts.sunSignEn,
      dayMasterElement: facts.dayMasterElement, vector, transit, relation,
      retrogrades, ruler, tide, nextTurningPoint, trajectories,
    });
    const cachedField = lang === "en" ? "full_report_en" : "full_report";
    const cached = submission[cachedField];
    const currentCache = typeof cached === "string" && sectionCount(cached) === 11 &&
      (cached.includes("结构证据：") || cached.includes("Structural evidence:"));

    if (currentCache && !body.regenerate) {
      return NextResponse.json({
        fullReport: cached, generatedDate: submission.generated_date,
        scores: report.scores, cached: true,
      });
    }
    if (sectionCount(report.fullReport) !== 11 || report.traces.length !== 11) {
      throw new Error("Daily Tide report did not produce exactly 11 chapters.");
    }

    const { error: updateError } = await admin.from("daily_tide_submissions")
      .update({ [cachedField]: report.fullReport })
      .eq("id", body.id).eq("user_id", submission.user_id);
    if (updateError) {
      console.error("[daily-tide] 报告缓存失败:", updateError, "submission id:", body.id);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport: report.fullReport, generatedDate: submission.generated_date,
      scores: report.scores, knowledgeVersion: report.knowledgeVersion,
      activatedNodeIds: report.activatedNodeIds, cached: false,
    });
  } catch (error) {
    console.error("[daily-tide] 本地知识引擎生成失败:", error, "submission id:", body.id);
    return NextResponse.json({ error: "潮汐档案计算未能完成，请稍后再试。" }, { status: 422 });
  }
}