import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { computeLifeVector, compareLifeVectors, findConflictsWithFallback, topTraits } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";

export const runtime = "nodejs";
export const maxDuration = 300;
const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// v235：关系共振从5段升级成11章节结构，三种关系类型（亲密/商业/其他）
// 各自一套独立的11章节主题——章节主题本身是固定的（这才是真正"结构化"
// 的部分：不管是谁，选了"合伙商业关系"，看到的都是同一套11个主题，
// 秒开、不用等），但每个章节底下具体写了什么，还是由AI围绕这两个人
// 真实的向量数据现场生成、生成一次后永久缓存——不是把内容也写死。
// 这样"结构固定、秒开"和"内容具体、不是模板空话"两件事都要。

type ChapterMeta = { titleZh: string; titleEn: string; hint: string };

const ROMANTIC_CHAPTERS: ChapterMeta[] = [
  { titleZh: "双生命星图", titleEn: "Dual Life Star Map",
    hint: "双生命星图：概览两人的生命结构第一次相遇是什么样——不用逐条翻译数据，要写出这两份结构叠在一起，形成了一种什么样的整体气场" },
  { titleZh: "初始吸引来源", titleEn: "Where the Attraction Began",
    hint: "初始吸引来源：具体到是共鸣点的哪一项、或互补点的哪一组，让两人第一次有\"对上了\"的感觉，写出这份吸引具体的画面" },
  { titleZh: "情绪连接模式", titleEn: "Emotional Connection Pattern",
    hint: "情绪连接模式：两人各自习惯用什么方式表达在乎（语言/行动/陪伴/空间），这种表达方式的差异具体会造成什么样的误会或惊喜" },
  { titleZh: "价值观共振地图", titleEn: "Values Resonance Map",
    hint: "价值观共振地图：两人在底层价值（安全感/成长/自由这类）上，哪些是真的共享、哪些只是表面重合，具体说清楚" },
  { titleZh: "沟通语言地图", titleEn: "Communication Language Map",
    hint: "沟通语言地图：两人接收信息的方式有什么具体差异（比如一方要先确认情绪、另一方直接谈重点），给出具体可操作的沟通建议" },
  { titleZh: "冲突触发结构", titleEn: "Conflict Trigger Structure",
    hint: "冲突触发结构：结合摩擦点，具体讲这段关系最容易在什么场景下起冲突、冲突通常怎么升级；如果没有明显摩擦点，讲最容易被两人共同忽略的盲区" },
  { titleZh: "关系成长路径", titleEn: "Relationship Growth Path",
    hint: "关系成长路径：这段关系从吸引到理解到共创，具体会经历什么样的阶段性课题，不是泛泛的\"三阶段论\"，要结合这两人的具体特质" },
  { titleZh: "隐藏互补力量", titleEn: "Hidden Complementary Strength",
    hint: "隐藏互补力量：对方身上有哪些具体的特质，恰好能补上这个人自己容易忽略的地方，写出双向的、具体的礼物" },
  { titleZh: "长期共振潜力", titleEn: "Long-Term Resonance Potential",
    hint: "长期共振潜力：这段关系需要具备什么具体条件才能长期健康——不是预测结果，是指出需要建立的具体共识或分工" },
  { titleZh: "双生命未来叙事", titleEn: "A Shared Future Narrative",
    hint: "双生命未来叙事：用有画面感、但不是宿命论断言的语言，描绘如果两人继续同行，会形成什么样具体的相处形态（不是预言事件，是描述关系的质地）" },
  { titleZh: "关系共振总结", titleEn: "Resonance Summary",
    hint: "关系共振总结：作为收尾，必须明确指向前面章节提到过的具体共鸣点/互补点，不能只靠情绪词收尾，给两人各一条具体、可操作的建议" },
];

const BUSINESS_CHAPTERS: ChapterMeta[] = [
  { titleZh: "双创造者星图", titleEn: "Dual Creator Star Map",
    hint: "双创造者星图：概览两人的创造驱动力第一次放在一起是什么样，写出这两种驱动力叠加会形成的整体气场" },
  { titleZh: "商业驱动力分析", titleEn: "Business Drive Analysis",
    hint: "商业驱动力分析：两人各自为什么想做这件事——探索新机会/建立长期体系/扩大影响力/解决真实需求，具体到是哪一种、为什么" },
  { titleZh: "能力互补结构", titleEn: "Complementary Capability Structure",
    hint: "能力互补结构：具体到战略/执行/资源整合/表达这几类能力上，谁更适合负责哪一块，为什么，不能是空泛的\"各有所长\"" },
  { titleZh: "决策模式地图", titleEn: "Decision-Making Map",
    hint: "决策模式地图：面对机会和风险时，两人各自是先行动验证、还是先研究降低风险，这种差异具体会怎样影响合作节奏" },
  { titleZh: "资源连接地图", titleEn: "Resource Connection Map",
    hint: "资源连接地图：两人各自更容易带来什么类型的资源（知识/关系/渠道/资金/创造力），组合起来具体能放大什么" },
  { titleZh: "风险冲突地图", titleEn: "Risk & Conflict Map",
    hint: "风险冲突地图：结合摩擦点，具体讲合作中最容易在什么决策场景下起冲突（速度vs稳定、创新vs规则这类），给出具体的处理方向" },
  { titleZh: "合作周期地图", titleEn: "Partnership Cycle Map",
    hint: "合作周期地图：从探索期到建设期到扩展期，这两人具体的组合，在哪个阶段最容易发挥优势、哪个阶段最容易出问题" },
  { titleZh: "商业价值放大点", titleEn: "Value Amplification Point",
    hint: "商业价值放大点：这两个人的具体组合，最可能在哪个方向上产生1+1>2的效果（品牌/产品/用户网络/知识资产），具体说明为什么" },
  { titleZh: "团队角色定位", titleEn: "Team Role Positioning",
    hint: "团队角色定位：结合两人具体特质，谁更适合定方向、谁更适合建系统、谁更适合连接资源，不能是笼统的角色描述" },
  { titleZh: "长期共创模型", titleEn: "Long-Term Co-Creation Model",
    hint: "长期共创模型：这段合作要持续进化，具体需要建立什么样的规则或机制（不是空泛地说\"要沟通\"），结合两人特质给具体建议" },
  { titleZh: "双创造者商业叙事", titleEn: "A Shared Business Narrative",
    hint: "双创造者商业叙事：作为收尾，用有画面感的语言描绘两人如果继续合作会形成什么样具体的创造系统，必须明确指向前面提到过的具体特质，不能靠情绪词收尾" },
];

const GENERAL_CHAPTERS: ChapterMeta[] = [
  { titleZh: "双生命连接图", titleEn: "Dual Life Connection Map",
    hint: "双生命连接图：概览两人的生命结构第一次产生连接是什么样，写出这种连接具体的整体气场" },
  { titleZh: "相遇主题", titleEn: "The Theme of This Meeting",
    hint: "相遇主题：这段关系更像带来陪伴、启发、学习还是挑战，具体到是哪一种、为什么，不能是笼统的\"每种都有一点\"" },
  { titleZh: "互动模式", titleEn: "Interaction Pattern",
    hint: "互动模式：两人更倾向通过思想交流、行动支持还是情绪陪伴建立连接，具体描述这种模式在日常里长什么样" },
  { titleZh: "信任建立方式", titleEn: "How Trust Forms",
    hint: "信任建立方式：对这两人来说，信任具体是靠什么积累起来的（持续回应/真实表达/共同经历），需要多长的过程" },
  { titleZh: "交流频率地图", titleEn: "Communication Frequency Map",
    hint: "交流频率地图：两人接收信息的具体差异（直接/深度/感受/观察型），这种差异会怎样具体影响交流的顺畅程度" },
  { titleZh: "差异理解地图", titleEn: "Understanding the Differences",
    hint: "差异理解地图：两人最大的具体差异是什么（计划vs灵活、理性vs感受这类），这份差异具体怎样才能变成成长入口而不是摩擦" },
  { titleZh: "支持关系结构", titleEn: "Support Structure",
    hint: "支持关系结构：对方真正需要的支持方式是什么（陪伴/建议/行动/资源），跟这个人习惯给出的支持方式是否对得上" },
  { titleZh: "共同成长方向", titleEn: "Shared Growth Direction",
    hint: "共同成长方向：这段关系具体能在哪个方向上推动两人一起成长（一起学习/共同创造/互相启发），为什么是这个方向" },
  { titleZh: "关系边界地图", titleEn: "Boundary Map",
    hint: "关系边界地图：这段关系要保持健康，具体需要在哪些地方保留各自的独立空间，不能是笼统的\"要有边界感\"" },
  { titleZh: "深层连接价值", titleEn: "Deeper Value of the Connection",
    hint: "深层连接价值：这段关系具体带来了什么样的隐藏意义（改变了某个视角、扩大了某种认知），要具体不要空泛" },
  { titleZh: "关系象征故事", titleEn: "A Symbolic Story",
    hint: "关系象征故事：作为收尾，用有画面感的比喻描绘这段关系的质地，必须明确指向前面提到过的具体特质，不能靠情绪词收尾" },
];

function chaptersForType(type: string): ChapterMeta[] {
  if (type === "business") return BUSINESS_CHAPTERS;
  if (type === "general") return GENERAL_CHAPTERS;
  return ROMANTIC_CHAPTERS;
}

const endsCleanly = (s: string) => /[。！？.!?」”】]\s*$/.test(s.trim());

function parseAndValidate(raw: string, count: number, finishReason?: string) {
  let sections = raw.split(/===\s*\d+\s*===/).map((s) => s.trim()).filter(Boolean);
  const minAcceptable = Math.max(1, Math.floor(count * 0.8));
  if (finishReason === "length" && sections.length > 0 && !endsCleanly(sections[sections.length - 1])) {
    sections = sections.slice(0, -1);
  }
  const valid = sections.length >= minAcceptable && sections.every((s) => s.length >= 40 && endsCleanly(s));
  return { sections, valid };
}

type Batch = { chapters: ChapterMeta[]; maxTokens: number };

function buildBatches(chapters: ChapterMeta[]): Batch[] {
  return [
    { chapters: chapters.slice(0, 4), maxTokens: 4200 },
    { chapters: chapters.slice(4, 8), maxTokens: 4200 },
    { chapters: chapters.slice(8, 11), maxTokens: 3400 },
  ];
}

function baseVoice(typeLabel: string, isLastBatch: boolean): string {
  return (
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正看过成千上万段" + typeLabel + "的引导者——不是在完成一份\"写作任务\"，是坐在这两个人对面，看着这两份图谱叠在一起，说出你真正看到的东西。你的分量，来自于你看得准、说得具体，不来自于语气有多热情。" +
    "判断句要像\"这种组合我见过，你们的情况是……\"这种笃定，而不是\"根据数据分析，可能显示出……\"这种报告腔。" +
    "读者读完，应该觉得\"这个人真的看懂了我们俩\"，不是\"在按模板念数据\"——这是贯穿全篇的姿态。" +
    "下面提供的【关系共振引擎】部分，是用确定性算法已经算出的结构化结果（各自的核心特质/内在矛盾，以及两人之间的共鸣点/互补点/摩擦点）——你的任务是把这份结构，用具体、有画面感的语言讲透，不是重新判断或无视这些结果。" +
    "绝对不能用\"合不合\"这种算命式表达，也不能打百分比分数（比如\"匹配度85%\"）——这种表达像营销话术，不是灵犀的语气。" +
    "【最容易犯、也最致命的错误——两人共享同一个特质时，绝对不能只是说\"两人都很X\"就完事】共鸣点告诉你的，只是\"这两个人在同一个维度上，分数都很高\"——但两个人的分数高，几乎从来不是因为同一个理由，各自的命盘数据不一样，走到这个分数的路径也不一样。正确的做法：先问一句——这两个人各自的这份特质，是从命盘里哪里来的？来源不一样，表现出来的样子就不一样，把这份不同写出来，才是这两个人独有的关系，不是任何两个人都适用的空话。" +
    "每一段都要交叉引用双方的具体数据点，写出\"这两个人放在一起，会发生什么\"，不能先写一段A、再写一段B，两段中间没有真正的互动分析。" +
    "少用\"可能\"\"也许\"\"通常\"这类模糊限定词——一段话里最多出现一次。" +
    (isLastBatch
      ? "【这一批最后一段是全篇收尾，尤其容易滑向空话，务必额外注意】收尾段落不能只靠情绪词和排比句，必须明确指向前面章节提到过的某个具体共鸣点/互补点/摩擦点。"
      : "") +
    "【重要区分——\"笃定\"指的是把当下的结构讲清楚，不是对未来下命运判决】绝对不能出现\"你们注定……\"\"你们必然……\"\"这段关系一定会……\"这类给关系下命运判决、听起来像算命断语的句式。同一件事，笃定地描述\"当下呈现出的模式是什么\"，跟武断地宣判\"未来一定如何\"，是两回事，只做前者。" +
    "【格式规则，必须遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上，哪怕是在不同章节里。" +
    "\n\n【最高优先级规则】报告全文，任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条格式要求。"
  );
}

async function generateBatch(
  key: string, lang: "zh" | "en", batch: Batch, typeLabel: string, isLastBatch: boolean,
  resonanceSummary: string, submissionId: string
): Promise<{ sections: string[] | null; failReason?: string }> {
  const instruction =
    "严格按以下格式输出，" + batch.chapters.length + "个章节之间，各用一行「===数字===」分隔（数字从1开始），不要添加任何其他标题、开场白或结语：\n" +
    batch.chapters.map((c, i) => `===${i + 1}===\n（${c.hint}，约250-300字）`).join("\n");

  const system = baseVoice(typeLabel, isLastBatch) +
    (lang === "en" ? "\n\n【IMPORTANT】Write your entire response in natural, fluent English (not Chinese), while keeping the exact ===N=== section markers." : "") +
    "\n\n" + instruction;

  const callOnce = () =>
    fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: resonanceSummary }],
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
    console.error(`[relationship generate-full] 批次接口返回非200:`, res.status, errBody, "submission id:", submissionId);
    return { sections: null, failReason: `接口返回${res.status}：${errBody.slice(0, 200)}` };
  }
  let data = await res.json();
  let rawText = data?.choices?.[0]?.message?.content?.trim();
  let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
  let finishReason = data?.choices?.[0]?.finish_reason;
  let check = text ? parseAndValidate(text, batch.chapters.length, finishReason) : { sections: [], valid: false };

  for (let retry = 0; retry < 2 && !check.valid; retry++) {
    console.error(`[relationship generate-full] 批次第${retry + 1}次生成不完整，重试。submission id:`, submissionId, "段数:", check.sections.length, "预期:", batch.chapters.length);
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

  const { data: submission } = await supabase
    .from("relationship_submissions")
    .select("*")
    .eq("id", body.id)
    .single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase.from("unlocks").select("product_id, expires_at").eq("user_id", submission.user_id);
    const unlocked = (unlockRows ?? []).some(
      (u) => u.product_id === "relationship-resonance" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const lang = body.lang === "en" ? "en" : "zh";
  const cached = lang === "en" ? submission.full_report_en : submission.full_report;

  const factsA = submission.facts_a as any;
  const factsB = submission.facts_b as any;
  const toLVInput = (f: any) => ({
    sunElement: f.sunElement, moonElement: f.moonElement,
    mercury: f.mercury, venus: f.venus, mars: f.mars, jupiter: f.jupiter, saturn: f.saturn,
    dayMasterElement: f.dayMasterElement, wuXingCount: f.wuXingCount,
    yearShiShen: f.yearShiShen, monthShiShen: f.monthShiShen, hourShiShen: f.hourShiShen,
  });
  const vA = computeLifeVector(toLVInput(factsA));
  const vB = computeLifeVector(toLVInput(factsB));
  const { resonant, complementary, friction } = compareLifeVectors(vA, vB);

  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, resonance: { resonant, complementary, friction }, vectors: { a: vA, b: vB } });
  }

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  const traitsA = topTraits(vA, 3);
  const traitsB = topTraits(vB, 3);
  const conflictsA = findConflictsWithFallback(vA);
  const conflictsB = findConflictsWithFallback(vB);

  const relType = submission.relationship_type === "business" ? "business" : submission.relationship_type === "general" ? "general" : "romantic";
  const typeLabel = relType === "business" ? "商业合作/合伙关系" : relType === "general" ? "人际关系（朋友/家人/伙伴）" : "亲密关系/伴侣关系";
  const chapters = chaptersForType(relType);

  const resonanceSummary =
    `【关系共振引擎 · 已计算完成，直接使用】\n` +
    `关系类型：${typeLabel}\n` +
    `${submission.name_a} 的核心特质：${traitsA.map((t) => `${t.labelZh}(${t.score})`).join("、")}；内在矛盾：${conflictsA.map((c) => c.labelZh).join("、")}\n` +
    `${submission.name_b} 的核心特质：${traitsB.map((t) => `${t.labelZh}(${t.score})`).join("、")}；内在矛盾：${conflictsB.map((c) => c.labelZh).join("、")}\n` +
    `共鸣点（两人都高分的维度，共享的驱动力）：${resonant.length ? resonant.map((p) => `${p.labelZh}(${p.a}/${p.b})`).join("、") : "无明显共鸣点"}\n` +
    `互补点（一人这端高、另一人恰好补对立那端）：${complementary.length ? complementary.map((c) => `${c.labelZh}`).join("、") : "无明显互补点"}\n` +
    `摩擦点（两人在同一种倾向上都很高，缺乏另一种力量平衡）：${friction.length ? friction.map((c) => `${c.labelZh}`).join("、") : "无明显摩擦点"}\n` +
    `【${submission.name_a} 命盘概要】太阳${factsA.sunSignZh}、月亮${factsA.moonSignZh}、日主${factsA.dayMasterGan}(${factsA.dayMasterElement})\n` +
    `【${submission.name_b} 命盘概要】太阳${factsB.sunSignZh}、月亮${factsB.moonSignZh}、日主${factsB.dayMasterGan}(${factsB.dayMasterElement})\n`;

  const batches = buildBatches(chapters);
  const allSections: string[] = [];

  try {
    for (let bi = 0; bi < batches.length; bi++) {
      const result = await generateBatch(key, lang, batches[bi], typeLabel, bi === batches.length - 1, resonanceSummary, body.id);
      if (!result.sections) {
        console.error("[relationship generate-full] 批次失败:", result.failReason, "submission id:", body.id);
        return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 502 });
      }
      allSections.push(...result.sections);
    }

    const fullReport = allSections.join("\n\n===SECTION===\n\n");
    const admin = (await import("@/lib/supabase/admin")).createAdminClient();
    await admin
      .from("relationship_submissions")
      .update(lang === "en" ? { full_report_en: fullReport } : { full_report: fullReport })
      .eq("id", body.id);

    return NextResponse.json({
      fullReport,
      resonance: { resonant, complementary, friction },
      vectors: { a: vA, b: vB },
    });
  } catch (e) {
    console.error("[relationship generate-full] 出错:", e);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
