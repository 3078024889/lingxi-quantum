import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAROT_MAJOR_ARCANA } from "@/lib/tarot-data";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

function buildSystem(lang: "zh" | "en"): string {
  const base =
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正读过成千上万次塔罗牌阵的引导者——不是在完成一份写作任务，是坐在这个人对面，看着这三张牌，说出你真正看到的东西。" +
    "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像\"这张牌落在这里，我见过，你的情况是……\"这种笃定，不是\"这可能象征着……\"这种模糊断语。" +
    "你是「灵犀」，负责为已付费用户，撰写一份「灵犀量子塔罗 · 三张牌阵深度探索」报告。" +
    "这三张牌不是随机抽的——是从这个人真实的命盘数据（出生年月日、四柱、太阳月亮星座、五行分布）确定性算出来的，过去牌对应年柱月柱，现在牌对应日柱与太阳月亮，未来牌对应时柱与当下最旺的五行元素。" +
    "你的任务：把这三张牌的原始含义（下面会给你），跟这个人具体的命盘数据交叉引用，写出一段连贯、有画面感、只属于这个人的解读——不是把三张牌的含义分别抄一遍，是说清楚这三张牌摆在一起，讲了一个什么故事。" +
    "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上。" +
    "【防止空话】禁止出现\"你可能\"\"也许\"\"通常\"这类模糊限定词连续使用；禁止\"魅力四射\"\"命中注定\"\"能量爆棚\"这类空洞套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的镜子，不是命运预言。" +
    "结构要求：分三段，每段对应一张牌，但段落之间要有呼应和过渡，不要写成三个孤立的小标题+解释；第一段（过去牌）说清楚这个人是从什么样的起点走过来的，形成原因要具体到年柱月柱透露的信息；第二段（现在牌）说清楚这个人此刻真实的状态，要交叉引用日柱、太阳、月亮的具体数据；第三段（未来牌）不是预言，是指出一个具体的、可以主动把握的方向，要交叉引用时柱和五行数据。" +
    "结尾一句话收束，把三张牌连成一条线，而不是三个独立的点。全文约500-650字。";
  return lang === "en"
    ? base + " 用英文回复（Reply in English）。"
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
    const unlocked = unlocks.includes("tarot-deep") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁深度探索。" }, { status: 402 });
    }
  }

  const admin = createAdminClient();
  const { data: submission, error: fetchErr } = await admin
    .from("tarot_submissions")
    .select("*")
    .eq("id", body.id)
    .single();
  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached });
  }

  const past = TAROT_MAJOR_ARCANA[submission.past_index];
  const present = TAROT_MAJOR_ARCANA[submission.present_index];
  const future = TAROT_MAJOR_ARCANA[submission.future_index];
  const facts = submission.facts as Record<string, unknown>;

  const promptContent =
    `三张牌：\n` +
    `过去（对应年柱${facts.yearPillar}、月柱${facts.monthPillar}）：${past.nameZh}（${past.nameEn}）—— ${past.keywordsZh}，牌义：${past.meaningZh}\n` +
    `现在（对应日柱${facts.dayPillar}、太阳${facts.sunSignZh}、月亮${facts.moonSignZh}）：${present.nameZh}（${present.nameEn}）—— ${present.keywordsZh}，牌义：${present.meaningZh}\n` +
    `未来（对应时柱${facts.hourPillar ?? "未提供出生时间"}、命盘五行分布：${JSON.stringify(facts.wuXingCount)}）：${future.nameZh}（${future.nameEn}）—— ${future.keywordsZh}，牌义：${future.meaningZh}\n` +
    (submission.name ? `这个人的名字：${submission.name}\n` : "");

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
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
      console.error("[tarot generate-full] 智谱接口返回非200状态:", res.status, errBody, "submission id:", body.id);
      return NextResponse.json({ error: `场域暂时无法回应（${res.status}），请稍后再试。` }, { status: 502 });
    }
    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim();
    const text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
    if (!text) {
      console.error("[tarot generate-full] AI 没有返回内容，submission id:", body.id, JSON.stringify(data));
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 502 });
    }

    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await admin.from("tarot_submissions").update(updateField).eq("id", body.id);

    return NextResponse.json({ fullReport: text });
  } catch (e) {
    console.error("[tarot generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
