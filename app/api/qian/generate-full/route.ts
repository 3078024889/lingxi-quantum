import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { LIFE_SIGNS, type LifeSign } from "@/lib/qian-data";
import { generateStaticQianReport } from "@/lib/qian-knowledge";
import { REVIEW_MODE } from "@/lib/reviewMode";

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

function validSigns(indexes: unknown): [LifeSign, LifeSign, LifeSign] | null {
  if (!Array.isArray(indexes) || indexes.length !== 3) return null;
  const signs = indexes.map((index) =>
    Number.isInteger(index) && index >= 0 && index < LIFE_SIGNS.length ? LIFE_SIGNS[index] : null,
  );
  if (signs.some((sign) => !sign)) return null;
  const typed = signs as [LifeSign, LifeSign, LifeSign];
  if (typed[0].tier !== "origin" || typed[1].tier !== "soul" || typed[2].tier !== "walker") return null;
  return typed;
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
    .from("qian_submissions")
    .select("*")
    .eq("id", body.id)
    .single();

  if (submissionError || !submission) {
    if (submissionError) {
      console.error("[qian] 读取提交记录失败:", submissionError, "submission id:", body.id);
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
      console.error("[qian] 查询解锁状态失败:", unlockError, "user id:", user!.id);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }

    const now = Date.now();
    const unlocked = (unlockRows ?? []).some(
      (unlock: { product_id: string; expires_at: string | null }) =>
        (unlock.product_id === "qian-reading" || unlock.product_id === "everything") &&
        (!unlock.expires_at || new Date(unlock.expires_at).getTime() > now),
    );

    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁深度生命解读。" }, { status: 402 });
    }
  }

  const signs = validSigns(submission.sign_indexes);
  if (!signs) {
    console.error("[qian] 签索引损坏:", submission.sign_indexes, "submission id:", body.id);
    return NextResponse.json({ error: "生命签数据不完整，请重新读取。" }, { status: 422 });
  }

  try {
    const facts = submission.facts as Record<string, unknown>;
    const vector = computeLifeVector(facts as LifeVectorInput);
    const seed = createHash("sha256")
      .update(JSON.stringify({ submissionId: body.id, lang, signIndexes: submission.sign_indexes, vector }))
      .digest("hex");
    const report = generateStaticQianReport({ signs, vector, seed, lang });

    const cachedField = lang === "en" ? "full_report_en" : "full_report";
    const cached = submission[cachedField];
    const isCurrentStaticReport =
      typeof cached === "string" &&
      countSections(cached) === 11 &&
      (lang === "en" ? cached.includes("Structural evidence:") : !cached.includes("结构证据："));

    if (isCurrentStaticReport && !body.regenerate) {
      return NextResponse.json({
        fullReport: cached,
        abilityMap: report.abilityMap,
        lifeStage: report.lifeStage,
        cached: true,
      });
    }

    if (countSections(report.fullReport) !== 11 || report.traces.length !== 11) {
      throw new Error("Static qian report did not produce exactly 11 chapters.");
    }

    const { error: updateError } = await admin
      .from("qian_submissions")
      .update({ [cachedField]: report.fullReport })
      .eq("id", body.id)
      .eq("user_id", submission.user_id);

    if (updateError) {
      console.error("[qian] 报告缓存失败:", updateError, "submission id:", body.id);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport: report.fullReport,
      abilityMap: report.abilityMap,
      lifeStage: report.lifeStage,
      knowledgeVersion: report.knowledgeVersion,
      activatedNodeIds: report.activatedNodeIds,
      cached: false,
    });
  } catch (error) {
    console.error("[qian] 本地知识引擎生成失败:", error, "submission id:", body.id);
    return NextResponse.json({ error: "生命灵签计算未能完成，请稍后再试。" }, { status: 422 });
  }
}
