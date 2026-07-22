import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAROT_MAJOR_ARCANA } from "@/lib/tarot-data";
import { computeLifeVector, type LifeVectorInput } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 当前意识频率——四项分数，全部来自"生命向量引擎"已经算好的维度，
// 不是AI现场编的百分比，跟摇签那份"天赋能力地图"是同一个原则。
function buildFrequencyMap(v: ReturnType<typeof computeLifeVector>) {
  return [
    { key: "awareness", zh: "觉察力", en: "Awareness", score: v.introspection },
    { key: "creativity", zh: "创造力", en: "Creativity", score: v.creativity },
    { key: "relationship", zh: "关系流动", en: "Relationship Flow", score: v.socialDrive },
    { key: "stability", zh: "内在稳定", en: "Inner Stability", score: v.discipline },
  ];
}

function buildSystem(lang: "zh" | "en"): string {
  const base =
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正读过成千上万次塔罗牌阵的引导者——不是在完成一份写作任务，是坐在这个人对面，看着这三张牌，说出你真正看到的东西。" +
    "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像\"这张牌落在这里，我见过，你的情况是……\"这种笃定，不是\"这可能象征着……\"这种模糊断语。" +
    "你是「灵犀」，负责为已完成能量交换的人，写一份「灵犀量子塔罗 · 生命镜像」解读。" +
    "这三张牌不是随机抽的——是从这个人真实的命盘数据确定性算出来的：潜意识镜像对应年柱月柱，当下共振对应日柱与太阳月亮，未来展开对应时柱与当下最旺的五行元素。另外已经用生命向量引擎，算出了这个人当前的意识频率（觉察力/创造力/关系流动/内在稳定，四项都是0-100的确定性分数），你不负责打分，只负责围绕已经算好的结果写解读。" +
    "【结构要求——必须严格按这个格式输出，三层，每层之间用===隔开，不能多也不能少】" +
    "===1===\n（当前生命主题：把三张牌合在一起看，这个人此刻正在经历的核心主题是什么——不是分别讲三张牌各自的意思，是说清楚潜意识镜像+当下共振+未来展开三者叠加在一起，指向了一个什么阶段，约150-180字）" +
    "===2===\n（隐藏力量：这个人自己可能还没充分意识到的优势或资源是什么——要具体交叉引用三张牌里至少一张的核心主题或象征，也可以呼应意识频率里分数最突出的那一项，不能是空泛的夸奖，约150-180字）" +
    "===3===\n（当前提醒：不是预言，是一句具体的、这个人现在就能用上的提醒——要跟前两层的判断呼应，不能是脱离前文的空泛建议，结尾一句话收束成一条线，约120-150字）" +
    "【格式规则，必须严格遵守】每层内部只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上。" +
    "【防止空话】禁止出现\"你可能\"\"也许\"\"通常\"这类模糊限定词连续使用；禁止\"魅力四射\"\"命中注定\"\"能量爆棚\"这类空洞套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的镜子，不是命运预言。" +
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

  // 意识频率是确定性算出来的，每次请求都重算一次，成本几乎为零
  // （本地计算，不调用接口），缓存的只有AI写的文字解读部分。
  let frequencyMap: ReturnType<typeof buildFrequencyMap> = [];
  try {
    const vector = computeLifeVector(facts as unknown as LifeVectorInput);
    frequencyMap = buildFrequencyMap(vector);
  } catch (e) {
    console.error("[tarot reading generate-full] 生命向量计算失败:", e, "submission id:", body.id);
  }

  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, frequencyMap });
  }

  const promptContent =
    `三张牌：\n` +
    `潜意识镜像（对应年柱${facts.yearPillar}、月柱${facts.monthPillar}）：${hidden.nameZh}（${hidden.nameEn}）—— 核心主题：${hidden.themeZh}，象征：${hidden.symbolZh}\n` +
    `当下共振（对应日柱${facts.dayPillar}、太阳${facts.sunSignZh}、月亮${facts.moonSignZh}）：${present.nameZh}（${present.nameEn}）—— 核心主题：${present.themeZh}，象征：${present.symbolZh}\n` +
    `未来展开（对应时柱${facts.hourPillar ?? "未提供出生时间"}、命盘五行分布：${JSON.stringify(facts.wuXingCount)}）：${future.nameZh}（${future.nameEn}）—— 核心主题：${future.themeZh}，象征：${future.symbolZh}\n` +
    `\n当前意识频率（已算好的确定性分数，0-100）：` +
    frequencyMap.map((f) => `${f.zh}${f.score}`).join("、") + "\n" +
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
          max_tokens: 2200,
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
      console.error("[tarot reading generate-full] 接口返回非200状态:", res.status, errBody, "submission id:", body.id);
      return NextResponse.json({ error: `场域暂时无法回应（${res.status}），请稍后再试。` }, { status: 502 });
    }
    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim();
    const text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
    if (!text) {
      console.error("[tarot reading generate-full] 没有返回内容，submission id:", body.id, JSON.stringify(data));
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 502 });
    }

    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await admin.from("tarot_reading_submissions").update(updateField).eq("id", body.id);

    return NextResponse.json({ fullReport: text, frequencyMap });
  } catch (e) {
    console.error("[tarot reading generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
