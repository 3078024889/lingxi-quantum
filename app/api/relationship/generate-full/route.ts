import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  compareLifeVectors,
  computeLifeVector,
  type LifeVectorInput,
} from "@/lib/life-vector";
import { generateStaticRelationshipReport } from "@/lib/knowledge-loader";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { RELATIONSHIP_KNOWLEDGE_VERSION } from "@/lib/relationship-dendrites";

export const runtime = "nodejs";
export const maxDuration = 30;

function sectionCount(report: string): number {
  return report
    .split(/===\s*(?:\d+|SECTION)\s*===/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function currentKnowledge(report: string): boolean {
  return report.startsWith(`<!-- relationship-knowledge:${RELATIONSHIP_KNOWLEDGE_VERSION} -->`);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!REVIEW_MODE && !user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  let body: { id?: string; lang?: "zh" | "en"; regenerate?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "缺少 submission id。" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: submission, error: fetchError } = await admin
    .from("relationship_submissions")
    .select("id,user_id,name_a,name_b,relationship_type,facts_a,facts_b,full_report,full_report_en")
    .eq("id", body.id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows, error: unlockError } = await admin
      .from("unlocks")
      .select("product_id, expires_at")
      .eq("user_id", user!.id)
      .in("product_id", ["relationship-resonance", "everything"]);

    if (unlockError) {
      console.error("[relationship/generate-full] unlock lookup failed:", unlockError);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }

    const now = Date.now();
    const unlocked = (unlockRows ?? []).some(
      (row: { product_id: string; expires_at: string | null }) =>
        !row.expires_at || new Date(row.expires_at).getTime() > now,
    );
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
    }
  }

  try {
    const lang = body.lang === "en" ? "en" : "zh";
    const cacheField = lang === "en" ? "full_report_en" : "full_report";
    const cached = submission[cacheField] as string | null;
    const vectorA = computeLifeVector(submission.facts_a as LifeVectorInput);
    const vectorB = computeLifeVector(submission.facts_b as LifeVectorInput);
    const resonance = compareLifeVectors(vectorA, vectorB);

    const currentPublication = cached && currentKnowledge(cached) && sectionCount(cached) >= 11 &&
      (lang === "en" || !cached.includes("结构证据："));
    if (currentPublication && !body.regenerate) {
      return NextResponse.json({
        fullReport: cached,
        resonance,
        vectors: { a: vectorA, b: vectorB },
      });
    }

    const generatedReport = generateStaticRelationshipReport({
      nameA: submission.name_a,
      nameB: submission.name_b,
      vectorA,
      vectorB,
      resonance,
      relationshipType: submission.relationship_type,
      lang,
    });
    const fullReport = "<!-- relationship-knowledge:" + RELATIONSHIP_KNOWLEDGE_VERSION + " -->\n" + generatedReport;

    const { error: updateError } = await admin
      .from("relationship_submissions")
      .update({ [cacheField]: fullReport })
      .eq("id", submission.id)
      .eq("user_id", submission.user_id);

    if (updateError) {
      console.error("[relationship/generate-full] report cache failed:", updateError);
      return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
    }

    return NextResponse.json({
      fullReport,
      resonance,
      vectors: { a: vectorA, b: vectorB },
    });
  } catch (error) {
    console.error("[relationship/generate-full] generation failed:", error);
    return NextResponse.json({ error: "场域展开报告时出错，请稍后再试。" }, { status: 500 });
  }
}
