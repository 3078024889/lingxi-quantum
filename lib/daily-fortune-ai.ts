import { createAdminClient } from "@/lib/supabase/admin";
import { stripMarkdownArtifacts } from "@/lib/text-clean";
import type { TodayTransit, RetrogradeInfo, ElementRelation, NextTidePeak } from "@/lib/daily-transit";

// ────────────────────────────────────────────────────────────────────
// 今日场域测试 · 正文生成（v226 首次做，v228 加入能量潮汐 + 未来趋势）
// ────────────────────────────────────────────────────────────────────
// v226 把之前"8种月相×3种元素关系=24种固定组合"的老版本，换成了结合
// 月亮星座、月相、逆行行星、当日守护星、太阳星座与元素关系这五个真实
// 数据点，交叉引用出的专属正文。
//
// v228 在这个基础上，加入"能量潮汐"这个新维度——不是新造的比喻，是
// 真实的潮汐力学：新月/满月时太阳月亮引力叠加，潮汐力最强（大潮）；
// 上下弦月时引力互相抵消，潮汐力最弱（小潮），这套周期任何潮汐表都
// 能查证。这次同时把"未来几天潮汐会怎么变化"也交给AI写进正文——
// 这是在描述潮汐这个真实、可预测的自然现象本身，不是在预言这个人的
// 命运，跟"不能预言具体会发生什么事"这条规则不冲突：潮汐涨落是提前
// 就能算出来的天文事实，不是算命。

const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = process.env.ZHIPU_MODEL_LIGHT || "glm-4-flash";

function cacheKey(dateStr: string, signSlug: string): string {
  return `${dateStr}_${signSlug}_v228`;
}

function buildPrompt(
  signZh: string,
  signEn: string,
  transit: TodayTransit,
  retro: RetrogradeInfo,
  ruler: { zh: string; en: string },
  relation: ElementRelation,
  tide: number,
  nextTide: NextTidePeak,
  lang: "zh" | "en"
): { system: string; user: string } {
  const relationZh = relation === "resonant" ? "共振（同元素）" : relation === "flowing" ? "顺畅相生" : "有摩擦";

  const system =
    "【你是谁】你是「灵犀场」，负责写一段当天、当下这个星座专属的「今日场域测试」正文——不是通用占星专栏，是把今天几个真实存在的天文数据点，交叉引用成一段具体、精准的解读。" +
    "【必须交叉引用，不能分别罗列】下面给你的月亮星座、月相、能量潮汐强度、逆行行星（如果有）、当日守护星、这个人的太阳星座与元素关系，不能写成\"今天月亮在XX，另外月相是XX，另外潮汐是XX\"这种逐条翻译、中间没有真正关联的写法——要写出这几个数据点放在一起，对这个具体星座意味着什么，是这几件事碰在一起才会产生的、独属于今天的具体情况。" +
    "【能量潮汐这个概念，务必用对】潮汐强度是真实的潮汐力学换算出来的（新月满月最强，上下弦月最弱），不是虚构的能量值——把它当成\"今天这个场域的振幅有多大\"来写：潮汐强，代表今天无论往哪个方向用力，效果都会被放大；潮汐弱，代表今天更适合收着来、不宜勉强推进。用给出的\"接下来还有几天到下一次大潮/小潮\"这个真实天文事实，写一句关于\"未来几天振幅会怎么变化\"的具体描述——这是在描述潮汐这个可预测的自然现象，不是在预言这个人会遇到什么事，措辞上不能滑向\"你将会...\"这种个人命运预言。" +
    "【精准，不要模棱两可】禁止\"你可能\"\"也许\"\"通常\"这类模糊限定词连续出现；禁止能套在任何星座、任何一天都成立的空话（比如\"保持觉察，一切都会好起来\"）；每一句判断都要能明确追溯到上面给的某个具体数据点，换一个星座、换一天，这段话就不再完全成立。" +
    "【格式】禁止markdown语法（不能有**加粗**、#标题、列表符号）；禁止出现\"AI\"\"人工智能\"\"机器人\"\"程序\"这类词；禁止具体的吉凶断语或\"你将会遇到……\"这类预言式表达，只做\"今天的能量结构是什么、接下来几天振幅趋势如何、这个星座今天适合往哪个方向用力\"这种观察性描述。" +
    "篇幅160-200字，纯文字一段，不用换行分段。" +
    (lang === "en" ? " 用英文回复（Reply in English）。" : "");

  const tideTrend = nextTide.daysAway === 0
    ? "今天正好是潮汐的转折点"
    : `再过${nextTide.daysAway}天，会到达这轮潮汐的${nextTide.kind === "spring" ? "峰值（大潮）" : "低点（小潮）"}`;

  const user =
    `星座：${signZh}（${signEn}）\n` +
    `今天月亮星座：${transit.moonSignZh}（${transit.moonSignEn}）\n` +
    `今天月相：${transit.moonPhaseZh}（${transit.moonPhaseEn}）\n` +
    `今天能量潮汐强度：${tide}/100（数值越接近100，代表越接近新月或满月，潮汐力越强；越接近0，代表越接近上弦或下弦月，潮汐力越弱）\n` +
    `未来潮汐趋势：${tideTrend}\n` +
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
  tide: number;
  nextTide: NextTidePeak;
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

  const { system, user } = buildPrompt(
    params.signZh, params.signEn, transit, params.retro, params.ruler, params.relation,
    params.tide, params.nextTide, lang
  );

  try {
    const res = await fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.85,
        max_tokens: 600,
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
