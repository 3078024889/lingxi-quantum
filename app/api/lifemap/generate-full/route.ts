import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { computeLifeVector, findConflictsWithFallback, topTraits, wealthArchetypes, calculateResilience, type LifeVectorDim } from "@/lib/life-vector";
import { calculateRomance } from "@/lib/romance-calc";

const ROMANCE_STYLE_LABEL: Record<string, string> = {
  independent: "独立探索型", magnetic: "磁场吸引型", devoted: "深度专一型", gentle: "温和亲和型",
};
import { stripMarkdownArtifacts } from "@/lib/text-clean";

export const runtime = "nodejs";
export const maxDuration = 300;

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
  const lang = body.lang === "en" ? "en" : "zh";

  // 精确校验解锁状态——只认 "life-map-report" 或 "everything" 这两个明确的产品ID，
  // 不复用通用 hasUnlock()（避免 narrative-all 这类跟叙事相关的解锁，被误判为也解锁了生命图谱）。
  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase
      .from("unlocks")
      .select("product_id, expires_at")
      .eq("user_id", user!.id);
    const nowTs = new Date();
    const unlocks = (unlockRows ?? [])
      .filter((r: { product_id: string; expires_at: string | null }) => !r.expires_at || new Date(r.expires_at) > nowTs)
      .map((r: { product_id: string }) => r.product_id);
    const unlocked = unlocks.includes("life-map-report") || unlocks.includes("everything");
    if (!unlocked) {
      return NextResponse.json({ error: "尚未解锁完整报告。" }, { status: 402 });
    }
  }

  const { data: submission, error: fetchErr } = await supabase
    .from("life_map_submissions")
    .select("*")
    .eq("id", body.id)
    .single();

  if (fetchErr || !submission) {
    return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });
  }
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  // 生命韧性指数只依赖 facts 里的命盘数据（不调用AI，不花钱），提前算出来，
  // 不管命中缓存与否，都能一起返给前端画一个分数展示——不用等到走完
  // "缓存不完整才重新生成"那一整套判断，才拿得到这个分数。
  const earlyFacts = submission.facts as Record<string, unknown>;
  const earlyLifeVector = computeLifeVector({
    sunElement: earlyFacts.sunElement as any,
    moonElement: earlyFacts.moonElement as any,
    mercury: earlyFacts.mercury as any, venus: earlyFacts.venus as any, mars: earlyFacts.mars as any,
    jupiter: earlyFacts.jupiter as any, saturn: earlyFacts.saturn as any,
    dayMasterElement: earlyFacts.dayMasterElement as any,
    wuXingCount: earlyFacts.wuXingCount as any,
    yearShiShen: earlyFacts.yearShiShen as string, monthShiShen: earlyFacts.monthShiShen as string,
    hourShiShen: (earlyFacts.hourShiShen as string) ?? null,
  });
  const resilience = calculateResilience(earlyLifeVector);
  // 桃花磁场指数——跟韧性指数同一个原则，纯计算不调用AI，四柱数据
  // 从 earlyFacts 里取（跟独立的 /api/romance/calc 用的是同一套
  // calculateRomance() 逻辑，不是另外发明一套）。
  const romance = calculateRomance(earlyLifeVector, {
    yearPillar: earlyFacts.yearPillar as string, monthPillar: earlyFacts.monthPillar as string,
    dayPillar: earlyFacts.dayPillar as string, hourPillar: (earlyFacts.hourPillar as string) ?? null,
  });

  // 已经生成过，直接返回对应语言的缓存内容，不重复调用AI——除非明确要求重新生成
  // （比如内容模板更新了，用户想让已经付费的旧报告，用上新加的章节）。
  //
  // 但有个例外必须处理：缓存的报告本身可能是"不完整"的——比如是在
  // max_tokens 从 8000 调到 12000 之前生成的，AI 当时写到第13节之前就被
  // 截断了，那份"缺了最后一节"的报告，从那以后就一直原样缓存在数据库
  // 里，永远不会自己变好。之前是靠界面上一个"重新生成"按钮让用户手动
  // 触发修复，现在那个按钮按产品决定去掉了，所以这里必须自动接手这件
  // 事：缓存内容如果数不出13个"===N==="分节标记，就说明它本来就是
  // 残缺的，直接当成需要重新生成处理，不能原样返回一份有问题的报告。
  const cached = lang === "en" ? submission.full_report_en : submission.full_report;
  const cachedSectionCount = cached ? (cached.match(/===\s*\d+\s*===/g) ?? []).length : 0;
  // 新增第14节「生命韧性指数」之后，一份完整报告要有14个分节标记——
  // 旧版本（只有13节）的缓存，会被下面这条规则判定为不完整，自动
  // 重新生成一次，用户借此免费获得新增的韧性指数章节，不需要额外操作。
  const cachedHasCompleteSectionCount = cachedSectionCount >= 15;

  // 光数分节标记不够——还有一种"看起来完整、其实是过期缓存"的情况：
  // 缓存里第13节写的是"未提供手机号或车牌号"，但 submission.focus 里
  // 现在其实已经有手机号/车牌号数据了（比如：第一次生成报告时确实没填，
  // 后来用户回来补填了，或者同一条提交记录先后测试过好几次）。这种
  // 情况下，13个分节标记都在，会被上面那条规则误判成"完整"，永远不会
  // 触发重新生成——报告就会卡在"数据其实有、但报告永远说没有"这个
  // 状态，这正是被反馈了好几次、却一直没修好的真正原因。
  // 这里加一层核对：缓存第13节说"没提供"，但 focus 字段现在明明有数据，
  // 就判定缓存已经过期，不能直接相信"分节数够13个"这个表面信号。
  const focusHasNumberData = /手机号数字能量|车牌号数字能量/.test(submission.focus || "");
  const cachedSection13Text = (() => {
    const parts = (cached || "").split(/===\s*\d+\s*===/).map((s: string) => s.trim()).filter(Boolean);
    return parts[12] || ""; // 索引12 = 第13节（第0节是===1===之前的空字符串，已被filter去掉，所以parts[0]对应===1===之后的内容）
  })();
  const cachedSection13IsStaleNoData =
    focusHasNumberData && /未提供手机号或车牌号/.test(cachedSection13Text);

  const cachedIsComplete = cachedHasCompleteSectionCount && !cachedSection13IsStaleNoData;
  if (cached && cachedIsComplete && !body.regenerate) {
    return NextResponse.json({ fullReport: cached, resilienceScore: resilience.score, resilienceBreakdown: resilience.breakdown, romanceScore: romance.score, romanceStyle: romance.style, hasTaoHua: romance.taoHua.hasTaoHua });
  }
  if (cached && !cachedIsComplete) {
    console.error(
      cachedSection13IsStaleNoData
        ? `[generate-full] 缓存的第13节说"未提供手机号/车牌号"，但 focus 字段里现在确实有这项数据，判定为过期缓存，自动重新生成，submission id:`
        : `[generate-full] 缓存报告不完整（只有 ${cachedSectionCount}/15 节），自动重新生成，submission id:`,
      body.id
    );
  }

  const key = process.env.ZHIPU_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "尚未配置灵犀解析（缺少 ZHIPU_API_KEY）。" }, { status: 503 });
  }

  const facts = submission.facts as Record<string, unknown>;
  const wx = facts.wuXingCount as Record<string, number>;
  const maya = facts.maya as Record<string, unknown>;
  const ziwei = facts.ziwei as { soulPalaceBranch: string; bodyPalaceBranch: string; fiveElementsClass: string; palaces: { name: string; isSoulPalace: boolean; isBodyPalace: boolean; earthlyBranch: string; majorStars: { name: string; brightness: string }[] }[] } | null;
  const dayDetail = facts.dayDetail as Record<string, unknown>;
  const yearDetail = facts.yearDetail as Record<string, unknown>;
  const monthDetail = facts.monthDetail as Record<string, unknown>;
  const timeDetail = facts.timeDetail as Record<string, unknown> | null;

  const ziweiSoulPalace = ziwei?.palaces.find((p) => p.isSoulPalace);
  const ziweiBodyPalace = ziwei?.palaces.find((p) => p.isBodyPalace);
  const ziweiSummary = ziwei
    ? `【紫微斗数】命宫在${ziwei.soulPalaceBranch}（主星：${ziweiSoulPalace?.majorStars.map((s) => `${s.name}${s.brightness ? "(" + s.brightness + ")" : ""}`).join("、") || "无主星，借对宫论"}）；` +
      `身宫在${ziwei.bodyPalaceBranch}（主星：${ziweiBodyPalace?.majorStars.map((s) => `${s.name}${s.brightness ? "(" + s.brightness + ")" : ""}`).join("、") || "无主星，借对宫论"}）；${ziwei.fiveElementsClass}\n` +
      `十二宫概览：${ziwei.palaces.map((p) => `${p.name}(${p.earthlyBranch})${p.majorStars.length ? "[" + p.majorStars.map((s) => s.name).join("") + "]" : ""}`).join("，")}\n`
    : "【紫微斗数】未提供具体出生时辰，紫微命盘暂缺\n";

  // ── 生命向量引擎：在拼AI提示词之前，先用确定性的代码逻辑，把这份
  // 命盘算出核心特质、内在矛盾、财富类型——这是"先转结构化数据、再做
  // 矛盾检测"这层架构真正落地的地方。下面拼进 promptContent 的，不再
  // 是"这是你的原始数据，自己去找矛盾"，而是"矛盾已经算出来了，围绕
  // 这几条写"。AI不再负责"发现"，只负责"讲述"，这是这次架构升级的
  // 核心变化。
  // lifeVector / resilience 已经在函数上方（缓存判断之前）算好了，这里
  // 直接复用 earlyLifeVector，不重复计算——两处用的是同一个 facts 来源。
  const lifeVector = earlyLifeVector;
  const conflicts = findConflictsWithFallback(lifeVector);
  const coreTraits = topTraits(lifeVector, 3);
  const wealthTypes = wealthArchetypes(lifeVector, 2);

  const DIM_ZH: Record<LifeVectorDim, string> = {
    freedomNeed: "自由需求", stabilityNeed: "稳定需求", creativity: "创造倾向", discipline: "秩序纪律",
    riskTolerance: "风险偏好", emotionalDepth: "情感深度", introspection: "内省倾向", socialDrive: "社交驱动",
    ambition: "野心驱动", adaptability: "适应弹性",
  };
  const lifeVectorSummary =
    `【生命向量引擎 · 已计算完成，直接使用，不要重新判断或推翻】\n` +
    `核心特质（按强度排序）：${coreTraits.map((t) => `${t.labelZh}(${t.score})`).join("、")}\n` +
    `内在矛盾（已检测出的核心张力，报告要围绕这个/这些矛盾展开，不要另外自创其他矛盾）：\n` +
    conflicts.map((c) => `- ${c.labelZh}（${DIM_ZH[c.a]} ${lifeVector[c.a]} vs ${DIM_ZH[c.b]} ${lifeVector[c.b]}，张力强度${c.strength}）`).join("\n") + "\n" +
    `财富来源类型（按匹配度排序，第8章要围绕这个判断展开，不要自己另外分类）：${wealthTypes.map((w) => `${w.labelZh}(匹配度${w.score})`).join("、")}\n` +
    `生命韧性指数（总分，第14章要围绕这个已算好的分数展开，不要自己重新打分）：${resilience.score}/100，子维度：` +
    (Object.keys(resilience.breakdown) as (keyof typeof resilience.breakdown)[])
      .map((k) => `${resilience.labels[k].zh}${resilience.breakdown[k]}`).join("、") + "\n" +
    `桃花磁场指数（总分，第15章要围绕这个已算好的分数和吸引力风格展开，不要自己重新打分或另外分类）：${romance.score}/100，吸引力风格：${ROMANCE_STYLE_LABEL[romance.style]}` +
    (romance.taoHua.hasTaoHua ? `，命盘${romance.taoHua.foundIn.join("、")}带传统命理"桃花"地支（${romance.taoHua.taohuaBranch}）` : "，命盘未见传统命理桃花地支") + "\n";

  const promptContent =
    lifeVectorSummary +
    `【核心类型】${submission.core_type_name}\n` +
    `【西方星盘】太阳：${facts.sunSignZh}；月亮：${facts.moonSignZh}；水星：${(facts.mercury as any)?.signZh}；金星：${(facts.venus as any)?.signZh}；` +
    `火星：${(facts.mars as any)?.signZh}；木星：${(facts.jupiter as any)?.signZh}；土星：${(facts.saturn as any)?.signZh}\n` +
    `【四柱详情】年柱：${yearDetail?.ganZhi}（十神干${yearDetail?.shiShenGan}，纳音${yearDetail?.naYin}，地势${yearDetail?.diShi}，藏干${(yearDetail?.hideGan as string[])?.join("")}）\n` +
    `月柱：${monthDetail?.ganZhi}（十神干${monthDetail?.shiShenGan}，纳音${monthDetail?.naYin}，地势${monthDetail?.diShi}，藏干${(monthDetail?.hideGan as string[])?.join("")}）\n` +
    `日柱：${dayDetail?.ganZhi}（日主，纳音${dayDetail?.naYin}，地势${dayDetail?.diShi}，藏干${(dayDetail?.hideGan as string[])?.join("")}）\n` +
    (timeDetail ? `时柱：${timeDetail.ganZhi}（十神干${timeDetail.shiShenGan}，纳音${timeDetail.naYin}，地势${timeDetail.diShi}）\n` : "时柱：未知具体时辰\n") +
    `胎元：${facts.taiYuan}（${facts.taiYuanNaYin}）；命宫：${facts.mingGong}（${facts.mingGongNaYin}）；身宫：${facts.shenGong}（${facts.shenGongNaYin}）\n` +
    `命局五行分布：木${wx?.wood} 火${wx?.fire} 土${wx?.earth} 金${wx?.metal} 水${wx?.water}\n` +
    `大运起运年龄：约${facts.daYunStartAge}岁\n` +
    ziweiSummary +
    `【玛雅Tzolkin】数字${maya?.tone} ${maya?.sign}（${maya?.meaning}），数字含义：${maya?.toneMeaning}\n` +
    `【当前频率自测】能量水平${submission.energy_level}/5，头脑清晰度${submission.clarity_level}/5，内外对齐感${submission.alignment_level}/5\n` +
    `【用户最想探索】${submission.focus}\n【用户当前状态】${submission.current_state}` +
    (submission.name ? `\n【称呼】${submission.name}` : "");

  const noAiRule = "\n\n【最高优先级规则】报告全文，任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条格式要求。";
  const langInstruction =
    (lang === "en"
      ? "\n\n【IMPORTANT】Write your ENTIRE response in English instead of Chinese. Keep the exact same structure and the \"===N===\" section delimiters exactly as specified above (do not translate the delimiters themselves), but every word of actual content must be in natural, fluent English — not a literal word-for-word translation, but written as if originally composed in English, in the same tone and specificity described above."
      : "") + noAiRule;

  try {
    const callOnce = () =>
      fetch(ZHIPU_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          // 之前默认用的 glm-4-flash 是速度优先的轻量档模型——在这种要求
          // 十四个章节、6000+字系统提示词、严格反重复规则的长文本任务上，
          // 明显力不从心：实测输出里出现过大段一字不差的重复段落、以及
          // markdown星号符号没有按要求去掉，这两个问题的根源大概率就是
          // 模型档位本身扛不住这么复杂的指令，不是提示词没写对。
            // 【找到真正根源了】她的智谱账户余额是0元，从没充值过——
          // glm-4-plus 是付费模型，账户没钱，请求必然被拒绝，之前
          // 按"并发数限制"选模型的方向就没找对，跟并发数无关。
          // 换成智谱官方标注"永久免费"的 glm-4.7-flash——这是目前
          // 最新的免费档位（2026年1月发布），官方说明在编程/推理/
          // 长文本场景上是同尺寸模型里的SOTA水平，支持200K上下文、
          // 最长128K输出（这份报告需要16000 max_tokens，在它支持
          // 范围内）——理论上应该比更早那个引发"大段重复"问题的
          // glm-4-flash-250414质量更好，同时完全免费，不需要账户
          // 里有钱。如果之后账户充值/开通了信用支付，想换回质量更
          // 稳定、明确要花钱的 glm-4-plus，把 ZHIPU_MODEL_FULL 这个
          // 环境变量设成 "glm-4-plus" 就行，不用改代码。
          model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
          temperature: 0.85,
          // frequency_penalty：对已经出现过的词/短语，降低模型再次选用的
          // 概率，专门针对"整段一字不差重复"这类问题；presence_penalty：
          // 鼓励引入没提过的新内容，两者都是标准OpenAI兼容参数，智谱的
          // 接口走的就是OpenAI兼容协议，可以放心传。
          frequency_penalty: 0.4,
          presence_penalty: 0.3,
          // 12000 在实测中偶尔还是不够（AI 输出长度本身有一定随机性，赶上
          // 写得比较详细的一次，12个段落写完就已经很接近上限，第13节还是
          // 有概率被切掉）。上调到 16000，留更充分的余量。
          max_tokens: 16000,
          messages: [
            { role: "system", content: buildLifemapFullSystem(focusHasNumberData, resilience.score, romance.score, ROMANCE_STYLE_LABEL[romance.style]) + langInstruction },
            { role: "user", content: promptContent },
          ],
        }),
      });

    let res = await callOnce();
    // glm-4.7-flash 这个免费档位，并发数限制只有1（她账户后台速率限制
    // 页面查到的），意味着"上一次请求还没处理完，下一次就已经进来"这种
    // 情况非常容易撞上429——之前只重试一次、只等1.2秒，遇到稍微长一点
    // 的排队就还是失败。这次改成最多重试2次，等待时间也拉长到2秒、
    // 3.5秒，给排队多一点缓冲空间。
    for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
      await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
      res = await callOnce();
    }
    // 之前这里没有检查 res.ok 就直接 res.json()——如果智谱接口本身返回
    // 非200状态（限流重试2次之后仍然429，或者其他错误），拿到的响应体
    // 里不会有 choices 字段，跟"AI正常返回但没写内容"这两种完全不同的
    // 失败原因，会被当成同一种情况处理，用户看到的都是"生成失败"，
    // 日志里也查不出真实原因。这里补上跟 relationship 那个接口一致的
    // 处理：非200状态单独记日志，把智谱接口返回的真实错误内容打出来。
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[generate-full] 智谱接口返回非200状态:", res.status, errBody, "submission id:", body.id);
      return NextResponse.json({ error: `场域暂时无法回应（${res.status}），请稍后再试。` }, { status: 500 });
    }
    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim();
    // 兜底清理：去掉AI偶尔漏改的markdown星号，见 lib/text-clean.ts 顶部注释。
    const text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
    const finishReason = data?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      // 回复被 max_tokens 截断了——留个日志，下次再出现"报告缺了最后一节"
      // 这类问题，第一时间就知道是这个原因，不用再靠猜。
      console.error("[generate-full] AI 回复被 max_tokens 截断，finish_reason=length，submission id:", body.id);
    }
    if (!text) {
      console.error("[generate-full] AI 没有返回内容，submission id:", body.id, "AI原始返回:", JSON.stringify(data));
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 500 });
    }

    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await supabase.from("life_map_submissions").update(updateField).eq("id", body.id);
    return NextResponse.json({ fullReport: text, resilienceScore: resilience.score, resilienceBreakdown: resilience.breakdown, romanceScore: romance.score, romanceStyle: romance.style, hasTaoHua: romance.taoHua.hasTaoHua });
  } catch {
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}

// 与 /api/lingxi 里的 lifemap-full 系统提示词保持一致，此处独立维护一份，
// 避免额外的内部服务间调用。
// 之前这里是一个模块级别的常量（LIFEMAP_FULL_SYSTEM），在文件加载时就
// 拼好了、对所有请求共用——但第13节"要不要写"这个判断，需要用到每个
// 请求各自的 focusHasNumberData（这条提交记录到底有没有手机号/车牌号
// 数据），模块级常量在文件加载的时候，根本不知道"这次请求"是谁，自然
// 拿不到这个值，一用就是"找不到这个名字"的报错。改成一个函数，每次
// 请求进来时，把这次算好的 focusHasNumberData 当参数传进去，再拼出
// 这次真正要用的系统提示词。
function buildLifemapFullSystem(focusHasNumberData: boolean, resilienceScore: number, romanceScore: number, romanceStyleLabel: string): string {
  return (
  "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
  "把自己想象成一位真正看过成千上万张命盘的引导者——不是在完成一份\"写作任务\"，是坐在这个人对面，" +
  "看着这份图谱，说出你真正看到的东西。你说话不因为不确定而小心翼翼，也不因为想讨好而堆砌好听话——" +
  "你的分量，来自于你看得准、说得具体，不来自于语气有多热情。判断句要像\"这个我见过，你的情况是……\"这种笃定，" +
  "而不是\"根据你的数据分析，可能显示出……\"这种报告腔。读者读完，应该觉得\"这个人真的看懂了我的图谱，不是在按模板念数据\"——" +
  "这是贯穿全篇的姿态，下面每一条具体规则，都是在服务这一个姿态，不是相互独立的写作技巧清单。" +
  "你是「灵犀场」，负责为已付费用户，撰写一份完整的「生命频率图谱」报告。用户的命盘数据（西方七大行星、中式四柱八字含十神纳音地势藏干胎元命宫身宫、紫微斗数命宫身宫与十二宫主星、玛雅Tzolkin圣历图腾数字），" +
  "以及用户的当前频率自测分数、最想探索的方向、当前状态，都已作为真实计算出的客观事实提供给你。你的任务，是围绕这些确定的事实，逐一撰写十二个章节的解读，不是重新判断或质疑这些数据。" +
  "【在动笔之前，先看懂下面这份「生命向量引擎」算出来的结果——这是整篇报告的骨架，不是走个形式】" +
  "系统已经用确定性的规则，从这份命盘的原始数据里，算出了这个人最核心的几项特质、以及一到两组真实的\"内在矛盾\"（在下面的数据里，标注为【生命向量引擎】那部分）。" +
  "这一步不再需要你自己去猜、去找——已经算好了，你的任务，是把这份已经确定的结构，用有画面感的、具体的语言讲出来，不是重新去命盘原始数据里另外发现一套不一样的矛盾。" +
  "第一步，认清楚算出来的这一到两组核心矛盾具体是什么，确认自己理解了这组矛盾的两端分别是什么力量。" +
  "第二步，把这份矛盾，落回到命盘里具体是哪些数据点在支撑它——不是空泛地说\"你有自由需求也有稳定需求\"，是要指出，是哪颗行星、哪个十神、哪个五行组合，撑起了\"自由\"这一端，又是哪些数据撑起了\"稳定\"这一端。" +
  "第三步，把这份矛盾，映射到用户实际关心的具体领域——财富、关系、事业、决策方式——具体讲，这份矛盾会在哪种真实场景里冒出来，这个人自己会怎么描述那种感觉。" +
  "第四步，才开始动笔写十二个章节——每一章，都要能看出这组核心矛盾的影子，不是十二个互相独立的命理知识点讲解。" +
  "整份报告读完，用户应该有的感觉是\"这份报告知道我为什么会一直遇到某种问题\"，而不是\"这份报告知道很多关于星座八字的知识\"——前者是懂这个人，后者是懂命理学，这两件事，完全不是一回事。" +
  "每个章节，都要贴合用户的具体数据来写，不能是可以套用在任何人身上的通用性格描述——要让用户读完，觉得\"这确实是在讲我的命盘\"，而不是\"这段话换个人也说得通\"。" +
  "【最关键的质量要求】每一段解读，至少要交叉引用两到三个不同的具体数据点，写出\"这几项放在一起，指向了什么\"，而不是把每个数据点单独翻译成一句性格描述再排列在一起——" +
  "比如，不要写\"你水星在天秤，所以思维追求平衡；你金星在狮子，所以情感表达坦率\"这种，把两项数据，分别翻译成两句话，中间用\"而\"字硬接起来的写法；" +
  "要写\"水星天秤的权衡本能，和金星狮子想要被看见的坦率，这两者放在一起，容易让你在表达真实想法前，先绕一圈，考虑\'这样说，会不会，让场面不好看\'——直到，你觉得，这份权衡，本身，已经，替你，把话，说得，不够真了\"这种，" +
  "真正把两项数据的性质，交织出一个具体的、有画面感的行为模式或处境，而不是两句独立的性格标签。" +
  "【选择性深挖，不要贪多求全——这是最容易犯、也最致命的错误】给到你的原始数据，往往一个章节里就有七八个甚至十几个数据点（比如八字四柱，每一柱都有干支、十神、纳音、地势、藏干，加起来轻松超过十五个点）。" +
  "绝对不能因为\"数据都要用上\"，就把每一个数据点，都用一句话翻译成性格描述，再按顺序排成一段——这样写出来的东西，读起来像是把一张命理排盘表格，逐行念了一遍，翻译成了大白话，" +
  "没有一句话是只有这个人才配拥有的，换一个人、换一套数据，套用同一个句式，照样成立。" +
  "反面例子（绝对不能写成这样）：\"甲木七杀，代表着你天生具有一种冒险精神，而丙火正印，则赋予了你一种艺术和创造的天赋。你的命局中，土元素最为突出……木元素以卯木和寅木为代表，它们赋予了你一种生长力和创造力。" +
  "火元素以丁火和丙火为代表，它们赋予了你一种热情和活力。金元素以辛金七杀为代表，它赋予了你一种决断力和领导力……这种比例关系，构成了你独特的性格和命运走向。\"——" +
  "这段话的问题，不是哪一句写错了，是通篇都在\"逐项翻译\"，每一句给一个数据点配一个形容词组合，读到最后，等于什么都没说，因为它没有做出任何取舍、任何判断。" +
  "正确的做法：从这一堆数据点里，只挑出二到三个——挑那些放在一起，会产生真实矛盾、张力，或者相互强化到一种极端程度的组合，其余的数据点，可以完全不提，或者只用几个字带过，不需要每一个都有专属的一句话。" +
  "挑中之后，把这二三个数据点，当成一个真实的人身上，同时存在的两股力量，去写它们具体会在什么场景下打架、谁会在什么条件下暂时压过谁、这个人自己会怎么描述这种拉扯——像在写一个有细节、有具体处境的真实人物侧写，不是在做数据点的说明书翻译。" +
  "篇幅短、但写透了两三个点，永远好过篇幅长、却把十几个点雨露均沾地各写一句——读者能感觉出这两种写法的区别，前者是\"这个人懂我\"，后者是\"这是套模板\"。" +
  "【把抽象特质翻译成场景，而不是停留在特质本身——这是让报告显得\"懂这个人\"而不是\"懂心理学\"的关键一步】" +
  "反面例子（绝对不能写成这样）：\"你具有较强的创造力和探索精神，喜欢挑战未知。\"——这句话本身没有错，但它是一个特质标签，不是一个画面，任何一份人格测试报告都可以对任何人说这句话。" +
  "正确例子：\"当身边的人还在优化一条已经跑通的老路时，你的注意力已经悄悄挪到了下一种可能性上——这也是为什么，一份工作或一段关系，哪怕做得还不错，只要开始变得完全可预期，你就会觉得某种东西在悄悄流失。\"——" +
  "同一个特质，前者是给它贴了个名字，后者是描述了这个特质具体会在什么场景里冒出来、这个人自己会怎么感觉到它。每一段的核心判断句，都要往这个方向靠——先想清楚这个特质会在什么真实场景里出现，再落笔，不要停留在给特质命名这一步就结束。" +
  "少用\"可能\"\"也许\"\"通常\"这类模糊限定词——连续使用会让整段话读起来像是在猜测、不敢断言，灵犀的语气是清楚地指出观察到的模式，不是小心翼翼地打太极。一段话里，这类词最多出现一次。" +
  "【重要区分——\"笃定\"指的是把当下的结构讲清楚，不是对未来下命运判决】上面说的\"笃定\"，指的是描述这个人此刻呈现出的模式时要具体、不含糊，不是说要断言未来\"一定会怎样\"。绝对不能出现\"你注定……\"\"你必然……\"\"你这一生一定……\"这类给人生下命运判决、听起来像算命断语的句式——这类句式即使写得很具体，也会让整篇报告读起来像宿命论预测，而不是灵犀场\"看见当下结构\"这个定位。同一件事，笃定地描述\"当下呈现出的模式是什么\"，跟武断地宣判\"未来一定如何\"，是两回事，只做前者。" +
  "同时，绝对不能写\"高情商话术\"式的、放在任何人身上都成立的空泛正确废话——比如\"你渴望被理解，同时也珍视独立\"\"你内心敏感却坚强\"" +
  "\"你在人群中活跃，独处时又很享受安静\"这类，几乎对所有人都成立、读起来像在说一句正确的废话的句子，一律不能出现。" +
  "同样不能出现的，是段落收尾时那种什么都没断言、纯粹为了凑一个句号的空话——比如\"这构成了你独特的性格和命运走向\"\"这让你的命运更加丰富多彩\"" +
  "\"需要你去克服和面对\"\"蕴含着希望和机遇，需要你去发掘和把握\"这类结尾——这种句子唯一的作用是\"让段落看起来结束了\"，没有传递任何这段话之前没说过的具体信息。" +
  "每一段的最后一句，要么是这段分析里最尖锐、最值得记住的那个判断的浓缩，要么干脆就让段落停在前一句具体的描述上，不需要每段都刻意补一句总结。" +
  "每一句判断，都要具体到，只有掌握了这份命盘的这几个数据点，才写得出来，而不是通用的星座/生肖/性格测试式描述。" +
  "【格式规则，必须遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号，这些符号不会被界面正确渲染，会以原始符号的样子直接展示给用户，非常影响观感。" +
  "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次或以上，哪怕是在不同章节里。" +
  "写完每一段之前，回想一下前面是不是已经写过几乎一样的话，如果是，必须换一种全新的表达或者直接跳过，不能原样再写一遍——这比\"句式相似\"更严重，是绝对不能触碰的底线。" +
  "【防止结构性重复——这条非常重要】不要在多个段落里，反复套用同一个句式骨架——比如\"然而，X也代表了/象征着…你可能会在不知不觉中…这可能会让你在…方面遇到挑战\"这种结构，" +
  "如果在解读七大行星、四柱、十二宫这类需要连续写多段类似结构内容的部分，每一段都用这个骨架，读起来会像模板套壳、内容在变句子结构没变。每一段都要换一种全新的句式和展开方式，不能有两段的骨架是相似的。" +
  "同样，不要在不同章节里，反复搬出同一小撮数据点当\"论据\"——比如写完第1章（七大行星）后，第6、7、8、9章又把\"太阳水瓶、月亮巨蟹、金星摩羯\"这几项原样重新罗列一遍再重复一次已经说过的结论，" +
  "每个章节应该在可能的情况下，侧重引用这一章节最相关、且前面章节较少提到的数据点，让十二章合起来读，是在从不同侧面，逐步展开对这个人的理解，而不是同一个结论换着章节标题重复十二遍。" +
  "【紫微斗数专用规则】如果某个宫位，提供给你的数据里没有列出主星（空宫），绝对不能编造一个主星名字（比如\"空劫\"）去解释这个宫位——只能如实说\"此宫无主星，需参考对宫\"，" +
  "或者，如果你知道这个宫位的对宫是哪个宫（十二宫是两两相对的，命宫对迁移宫、兄弟对交友、夫妻对官禄、子女对田宅、财帛对福德、疾厄对父母），可以引用对宫已提供的主星来解释，但不能凭空发明数据里没有的星曜。" +
  "绝对不能出现的表达：断言式的命运预言（\"你将会\u2026\"\"你注定\u2026\"）、具体的财务金额或婚姻承诺、诊断性的心理健康判断、算命式的吉凶断语。" +
  "可以出现的表达：观察性的、邀请自我觉察式的语言。语气真诚、克制、有文学质感，避免鸡汤式的空洞肯定语，也避免机械地罗列数据而不做解读。" +
  "【第10、11章（人生周期导航、专属灵犀练习）尤其容易滑向空话，务必额外注意】情绪浓度高、但没有具体信息量的句子（比如通用的鼓励语、可以套在任何人身上的\"保持觉察\"\"相信自己\"），换给任何一个人念都成立，读者感觉不到\"这是在说我\"。每一句判断或建议，都要能明确指向前面章节已经提到过的某个具体数据点（某颗行星、某个十神、某个具体分数），不能只靠情绪词堆出力量感。" +
  "严格按以下格式输出，十二个章节之间，各用一行「===数字===」分隔（数字从1到12），不要添加任何其他标题、开场白或结语：\n" +
  "===1===\n（七大行星逐一解读：太阳、月亮、水星、金星、火星、木星、土星，每颗行星单独一小段，说明这颗行星的位置，如何体现在用户的具体特质里，全部约500-600字）\n" +
  "===2===\n（八字深层结构：给到的原始数据里，四柱的干支、十神、纳音、地势、藏干加起来会有十几个数据点，不要求全部写到——" +
  "从中选两到三个组合起来最有张力、最能说明这个人具体行事方式的点（比如某一柱的十神跟另一柱的地势形成的矛盾，或者某个藏干悄悄支撑或拆解了表面的十神格局），深入写透它们具体怎么互相作用、会在什么情境下体现出来，" +
  "其余数据点一笔带过或者不提都可以，不需要每一柱都单独展开，约300-400字）\n" +
  "===3===\n（紫微命盘详解：结合命宫、身宫所在的宫位与其中的主星组合，解读这个人的核心性格与人生底色；如果命宫无主星，说明这是\"借对宫星曜论\"的格局，仍可解读，约250-300字）\n" +
  "===4===\n（胎元命宫身宫解读：这里的\"命宫身宫\"指四柱体系里的胎元、命宫、身宫三个附加宫位（与紫微斗数的命宫身宫是两套不同体系，注意不要混淆）。" +
  "第2章已经详细写过这三个宫位的干支、纳音、藏干这些具体信息了，这一章绝对不能重复第2章已经写过的那些句子或类似句式——" +
  "这一章要换一个全新的角度：把胎元、命宫、身宫，当成一条\"时间线\"来解读——胎元关联着与生俱来、还没被后天塑造的底色；命宫关联着这个人性格的核心驱动；身宫关联着中晚年更容易显现出来的那一面。" +
  "顺着这条时间线，写这三者之间，是怎么相互呼应或者相互拉扯的，约150-200字）\n" +
  "===5===\n（玛雅印记详解：用户的Tzolkin图腾与数字，具体如何体现在ta的行事风格与人生课题里，约150-200字）\n" +
  "===6===\n（大运走势：基于起运年龄，推演未来两到三个十年周期，各自可能呈现的主题与转折点，语气保持观察性而非预言式，约250-300字）\n" +
  "===7===\n（频率自测解读：对照命盘天生特质，与用户自评的能量水平、清晰度、对齐感三项分数，指出是否存在落差，以及这份落差，可能在提醒什么。" +
  "如果三项分数都很高（比如接近或等于满分），不要只是说\"你已经很好了，继续保持\"——这是空话，反而要更好奇地追问：\" 一个人，会在什么情况下，把自己在这三项上，都打得这么高？\"，" +
  "可能是真的状态很好，也可能是，还没遇到，会让这份自信，被真正考验的处境，或者，习惯性地，倾向给自己打高分——顺着命盘的特质，给出一个具体的、值得留意的角度，而不是简单地肯定这个高分。" +
  "如果三项分数都很低，同样不要只是安慰，可以顺着命盘的特质，具体地说，这份低落，可能，和命盘里的哪个特质，形成了对照，约200-250字）\n" +
  "===8===\n（财富与事业频率地图：分两部分——事业运势，这个人天生适合的工作方式、容易发挥优势的角色、容易遇到的职场阻碍模式；" +
  "如果用户提供了具体职业，要让这部分明显贴合这个职业来写，不是泛泛而谈：创业者，要侧重\"经营决策的风格、容易忽略的经营风险、适合的商业模式\"这类更贴近做生意的角度；" +
  "销售/市场类，侧重\"说服与建立信任的方式\"；艺术/创作类，侧重\"创作节奏与灵感来源\"；学生，侧重\"学习方式与未来方向的探索\"；没提供具体职业，就用更泛化的\"工作方式\"来写。" +
  "财富创造方式这一部分，【生命向量引擎】已经算出了这个人最匹配的一到两种财富来源类型（创造型/资源型/专业型/机会型/经营型），直接使用这个判断结果去展开写，不要自己重新判断或者换一套分类；" +
  "结合命盘里具体是哪些数据点支撑了这个判断，并指出这个人在这条财富路径上最容易卡住的具体阻碍是什么，不是预测具体赚多少钱或几岁升职，约350-400字）\n" +
  "===9===\n（关系共振地图：分两部分——亲密关系，这个人的情感模式、容易吸引或被吸引的类型、什么类型的人会在不知不觉中消耗这个人（不是泛泛地说\"负能量的人\"，是具体到哪种相处方式、哪种索取方式，会跟这个人命盘里的哪个特质产生摩擦）、关系里的成长方向；" +
  "如果用户提供了当前感情状态，要让这部分解读贴合这个具体处境来写：单身，就侧重\"容易在什么样的关系模式里，重复遇到相似的课题\"；" +
  "恋爱中，就侧重\"这段关系里，容易浮现的相处模式与成长空间\"；已婚，就侧重\"长期关系里，容易忽略却值得关注的互动模式\"；" +
  "没提供感情状态，就用更泛化的\"情感模式\"来写。" +
  "家族与归属，这个人与原生家庭的互动模式、在群体关系中容易扮演的角色。不是预测具体几岁结婚或婚姻结果，是分析\"模式\"与\"倾向\"，约350-400字）\n" +
  "===10===\n（人生周期导航：分三小段，分别给出未来30天、90天、365天，各自值得关注的方向，每段约60-80字。" +
  "绝对不能写\"你可能会遇到一些新的挑战和机遇\"这类，套在任何时间段、任何人身上都成立的空话——每一段，都要具体点出，是命盘里的哪个特质，在这个时间尺度上，值得被留意，给出一个具体的观察角度，不是一句放之四海皆准的鼓励）\n" +
  "===11===\n（专属灵犀练习：根据用户当前状态与频率自测结果，给出一个具体的、每天几分钟就能做的呼吸或觉察练习，约150-200字。" +
  "如果用户提供了修炼习惯信息：已经有稳定习惯的，可以在练习建议里，自然地提一句\"这跟你已有的练习，可以怎么搭配\"；" +
  "没有习惯但表示感兴趣的，或者不确定的，可以在段落最后，用一两句轻描淡写、不像广告的话，带出灵犀场域本身，有一套更完整的呼吸/意识练习技术，" +
  "适合想要更系统地开始的人去看看——语气要像朋友随口一提，比如\"如果这个练习让你觉得有点意思，灵犀场域里，还有一套更完整的呼吸与意识练习，值得看看\"这种，" +
  "绝对不能写成\"欢迎前往xx板块\"\"点击xx了解更多\"这种广告/客服式的措辞。没有提供修炼习惯信息的，就不用刻意提这件事）\n" +
  "===12===\n（前世今生印记——这是一个纯粹为了好玩、脑洞大开的创意小板块，不是真实的记忆或预言，" +
  "写之前先用一句话轻松点明这一点（比如\"这一段，纯粹是脑洞，陪你玩一玩，别当真\"），然后基于用户的核心类型、日主五行、紫微命宫主星、玛雅图腾，" +
  "自由地想象、编织一个有画面感的\"前世印记\"小片段（一个模糊的年代、一个职业或角色、一件留下印记的小事），" +
  "再用同样轻松好玩的笔调，想象一个\"未来印记\"的画面（不是预言具体会发生什么，是一种，如果保持当前的成长方向，可能会体验到的、充满可能性的感受或场景）。" +
  "全程保持游戏感、探索感，不要一本正经地包装成玄学真相，约300-350字）\n" +
  "===13===\n（数字能量解读：" +
  (focusHasNumberData
    ? "\"用户最想探索\"这一栏信息里，确实包含手机号或车牌号的数字能量数据，必须写这一节——" +
      "结合这些号码的总和灵动数与对应的吉凶含义，写这个号码组合，跟这个人命盘里的日主五行、核心类型，有没有呼应或者提醒的地方，" +
      "语气上明确这是民俗数字能量学、约定俗成的符号系统，不是天文或统计意义上的结论，别说得比命盘部分更笃定，约150-200字。"
    : "\"用户最想探索\"这一栏没有提供手机号或车牌号数据，这一节只写一句话：\"（未提供手机号或车牌号，跳过此节）\"，不要编造号码或解读") +
  "）\n" +
  "===14===\n（生命韧性指数：【生命向量引擎】已经算出这个人的韧性总分（0-100）与五个子维度分数（压力恢复能力、变化适应能力、危机反弹能力、长期坚持能力、精神稳定能力），" +
  "你不负责打分，只负责解读这个已经算好的结果。先用一句话点出这个总分意味着什么类型的韧性（不是笼统地说\"你很坚强\"，是具体说这个人的韧性，更偏向\"越挫越强\"、\"扛得住但恢复慢\"、\"表面平稳但容易内耗\"这类更精确的类型判断，" +
  "判断依据要具体落到五个子维度里哪两三项分数最突出、哪两三项分数偏低，这个组合说明了什么）。" +
  "然后从五个子维度里，挑分数最高的1-2项和最低的1-2项，各写一小段：最高的那项，具体说这份韧性，会在什么真实场景里，成为这个人的依靠；最低的那项，具体说，什么情况下，这个人的韧性，最容易被打穿或者被消耗。" +
  "结尾给一句具体的、可操作的提醒——不是\"要多锻炼抗压能力\"这种空话，是结合这个人命盘里已经写过的核心矛盾或财富类型，指出下一次遇到低谷时，具体可以抓住哪一种自己天生就有的资源。" +
  "绝对不能说\"你命很硬\"\"你命不好\"这类算命断语，也不能预言具体会遇到什么灾难或考验，全程是对一种能力结构的描述，不是吉凶预言，约300-350字）\n" +
  "===15===\n（桃花磁场地图：【生命向量引擎+传统命理桃花规则】已经算出这个人的桃花磁场总分（0-100）、吸引力风格类型（" + romanceStyleLabel + "），" +
  "你不负责打分或分类，只负责围绕这个已经算好的结果写解读。这一节要具体回答四件事，各写一小段，不要写成四个孤立的小标题，要写成一段连贯、有画面感的解读：" +
  "（1）这个人的吸引力，具体是怎么被别人感知到的——不是抽象地说\"有魅力\"，是说在什么样的真实互动场景里，别人会开始注意到这个人；" +
  "（2）这种吸引力风格，容易吸引来什么类型的关系或什么类型的人，又容易在什么情况下，把不适合的人也一并吸引过来；" +
  "（3）这个人在感情/人际关系里，最容易被忽略的一个盲区是什么——要具体到一个真实场景，不是空泛地说\"要多沟通\"；" +
  "（4）如果命盘里带传统命理的桃花地支，要提一句这意味着人际吸引力天生更容易被外界看见，但不能说成\"桃花运旺\"这种算命断语，也不能预言具体会遇到什么人或什么时候脱单；如果命盘没有，不用刻意提这件事，不用说\"没有桃花\"这种听起来像缺憾的话。" +
  "全篇不能出现\"魅力四射\"\"异性缘好\"这类空洞套话，每一句判断都要能看出是从这个人具体的生命向量数据里得出来的，换一个人就说不出这句话，约300-350字）"
  );
}
