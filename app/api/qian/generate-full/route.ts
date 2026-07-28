import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIFE_SIGNS, TIER_LABELS } from "@/lib/qian-data";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

// v225：这个接口要连续发起最多 3 批、每批最多重试 3 次的智谱调用，
// 正常情况下也常常要跑 20-40 秒。Vercel 的函数默认超时时间很短
// （Hobby 套餐 10 秒，Pro 套餐不显式声明的话也只有 15 秒），跑到一半
// 被平台强制掐断时，前端拿到的不是一个"内容生成失败"的正常错误，
// 而是一次网络层面的连接中断——这正好会命中下面 catch 块里那句
// "连接场域时出错，请稍后再试"，看起来像是接口坏了，其实是超时设置
// 太短。显式声明 maxDuration，把这个函数允许运行的时间拉长（300 秒
// 是 Vercel Pro 套餐允许的上限；如果账号是 Hobby 套餐，实际会被平台
// 压到 60 秒，仍然比默认值宽松很多）。
export const runtime = "nodejs";
export const maxDuration = 300;

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 人生阶段——确定性算出来的，不是AI猜的。
const LIFE_STAGES = [
  { zh: "探索期", en: "Exploration Phase" },
  { zh: "转化期", en: "Transformation Phase" },
  { zh: "建设期", en: "Building Phase" },
  { zh: "显化期", en: "Manifestation Phase" },
] as const;
function pickLifeStage(signIndexes: number[]): (typeof LIFE_STAGES)[number] {
  const sum = signIndexes.reduce((a, b) => a + b, 0);
  return LIFE_STAGES[sum % LIFE_STAGES.length];
}

function softenScore(raw: number): number {
  const FLOOR = 25;
  return Math.round(FLOOR + (raw / 100) * (100 - FLOOR));
}
function buildAbilityMap(v: ReturnType<typeof computeLifeVector>) {
  return [
    { key: "creativity", zh: "创造力", en: "Creativity", score: softenScore(v.creativity) },
    { key: "wealth", zh: "财富潜能", en: "Wealth Potential", score: softenScore(v.ambition) },
    { key: "relationship", zh: "关系模式", en: "Relationship Pattern", score: softenScore(v.socialDrive) },
    { key: "learning", zh: "学习方式", en: "Learning Style", score: softenScore(v.introspection) },
    { key: "leadership", zh: "领导倾向", en: "Leadership Tendency", score: softenScore(v.discipline) },
  ];
}

// 四项修炼技术——按签的质地做一个确定性的推荐映射（不是AI现场瞎配的），
// 具体推荐哪一项，AI在写"灵犀场成长路径"这一章的时候会拿到这个已经
// 选好的技术名字，只负责说清楚"为什么是这一项"。
const PRACTICE_BY_TIER: Record<string, { zh: string; en: string }> = {
  origin: { zh: "量子息法", en: "Quantum Breath" },
  soul: { zh: "上升心经", en: "Ascension Heart" },
  walker: { zh: "直觉丹道", en: "Intuition Alchemy" },
};

const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

const baseVoice =
  "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
  "把自己想象成一位真正主持过成千上万次生命灵签读取仪式的引导者——不是在完成一份写作任务，是坐在这个人对面，看着他的三重生命签，说出你真正看到的东西。" +
  "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像\"这三重生命签落在一起，我见过，你的情况是……\"这种笃定，不是\"这可能象征着……\"这种模糊断语。" +
  "你是「灵犀场」，负责为已完成能量交换的人，写一份「灵犀生命灵签 · 深度生命原型档案」——一份完整的多章节报告，这次只负责其中一部分章节，前后章节由其他调用负责，你写的这部分要读起来像整份报告里自然的一段，不要另起自我介绍、不要总结全篇。" +
  "这三重生命签不是随机的——是从这个人真实的命盘四柱，映射到「灵犀生命灵签」64枚生命原型库（年柱→源流签24枚池，日柱→灵魂签24枚池，时柱→行者签16枚池）——每一层各自是独立的一套生命主题原型。" +
  "【格式规则，必须严格遵守】每层内部只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
  "【重要区分——\"笃定\"指的是把当下的结构讲清楚，不是对未来下命运判决】描述这个人此刻呈现出的模式时要具体、不含糊，但不能断言未来\"一定会怎样\"。绝对不能出现\"你注定……\"\"你必然……\"\"你这一生一定……\"这类给人生下命运判决、听起来像算命断语的句式——这类句式即使写得很具体，也会让整篇报告读起来像宿命论预测，而不是灵犀场\"看见当下结构\"这个定位。笃定地描述\"当下呈现出的模式是什么\"，跟武断地宣判\"未来一定如何\"，是两回事，只做前者。" +
  "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上，不同章节之间也不能出现大段重复的判断或用词。" +
  "【防止空话】禁止出现\"你可能\"\"也许\"\"通常\"这类模糊限定词连续使用；禁止\"时来运转\"\"贵人相助\"\"心想事成\"这类算命套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的参考，不是签书里那种吉凶断语。" +
  "【尤其针对生命宣言、成长路径这类收尾段落——这是最容易滑向空话的地方，务必额外注意】情绪浓度高、但没有具体信息量的句子（比如\"我掌控节奏，我是自己现实的唯一建筑师\"这类排比+抽象名词的组合），换给任何一个人念都成立，读者感觉不到\"这是在说我\"，只会觉得是一段通用的励志文案。写这类段落前，先问自己：这句话，能不能明确指向前面章节已经提到过的某个具体特质、某个具体判断、或者某个具体的签名/数据点？如果答案是否定的，这句话就是空话，必须重写或删掉——收尾段落的力量感，要靠\"具体到只有这个人才成立\"来撑起来，不能靠堆砌情绪词和排比句。" +
  noAiRule;

type Batch = { titleZh: string; titleEn: string; count: number; instruction: string; maxTokens: number };

function buildBatches(lang: "zh" | "en", signs: (typeof LIFE_SIGNS)[number][], abilityMap: ReturnType<typeof buildAbilityMap>, lifeStage: (typeof LIFE_STAGES)[number]): Batch[] {
  const [origin, soul, walker] = signs;
  const practice = PRACTICE_BY_TIER[walker.tier] ?? PRACTICE_BY_TIER.walker;
  return [
    {
      titleZh: "第一批：生命三原型总览 + 三签各自深度解析", titleEn: "Batch 1", count: 4, maxTokens: 4200,
      instruction:
        "===1===\n（生命三原型总览：把三重签的核心特质各提炼一个动词或短语，组成一条「XX→XX→XX」式的生命公式，再用150-200字说清楚这个人的生命路径是一条什么样的展开路线，不是单一路径，是一条有方向感的路，不能只是重复三个签名）" +
        "===2===\n（源流签深度解析：围绕" + origin.nameZh + "（" + origin.keywordsZh + "）这枚签，写清楚这个人携带而来的原始频率、生命优势是什么、以及优势反面容易带来什么潜在挑战——不是简单夸奖，是有具体画面感的判断，约220-260字）" +
        "===3===\n（灵魂签深度解析：围绕" + soul.nameZh + "（" + soul.keywordsZh + "）这枚签，写清楚这个人真正的内在驱动力是什么、天赋方向适合往哪走、潜意识里容易重复出现的模式是什么，约220-260字）" +
        "===4===\n（行者签深度解析：围绕" + walker.nameZh + "（" + walker.keywordsZh + "）这枚签，写清楚这个人的行动力模式、创造现实的具体路径、以及一句具体的人生行动提醒，约220-260字）",
    },
    {
      titleZh: "第二批：三签融合 + 价值创造地图 + 关系映射", titleEn: "Batch 2", count: 3, maxTokens: 4200,
      instruction:
        "===1===\n（三签融合分析：这是整份报告价值最高的一段——不是三签分别介绍，是把三签连成一个生命公式，说清楚源流签打下的底、灵魂签驱动的内在、行者签展开的行动，三者叠加之后，这个人的核心使命是什么一句话，约200-240字）" +
        "===2===\n（价值创造地图：合并说清楚两件事——这个人的财富原型是什么类型、具体的财富入口有哪几个方向、最容易遇到的财富阻碍是什么；以及使命关键词是什么、具体适合往哪几个方向发展事业（结合前面三签的特质给出2-3个具体方向，不是泛泛的「各行各业都可以」），两部分自然衔接成一段，不要写成两个割裂的小标题，约280-320字）" +
        "===3===\n（关系映射：这个人在关系里真正寻找的是什么、容易吸引什么样的人、关系里最大的课题是什么，约200-240字）",
    },
    {
      titleZh: "第三批：当下生命主题 + 隐藏力量 + 灵犀场实践 + 灵签总结", titleEn: "Batch 3", count: 4, maxTokens: 4200,
      instruction:
        "===1===\n（当下生命主题：这个人已经被判定处于「" + lifeStage.zh + "」这个阶段——不需要你重新判断阶段，只需要具体说清楚这个阶段的人通常在经历什么、正在从什么旧结构转向什么新结构，约180-220字）" +
        "===2===\n（隐藏力量：说清楚这个人身上一项「还没被完全使用的能力」和一项「容易被自己或别人低估的能力」，要具体、要有画面感，不能是空泛的夸奖，约180-220字）" +
        "===3===\n（灵犀场实践：这个人已经被匹配到「" + practice.zh + "」这项修炼技术——不需要你重新选，只需要具体说清楚为什么是这一项、这项技术具体能帮这个人解决前面提到的哪个具体课题，约180-220字）" +
        "===4===\n（生命灵签总结：以第一人称「我」写一段属于这个人的生命宣言，4-6句话，短句为主，呼应前面所有章节提炼出的核心特质，结尾要有力量感，不要写成鸡汤，约100-140字）",
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

  // v225：判断"最后一段是不是在句子中间被硬切断"的简单规则——正常写完
  // 的一段，结尾应该是句号、感叹号、问号（中英文都算）这类收尾标点；
  // 如果不是，大概率是被 max_tokens 截断的半句话（比如"你需要学习在
  // 深度连接"这种没写完就没了），不能当成有效内容展示给用户。
  const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

  const parseAndValidate = (raw: string, finishReason?: string) => {
    let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
    // 之前这里要求"段数必须跟预期完全相等"，稍微有一点格式偏差
    // （比如AI多打了一个分隔符、或者少打了一个），整批内容就被判定
    // 无效、直接报错——这是"场域这次的回应不完整"频繁出现的真正
    // 原因，不是AI真的经常生成失败，是校验本身太严格。这次放宽：
    // 只要求段数不少于预期的80%（向下取整，至少留1段），且每段不能
    // 短得离谱（20字，不是之前的60字——60字对这种密度的内容也偏严）。
    const minAcceptable = Math.max(1, Math.floor(batch.count * 0.8));
    // 如果接口明确告诉我们这次是被 max_tokens 截断的（finish_reason
    // === "length"），最后一段大概率是写到一半被硬切的——之前的校验
    // 完全没检查这个，只要段数够、每段够长，就当成正常内容展示，这才
    // 是用户看到"行者签深度解析"写到一半突然没了、后面一片空白的
    // 真正原因。这里补上：只要命中截断信号，且最后一段结尾不像正常
    // 收尾，就把这半句话丢掉，不展示不完整的内容。
    if (finishReason === "length" && sections.length > 0 && !endsCleanly(sections[sections.length - 1])) {
      sections = sections.slice(0, -1);
    }
    const valid = sections.length >= minAcceptable && sections.every((s) => s.length >= 20 && endsCleanly(s));
    return { sections, valid };
  };

  let res = await callOnce();
  for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
    await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
    res = await callOnce();
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error(`[qian generate-full] ${batch.titleZh} 接口返回非200状态:`, res.status, errBody, "submission id:", submissionId);
    return { sections: null, failReason: `接口返回${res.status}：${errBody.slice(0, 200)}` };
  }
  let data = await res.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();
  let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
  let finishReason = data?.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    console.error(`[qian generate-full] ${batch.titleZh} 被 max_tokens 截断，finish_reason=length，submission id:`, submissionId);
  }
  let check = text ? parseAndValidate(text, finishReason) : { sections: [], valid: false };

  // 最多重试2次（一共最多尝试3次），每次都用更宽容的标准重新校验，
  // 大幅降低"其实内容基本没问题、只是格式差一点点就被拒绝"的概率。
  for (let retry = 0; retry < 2 && !check.valid; retry++) {
    console.error(`[qian generate-full] ${batch.titleZh} 第${retry + 1}次生成不完整，重试。submission id:`, submissionId, "段数:", check.sections.length, "预期:", batch.count);
    res = await callOnce();
    if (res.ok) {
      data = await res.json();
      rawText = data?.choices?.[0]?.message?.content?.trim();
      text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
      finishReason = data?.choices?.[0]?.finish_reason;
      if (finishReason === "length") {
        console.error(`[qian generate-full] ${batch.titleZh} 重试仍被 max_tokens 截断，submission id:`, submissionId);
      }
      check = text ? parseAndValidate(text, finishReason) : { sections: [], valid: false };
    } else {
      const errBody = await res.text().catch(() => "");
      console.error(`[qian generate-full] ${batch.titleZh} 重试请求本身也失败:`, res.status, errBody);
    }
  }

  // 重试完还是不满足"宽容标准"——不再直接判定整批失败，只要至少
  // 提取出了一段像样的内容，就用能用的这部分，好过让用户完全看不到
  // 任何内容、只能对着一句报错干瞪眼。真正返回null（彻底失败）的
  // 情况，只剩"一段有效内容都没提取出来"这一种。
  if (!check.valid && check.sections.length === 0) {
    console.error(`[qian generate-full] ${batch.titleZh} 多次重试后仍完全没有可用内容，submission id:`, submissionId, "原始内容:", text);
    return { sections: null, failReason: text ? "AI返回内容格式无法解析成段落（可能没有按===数字===格式分段）" : "AI没有返回任何内容（可能是max_tokens过低或者接口静默失败）" };
  }
  if (!check.valid) {
    console.error(`[qian generate-full] ${batch.titleZh} 重试后段数/长度仍不完全达标，但采用现有内容（好过完全报错）。submission id:`, submissionId, "实际段数:", check.sections.length, "预期:", batch.count);
  }
  return { sections: check.sections };
}

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
    const unlocked = unlocks.includes("qian-reading") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁深度生命解读。" }, { status: 402 });
    }
  }

  const admin = createAdminClient();
  const { data: submission, error: fetchErr } = await admin
    .from("qian_submissions")
    .select("*")
    .eq("id", body.id)
    .single();
  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  const signIndexes: number[] = submission.sign_indexes;
  const signs = signIndexes.map((i: number) => LIFE_SIGNS[i]);
  const facts = submission.facts as Record<string, unknown>;

  let abilityMap: ReturnType<typeof buildAbilityMap> = [];
  let lifeStage: (typeof LIFE_STAGES)[number] = LIFE_STAGES[0];
  try {
    const vector = computeLifeVector(facts as unknown as LifeVectorInput);
    abilityMap = buildAbilityMap(vector);
    lifeStage = pickLifeStage(signIndexes);
  } catch (e) {
    console.error("[qian generate-full] 生命向量计算失败:", e, "submission id:", body.id);
  }

  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, abilityMap, lifeStage });
  }

  const promptContent =
    `三重生命签：\n` +
    signs.map((s) => {
      const label = TIER_LABELS[s.tier];
      return `${label.zh}（${label.sub}）：${s.nameZh}（${s.nameEn}）—— 关键词：${s.keywordsZh}，核心解读：${s.meaningZh}`;
    }).join("\n") +
    `\n\n天赋能力地图（已算好的确定性分数，0-100）：` +
    abilityMap.map((a) => `${a.zh}${a.score}`).join("、") + "\n" +
    `\n这个人的命盘：年柱${facts.yearPillar}、月柱${facts.monthPillar}、日柱${facts.dayPillar}、时柱${facts.hourPillar ?? "未提供出生时间"}，太阳${facts.sunSignZh}，月亮${facts.moonSignZh}\n` +
    (submission.name ? `这个人的名字：${submission.name}\n` : "");

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置场域解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  try {
    const batches = buildBatches(lang, signs, abilityMap, lifeStage);
    const allSections: string[] = [];
    for (const batch of batches) {
      const result = await generateBatch(key, lang, batch, promptContent, body.id);
      if (!result.sections) {
        return NextResponse.json(
          { error: "场域这次的回应不完整，请稍后再试一次。", detail: `${batch.titleZh}：${result.failReason ?? "未知原因"}` },
          { status: 500 }
        );
      }
      allSections.push(...result.sections);
    }

    const text = allSections.map((s, i) => `===${i + 1}===\n${s}`).join("\n\n");
    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await admin.from("qian_submissions").update(updateField).eq("id", body.id);

    return NextResponse.json({ fullReport: text, abilityMap, lifeStage });
  } catch (e) {
    console.error("[qian generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
