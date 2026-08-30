import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAROT_MAJOR_ARCANA, type TarotCard } from "@/lib/tarot-data";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { generateStaticLifeMirrorReport } from "@/lib/life-mirror-knowledge";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 30;
type RequestBody = { id?: string; lang?: "zh" | "en"; regenerate?: boolean };

function validCards(submission: Record<string, unknown>): [TarotCard, TarotCard, TarotCard] | null {
  const indexes = [submission.hidden_index, submission.present_index, submission.future_index];
  if (!indexes.every(index => Number.isInteger(index) && Number(index) >= 0 && Number(index) < TAROT_MAJOR_ARCANA.length)) return null;
  if (new Set(indexes).size !== 3) return null;
  return indexes.map(index => TAROT_MAJOR_ARCANA[Number(index)]) as [TarotCard, TarotCard, TarotCard];
}
function sectionCount(report: string): number {
  return (report.match(/===\s*\d+\s*===/g) ?? []).length;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!REVIEW_MODE && !user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  let body: RequestBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "请求格式有误。" }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "zh";

  const admin = createAdminClient();
  const { data: submission, error: submissionError } = await admin
    .from("tarot_reading_submissions").select("*").eq("id", body.id).single();
  if (submissionError || !submission) {
    if (submissionError) console.error("[life-mirror] 读取提交失败:", submissionError, "submission id:", body.id);
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows, error: unlockError } = await admin
      .from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    if (unlockError) {
      console.error("[life-mirror] 查询解锁状态失败:", unlockError, "user id:", user!.id);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }
    const now = Date.now();
    const unlocked = (unlockRows ?? []).some((row: { product_id: string; expires_at: string | null }) =>
      (row.product_id === "tarot-reading" || row.product_id === "everything") &&
      (!row.expires_at || new Date(row.expires_at).getTime() > now)
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整生命镜像。" }, { status: 402 });
  }

  const cards = validCards(submission as Record<string, unknown>);
  if (!cards) {
    console.error("[life-mirror] 三牌索引损坏:", submission.hidden_index, submission.present_index, submission.future_index);
    return NextResponse.json({ error: "生命镜像数据不完整，请重新生成。" }, { status: 422 });
  }

  try {
    const facts = submission.facts as LifeVectorInput & Record<string, unknown>;
    const vector = computeLifeVector(facts);
    const seed = createHash("sha256").update(JSON.stringify({
      id: body.id, lang, cards: cards.map(card => card.index), vector,
    })).digest("hex");
    const report = generateStaticLifeMirrorReport({ cards, vector, facts, seed, lang });
    const cachedField = lang === "en" ? "full_report_en" : "full_report";
    const cached = submission[cachedField];
    const currentCache = typeof cached === "string" && sectionCount(cached) === 11 &&
      (lang === "en" ? cached.includes("Structural evidence:") : !cached.includes("结构证据："));

    if (currentCache && !body.regenerate) {
      return NextResponse.json({ fullReport: cached, frequencyMap: report.frequencyMap, practice: report.practice, cached: true });
    }
    if (sectionCount(report.fullReport) !== 11 || report.traces.length !== 11) {
      throw new Error("Life Mirror report did not produce exactly 11 chapters.");
    }

    const { error: updateError } = await admin.from("tarot_reading_submissions")
      .update({ [cachedField]: report.fullReport })
      .eq("id", body.id).eq("user_id", submission.user_id);
    if (updateError) {
      console.error("[life-mirror] 报告缓存失败:", updateError, "submission id:", body.id);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport: report.fullReport, frequencyMap: report.frequencyMap, practice: report.practice,
      knowledgeVersion: report.knowledgeVersion, activatedNodeIds: report.activatedNodeIds, cached: false,
    });
  } catch (error) {
    console.error("[life-mirror] 本地知识引擎生成失败:", error, "submission id:", body.id);
    return NextResponse.json({ error: "生命镜像计算未能完成，请稍后再试。" }, { status: 422 });
  }
}
