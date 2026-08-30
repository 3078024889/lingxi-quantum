import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, calculateWealthDetail, type LifeVectorInput } from "@/lib/life-vector";
import { planReport, loadLibrary } from "@/lib/hybrid-report";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 30;

const DIM_ZH: Record<string, string> = {
  insight: "洞察力",
  build: "构建力",
  connect: "连接力",
  express: "表达力",
  risk: "风险承担力",
};

const DIM_EN: Record<string, string> = {
  insight: "Insight",
  build: "Building",
  connect: "Connection",
  express: "Expression",
  risk: "Risk Capacity",
};

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!REVIEW_MODE && !user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  let body: { id?: string; lang?: "zh" | "en"; regenerate?: boolean };
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
    .from("wealth_submissions")
    .select("*")
    .eq("id", body.id)
    .single();

  if (submissionError || !submission) {
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
      console.error("[wealth] 解锁状态读取失败:", unlockError);
      return NextResponse.json({ error: "暂时无法确认解锁状态，请稍后再试。" }, { status: 503 });
    }

    const unlocked = (unlockRows ?? []).some(
      (unlock: { product_id: string; expires_at: string | null }) =>
        (unlock.product_id === "wealth-report" || unlock.product_id === "everything") &&
        (!unlock.expires_at || new Date(unlock.expires_at) > new Date())
    );
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
    }
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  if (submission[cachedField] && !body.regenerate) {
    const cachedText = submission[cachedField] as string;
    const sectionCount = cachedText
      .split(/===\s*(?:\d+|SECTION)\s*===/)
      .map((section: string) => section.trim())
      .filter(Boolean).length;
    const currentPublication = sectionCount >= 12 && (lang === "en" || !cachedText.includes("结构证据："));
    if (currentPublication) {
      return NextResponse.json({ fullReport: cachedText });
    }
  }

  let wealth;
  try {
    const vector = computeLifeVector(submission.facts as LifeVectorInput);
    wealth = calculateWealthDetail(vector);
  } catch (error) {
    console.error("[wealth] 确定性计算失败:", error);
    return NextResponse.json({ error: "这份记录缺少完整计算数据，请重新提交。" }, { status: 422 });
  }

  const breakdown = wealth.breakdown as Record<string, number>;
  const ranked = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  const bar = (value: number) => {
    const filled = Math.max(0, Math.min(10, Math.round(value / 10)));
    return "█".repeat(filled) + "░".repeat(10 - filled);
  };

  const profile =
    lang === "en"
      ? [
          "Your Wealth-Creation Vector",
          "",
          `Overall score: ${wealth.score}`,
          `Creation archetype: ${wealth.typeLabelEn}`,
          "",
          ...ranked.map(
            ([key, value]) =>
              `${(DIM_EN[key] ?? key).padEnd(18)} ${bar(value)}  ${value}`
          ),
          "",
          `Primary leverage: ${DIM_EN[highest[0]] ?? highest[0]} (${highest[1]})`,
          `Current bottleneck: ${DIM_EN[lowest[0]] ?? lowest[0]} (${lowest[1]})`,
          `Structural spread: ${highest[1] - lowest[1]}`,
          "",
          "Evidence chain: insight → building → connection → expression → protected experimentation.",
          "The highest score shows where value starts moving most easily. The lowest does not define a defect; it identifies where that movement currently loses continuity. Use the real projects and exchanges of the last year to confirm or reject each chapter.",
        ].join("\n")
      : [
          "你的财富创造向量",
          "",
          `综合分：${wealth.score}`,
          `创造原型：${wealth.typeLabelZh}`,
          "",
          ...ranked.map(
            ([key, value]) =>
              `${(DIM_ZH[key] ?? key).padEnd(6, "　")} ${bar(value)}  ${value}`
          ),
          "",
          `主要杠杆：${DIM_ZH[highest[0]] ?? highest[0]}（${highest[1]}）`,
          `当前瓶颈：${DIM_ZH[lowest[0]] ?? lowest[0]}（${lowest[1]}）`,
          `结构落差：${highest[1] - lowest[1]} 分`,
          "",
          "证据链：洞察 → 构建 → 连接 → 表达 → 有边界的试验。",
          "最高项说明价值最容易从哪里开始流动；最低项不是缺陷判决，而是这条链目前最容易中断的位置。请用最近一年真实发生过的项目、合作与交换，逐章确认或推翻报告判断。",
        ].join("\n");

  const library = await loadLibrary("wealth");
  const seed = [
    submission.facts?.sunSignZh,
    submission.facts?.dayMasterElement,
    wealth.type,
    wealth.score,
    ...Object.entries(breakdown).map(([key, value]) => `${key}:${value}`),
  ].join("|");
  const plan = planReport(library, breakdown, seed, null);

  if (plan.gapChapterKeys.length > 0 || plan.coverage.percent !== 100) {
    console.error(
      "[wealth] 知识库覆盖缺口:",
      plan.gapChapterKeys.join(","),
      "分数:",
      JSON.stringify(breakdown)
    );
    return NextResponse.json(
      { error: "财富地图知识版本不完整，请稍后再试。" },
      { status: 503 }
    );
  }

  const chapterSections = plan.chapters.map((chapter) => {
    const title = lang === "en" ? chapter.titleEn : chapter.titleZh;
    const prose = lang === "en" ? chapter.ruleTextEn : chapter.ruleTextZh;
    return `${title}

${prose?.trim() ?? ""}`;
  });
  const fullReport = [profile, ...chapterSections].join("\n\n===SECTION===\n\n");

  const { error: updateError } = await admin
    .from("wealth_submissions")
    .update({ [cachedField]: fullReport })
    .eq("id", body.id)
    .eq("user_id", submission.user_id);

  if (updateError) {
    console.error("[wealth] 报告缓存失败:", updateError);
    return NextResponse.json(
      { error: "报告已生成，但保存失败，请稍后再试。" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    fullReport,
    coverage: plan.coverage,
  });
}
