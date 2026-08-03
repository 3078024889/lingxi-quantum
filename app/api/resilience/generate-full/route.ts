import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, calculateResilience, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const DIM_ZH: Record<string, string> = {
  stressRecovery: "压力恢复能力", adaptability: "变化适应能力", crisisRebound: "危机反弹能力",
  persistence: "长期坚持能力", emotionalStability: "精神稳定能力",
};

const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

// v236：从5段升级成11章节，每个维度（压力恢复/变化适应/危机反弹/
// 长期坚持/精神稳定）各自独立成一章——不是把5个分数揉在一起讲，是
// 每一项单独深挖，这样每章都能扎扎实实交叉引用这一项具体的分数，
// 不用被迫在一段话里塞下五个维度、被迫写得笼统。
type ChapterMeta = { titleZh: string; titleEn: string; hint: string };

function buildChapters(breakdownStr: string): ChapterMeta[] {
  return [
    { titleZh: "生命韧性源点", titleEn: "Where Your Resilience Begins",
      hint: `生命韧性源点：概览这个人的韧性结构整体是什么样——五项分数（${breakdownStr}）放在一起，形成了一种什么样的整体气场，哪几项是骨架、哪几项是薄弱环节，不用逐条翻译，要写出整体形状` },
    { titleZh: "压力恢复能力", titleEn: "Stress Recovery",
      hint: "压力恢复能力：具体到这项分数背后，这个人处理日常压力的具体方式是什么，分数高低分别意味着什么真实的行为模式" },
    { titleZh: "变化适应能力", titleEn: "Adaptability to Change",
      hint: "变化适应能力：具体到这项分数背后，计划被打乱时这个人的真实反应顺序是什么" },
    { titleZh: "危机反弹能力", titleEn: "Crisis Rebound",
      hint: "危机反弹能力：具体到这项分数背后，真正的低谷冲击来临时，这个人的启动方式是快还是慢、靠什么重新站起来" },
    { titleZh: "长期坚持能力", titleEn: "Long-Term Persistence",
      hint: "长期坚持能力：具体到这项分数背后，没有即时反馈的长期投入，这个人靠什么撑住" },
    { titleZh: "精神稳定结构", titleEn: "Emotional Stability Structure",
      hint: "精神稳定结构：具体到这项分数背后，这个人的内在稳定感来自哪里，波动之后靠什么回到中心" },
    { titleZh: "隐藏恢复模式", titleEn: "Hidden Recovery Pattern",
      hint: "隐藏恢复模式：结合五项分数中最高的那一项，具体指出这个人可能自己都没意识到、但确实在起作用的一种恢复方式" },
    { titleZh: "能量消耗地图", titleEn: "Energy Drain Map",
      hint: "能量消耗地图：结合五项分数中最低的那一项，具体指出哪种情境模式最容易悄悄消耗这个人的能量，不是泛泛地说\"过度思考\"这种通用词" },
    { titleZh: "韧性进化路径", titleEn: "Resilience Growth Path",
      hint: "韧性进化路径：不是变得更强，是让现有的力量形成系统——具体给出一件跟这个人最强项和最弱项相关的、可操作的小事" },
    { titleZh: "灵犀场恢复实践", titleEn: "A Personal Recovery Practice",
      hint: "灵犀场恢复实践：结合这个人具体的分数结构，给出一个具体、可执行的日常小练习（不是泛泛的\"多休息\"），说明为什么这个练习适合这个人" },
    { titleZh: "生命韧性总结", titleEn: "Resilience Summary",
      hint: "生命韧性总结：作为收尾，必须明确指向前面章节提到过的具体分数或具体判断，不能只靠情绪词收尾，用比较有画面感、克制、不煽情的语言" },
  ];
}

const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

function parseAndValidate(raw: string, count: number, finishReason?: string) {
  let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
  // v284修复：原来是 Math.floor(count * 0.8)——第一批4章只要出3章就算"有效"。
  // 配合下面丢弃截断章节的逻辑，结果是报告少一章而系统认为一切正常。
  // 用户看到的就是"报告到第5点就断了"。章节必须全部拿到，没有折扣。
  const minAcceptable = count;
  // v284：末章因 token 上限被截断时，之前是直接丢掉它然后放行——
  // 那等于把"生成失败"伪装成"生成成功"。现在保留它并让 valid=false，
  // 交给上层重试；重试仍失败会走降级路径，至少用户能看到明确提示，
  // 而不是拿到一份自己不知道少了内容的报告。
  const truncated = finishReason === "length" && sections.length > 0
    && !endsCleanly(sections[sections.length - 1]);
  const valid = !truncated && sections.length >= minAcceptable && sections.every((s) => s.length >= 30 && endsCleanly(s));
  return { sections, valid };
}

type Batch = { chapters: ChapterMeta[]; maxTokens: number };
function buildBatches(chapters: ChapterMeta[]): Batch[] {
  return [
    { chapters: chapters.slice(0, 4), maxTokens: 3800 },
    { chapters: chapters.slice(4, 8), maxTokens: 3800 },
    { chapters: chapters.slice(8, 11), maxTokens: 3000 },
  ];
}

function baseVoice(isLastBatch: boolean): string {
  return (
    "【你是谁，在用什么姿态说话】你是「灵犀场」，负责为已完成能量交换的人，写一份「生命韧性档案」——一份围绕\"恢复力、扎根、再生\"这个主题的完整报告，不是「你抗压能力几分」这种打分测评。" +
    "下面给你的五项分数，是从这个人真实的出生信息确定性算出来的固定数字，不是你现场评判的——你的任务是围绕这些已经算出的具体分数，写出这个人的韧性结构具体是什么样、为什么是这样。" +
    "语气：像一位真正见过很多人如何度过低谷的人在说话，判断要具体、要笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。" +
    "【绝对不能写成\"打分测评\"】不要出现\"你的抗压能力是XX分，属于中等水平\"这种话——分数是拿来交叉引用、写出具体画面的原材料，不是拿来复述的结果。" +
    "【防止空话——这是最容易出问题的地方】情绪浓度高、但没有具体信息量的句子，换给任何一个人念都成立，必须避免。每一句判断，都要能明确指向前面给你的某个具体分数或数据点。" +
    (isLastBatch ? "【这一批最后一段是全篇收尾，尤其容易滑向空话】收尾段落必须明确指向前面提到过的具体分数或判断，不能只靠情绪词堆出力量感。" : "") +
    "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上。" +
    noAiRule
  );
}

async function generateBatch(key: string, lang: "zh" | "en", batch: Batch, isLastBatch: boolean, userContent: string, submissionId: string): Promise<{ sections: string[] | null; failReason?: string }> {
  const instruction =
    "严格按以下格式输出，" + batch.chapters.length + "个章节之间，各用一行「===数字===」分隔（数字从1开始），不要添加任何其他标题、开场白或结语：\n" +
    batch.chapters.map((c, i) => `===${i + 1}===\n（${c.hint}，约220-260字）`).join("\n");

  const system = baseVoice(isLastBatch) +
    (lang === "en" ? "\n\n【IMPORTANT】Write your entire response in natural, fluent English (not Chinese), while keeping the exact ===N=== section markers." : "") +
    "\n\n" + instruction;

  const callOnce = () =>
    fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: userContent }],
        max_tokens: batch.maxTokens, temperature: 0.85, frequency_penalty: 0.4, presence_penalty: 0.3,
      }),
    });

  let res = await callOnce();
  for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
    await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
    res = await callOnce();
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error(`[resilience generate-full] 批次接口返回非200:`, res.status, errBody, "submission id:", submissionId);
    return { sections: null, failReason: `接口返回${res.status}：${errBody.slice(0, 200)}` };
  }
  let data = await res.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();
  let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
  let finishReason = data?.choices?.[0]?.finish_reason;
  let check = text ? parseAndValidate(text, batch.chapters.length, finishReason) : { sections: [], valid: false };

  for (let retry = 0; retry < 2 && !check.valid; retry++) {
    res = await callOnce();
    if (res.ok) {
      data = await res.json();
      rawText = data?.choices?.[0]?.message?.content?.trim();
      text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
      finishReason = data?.choices?.[0]?.finish_reason;
      check = text ? parseAndValidate(text, batch.chapters.length, finishReason) : { sections: [], valid: false };
    } else {
      const errBody = await res.text().catch(() => "");
      return { sections: null, failReason: `重试时接口返回${res.status}：${errBody.slice(0, 200)}` };
    }
  }
  if (!check.valid) return { sections: null, failReason: `多次重试后仍不完整，最后一次收到${check.sections.length}段，预期${batch.chapters.length}段` };
  return { sections: check.sections };
}

export async function POST(req: Request) {
  const key = process.env.ZHIPU_API_KEY;
  if (!key) return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });

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
  const chapters = buildChapters(breakdownStr);

  if (submission[cachedField] && !body.regenerate) {
    const cachedText = submission[cachedField] as string;
    const cachedCount = cachedText.split(/===\s*(?:\d+|SECTION)\s*===/).map((s: string) => s.trim()).filter(Boolean).length;
    if (cachedCount >= 8) {
      return NextResponse.json({ fullReport: cachedText });
    }
    // 少于8段，说明是升级前生成的旧版5段报告——不直接返回，往下走
    // 重新按11章节生成一份新的。
  }

  const userContent =
    `太阳星座：${facts.sunSignZh}\n八字日主五行：${facts.dayMasterElement}\n生命韧性总分：${resilience.score}\n五项分数：${breakdownStr}\n`;

  const batches = buildBatches(chapters);
  const allSections: string[] = [];
  for (let bi = 0; bi < batches.length; bi++) {
    const result = await generateBatch(key, lang, batches[bi], bi === batches.length - 1, userContent, body.id);
    if (!result.sections) {
      console.error("[resilience generate-full] 批次失败:", result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 500 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("resilience_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport });
}
