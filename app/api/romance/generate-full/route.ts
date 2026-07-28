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

const baseVoiceParts = [
  "【你是谁，在用什么姿态说话】你是「灵犀场」，负责为已完成能量交换的人，写一份「桃花磁场档案」——探索这个人自身散发出的吸引力场是什么样的，不是「什么时候脱单」「桃花运好不好」这种运势预测。",
  "下面给你的分数、吸引力风格、五个磁场维度分数（存在感/表达力/开放度/自信场/共振力），以及是否命带传统命理里的\"桃花星\"，都是从这个人真实的出生信息确定性算出来的固定数字，不是你现场评判的——你的任务是围绕这些已经算出的具体数据，写出这个人的磁场具体是什么样、为什么是这样。",
  "语气：像一位真正观察过很多人如何吸引他人的人在说话，判断要具体、要笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。",
  "【绝对不能写成廉价的\"桃花运\"内容】不要出现\"你今年桃花很旺\"\"容易遇到对的人\"这类预言式的话——这是一份关于\"你自身散发什么\"的自我观察，不是关于\"会不会遇到谁\"的预测。",
  "【防止空话——这是最容易出问题的地方】情绪浓度高、但没有具体信息量的句子（比如\"你很有魅力，大家都喜欢你\"），换给任何一个人念都成立，必须避免。每一句判断，都要能明确指向前面给你的某个具体分数或数据点。",
  "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。",
  "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上，不同段落之间也不能出现大段重复的判断或用词。",
];
const baseVoice = baseVoiceParts.join("") + noAiRule;

type Batch = { titleZh: string; count: number; instruction: string; maxTokens: number };

function buildBatches(params: {
  score: number; styleZh: string; hasTaoHua: boolean; taohuaFoundIn: string[];
  presence: number; expression: number; openness: number; confidence: number; resonance: number;
}): Batch[] {
  const { score, styleZh, hasTaoHua, taohuaFoundIn, presence, expression, openness, confidence, resonance } = params;
  const taohuaStr = hasTaoHua
    ? `命盘的${taohuaFoundIn.join("、")}命中传统命理里的桃花星`
    : "命盘没有命中传统命理里的桃花星（这不代表吸引力弱，只是这个人的吸引力不是走这条传统路径）";
  const dimStr = `存在感${presence}分、表达力${expression}分、开放度${openness}分、自信场${confidence}分、共振力${resonance}分`;

  return [
    {
      titleZh: "第一批：吸引力核心图 + 磁场频率光谱", count: 2, maxTokens: 3200,
      instruction:
        "===1===\n（吸引力核心图：这个人的桃花磁场总分是" + score + "分，吸引力风格属于「" + styleZh + "」，五个磁场维度分别是" + dimStr + "。具体说清楚这个人的吸引力核心具体是什么样——是靠哪个维度最先被别人感知到的，这份吸引力风格具体在人际互动里长什么样子，约220-260字）\n" +
        "===2===\n（磁场频率光谱：" + taohuaStr + "，结合这一点和五个维度里最高、最低的那两项，说清楚这个人的磁场是偏\"近距离才感知到\"还是\"一进门就有存在感\"，是偏稳定持续还是偏忽强忽弱，约200-240字）",
    },
    {
      titleZh: "第二批：吸引能量花瓣 + 磁场洞察", count: 2, maxTokens: 3600,
      instruction:
        "===1===\n（吸引能量花瓣：把五个维度当成五片花瓣，具体说清楚哪几片花瓣长得饱满、哪几片相对单薄，这种不均衡具体会在关系里表现成什么样的行为模式，不要只是把五个分数翻译成五句话，要写出它们放在一起是什么整体形状，约220-260字）\n" +
        "===2===\n（磁场洞察，分三段但连贯成一整段：当前吸引状态——现在这个磁场最容易吸引到什么类型的人；内在磁场——这个磁场背后真正的驱动力是什么；共振方向——具体给出一件这个人可以做的、跟前面提到的具体维度相关的小事，让磁场更容易被同频的人感知到，不要给\"多社交\"\"要自信\"这种通用建议，约260-300字）",
    },
    {
      titleZh: "第三批：磁场印记（封印页）", count: 1, maxTokens: 1200,
      instruction:
        "===1===\n（磁场印记：作为整份报告的收尾，必须明确指向前面提到过的某个具体维度或数据点，不能只靠\"你的磁场自然绽放\"这类换谁都成立的空话收尾，用比较有画面感、克制、不煽情的语言，约120-150字）",
    },
  ];
}

const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

function parseAndValidate(raw: string, count: number, finishReason?: string) {
  let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
  const minAcceptable = Math.max(1, Math.floor(count * 0.8));
  if (finishReason === "length" && sections.length > 0 && !endsCleanly(sections[sections.length - 1])) {
    sections = sections.slice(0, -1);
  }
  const valid = sections.length >= minAcceptable && sections.every((s) => s.length >= 20 && endsCleanly(s));
  return { sections, valid };
}

async function generateBatch(key: string, lang: "zh" | "en", batch: Batch, submissionId: string): Promise<{ sections: string[] | null; failReason?: string }> {
  const system = baseVoice + `【这次只负责${batch.titleZh}这一部分，严格按下面的分段格式输出，共${batch.count}段，每段之间用===隔开，不能多也不能少】` + batch.instruction +
    (lang === "en" ? " 用英文回复（Reply in English），但===数字===这些分隔符本身保持原样不要翻译。" : "");

  const callOnce = () =>
    fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: "开始写这一部分。" }],
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
    console.error(`[romance generate-full] ${batch.titleZh} 接口返回非200:`, res.status, errBody, "submission id:", submissionId);
    return { sections: null, failReason: `接口返回${res.status}：${errBody.slice(0, 200)}` };
  }
  let data = await res.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();
  let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
  let finishReason = data?.choices?.[0]?.finish_reason;
  let check = text ? parseAndValidate(text, batch.count, finishReason) : { sections: [], valid: false };

  for (let retry = 0; retry < 2 && !check.valid; retry++) {
    res = await callOnce();
    if (res.ok) {
      data = await res.json();
      rawText = data?.choices?.[0]?.message?.content?.trim();
      text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
      finishReason = data?.choices?.[0]?.finish_reason;
      check = text ? parseAndValidate(text, batch.count, finishReason) : { sections: [], valid: false };
    } else {
      const errBody = await res.text().catch(() => "");
      return { sections: null, failReason: `重试时接口返回${res.status}：${errBody.slice(0, 200)}` };
    }
  }
  if (!check.valid) return { sections: null, failReason: `多次重试后仍不完整，最后一次收到${check.sections.length}段，预期${batch.count}段` };
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
      (u) => u.product_id === "romance-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  if (submission[cachedField] && !body.regenerate) {
    return NextResponse.json({ fullReport: submission[cachedField] });
  }

  const facts = submission.facts;
  const vector = computeLifeVector(facts as LifeVectorInput);
  const romance = calculateRomance(vector, {
    yearPillar: facts.yearPillar, monthPillar: facts.monthPillar,
    dayPillar: facts.dayPillar, hourPillar: facts.hourPillar,
  });

  const softenScore = (raw: number) => Math.round(25 + (raw / 100) * 75);
  const batches = buildBatches({
    score: romance.score, styleZh: STYLE_ZH[romance.style],
    hasTaoHua: romance.taoHua.hasTaoHua, taohuaFoundIn: romance.taoHua.foundIn,
    presence: softenScore(vector.socialDrive), expression: softenScore(vector.creativity),
    openness: softenScore(vector.adaptability), confidence: softenScore(vector.ambition),
    resonance: softenScore(vector.emotionalDepth),
  });

  const allSections: string[] = [];
  for (const batch of batches) {
    const result = await generateBatch(key, lang, batch, body.id);
    if (!result.sections) {
      console.error("[romance generate-full] 批次失败:", batch.titleZh, result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 502 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("romance_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport });
}
