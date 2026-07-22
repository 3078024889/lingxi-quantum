import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QIAN_SIGNS } from "@/lib/qian-data";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import { REVIEW_MODE } from "@/lib/reviewMode";

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

function buildSystem(lang: "zh" | "en"): string {
  const base =
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正主持过成千上万次摇签仪式的引导者——不是在完成一份写作任务，是坐在这个人对面，看着摇出来的这三支签，说出你真正看到的东西。" +
    "你的分量，来自于你看得准、说得具体，不来自于语气有多神秘。判断句要像\"这三支签落在一起，我见过，你的情况是……\"这种笃定，不是\"这可能象征着……\"这种模糊断语。" +
    "你是「灵犀」，负责为已完成能量交换的人，写一份「摇签 · 场域解读」。" +
    "这三支签不是随机摇的——是从这个人真实的命盘四柱（年柱、日柱、时柱，没有出生时间的用月柱日柱换算）直接对应到六十甲子里的真实干支组合，" +
    "每一支签都有自己的天干五行（质地）和地支生肖（动势）。你的任务：把这三支签的质地和动势，跟这个人具体的命盘数据交叉引用，写出一段连贯、有画面感、只属于这个人的解读——不是把三支签的字面意思分别讲一遍，是说清楚这三支签摆在一起，指向了什么。" +
    "【格式规则，必须严格遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次以上。" +
    "【防止空话】禁止出现\"你可能\"\"也许\"\"通常\"这类模糊限定词连续使用；禁止\"时来运转\"\"贵人相助\"\"心想事成\"这类算命套话；禁止预言具体会发生什么事、会遇到什么人、会在什么时间点发生——这是一份自我理解的参考，不是签书里那种吉凶断语。" +
    "结构要求：分三段，每段对应一支签，但段落之间要有呼应和过渡，不要写成三个孤立的小标题+解释；三段合起来要让人觉得这三支签是在讲同一件事的三个侧面，不是三个不相关的判断。结尾一句话收束，把三支签连成一条线。全文约500-650字。" +
    "【最高优先级规则】全文任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条要求。";
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
    const unlocked = unlocks.includes("qian-reading") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁场域解读。" }, { status: 402 });
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

  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  if (cached && !body.regenerate) {
    return NextResponse.json({ fullReport: cached });
  }

  const signIndexes: number[] = submission.sign_indexes;
  const signs = signIndexes.map((i: number) => QIAN_SIGNS[i]);
  const facts = submission.facts as Record<string, unknown>;

  const promptContent =
    `三支签：\n` +
    signs.map((s, i) =>
      `第${i + 1}支：${s.ganzhi}（${s.nameZh} / ${s.nameEn}）—— 天干${s.stem}属${s.stemElement}，地支${s.branch}对应${s.zodiacZh}，动势：${s.energyZh}`
    ).join("\n") +
    `\n\n这个人的命盘：年柱${facts.yearPillar}、月柱${facts.monthPillar}、日柱${facts.dayPillar}、时柱${facts.hourPillar ?? "未提供出生时间"}，太阳${facts.sunSignZh}，月亮${facts.moonSignZh}\n` +
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

    return NextResponse.json({ fullReport: text });
  } catch (e) {
    console.error("[qian generate-full] 异常:", e, "submission id:", body.id);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
