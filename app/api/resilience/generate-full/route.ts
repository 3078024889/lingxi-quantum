import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, calculateResilience, type LifeVectorInput } from "@/lib/life-vector";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { planReport, loadLibrary } from "@/lib/hybrid-report";
import { archetypeOf } from "@/lib/archetype";

export const runtime = "nodejs";
export const maxDuration = 30;

const DIM_ZH: Record<string, string> = {
  stressRecovery: "压力恢复能力",
  adaptability: "变化适应能力",
  crisisRebound: "危机反弹能力",
  persistence: "长期坚持能力",
  emotionalStability: "精神稳定能力",
};

const DIM_EN: Record<string, string> = {
  stressRecovery: "Stress Recovery",
  adaptability: "Adaptability",
  crisisRebound: "Crisis Rebound",
  persistence: "Persistence",
  emotionalStability: "Emotional Stability",
};

export async function POST(req: Request) {
  // v293：生命韧性已完全由规则引擎产出，不再需要 ZHIPU_API_KEY。
  // 之前这里留着 key 检查——如果 key 失效或未配置，连纯规则的报告
  // 都会被这一行拦下返回 503，那是完全没必要的失败。已移除。

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!REVIEW_MODE && !user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  let body: { id?: string; lang?: "zh" | "en"; regenerate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "缺少 submission id。" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "zh";

  const admin = createAdminClient();
  const { data: submission } = await admin.from("resilience_submissions").select("*").eq("id", body.id).single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    const unlocked = (unlockRows ?? []).some(
      (u: { product_id: string; expires_at: string | null }) => u.product_id === "resilience-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  const facts = submission.facts;
  const vector = computeLifeVector(facts as LifeVectorInput);
  const resilience = calculateResilience(vector);
  const breakdown = resilience.breakdown as Record<string, number>;
  const breakdownStr = Object.entries(breakdown).map(([k, v]) => `${DIM_ZH[k] ?? k}${v}分`).join("、");

  if (submission[cachedField] && !body.regenerate) {
    const cachedText = submission[cachedField] as string;
    const cachedCount = cachedText.split(/===\s*(?:\d+|SECTION)\s*===/).map((s: string) => s.trim()).filter(Boolean).length;
    if (cachedCount >= 12) {
      return NextResponse.json({ fullReport: cachedText });
    }
    // 少于8段，说明是升级前生成的旧版5段报告——不直接返回，往下走
    // 重新按11章节生成一份新的。
  }

  // ── v288：生命韧性报告完全由规则引擎产出，不调用任何外部模型 ──
  // 这是刻意的架构决定：
  //   · token 成本与速率限制不再是变量——纯计算，零调用，429 不可能发生
  //   · 同一份出生数据永远同一份报告，可复算
  //   · 断网、断供、涨价都不影响用户能不能拿到报告
  // 知识库在 knowledge/resilience/，65 个单维节点 + 6 个组合节点，
  // 覆盖 11 章 × 5 分数带，实测五种差异极大的分数结构均 100% 命中。
  const lib = await loadLibrary("resilience");
  const seed = `${facts.sunSignZh}|${facts.dayMasterElement}|${resilience.score}|${breakdownStr}`;
  const plan = planReport(lib, breakdown, seed, null);

  if (plan.gapChapterKeys.length > 0) {
    // 有缺口说明知识库漏了这个分数带的节点——这是需要修复的缺陷，
    // 不静默降级。日志记下具体章节，方便定位要补哪一条。
    console.error("[resilience] 知识库缺口:", plan.gapChapterKeys.join(","), "分数:", JSON.stringify(breakdown));
  }

  // v295：在 11 章之前插入一页数据画像。
  // 之前报告直接从解读开始，用户看不到"我的五项到底是多少、
  // 谁高谁低、凭什么这样判断"——那正是"这是在说所有人还是在说我"
  // 这个疑问的来源。把数据本身摆出来，解读才有落点。
  const arch = archetypeOf(breakdown);
  const ranked = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const bar = (v: number) => "█".repeat(Math.round(v / 10)) + "░".repeat(10 - Math.round(v / 10));
  const profile = lang === "en"
    ? `Your Five Dimensions\n\n${ranked.map(([k, v]) => `${(DIM_EN[k] ?? k).padEnd(22)} ${bar(v)}  ${v}`).join("\n")}\n\nHighest: ${DIM_EN[ranked[0][0]] ?? ranked[0][0]} (${ranked[0][1]})\nLowest: ${DIM_EN[ranked[4][0]] ?? ranked[4][0]} (${ranked[4][1]})\nSpread: ${ranked[0][1] - ranked[4][1]}\n\nStructural form: ${arch.en}\nBasis: ${arch.reason}\n\nThis form comes from the shape of the five, not their height — two people with the same average and different distributions are read differently.`
    : `你的五项分数\n\n${ranked.map(([k, v]) => `${(DIM_ZH[k] ?? k).padEnd(6, "　")} ${bar(v)}  ${v}`).join("\n")}\n\n最高：${DIM_ZH[ranked[0][0]] ?? ranked[0][0]}（${ranked[0][1]}）\n最低：${DIM_ZH[ranked[4][0]] ?? ranked[4][0]}（${ranked[4][1]}）\n落差：${ranked[0][1] - ranked[4][1]} 分\n\n结构形态：${arch.zh}\n判定依据：${arch.reason}\n\n这个形态取自五项之间的形状，不是分数的高低——同样的平均分，分布不同，读出来是两个人。`;

  const allSections: string[] = [profile, ...plan.chapters
    .map((ch) => (lang === "en" ? ch.ruleTextEn : ch.ruleTextZh) ?? "")
    .filter((x) => x.trim())];

  if (allSections.length === 0) {
    return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 500 });
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  const { error: updateError } = await admin
    .from("resilience_submissions")
    .update({ [cachedField]: fullReport })
    .eq("id", body.id)
    .eq("user_id", submission.user_id);
  if (updateError) {
    console.error("[resilience] 报告缓存失败:", updateError);
    return NextResponse.json({ error: "报告已生成，但保存失败，请稍后再试。" }, { status: 503 });
  }

  return NextResponse.json({ fullReport });
}
