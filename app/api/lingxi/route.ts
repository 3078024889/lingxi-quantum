import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
// 文本模型：默认免费、稳定支持知识库检索；可用环境变量切到 glm-4.7-flash
const MODEL = process.env.ZHIPU_MODEL || "glm-4-flash-250414";
// 灵犀知识库（站点资料）
const KNOWLEDGE_ID = process.env.ZHIPU_KNOWLEDGE_ID || "2071126362659377152";

const PROMPT_TEMPLATE =
  '以下是灵犀场域的相关资料：\n"""\n{{knowledge}}\n"""\n' +
  '请结合上述资料的精神，用你自己的语言回应用户（不要逐句引用或复述资料原文）：\n"""\n{{question}}\n"""';

const SYSTEM: Record<string, string> = {
  dream:
    "你是「灵犀」，一位温柔、克制、富有洞察力的梦境陪伴者。" +
    "用户会写下梦境与联想。请用中文，以象征与心理的视角，" +
    "温柔解读梦中可能映照的情绪、关系与内在状态，给出一个可落地的小提醒或练习方向。" +
    "语气真诚、有诗意但不玄乎；不做命运的绝对断言，不预言吉凶，不替代医疗或心理治疗。" +
    "篇幅 200–350 字，2–3 段，不用列表，结尾留一句温暖的话。",
  manifest:
    "你是「灵犀」，一位陪伴显化的引导者，融合约瑟夫·墨菲《潜意识的力量》的核心方法。" +
    "用户写下了「已经拥有」状态下的生活与感受。请用中文，先共情镜映他的画面，再温柔点出其中已对齐的部分，" +
    "可自然呼应潜意识原理（潜意识会忠实接受你反复输入并相信的信念）；" +
    "最后给一个今天就能做的微小行动，或一句可在睡前用现在时默念的肯定语。" +
    "语气真诚、笃定、不浮夸，不承诺具体结果，不做财务或医疗建议。篇幅 150–280 字，2 段，不用列表。",
  invite:
    "你是「灵犀」。" +
    "请为用户当前所在的「门」生成 9 个简短、温柔、开放式的自我对话邀请（问句），" +
    "紧密贴合该门的主题、以及用户此刻填写的『今日状态』（心情与心上的事）；若有近期记录也一并参考。" +
    "九句之间角度各异、层层递进，每句不超过 30 字，引导向内觉察而非给答案，不算命、不诊疗。" +
    '严格只返回一个 JSON 数组，形如 ["问句1","问句2",...,"问句9"]，共 9 句，不要任何多余文字、解释或代码块标记。',
  invite_en:
    "You are 'Lingxi'. " +
    "Generate 9 short, gentle, open-ended self-inquiry invitations (questions) for the gate the user is at, " +
    "closely attuned to the gate's theme and the user's 'today's state' (their mood and what's on their mind); also consider any recent records. " +
    "Vary the angle across the nine and let them deepen; keep each under ~16 words; guide inward awareness rather than giving answers; no fortune-telling, no diagnosis. " +
    'Return STRICTLY one JSON array like ["question 1","question 2",...,"question 9"] with exactly 9 items — no extra text, explanation, or code fences.',
};

export async function POST(req: Request) {
  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  let body: { mode?: string; content?: string; context?: string; mood?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误。" }, { status: 400 });
  }

  const mode = body.mode === "manifest" || body.mode === "invite" ? body.mode : "dream";
  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "内容为空。" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "zh";
  const mood = (body.mood || "").trim();

  // invite 依语言选择系统提示
  const systemKey = mode === "invite" && lang === "en" ? "invite_en" : mode;

  const userText =
    mode === "dream"
      ? `【梦境】\n${content}\n${body.context ? `【联想与感受】\n${body.context}` : ""}`
      : mode === "invite"
        ? `${lang === "en" ? "[Gate]" : "【门】"} ${content}\n` +
          `${lang === "en" ? "[Today's state]" : "【今日状态】"} ${mood || (lang === "en" ? "(not provided)" : "（未填写）")}\n` +
          `${body.context ? `${lang === "en" ? "[Recent records]" : "【用户近期记录（梦境/签到摘录）】"}\n${body.context}` : ""}`
        : `【我正在显化的生活】\n${content}\n${body.context ? `【此刻的感受】\n${body.context}` : ""}`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        max_tokens: 1200,
        messages: [
          { role: "system", content: SYSTEM[systemKey] },
          { role: "user", content: userText },
        ],
        // 知识库检索：回答前先从灵犀知识库取相关 Codex 片段
        tools: [
          {
            type: "retrieval",
            retrieval: { knowledge_id: KNOWLEDGE_ID, prompt_template: PROMPT_TEMPLATE },
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `场域暂时无法回应（${res.status}），请稍后再试。` }, { status: 502 });
    }
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) return NextResponse.json({ error: "场域沉默了，请稍后再试。" }, { status: 502 });

    if (mode === "invite") {
      try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        const arr = JSON.parse(cleaned);
        const invites = Array.isArray(arr)
          ? arr.filter((x) => typeof x === "string" && x.trim()).slice(0, 9)
          : [];
        if (invites.length >= 1) return NextResponse.json({ invites });
      } catch {
        // 解析失败：交由前端用本地池兜底
      }
      return NextResponse.json({ error: "邀请生成失败。" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 502 });
  }
}
