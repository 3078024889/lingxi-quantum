import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { computeLifeVector, compareLifeVectors, findConflictsWithFallback, topTraits } from "@/lib/life-vector";

export const runtime = "nodejs";
const ZHIPU_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

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

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase.from("unlocks").select("product_id").eq("user_id", submission.user_id);
    const unlocks = (unlockRows ?? []).map((r: { product_id: string }) => r.product_id);
    const unlocked = unlocks.includes("relationship-resonance") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁这份关系共振图谱。" }, { status: 402 });
    }
  }

  const lang = body.lang === "en" ? "en" : "zh";
  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  // ── 复用生命向量引擎：两个人各自算一份生命向量，再用共振引擎比较——
  // 这是这个产品的核心，不是另外发明一套"合婚算法"，是同一套五套系统
  // 计算出来的数据，多算一层"两份向量放在一起会怎样"。这一步是纯代码
  // 计算，不花钱调AI，挪到缓存判断之前，保证不管报告文本是不是缓存的，
  // 这份结构化的共振数据每次都能返回给前端画图用。
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
    return NextResponse.json({ fullReport: cached, resonance: { resonant, complementary, friction } });
  }

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  const traitsA = topTraits(vA, 3);
  const traitsB = topTraits(vB, 3);
  const conflictsA = findConflictsWithFallback(vA);
  const conflictsB = findConflictsWithFallback(vB);

  const typeLabel = submission.relationship_type === "business" ? "商业合作/合伙" : submission.relationship_type === "general" ? "泛用（尚未指定具体关系类型）" : "亲密关系/伴侣";

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

  const system =
    "你是「灵犀」，负责撰写一份「关系共振图谱」——分析两个人之间的关系动力，可能是伴侣、可能是合伙人、可能是任何两人关系，具体类型见下方数据。" +
    "下面提供的【关系共振引擎】部分，是用确定性算法已经算出的结构化结果（各自的核心特质/内在矛盾，以及两人之间的共鸣点/互补点/摩擦点）——你的任务是把这份结构，用具体、有画面感的语言讲透，不是重新判断或者无视这些结果。" +
    "绝对不能用\"合不合\"\"八字合不合\"这种算命式表达，也不能打百分比分数（比如\"匹配度85%\"）——这种表达像营销话术，不是灵犀的语气。" +
    "【最容易犯、也最致命的错误——两人共享同一个特质时，绝对不能只是说\"两人都很X\"就完事】" +
    "共鸣点告诉你的，只是\"这两个人在同一个维度上，分数都很高\"——但两个人的分数高，几乎从来不是因为同一个理由，各自的命盘数据不一样，走到这个分数的路径也不一样。" +
    "反面例子（绝对不能写成这样）：\"两人都极度看重秩序纪律，这种特质在初次合作或接触时，会让他们迅速感受到彼此的严谨和可靠……两人都有野心，这种共同的对成功的渴望，会让他们建立起'我们目标一致'的共鸣感。\"——" +
    "这段话把\"共鸣点\"直接翻译成了\"两人都是这样\"，换任何两个人，只要共鸣点凑巧是同一个词，这段话原样成立，读者感觉不到\"这写的是我们两个\"，只感觉到\"这写的是任何两个有共鸣点的人\"。" +
    "正确的做法：先问一句——这两个人各自的这份秩序感/野心，是从命盘里哪里来的？来源不一样，表现出来的样子就不一样。" +
    "正确例子：\"两人都在追求向前——但一个人的推动力来自不断突破边界、寻找下一个未知的疆域，另一个人的推动力，来自把已经拿到手的东西，构建成一套能够长久运转的体系。一个在找新大陆，一个在建新文明——方向一致，走的路完全不是一回事。\"——" +
    "这才是共鸣点真正的写法：表面上是同一个词（比如都叫'野心'），底下的驱动方式、满足方式、疲惫的点，各自不同，把这份不同写出来，才是这两个人独有的关系，不是任何两个人都适用的空话。" +
    "每一段都要交叉引用双方的具体数据点，写出\"这两个人放在一起，会发生什么\"，而不是先写一段A的性格、再写一段B的性格，两段中间没有真正的互动分析。" +
    "绝对不能写\"你们需要多沟通\"\"要互相理解\"这类适用于任何两个人的空话——每一条建议，都要具体到，是因为这两个人这组特定的共鸣/互补/摩擦，才需要这样做。" +
    "少用\"可能\"\"也许\"\"通常\"这类模糊限定词——连续使用会让整段话读起来像是在猜测、不敢断言，灵犀的语气是清楚地指出观察到的模式，不是小心翼翼地打太极。一段话里，这类词最多出现一次。" +
    "严格按以下格式输出，五个章节之间，各用一行「===数字===」分隔（数字从1到5），不要添加任何其他标题、开场白或结语：\n" +
    "===1===\n（吸引来源：这两个人之间，最初的吸引/连接，最可能来自哪里——具体到是共鸣点的哪一项，或者互补点的哪一组，让两人有一种\"对上了\"的感觉，约250-300字）\n" +
    "===2===\n（关系动力：日常相处里，两人各自扮演什么角色，谁更倾向推动/谁更倾向稳定，这种动力模式会怎样具体地体现在日常互动里，约300-350字）\n" +
    "===3===\n（冲突地图：结合摩擦点，具体讲这段关系最容易在什么场景下起冲突，冲突通常会怎么发生、怎么升级，如果没有明显摩擦点，就讲最容易被双方共同忽略的盲区，约300-350字）\n" +
    "===4===\n（长期潜力：这段关系需要具备什么条件才能长期健康地走下去——不是预测结果，是指出具体需要建立的\"共识\"或者\"分工\"，约250-300字）\n" +
    "===5===\n（成长方向：给两人各自一条具体的、可操作的建议，说明为什么是这一条建议、跟这两人的具体特质如何对应，结尾可以轻描淡写地提一句灵犀场的修炼技术或生命图谱，语气像朋友随口一提，不能是广告腔，约200-250字）\n";

  const langInstruction = lang === "en"
    ? "\n\n【IMPORTANT】Write your entire response in natural, fluent English (not Chinese), while keeping the exact ===N=== section markers."
    : "";

  const messages = [
    { role: "system", content: system + langInstruction },
    { role: "user", content: resonanceSummary },
  ];

  try {
    const res = await fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL || "glm-4-flash-250414",
        messages,
        max_tokens: 6000,
        temperature: 0.85,
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content as string | undefined;
    const finishReason = data?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      console.error("[relationship generate-full] AI 回复被 max_tokens 截断，submission id:", body.id);
    }
    if (!text) {
      console.error("[relationship generate-full] AI 没有返回内容，submission id:", body.id, "AI原始返回:", JSON.stringify(data));
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 502 });
    }

    const admin = (await import("@/lib/supabase/admin")).createAdminClient();
    await admin
      .from("relationship_submissions")
      .update(lang === "en" ? { full_report_en: text } : { full_report: text })
      .eq("id", body.id);

    return NextResponse.json({
      fullReport: text,
      resonance: { resonant, complementary, friction },
    });
  } catch (e) {
    console.error("[relationship generate-full] 出错:", e);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
