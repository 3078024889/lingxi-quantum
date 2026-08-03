import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeTodayTransit, tideLevel, nextTidePeak, futureTideSnapshot, elementRelation, computeRetrogrades, dayRuler } from "@/lib/daily-transit";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";
export const maxDuration = 300;
const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const noAiRule = "\n\n【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";

// v237：今日运势潮汐付费深度报告——11章节，结合这个人真实的出生
// 结构（太阳/日主）+ 当天真实的潮汐/月相/逆行数据 + 未来7/30/90天
// 真实算出来的潮汐趋势。这份报告是"从生成那天开始往后看"的快照，
// 不是每天都变——买一次，看的是从购买那天起的一段展开。
type ChapterMeta = { titleZh: string; titleEn: string; hint: string };

function buildChapters(ctx: {
  sunSignZh: string; dayMasterElement: string; moonSignZh: string; moonPhaseZh: string;
  tide: number; relationZh: string; rulerZh: string; retroStr: string;
  nextTideStr: string; day7: number; day30: number; day90: number;
}): ChapterMeta[] {
  return [
    { titleZh: "今日潮汐入口", titleEn: "Today's Tide Gate",
      hint: `今日潮汐入口：概览这个人今天的整体能量状态是什么样——结合太阳${ctx.sunSignZh}、日主${ctx.dayMasterElement}这个人的固定结构，和今天真实的潮汐强度${ctx.tide}/100、月亮${ctx.moonSignZh}这些当天数据，写出今天对这个具体的人意味着什么，不是通用的"今日提示"` },
    { titleZh: "今日行动潮", titleEn: "Today's Action Tide",
      hint: `今日行动潮：结合潮汐强度${ctx.tide}/100和当日守护星${ctx.rulerZh}，具体说今天适合往哪个方向用力、行动节奏该快还是该稳` },
    { titleZh: "今日创造潮", titleEn: "Today's Creation Tide",
      hint: "今日创造潮：结合这个人的日主五行和今天的月相，具体说今天灵感/创造力更容易在什么场景下出现" },
    { titleZh: "今日关系潮", titleEn: "Today's Connection Tide",
      hint: `今日关系潮：结合月亮元素与本命元素的关系（${ctx.relationZh}），具体说今天的人际互动容易顺畅还是容易有摩擦` },
    { titleZh: "今日价值流动潮", titleEn: "Today's Value Flow Tide",
      hint: "今日价值流动潮：不写发财预测，写今天适合观察资源、机会、合作的哪个具体方面" },
    { titleZh: "今日内在潮汐", titleEn: "Today's Inner Tide",
      hint: "今日内在潮汐：结合潮汐强度和逆行情况，具体说今天更适合向外探索还是向内整理" },
    { titleZh: "未来7日潮汐趋势", titleEn: "The Next 7 Days",
      hint: `未来7日潮汐趋势：7天后潮汐强度会到${ctx.day7}/100（${ctx.day7 > ctx.tide ? "比今天更强" : ctx.day7 < ctx.tide ? "比今天更弱" : "跟今天接近"}），结合这个真实的趋势数字，具体描述接下来一周能量振幅会怎样变化、这对这个人意味着什么，不能写成具体事件预言，是描述潮汐这个自然节奏本身` },
    { titleZh: "未来30日潮汐趋势", titleEn: "The Next 30 Days",
      hint: `未来30日潮汐趋势：30天后潮汐强度会到${ctx.day30}/100，结合${ctx.nextTideStr}这个真实的天文事实，具体描述这一个月的能量节奏走向，重点关注的方向可以结合这个人的日主五行来说` },
    { titleZh: "未来90日能量周期", titleEn: "The Next 90 Days",
      hint: `未来90日能量周期：90天后潮汐强度会到${ctx.day90}/100，具体描述这个更长周期里，能量是在积蓄、释放还是转化，给出一个具体、不是空泛鸡汤的观察方向` },
    { titleZh: "灵犀场今日连接", titleEn: "Today's Practice",
      hint: "灵犀场今日连接：给一个具体、可执行的今日小练习，结合前面提到的具体潮汐状态，不能是泛泛的\"深呼吸\"这种通用建议" },
    { titleZh: "今日运势潮汐总结", titleEn: "Tide Summary",
      hint: "今日运势潮汐总结：作为收尾，必须明确指向前面章节提到过的具体潮汐数字或判断，不能只靠情绪词收尾" },
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
    { chapters: chapters.slice(0, 4), maxTokens: 3600 },
    { chapters: chapters.slice(4, 8), maxTokens: 3600 },
    { chapters: chapters.slice(8, 11), maxTokens: 2800 },
  ];
}

function baseVoice(isLastBatch: boolean): string {
  return (
    "【你是谁】你是「灵犀场」，负责为已完成能量交换的人，写一份「今日运势潮汐」深度报告——结合这个人的真实出生结构和当天真实的潮汐/月相天文数据，不是通用的每日运势。" +
    "潮汐强度是真实的潮汐力学换算出来的（新月满月最强、上下弦月最弱），未来7/30/90天的数字也是真实算出来的月相角度换算的潮汐强度，不是编的。" +
    "语气：具体、笃定，不要用\"你可能\"\"或许\"这类含糊限定词连续出现。" +
    "【绝对不能预言具体事件】不能写\"你会遇到...\"\"会发生...\"这类命运预言——你描述的是潮汐这个自然节奏本身、以及这种节奏跟这个具体人的结构碰在一起意味着什么，不是预言这个人的命运。" +
    "【防止空话】每一句判断都要能明确指向前面给的某个具体数字或数据点。" +
    (isLastBatch ? "【这一批最后一段是全篇收尾，尤其容易滑向空话】必须明确指向前面提到过的具体数字或判断。" : "") +
    "【格式规则】全文只能是纯文字段落，不能使用markdown语法。" +
    "【不能逐字重复】同一句话不能在文中出现两次以上。" +
    noAiRule
  );
}

async function generateBatch(key: string, lang: "zh" | "en", batch: Batch, isLastBatch: boolean, userContent: string, submissionId: string): Promise<{ sections: string[] | null; failReason?: string }> {
  const instruction =
    "严格按以下格式输出，" + batch.chapters.length + "个章节之间，各用一行「===数字===」分隔（数字从1开始），不要添加任何其他标题、开场白或结语：\n" +
    batch.chapters.map((c, i) => `===${i + 1}===\n（${c.hint}，约200-240字）`).join("\n");
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
    console.error(`[daily-tide generate-full] 批次接口返回非200:`, res.status, errBody, "submission id:", submissionId);
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
  const { data: submission } = await admin.from("daily_tide_submissions").select("*").eq("id", body.id).single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await admin.from("unlocks").select("product_id, expires_at").eq("user_id", user!.id);
    const unlocked = (unlockRows ?? []).some(
      (u: { product_id: string; expires_at: string | null }) => u.product_id === "daily-tide-report" && (!u.expires_at || new Date(u.expires_at) > new Date())
    );
    if (!unlocked) return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
  }

  const cachedField = lang === "en" ? "full_report_en" : "full_report";
  if (submission[cachedField] && !body.regenerate) {
    return NextResponse.json({ fullReport: submission[cachedField], generatedDate: submission.generated_date });
  }

  // 这份报告是"从生成那天开始往后看"的快照——用提交记录里存的
  // generated_date（第一次生成的那天），不用"现在"，不然缓存过的
  // 报告，每次被打开都会重新算一遍"未来7天"，数字对不上生成那天
  // 写的内容。
  const snapshotDate = new Date(submission.generated_date + "T12:00:00Z");
  const facts = submission.facts;
  const transit = computeTodayTransit(snapshotDate);
  const tide = tideLevel(transit.moonPhaseAngle);
  const nextTide = nextTidePeak(snapshotDate);
  const future = futureTideSnapshot(snapshotDate);
  const relation = elementRelation(transit.moonElement, facts.sunElement ?? "fire");
  const retro = computeRetrogrades(snapshotDate);
  const ruler = dayRuler(snapshotDate);
  const relationZh = relation === "resonant" ? "共振" : relation === "flowing" ? "顺畅相生" : "有摩擦";
  const nextTideStr = nextTide.daysAway === 0 ? "潮汐正处在转折点" : `再过${nextTide.daysAway}天到达这轮潮汐的${nextTide.kind === "spring" ? "峰值" : "低点"}`;

  const userContent =
    `报告基准日期：${submission.generated_date}\n` +
    `太阳星座：${facts.sunSignZh}\n八字日主五行：${facts.dayMasterElement}\n` +
    `当天月亮星座：${transit.moonSignZh}\n当天月相：${transit.moonPhaseZh}\n` +
    `当天能量潮汐强度：${tide}/100\n月亮元素与本命元素关系：${relationZh}\n当日守护星：${ruler.zh}\n` +
    `当天逆行行星：${retro.length > 0 ? retro.map((r) => r.planetZh).join("、") : "无"}\n` +
    `未来潮汐趋势：${nextTideStr}\n` +
    `7天后潮汐强度：${future.day7}/100\n30天后潮汐强度：${future.day30}/100\n90天后潮汐强度：${future.day90}/100\n`;

  const chapters = buildChapters({
    sunSignZh: facts.sunSignZh, dayMasterElement: facts.dayMasterElement, moonSignZh: transit.moonSignZh,
    moonPhaseZh: transit.moonPhaseZh, tide, relationZh, rulerZh: ruler.zh,
    retroStr: retro.map((r) => r.planetZh).join("、"), nextTideStr,
    day7: future.day7, day30: future.day30, day90: future.day90,
  });

  const batches = buildBatches(chapters);
  const allSections: string[] = [];
  for (let bi = 0; bi < batches.length; bi++) {
    const result = await generateBatch(key, lang, batches[bi], bi === batches.length - 1, userContent, body.id);
    if (!result.sections) {
      console.error("[daily-tide generate-full] 批次失败:", result.failReason, "submission id:", body.id);
      return NextResponse.json({ error: "场域这次的回应不完整，请稍后再试一次。" }, { status: 500 });
    }
    allSections.push(...result.sections);
  }

  const fullReport = allSections.join("\n\n===SECTION===\n\n");
  await admin.from("daily_tide_submissions").update({ [cachedField]: fullReport }).eq("id", body.id);

  return NextResponse.json({ fullReport, generatedDate: submission.generated_date });
}
