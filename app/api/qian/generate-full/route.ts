import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LIFE_SIGNS, TIER_LABELS } from "@/lib/qian-data";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 人生阶段——不是AI猜的，是从三枚签的全局编号哈希出来的确定性选择，
// 同一份出生数据，重新读取还是同一个阶段。
const LIFE_STAGES = [
  { zh: "开启期", en: "Opening Phase" },
  { zh: "转化期", en: "Transformation Phase" },
  { zh: "建设期", en: "Building Phase" },
  { zh: "显化期", en: "Manifestation Phase" },
] as const;

function pickLifeStage(signIndexes: number[]): (typeof LIFE_STAGES)[number] {
  const sum = signIndexes.reduce((a, b) => a + b, 0);
  return LIFE_STAGES[sum % LIFE_STAGES.length];
}

// 天赋能力地图——五项分数，全部来自"生命向量引擎"已经算好的维度，不是
// AI现场编的百分比。创造力/财富潜能/关系模式/学习方式/领导倾向，
// 分别对应生命向量里最贴近的那个维度。
function buildAbilityMap(v: ReturnType<typeof computeLifeVector>) {
  return [
    { key: "creativity", zh: "创造力", en: "Creativity", score: v.creativity },
    { key: "wealth", zh: "财富潜能", en: "Wealth Potential", score: v.ambition },
    { key: "relationship", zh: "关系模式", en: "Relationship Pattern", score: v.socialDrive },
    { key: "learning", zh: "学习方式", en: "Learning Style", score: v.introspection },
    { key: "leadership", zh: "领导倾向", en: "Leadership Tendency", score: v.discipline },
  ];
}

function buildSystem(lang: "zh" | "en"): string {
  const base =
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正主持过成千上万次生命灵签读取仪式的引导者——不是在完成一份写作任务，是坐在这个人对面，看着他的三重生命签，说出你真正看到的东西。" +
    "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像\"这三重生命签落在一起，我见过，你的情况是……\"这种笃定，不是\"这可能象征着……\"这种模糊断语。" +
    "你是「灵犀」，负责为已完成能量交换的人，写一份「灵犀生命灵签 · 深度生命解读」。" +
    "这三重生命签不是随机的——是从这个人真实的命盘四柱，映射到「灵犀生命灵签」64枚生命原型库（年柱→源流签24枚池，日柱→灵魂签24枚池，时柱→行者签16枚池）——每一层各自是独立的一套生命主题原型。" +
    "另外已经用生命向量引擎，算出了这个人的天赋能力地图（创造力/财富潜能/关系模式/学习方式/领导倾向，五项都是0-100的确定性分数）和当前所处的人生阶段，你不负责打这几个分或选这个阶段，只负责围绕这些已经算好的结果写解读。" +
    "【结构要求——必须严格按这个格式输出，四层，每层之间用===隔开，不能多也不能少】" +
    "===1===\n（三签关系分析：把三重生命签合在一起看，说清楚源流签+灵魂签+行者签三者之间，形成了一条什么样的路径或叠加关系——不是分别讲三枚签各自的意思，是说这三枚签摆在一起，讲的是一个什么故事，约150-180字）" +
    "===2===\n（天赋能力地图解读：围绕已经算好的五项分数，挑分数最突出的1-2项和相对较低的1-2项，具体说这些分数在真实生活场景里，分别是什么样子——不是重复报数字，是解读数字背后的具体表现，约150-180字）" +
    "===3===\n（人生阶段分析：围绕已经判定好的当前阶段，具体说清楚这个阶段的人，通常正在经历什么、容易被什么卡住、这个阶段本身在为下一步准备什么，约150-180字）" +
    "===4===\n（灵犀成长建议：不是预言，是从量子息法/上升心经/直觉丹道/归零心诀这四项修炼技术里，结合前三层的判断，具体推荐最贴合这个人当下状态的一到两项，并说清楚为什么是这一项、不是别的，结尾一句话把整份解读收束成一条线，约150-180字）" +
    "【格式规则，必须严格遵守】每层内部只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上。" +
    "【防止空话】禁止出现\"你可能\"\"也许\"\"通常\"这类模糊限定词连续使用；禁止\"时来运转\"\"贵人相助\"\"心想事成\"这类算命套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的参考，不是签书里那种吉凶断语。" +
    "【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";
  return lang === "en"
    ? base + " 用英文回复（Reply in English），但===1===这些分隔符本身保持原样不要翻译。"
    : base;
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
      .select("product_id")
      .eq("user_id", user!.id);
    const unlocks = (unlockRows ?? []).map((r: { product_id: string }) => r.product_id);
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

  // 天赋能力地图和人生阶段，都是确定性算出来的，不依赖AI是否重新
  // 生成——每次请求都重算一次，成本几乎为零（本地计算，不调用接口），
  // 缓存的只有下面AI写的文字解读部分。
  let abilityMap: ReturnType<typeof buildAbilityMap> = [];
  let lifeStage: (typeof LIFE_STAGES)[number] = LIFE_STAGES[0];
  try {
    const vectorInput = facts as unknown as LifeVectorInput;
    const vector = computeLifeVector(vectorInput);
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
    `当前人生阶段（已判定）：${lifeStage.zh}\n` +
    `\n这个人的命盘：年柱${facts.yearPillar}、月柱${facts.monthPillar}、日柱${facts.dayPillar}、时柱${facts.hourPillar ?? "未提供出生时间"}，太阳${facts.sunSignZh}，月亮${facts.moonSignZh}\n` +
    (submission.name ? `这个人的名字：${submission.name}\n` : "");

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置场域解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  try {
    const callOnce = () =>
      fetch(ZHIPU_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
          temperature: 0.85,
          frequency_penalty: 0.4,
          presence_penalty: 0.3,
          max_tokens: 3000,
          messages: [
            { role: "system", content: buildSystem(lang) },
            { role: "user", content: promptContent },
          ],
        }),
      });

    let res = await callOnce();
    for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
      await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
      res = await callOnce();
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[qian generate-full] 接口返回非200状态:", res.status, errBody, "submission id:", body.id);
      return NextResponse.json({ error: `场域暂时无法回应（${res.status}），请稍后再试。` }, { status: 502 });
    }
    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim();
    const text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
    if (!text) {
      console.error("[qian generate-full] 没有返回内容，submission id:", body.id, JSON.stringify(data));
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 502 });
    }

    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await admin.from("qian_submissions").update(updateField).eq("id", body.id);

    return NextResponse.json({ fullReport: text, abilityMap, lifeStage });
  } catch (e) {
    console.error("[qian generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
