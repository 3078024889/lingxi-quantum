import { createAdminClient } from "@/lib/supabase/admin";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import type { TodayTransit, RetrogradeInfo, ElementRelation } from "@/lib/daily-transit";

// ────────────────────────────────────────────────────────────────────
// 今日运势 · 正文生成（v226 新增）
// ────────────────────────────────────────────────────────────────────
// 之前这个页面的正文，来自 lib/daily-horoscope-narrative.ts 里两张固定
// 表格：8种月相 × 3种元素关系 = 24种组合，套在12个星座身上循环——
// 同一段话，一年里会被同一个星座反复看到很多次，跟星座本身几乎没有
// 关系（金牛座和处女座只要"元素关系"凑巧一样，看到的正文就完全一样）。
// 这是"太简单没新意"这个反馈的真正原因。
//
// 这次的做法：结合月亮星座、月相、逆行行星、当日守护星、这个人的
// 太阳星座和元素这五个真实数据点，让AI写一段真正贴合"今天+这个星座"
// 的具体正文，而不是套用固定文案。同一天、同一个星座，只生成一次，
// 存进 Supabase 缓存——不是每次访问都调用AI，一天最多12次调用
// （12个星座各一次），成本可以忽略不计，也不会给这个高频免费页面
// 带来限流压力。

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = process.env.ZHIPU_MODEL_LIGHT || "glm-4-flash";

function cacheKey(dateStr: string, signSlug: string): string {
  return `${dateStr}_${signSlug}`;
}

function buildPrompt(
  signZh: string,
  signEn: string,
  transit: TodayTransit,
  retro: RetrogradeInfo,
  ruler: { zh: string; en: string },
  relation: ElementRelation,
  lang: "zh" | "en"
): { system: string; user: string } {
  const relationZh = relation === "resonant" ? "共振（同元素）" : relation === "flowing" ? "顺畅相生" : "有摩擦";

  const system =
    "【你是谁】你是「灵犀场」，负责写一段当天、当下这个星座专属的「今日能量指引」正文——不是通用占星专栏，是把今天几个真实存在的天文数据点，交叉引用成一段具体、精准的解读。" +
    "【必须交叉引用，不能分别罗列】下面给你的月亮星座、月相、逆行行星（如果有）、当日守护星、这个人的太阳星座与元素关系，不能写成\"今天月亮在XX，另外月相是XX，另外今天水星逆行\"这种逐条翻译、中间没有真正关联的写法——要写出这几个数据点放在一起，对这个具体星座意味着什么，是这几件事碰在一起才会产生的、独属于今天的具体情况。" +
    "【精准，不要模棱两可】禁止\"你可能\"\"也许\"\"通常\"这类模糊限定词连续出现；禁止能套在任何星座、任何一天都成立的空话（比如\"保持觉察，一切都会好起来\"）；每一句判断都要能明确追溯到上面给的某个具体数据点，换一个星座、换一天，这段话就不再完全成立。" +
    "【格式】禁止markdown语法（不能有**加粗**、#标题、列表符号）；禁止出现\"AI\"\"人工智能\"\"机器人\"\"程序\"这类词；禁止具体的吉凶断语或\"你将会遇到……\"这类预言式表达，只做\"今天的能量结构是什么、这个星座今天适合往哪个方向用力\"这种观察性描述。" +
    "篇幅120-160字，纯文字一段，不用换行分段。" +
    (lang === "en" ? " 用英文回复（Reply in English）。" : "");

  const user =
    `星座：${signZh}（${signEn}）\n` +
    `今天月亮星座：${transit.moonSignZh}（${transit.moonSignEn}）\n` +
    `今天月相：${transit.moonPhaseZh}（${transit.moonPhaseEn}）\n` +
    `今天太阳所在星座（当下的"星座季节"）：${transit.sunSignZh}（${transit.sunSignEn}）\n` +
    `月亮元素与本星座元素的关系：${relationZh}\n` +
    `当日守护星（传统七曜配星期）：${ruler.zh}\n` +
    (retro.length > 0 ? `今天处于逆行状态的行星：${retro.map((r) => r.planetZh).join("、")}\n` : `今天没有主要行星处于逆行状态\n`);

  return { system, user };
}

export async function getDailyFortuneContent(params: {
  signSlug: string;
  signZh: string;
  signEn: string;
  transit: TodayTransit;
  retro: RetrogradeInfo;
  ruler: { zh: string; en: string };
  relation: ElementRelation;
  lang: "zh" | "en";
}): Promise<string | null> {
  const { signSlug, transit, lang } = params;
  const key = cacheKey(transit.date, signSlug) + (lang === "en" ? "_en" : "");
  const admin = createAdminClient();

  try {
    const { data: cached } = await admin.from("daily_fortune_cache").select("content").eq("id", key).single();
    if (cached?.content) return cached.content;
  } catch {
    // 缓存里没有这一条，走下面的生成逻辑——这不是错误，是正常的"今天
    // 这个星座还没人访问过、还没生成过"的情况。
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) return null;

  const { system, user } = buildPrompt(params.signZh, params.signEn, transit, params.retro, params.ruler, params.relation, lang);

  try {
    const res = await fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.85,
        max_tokens: 500,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    const clean = stripMarkdownArtifacts(text);

    // 存进缓存，同一天同一个星座之后的访问都直接读这条，不用再调用AI。
    await admin.from("daily_fortune_cache").upsert({ id: key, content: clean });
    return clean;
  } catch (e) {
    console.error("[daily-fortune-ai] 生成失败:", e);
    return null;
  }
}
