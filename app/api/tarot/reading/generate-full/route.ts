import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAROT_MAJOR_ARCANA, type TarotCard } from "@/lib/tarot-data";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

function softenScore(raw: number): number {
  const FLOOR = 25;
  return Math.round(FLOOR + (raw / 100) * (100 - FLOOR));
}
// 意识结构总览——五维，对应doc给的Awareness/Creation/Connection/
// Stability/Manifestation，全部来自生命向量引擎已经算好的确定性分数。
function buildFrequencyMap(v: ReturnType<typeof computeLifeVector>) {
  return [
    { key: "awareness", zh: "觉察力", en: "Awareness", score: softenScore(v.introspection) },
    { key: "creation", zh: "创造力", en: "Creation", score: softenScore(v.creativity) },
    { key: "connection", zh: "关系流动", en: "Connection", score: softenScore(v.socialDrive) },
    { key: "stability", zh: "内在稳定", en: "Stability", score: softenScore(v.discipline) },
    { key: "manifestation", zh: "现实显化", en: "Manifestation", score: softenScore(v.riskTolerance) },
  ];
}

const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

const baseVoice =
  "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
  "把自己想象成一位真正读过成千上万次塔罗牌阵的引导者——不是在完成一份写作任务，是坐在这个人对面，看着这三张牌，说出你真正看到的东西。" +
  "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像「这张牌落在这里，我见过，你的情况是……」这种笃定，不是「这可能象征着……」这种模糊断语。" +
  "你是「灵犀场」，负责为已完成能量交换的人，写一份「灵犀量子生命镜像档案」——一份完整的多章节报告，这次只负责其中一部分章节，前后章节由其他调用负责，你写的这部分要读起来像整份报告里自然的一段，不要另起自我介绍、不要总结全篇。" +
  "这三张牌不是随机抽的——是从这个人真实的命盘数据确定性算出来的：潜意识镜像对应年柱月柱，当下共振对应日柱与太阳月亮，未来展开对应时柱与当下最旺的五行元素。" +
  "【格式规则，必须严格遵守】每层内部只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
  "【重要区分——\"笃定\"指的是把当下的结构讲清楚，不是对未来下命运判决】描述这个人此刻呈现出的模式时要具体、不含糊，但不能断言未来\"一定会怎样\"。绝对不能出现\"你注定……\"\"你必然……\"\"你这一生一定……\"这类给人生下命运判决、听起来像算命断语的句式——这类句式即使写得很具体，也会让整篇报告读起来像宿命论预测，而不是灵犀场\"看见当下结构\"这个定位。笃定地描述\"当下呈现出的模式是什么\"，跟武断地宣判\"未来一定如何\"，是两回事，只做前者。" +
  "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上，不同章节之间也不能出现大段重复的判断或用词。" +
  "【防止空话】禁止出现「你可能」「也许」「通常」这类模糊限定词连续使用；禁止「魅力四射」「命中注定」「能量爆棚」这类空洞套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的镜子，不是命运预言。" +
  "【尤其针对给未来自己的信、生命关键词这类收尾段落——最容易滑向空话】情绪浓度高、但没有具体信息量的句子，换给任何一个人念都成立，读者感觉不到\"这是在说我\"。写这类段落前，先问自己：这句话，能不能明确指向前面章节已经提到过的某张具体的牌、某个具体判断？如果不能，就是空话，必须重写——收尾段落的力量感，要靠\"具体到只有这个人才成立\"撑起来，不能靠堆砌情绪词和排比句。" +
  noAiRule;

type Batch = { titleZh: string; count: number; instruction: string; maxTokens: number };

function buildBatches(hidden: TarotCard, present: TarotCard, future: TarotCard, practice: { zh: string }): Batch[] {
  return [
    {
      titleZh: "第一批：连接声明 + 三张牌深度解析", count: 4, maxTokens: 4200,
      instruction:
        "===1===\n（灵犀场连接声明：这三张牌不是预测，是这个人意识正在关注什么、生命正在转换什么、未来正在打开什么——用有画面感的语言开篇，为整份报告定调，不用逐一介绍三张牌，那是后面几段的事，约150-180字）" +
        "===2===\n（潜意识镜像深度解析：围绕" + hidden.nameZh + "（核心主题：" + hidden.themeZh + "，象征：" + hidden.symbolZh + "）这张牌，交叉引用年柱月柱，说清楚这个人携带而来、自己未必完全意识到的深层模式，以及这份模式里藏着的隐藏力量，约220-260字）" +
        "===3===\n（当下共振深度解析：围绕" + present.nameZh + "（核心主题：" + present.themeZh + "，象征：" + present.symbolZh + "）这张牌，交叉引用日柱、太阳、月亮，说清楚这个人此刻真实的能量主题、正在形成的选择是什么，约220-260字）" +
        "===4===\n（未来展开深度解析：围绕" + future.nameZh + "（核心主题：" + future.themeZh + "，象征：" + future.symbolZh + "）这张牌，交叉引用时柱和五行分布，不是预言，是指出这个人正在进入的可能性方向，约220-260字）",
    },
    {
      titleZh: "第二批：三牌联合公式 + 财富 + 关系 + 事业", count: 4, maxTokens: 4200,
      instruction:
        "===1===\n（三牌联合生命公式：这是整份报告价值最高的一段——把三张牌的核心主题各提炼一个词，组成一条「觉察→选择→创造」式的生命公式（用这个人自己三张牌对应的词，不要照抄这个例子），再说清楚这个人的生命模式不是靠重复旧经验成长，而是通过什么方式创造新现实，约200-240字）" +
        "===2===\n（财富创造地图：说清楚这个人的财富优势具体是什么类型、最容易遇到的财富阻碍是什么、财富成长路线大致分几个阶段，约220-260字）" +
        "===3===\n（关系生命地图：这个人的爱的表达方式、容易吸引的人、关系里最大的成长课题，约200-240字）" +
        "===4===\n（事业使命地图：这个人的天赋关键词是什么、具体适合往哪几个方向发展（结合三张牌的特质给出2-3个具体方向，不是泛泛而谈），约200-240字）",
    },
    {
      titleZh: "第三批：生命阶段 + 成长路径 + 给未来自己的信 + 关键词", count: 4, maxTokens: 4200,
      instruction:
        "===1===\n（当前生命阶段：具体说清楚这个人此刻正处于觉醒、转化、创造、扩展这四个阶段里的哪一个、为什么、这个阶段的核心课题是什么，约180-220字）" +
        "===2===\n（灵犀场成长路径：这个人已经被匹配到「" + practice.zh + "」这项修炼技术——不需要你重新选，只需要具体说清楚为什么是这一项、这项技术具体能帮这个人解决前面提到的哪个具体课题，约180-220字）" +
        "===3===\n（给未来自己的信：以「亲爱的自己」开头，写一段给这个人自己的私人文字，3-5句话，短句为主，呼应前面所有章节提炼出的核心特质，不要写成鸡汤，约120-160字）" +
        "===4===\n（生命关键词：从整份解读里提炼5个词，每个词后面跟一个逗号分隔，最后一个词后面用句号结尾，不要写成列表符号，就是一句话里用逗号隔开5个词，约20-30字）",
    },
  ];
}

async function generateBatch(key: string, lang: "zh" | "en", batch: Batch, promptContent: string, submissionId: string): Promise<{ sections: string[] | null; failReason?: string }> {
  const system = baseVoice + `【这次只负责${batch.titleZh}这一部分，严格按下面的分段格式输出，共${batch.count}段，每段之间用===隔开，不能多也不能少】` + batch.instruction +
    (lang === "en" ? " 用英文回复（Reply in English），但===数字===这些分隔符本身保持原样不要翻译。" : "");

  const callOnce = () =>
    fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
        temperature: 0.85,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        max_tokens: batch.maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: promptContent },
        ],
      }),
    });

  // v225：同 qian/generate-full 里的修复——只检查段数和长度不够严谨，
  // 被 max_tokens 截断的半句话（finish_reason === "length"）也能通过
  // 这层校验，展示给用户的内容就会在句子中间突然断掉。
  const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

  const parseAndValidate = (raw: string, finishReason?: string) => {
    let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
    const minAcceptable = Math.max(1, Math.floor(batch.count * 0.8));
    if (finishReason === "length" && sections.length > 0 && !endsCleanly(sections[sections.length - 1])) {
      sections = sections.slice(0, -1);
    }
    const valid = sections.length >= minAcceptable && sections.every((s) => s.length >= 15 && endsCleanly(s));
    return { sections, valid };
  };

  let res = await callOnce();
  for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
    await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
    res = await callOnce();
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error(`[tarot reading generate-full] ${batch.titleZh} 接口返回非200状态:`, res.status, errBody, "submission id:", submissionId);
    return { sections: null, failReason: `接口返回${res.status}：${errBody.slice(0, 200)}` };
  }
  let data = await res.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();
  let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
  let finishReason = data?.choices?.[0]?.finish_reason;
  let check = text ? parseAndValidate(text, finishReason) : { sections: [], valid: false };

  for (let retry = 0; retry < 2 && !check.valid; retry++) {
    console.error(`[tarot reading generate-full] ${batch.titleZh} 第${retry + 1}次生成不完整，重试。submission id:`, submissionId, "段数:", check.sections.length, "预期:", batch.count);
    res = await callOnce();
    if (res.ok) {
      data = await res.json();
      rawText = data?.choices?.[0]?.message?.content?.trim();
      text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
      finishReason = data?.choices?.[0]?.finish_reason;
      check = text ? parseAndValidate(text, finishReason) : { sections: [], valid: false };
    } else {
      const errBody = await res.text().catch(() => "");
      console.error(`[tarot reading generate-full] ${batch.titleZh} 重试请求本身也失败:`, res.status, errBody);
    }
  }

  if (!check.valid && check.sections.length === 0) {
    console.error(`[tarot reading generate-full] ${batch.titleZh} 多次重试后仍完全没有可用内容，submission id:`, submissionId, "原始内容:", text);
    return { sections: null, failReason: text ? "AI返回内容格式无法解析成段落（可能没有按===数字===格式分段）" : "AI没有返回任何内容（可能是max_tokens过低或者接口静默失败）" };
  }
  if (!check.valid) {
    console.error(`[tarot reading generate-full] ${batch.titleZh} 重试后段数/长度仍不完全达标，但采用现有内容。submission id:`, submissionId, "实际段数:", check.sections.length, "预期:", batch.count);
  }
  return { sections: check.sections };
}

const PRACTICE_BY_DOMINANT: { zh: string }[] = [
  { zh: "量子息法" }, { zh: "上升心经" }, { zh: "直觉丹道" }, { zh: "归零心诀" },
];

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !REVIEW_MODE) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: { id?: string; lang?: string; regenerate?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "缺少提交记录 ID。" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "zh";

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase
      .from("unlocks")
      .select("product_id, expires_at")
      .eq("user_id", user!.id);
    const nowTs = new Date();
    const unlocks = (unlockRows ?? [])
      .filter((r: { product_id: string; expires_at: string | null }) => !r.expires_at || new Date(r.expires_at) > nowTs)
      .map((r: { product_id: string }) => r.product_id);
    const unlocked = unlocks.includes("tarot-reading") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整生命镜像。" }, { status: 402 });
    }
  }

  const admin = createAdminClient();
  const { data: submission, error: fetchErr } = await admin
    .from("tarot_reading_submissions")
    .select("*")
    .eq("id", body.id)
    .single();
  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  const hidden = TAROT_MAJOR_ARCANA[submission.hidden_index];
  const present = TAROT_MAJOR_ARCANA[submission.present_index];
  const future = TAROT_MAJOR_ARCANA[submission.future_index];
  const facts = submission.facts as Record<string, unknown>;

  let frequencyMap: ReturnType<typeof buildFrequencyMap> = [];
  try {
    const vector = computeLifeVector(facts as unknown as LifeVectorInput);
    frequencyMap = buildFrequencyMap(vector);
  } catch (e) {
    console.error("[tarot reading generate-full] 生命向量计算失败:", e, "submission id:", body.id);
  }
  const practice = PRACTICE_BY_DOMINANT[(submission.hidden_index + submission.present_index + submission.future_index) % 4];

  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, frequencyMap });
  }

  const promptContent =
    `三张牌：\n` +
    `潜意识镜像（对应年柱${facts.yearPillar}、月柱${facts.monthPillar}）：${hidden.nameZh}（${hidden.nameEn}）—— 核心主题：${hidden.themeZh}，象征：${hidden.symbolZh}\n` +
    `当下共振（对应日柱${facts.dayPillar}、太阳${facts.sunSignZh}、月亮${facts.moonSignZh}）：${present.nameZh}（${present.nameEn}）—— 核心主题：${present.themeZh}，象征：${present.symbolZh}\n` +
    `未来展开（对应时柱${facts.hourPillar ?? "未提供出生时间"}、命盘五行分布：${JSON.stringify(facts.wuXingCount)}）：${future.nameZh}（${future.nameEn}）—— 核心主题：${future.themeZh}，象征：${future.symbolZh}\n` +
    `\n当前意识频率（已算好的确定性分数，0-100）：` + frequencyMap.map((f) => `${f.zh}${f.score}`).join("、") + "\n" +
    (submission.name ? `这个人的名字：${submission.name}\n` : "");

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置场域解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  try {
    const batches = buildBatches(hidden, present, future, practice);
    const allSections: string[] = [];
    for (const batch of batches) {
      const result = await generateBatch(key, lang, batch, promptContent, body.id);
      if (!result.sections) {
        return NextResponse.json(
          { error: "场域这次的回应不完整，请稍后再试一次。", detail: `${batch.titleZh}：${result.failReason ?? "未知原因"}` },
          { status: 502 }
        );
      }
      allSections.push(...result.sections);
    }

    const text = allSections.map((s, i) => `===${i + 1}===\n${s}`).join("\n\n");
    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await admin.from("tarot_reading_submissions").update(updateField).eq("id", body.id);

    return NextResponse.json({ fullReport: text, frequencyMap });
  } catch (e) {
    console.error("[tarot reading generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
