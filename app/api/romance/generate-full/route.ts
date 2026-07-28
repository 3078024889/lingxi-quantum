import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { calculateRomance, type AttractionStyle } from "@/lib/romance-calc";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const STYLE_ZH: Record<AttractionStyle, string> = {
  independent: "独立探索型", magnetic: "磁场吸引型", devoted: "深度专一型", gentle: "温和渗透型",
};

const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

// v236：从5段升级成11章节，覆盖吸引力类型、情感表达、关系需求、
// 隐藏魅力、互动模式、成长方向、阻碍地图、理想连接模式、象征故事
// 这些具体维度——每章都要交叉引用真实数据点，不是空泛的桃花运描述。
type ChapterMeta = { titleZh: string; titleEn: string; hint: string };

function buildChapters(dimStr: string, styleZh: string, taohuaStr: string): ChapterMeta[] {
  return [
    { titleZh: "桃花磁场源点", titleEn: "Where Your Field Begins",
      hint: `桃花磁场源点：概览这个人的磁场整体是什么样——五个维度（${dimStr}）和吸引力风格「${styleZh}」放在一起，形成了怎样的整体气场` },
    { titleZh: "吸引力类型", titleEn: "Attraction Type",
      hint: `吸引力类型：具体展开「${styleZh}」这个风格，别人具体是怎么被这种风格感知到的，越具体越好，不要泛泛而谈` },
    { titleZh: "情感表达模式", titleEn: "Emotional Expression Pattern",
      hint: "情感表达模式：这个人喜欢一个人时，具体的表达方式是直接/行动/陪伴/理解中的哪一种，结合具体维度分数说明" },
    { titleZh: "关系需求地图", titleEn: "Relationship Needs Map",
      hint: "关系需求地图：这个人在关系里真正需要的是稳定、自由、成长还是交流，结合具体维度分数说明为什么" },
    { titleZh: "隐藏魅力节点", titleEn: "Hidden Charm Point",
      hint: "隐藏魅力节点：结合分数最高但容易被自己忽略的那个维度，具体指出一个这个人自己可能没意识到的魅力点" },
    { titleZh: "关系互动模式", titleEn: "Relationship Interaction Pattern",
      hint: "关系互动模式：进入关系时，这个人是主动靠近、慢慢观察还是深度连接，具体说明这种模式的画面" },
    { titleZh: "吸引力成长方向", titleEn: "Attraction Growth Direction",
      hint: "吸引力成长方向：不是变成别人喜欢的样子，是更完整地表达自己——结合具体最低分维度，给出具体可操作的方向" },
    { titleZh: "情感阻碍地图", titleEn: "Emotional Obstacle Map",
      hint: "情感阻碍地图：结合具体数据，指出这个人在关系里最容易出现的具体阻碍模式（过度保护/过度期待/害怕表达这类），要具体不要笼统" },
    { titleZh: "理想连接模式", titleEn: "Ideal Connection Style",
      hint: "理想连接模式：根据这个人的具体结构，更容易在什么样的关系模式里舒展（深度交流型/共同成长型/自由空间型），具体说明为什么" },
    { titleZh: "桃花磁场故事", titleEn: "A Symbolic Story",
      hint: `桃花磁场故事：用有画面感的象征比喻描绘这个人的吸引力质地${taohuaStr ? "，可以自然带入" + taohuaStr : ""}，不能是空洞的比喻，要具体` },
    { titleZh: "桃花磁场总结", titleEn: "Field Summary",
      hint: "桃花磁场总结：作为收尾，必须明确指向前面章节提到过的具体维度或判断，不能只靠情绪词收尾" },
  ];
}

const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

function parseAndValidate(raw: string, count: number, finishReason?: string) {
  let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
  const minAcceptable = Math.max(1, Math.floor(count * 0.8));
  if (finishReason === "length" && sections.length > 0 && !endsCleanly(sections[sections.length - 1])) {
    sections = sections.slice(0, -1);
  }
  const valid = sections.length >= minAcceptable && sections.every((s) => s.length >= 30 && endsCleanly(s));
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
    "【你是谁，在用什么姿态说话】你是「灵犀场」，负责为已完成能量交换的人，写一份「桃花磁场档案」——探索这个人自身散发出的吸引力场是什么样的，不是「什么时候脱单」「桃花运好不好」这种运势预测。" +
    "下面给你的分数、吸引力风格、五个磁场维度分数，以及是否命带传统命理里的\"桃花星\"，都是从这个人真实的出生信息确定性算出来的固定数字，不是你现场评判的。" +
    "语气：像一位真正观察过很多人如何吸引他人的人在说话，判断要具体、要笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。" +
    "【绝对不能写成廉价的\"桃花运\"内容】不要出现\"你今年桃花很旺\"\"容易遇到对的人\"这类预言式的话——这是一份关于\"你自身散发什么\"的自我观察，不是关于\"会不会遇到谁\"的预测。" +
    "【防止空话】情绪浓度高、但没有具体信息量的句子，换给任何一个人念都成立，必须避免。每一句判断，都要能明确指向前面给你的某个具体分数或数据点。" +
    (isLastBatch ? "【这一批最后一段是全篇收尾，尤其容易滑向空话】收尾段落必须明确指向前面提到过的具体维度或判断，不能只靠情绪词堆出力量感。" : "") +
    "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法。" +
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
    console.error(`[romance generate-full] 批次接口返回非200:`, res.status, errBody, "submission id:", submissionId);
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
  const { data: submission } = await admin.from("romance_submissions").select("*").eq("id", body.id).single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    const unlocked = (unlockRows ?? []).some(
      (u: { product_id: string; expires_at: string | null }) => u.product_id === "romance-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";

  const facts = submission.facts;
  const vector = computeLifeVector(facts as LifeVectorInput);
  const romance = calculateRomance(vector, {
    yearPillar: facts.yearPillar, monthPillar: facts.monthPillar,
    dayPillar: facts.dayPillar, hourPillar: facts.hourPillar,
  });
  const softenScore = (raw: number) => Math.round(25 + (raw / 100) * 75);
  const dimStr = `存在感${softenScore(vector.socialDrive)}分、表达力${softenScore(vector.creativity)}分、开放度${softenScore(vector.adaptability)}分、自信场${softenScore(vector.ambition)}分、共振力${softenScore(vector.emotionalDepth)}分`;
  const styleZh = STYLE_ZH[romance.style];
  const taohuaStr = romance.taoHua.hasTaoHua ? `命盘${romance.taoHua.foundIn.join("、")}命中传统命理桃花星` : "";

  if (submission[cachedField] && !body.regenerate) {
    const cachedText = submission[cachedField] as string;
    const cachedCount = cachedText.split(/===\s*(?:\d+|SECTION)\s*===/).map((s: string) => s.trim()).filter(Boolean).length;
    if (cachedCount >= 8) {
      return NextResponse.json({ fullReport: cachedText });
    }
  }

  const userContent =
    `桃花磁场总分：${romance.score}\n吸引力风格：${styleZh}\n五个磁场维度：${dimStr}\n${romance.taoHua.hasTaoHua ? `命理桃花星：${taohuaStr}` : "命盘未命中传统命理桃花星"}\n`;

  const chapters = buildChapters(dimStr, styleZh, taohuaStr);
  const batches = buildBatches(chapters);
  const allSections: string[] = [];
  for (let bi = 0; bi < batches.length; bi++) {
    const result = await generateBatch(key, lang, batches[bi], bi === batches.length - 1, userContent, body.id);
    if (!result.sections) {
      console.error("[romance generate-full] 批次失败:", result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 500 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("romance_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport });
}
