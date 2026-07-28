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

const baseVoice =
  "【你是谁，在用什么姿态说话】你是「灵犀场」，负责为已完成能量交换的人，写一份「生命韧性档案」——一份围绕\"恢复力、扎根、再生\"这个主题的完整报告，不是「你抗压能力几分」这种打分测评。" +
  "下面给你的五项分数（压力恢复/变化适应/危机反弹/长期坚持/精神稳定），是从这个人真实的出生信息确定性算出来的固定数字，不是你现场评判的——你的任务是围绕这些已经算出的具体分数，写出这个人的韧性结构具体是什么样、为什么是这样。" +
  "语气：像一位真正见过很多人如何度过低谷的人在说话，判断要具体、要像\"我见过，你这种情况是……\"这种笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。" +
  "【绝对不能写成\"打分测评\"或\"心理测试报告\"】不要出现\"你的抗压能力是XX分，属于中等水平\"这种话——分数是拿来交叉引用、写出具体画面的原材料，不是拿来复述的结果。" +
  "【防止空话——这是最容易出问题的地方】情绪浓度高、但没有具体信息量的句子（比如\"你很坚强，你能挺过一切\"），换给任何一个人念都成立，必须避免。每一句判断，都要能明确指向前面给你的某个具体分数或数据点，不能只靠鼓励性的形容词堆出\"温暖\"的感觉。" +
  "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
  "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上，不同段落之间也不能出现大段重复的判断或用词。" +
  noAiRule;

type Batch = { titleZh: string; count: number; instruction: string; maxTokens: number };

function buildBatches(params: {
  score: number; breakdown: Record<string, number>; sunSignZh: string; dayMasterElement: string;
  strongest: string; weakest: string;
}): Batch[] {
  const { score, breakdown, sunSignZh, dayMasterElement, strongest, weakest } = params;
  const breakdownStr = Object.entries(breakdown).map(([k, v]) => `${DIM_ZH[k] ?? k}${v}分`).join("、");
  return [
    {
      titleZh: "第一批：生命韧性图谱总览 + 根系支撑系统", count: 2, maxTokens: 3200,
      instruction:
        "===1===\n（生命韧性图谱总览：这个人的太阳星座是" + sunSignZh + "，八字日主五行是" + dayMasterElement + "，五项韧性分数分别是" + breakdownStr + "，总分" + score + "。用「树」的意象——根系是过去积累的经验和习惯，树干是当下承受和转化的方式，树冠是韧性最终外显出来的样子——具体说清楚这个人的韧性结构长什么样，尤其要说清楚最高分「" + DIM_ZH[strongest] + "」和最低分「" + DIM_ZH[weakest] + "」之间，是怎样互相影响的，不是分开列出来，约220-260字）\n" +
        "===2===\n（根系支撑系统：逐一但简洁地说清楚这五项能力各自的具体样子——不是每项都展开讲透（那是后面的事），而是像看一张根系分布图一样，说清楚这五条根哪几条粗、哪几条细，彼此之间有没有互相支援，整体是均衡型还是有明显偏科，约220-260字）",
    },
    {
      titleZh: "第二批：再生循环能量环 + 韧性洞察", count: 2, maxTokens: 3600,
      instruction:
        "===1===\n（再生循环能量环：具体描述这个人经历「冲击→转化→恢复→成长→新生」这五个阶段时，自己的节奏是什么样的——哪个阶段对这个人来说走得最快、哪个阶段最容易卡住，尤其要点出「" + DIM_ZH[weakest] + "」这一项在这个循环的哪个环节上最容易拖慢整体节奏，约220-260字）\n" +
        "===2===\n（韧性洞察，分三段但连贯成一整段：隐藏力量——这个人自己可能都没完全意识到、但从数据看确实存在的一项能力；恢复模式——面对变化时这个人身体和情绪的自然反应顺序是什么；成长方向——具体给出一件这个人下次遇到冲击时可以做的、跟前面提到的具体分数或阶段相关的小动作，不要给泛泛的\"多休息\"\"要放松\"这种通用建议，约260-300字）",
    },
    {
      titleZh: "第三批：生命树印记（封印页）", count: 1, maxTokens: 1200,
      instruction:
        "===1===\n（生命树印记：作为整份报告的收尾——必须明确指向前面提到过的某个具体分数或阶段（比如呼应最高分那一项、或者呼应再生循环里走得最快的那个阶段），不能只靠\"你很坚强，生命会继续绽放\"这类换谁都成立的空话收尾，用比较有画面感、克制、不煽情的语言，约120-150字）",
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
    console.error(`[resilience generate-full] ${batch.titleZh} 接口返回非200:`, res.status, errBody, "submission id:", submissionId);
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
  const { data: submission } = await admin.from("resilience_submissions").select("*").eq("id", body.id).single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    const unlocked = (unlockRows ?? []).some(
      (u) => u.product_id === "resilience-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  if (submission[cachedField] && !body.regenerate) {
    return NextResponse.json({ fullReport: submission[cachedField] });
  }

  const facts = submission.facts;
  const vector = computeLifeVector(facts as LifeVectorInput);
  const resilience = calculateResilience(vector);
  const breakdown = resilience.breakdown as Record<string, number>;
  const entries = Object.entries(breakdown);
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

  const batches = buildBatches({
    score: resilience.score, breakdown, sunSignZh: facts.sunSignZh, dayMasterElement: facts.dayMasterElement,
    strongest, weakest,
  });

  const allSections: string[] = [];
  for (const batch of batches) {
    const result = await generateBatch(key, lang, batch, body.id);
    if (!result.sections) {
      console.error("[resilience generate-full] 批次失败:", batch.titleZh, result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 502 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("resilience_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport });
}
