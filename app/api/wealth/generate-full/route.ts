import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLifeVector, calculateWealthDetail, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

// v245：财富创造地图，11章节，跟生命韧性/桃花磁场同一套模式——每章
// 都要交叉引用真实计算出来的具体分数，不能是任何人都适用的空话。
type ChapterMeta = { titleZh: string; titleEn: string; hint: string };

function buildChapters(dimStr: string, typeZh: string): ChapterMeta[] {
  return [
    { titleZh: "财富创造源点", titleEn: "Where Your Creation Begins",
      hint: `财富创造源点：概览这个人的创造驱动力整体是什么样——五个维度（${dimStr}）和创造类型「${typeZh}」放在一起，形成了怎样的整体气场，不用逐条翻译分数，要写出整体形状` },
    { titleZh: "天赋结构地图", titleEn: "Talent Structure Map",
      hint: "天赋结构地图：具体展开洞察力/构建力/连接力/表达力/风险承担力这五项里，最突出的一到两项，具体是怎样的天赋表现，越具体越好" },
    { titleZh: "价值表达方式", titleEn: "How Value Gets Expressed",
      hint: "价值表达方式：这个人的价值更容易通过思想型（观点/知识/洞察）、产品型（工具/系统/作品）还是连接型（关系/合作/资源）被世界接收到，结合具体维度分数说明为什么" },
    { titleZh: "财富流动模式", titleEn: "Value Flow Pattern",
      hint: "财富流动模式：这个人的价值从创造到交换的这条路径，具体容易在哪个环节顺畅、哪个环节卡住（创造→表达→连接→交换→反馈），结合具体分数说明" },
    { titleZh: "资源连接方式", titleEn: "Resource Connection Style",
      hint: "资源连接方式：这个人更容易通过个人能力积累、人际网络、还是环境变化获得机会，结合连接力和风险承担力的具体分数说明" },
    { titleZh: "创造阻碍模式", titleEn: "Creative Obstacle Pattern",
      hint: "创造阻碍模式：结合具体最低分维度，指出这个人在价值释放过程中最容易卡在哪个具体环节（想法太多方向分散、过度等待、缺少展示这类），要具体不要笼统" },
    { titleZh: "长期复利结构", titleEn: "Long-Term Compounding Structure",
      hint: "长期复利结构：结合这个人具体的分数结构，指出哪一类投入对这个人来说最值得长期培养、会随时间放大" },
    { titleZh: "合作与共创潜力", titleEn: "Collaboration Potential",
      hint: "合作与共创潜力：这个人更适合独立创造、伙伴合作还是团队生态，结合连接力和构建力的具体分数说明为什么" },
    { titleZh: "个人价值品牌", titleEn: "Personal Value Brand",
      hint: "个人价值品牌：结合这个人的创造类型和最突出的维度，具体说明这个人容易被记住的方式是什么、独特标签可能是什么" },
    { titleZh: "财富进化路径", titleEn: "Wealth Evolution Path",
      hint: "财富进化路径：不是变得更有钱，是让现有的创造能力形成系统——具体给出一件跟这个人最强项和最弱项相关的、可操作的小事" },
    { titleZh: "财富创造总结", titleEn: "Wealth Creation Summary",
      hint: `财富创造总结：作为收尾，必须明确指向前面章节提到过的具体分数或判断，给出这个人的"创造者身份"一句话总结（呼应创造类型「${typeZh}」），不能只靠情绪词收尾` },
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
    "【你是谁，在用什么姿态说话】你是「灵犀场」，负责为已完成能量交换的人，写一份「财富创造地图」——探索这个人如何发现价值、创造价值、交换价值，不是「你会不会发财」「什么时候有钱」这种运势预测。" +
    "下面给你的分数、创造类型、五个维度分数，都是从这个人真实的出生信息确定性算出来的固定数字，不是你现场评判的。" +
    "【场域感知，不是数据播报】你不是在把一份计算结果念给这个人听——是这份真实的结构，让你先感知到了这个人身上具体的创造样貌，然后你把感知到的东西说出来。同一个维度分数，落在这个人具体的整体结构里，意味着什么，要写得像是\"看见了这个人\"，不是\"读出了这个数字\"。避免用「你的XX分数是XX」这种播报式开头连续出现在多段里，让分数自然地嵌进对这个人的具体描述里。" +
    "语气：像一位真正观察过很多人如何创造价值的人在说话，判断要具体、要笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。" +
    "【绝对不能写成廉价的\"财神测算\"内容】不要出现\"你今年财运很旺\"\"容易发大财\"这类预言式的话——这是一份关于\"你如何创造价值\"的自我观察，不是关于\"会不会有钱\"的预测。也不要写具体金额、具体投资建议。" +
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
    console.error(`[wealth generate-full] 批次接口返回非200:`, res.status, errBody, "submission id:", submissionId);
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
  const { data: submission } = await admin.from("wealth_submissions").select("*").eq("id", body.id).single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    const unlocked = (unlockRows ?? []).some(
      (u: { product_id: string; expires_at: string | null }) => u.product_id === "wealth-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  const facts = submission.facts;
  const vector = computeLifeVector(facts as LifeVectorInput);
  const wealth = calculateWealthDetail(vector);
  const typeZh = wealth.typeLabelZh;
  const dimStr = Object.entries(wealth.breakdown).map(([k, v]) => {
    const label = { insight: "洞察力", build: "构建力", connect: "连接力", express: "表达力", risk: "风险承担力" }[k as string];
    return `${label}${v}分`;
  }).join("、");

  if (submission[cachedField] && !body.regenerate) {
    const cachedText = submission[cachedField] as string;
    const cachedCount = cachedText.split(/===\s*(?:\d+|SECTION)\s*===/).map((s: string) => s.trim()).filter(Boolean).length;
    if (cachedCount >= 8) {
      return NextResponse.json({ fullReport: cachedText });
    }
  }

  const userContent = `财富创造总分：${wealth.score}\n创造类型：${typeZh}\n五个维度：${dimStr}\n太阳星座：${facts.sunSignZh}\n八字日主五行：${facts.dayMasterElement}\n`;

  const chapters = buildChapters(dimStr, typeZh);
  const batches = buildBatches(chapters);
  const allSections: string[] = [];
  for (let bi = 0; bi < batches.length; bi++) {
    const result = await generateBatch(key, lang, batches[bi], bi === batches.length - 1, userContent, body.id);
    if (!result.sections) {
      console.error("[wealth generate-full] 批次失败:", result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 500 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("wealth_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport });
}
