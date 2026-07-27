import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";
import { computeLifeVector, compareLifeVectors, findConflictsWithFallback, topTraits } from "@/lib/life-vector";
import { stripMarkdownArtifacts } from "@/lib/text-clean";

export const runtime = "nodejs";
// v225：见 app/api/qian/generate-full/route.ts 里同一处的详细注释——
// 默认的函数超时时间对这类长耗时 AI 调用来说太短，超时会被前端当成
// "连接场域时出错"展示，其实不是接口坏了。这个接口现在还多了一次
// 失败重试，更需要留够时间。
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

  const { data: submission } = await supabase
    .from("relationship_submissions")
    .select("*")
    .eq("id", body.id)
    .single();
  if (!submission) return NextResponse.json({ error: "找不到这份提交记录。" }, { status: 404 });

  // 安全修复（v225）：之前这里漏了归属校验——生命图谱、灵签、塔罗三个
  // 姊妹接口都会检查"这份提交记录是不是当前登录用户自己的"，唯独这个
  // 接口没做，导致理论上任何登录用户，只要拿到别人的 submission id，
  // 就既能读到别人的关系共振报告内容，又会绕开自己的付费状态、直接
  // 借用"提交记录所有者"是否已解锁来通过下面的解锁校验——不用付费就
  // 能生成一份不属于自己的报告。这里补上跟其余三个接口一致的校验。
  if (!REVIEW_MODE && submission.user_id !== user!.id) {
    return NextResponse.json({ error: "无权访问这份记录。" }, { status: 403 });
  }

  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase.from("unlocks").select("product_id, expires_at").eq("user_id", submission.user_id);
    const nowTs = new Date();
    const unlocks = (unlockRows ?? [])
      .filter((r: { product_id: string; expires_at: string | null }) => !r.expires_at || new Date(r.expires_at) > nowTs)
      .map((r: { product_id: string }) => r.product_id);
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
    return NextResponse.json({ fullReport: cached, resonance: { resonant, complementary, friction }, vectors: { a: vA, b: vB } });
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
    "【你是谁，在用什么姿态说话——这段定调，比后面任何一条具体规则都重要】" +
    "把自己想象成一位真正看过成千上万对关系的引导者——不是在完成一份\"写作任务\"，是坐在这两个人对面，" +
    "看着这两份图谱叠在一起，说出你真正看到的东西。你的分量，来自于你看得准、说得具体，不来自于语气有多热情。" +
    "判断句要像\"这种组合我见过，你们的情况是……\"这种笃定，而不是\"根据数据分析，可能显示出……\"这种报告腔。" +
    "读者读完，应该觉得\"这个人真的看懂了我们俩的关系，不是在按模板念数据\"——这是贯穿全篇的姿态。" +
    "你是「灵犀场」，负责撰写一份「关系共振图谱」——分析两个人之间的关系动力，可能是伴侣、可能是合伙人、可能是任何两人关系，具体类型见下方数据。" +
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
    "【第5段\"成长方向\"尤其容易滑向空话，务必额外注意】给的建议不能是\"多沟通\"\"要理解彼此\"这类适用于任何两人的话，也不能是情绪浓度高但没有具体信息量的排比句——每一条建议，都要能明确对应到前面已经提到过的某个具体共鸣点/互补点/摩擦点，读者要能看出\"这条建议是因为我们俩这个具体组合才成立的\"，不是随便两个人都适用的通用关系建议。" +
    "【重要区分——\"笃定\"指的是把当下的结构讲清楚，不是对未来下命运判决】上面说的\"笃定\"，指的是描述这两人此刻呈现出的模式时要具体、不含糊，不是说要断言这段关系\"一定会怎样\"。绝对不能出现\"你们注定……\"\"你们必然……\"\"你们就是……\"\"这段关系一定会……\"这类给关系下命运判决、听起来像算命断语的句式——这类句式即使写得很具体，也会让整篇报告读起来像宿命论预测，而不是灵犀场\"看见当下结构\"这个定位。同一件事，笃定地描述\"当下呈现出的模式是什么\"，跟武断地宣判\"未来一定如何\"，是两回事，只做前者。" +
    "【格式规则，必须遵守】全文只能是纯文字段落，绝对不能使用任何markdown语法——不能出现**加粗**、#标题、-或*开头的列表符号，这些符号不会被界面正确渲染，会以原始符号的样子直接展示给用户。" +
    "【绝对不能出现的最严重错误——逐字重复】同一句话、同一个段落，绝对不能在文中出现两次或以上，哪怕是在不同章节里。写完每一段之前，回想一下前面是不是已经写过几乎一样的话，如果是，必须换一种表达或者直接跳过。" +
    "严格按以下格式输出，五个章节之间，各用一行「===数字===」分隔（数字从1到5），不要添加任何其他标题、开场白或结语：\n" +
    "===1===\n（吸引来源：这两个人之间，最初的吸引/连接，最可能来自哪里——具体到是共鸣点的哪一项，或者互补点的哪一组，让两人有一种\"对上了\"的感觉，约250-300字）\n" +
    "===2===\n（关系动力：日常相处里，两人各自扮演什么角色，谁更倾向推动/谁更倾向稳定，这种动力模式会怎样具体地体现在日常互动里，约300-350字）\n" +
    "===3===\n（冲突地图：结合摩擦点，具体讲这段关系最容易在什么场景下起冲突，冲突通常会怎么发生、怎么升级，如果没有明显摩擦点，就讲最容易被双方共同忽略的盲区，约300-350字）\n" +
    "===4===\n（长期潜力：这段关系需要具备什么条件才能长期健康地走下去——不是预测结果，是指出具体需要建立的\"共识\"或者\"分工\"，约250-300字）\n" +
    "===5===\n（成长方向：给两人各自一条具体的、可操作的建议，说明为什么是这一条建议、跟这两人的具体特质如何对应，结尾可以轻描淡写地提一句灵犀场的修炼技术或生命图谱，语气像朋友随口一提，不能是广告腔，约200-250字）\n";

  const noAiRule = "\n\n【最高优先级规则】报告全文，任何情况下都不能出现\"AI\"这两个字母，也不能用\"人工智能\"\"机器人\"\"程序\"这类词替代——灵犀是「场」，不是「AI产品」，这条规则优先于其余任何一条格式要求。";
  const langInstruction = (lang === "en"
    ? "\n\n【IMPORTANT】Write your entire response in natural, fluent English (not Chinese), while keeping the exact ===N=== section markers."
    : "") + noAiRule;

  const messages = [
    { role: "system", content: system + langInstruction },
    { role: "user", content: resonanceSummary },
  ];

  try {
    const callOnce = () =>
      fetch(ZHIPU_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          // 同 lifemap 报告：换成免费的 glm-4.7-flash，理由见
          // app/api/lifemap/generate-full/route.ts 里同一处的详细
          // 注释（账户余额0元，glm-4-plus这类付费模型必然调用失败，
          // 跟并发数无关）。
          model: process.env.ZHIPU_MODEL_FULL || "glm-4.7-flash",
          messages,
          // v225：6000 对这份报告要求的 9-10 个章节来说偏紧——之前的表现
          // 是最后一到两个章节（比如"05·成长方向"）整段缺失，不是内容
          // 写得差，是配额不够写到那里就被截断了。参考 lifemap 报告
          // （12章用16000）的章节数/token比例，这里上调到9000。
          max_tokens: 9000,
          temperature: 0.85,
          frequency_penalty: 0.4,
          presence_penalty: 0.3,
        }),
      });

    let res = await callOnce();
    // glm-4.7-flash 并发数限制只有1，重试1次、等1.2秒经常不够——加到
    // 最多2次，等待时间也拉长，理由见 app/api/lifemap/generate-full/
    // route.ts 里同一处的详细注释。
    for (let attempt = 0; attempt < 2 && res.status === 429; attempt++) {
      await new Promise((r) => setTimeout(r, 2000 + attempt * 1500));
      res = await callOnce();
    }
    // 之前这里没有检查 res.ok 就直接 await res.json()——如果智谱接口本身
    // 拒绝了这次请求（比如请求体里混入了异常数值，返回4xx/5xx错误），
    // data 长得和"AI正常返回但没写内容"几乎一样（都没有 choices 字段），
    // 两种完全不同的失败原因，会被这里的代码当成同一种情况处理，用户
        // 看到的都是"生成失败，请稍后再试"，没法区分。这里把这两种情况
    // 分开记录到日志里，方便以后真出问题时能一眼看出是哪一种。
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[relationship generate-full] 智谱接口返回非200状态:", res.status, errBody, "submission id:", body.id);
      return NextResponse.json({ error: "灵犀场暂时无法回应，请稍后再试。" }, { status: 502 });
    }
    let data = await res.json();
    let rawText = data?.choices?.[0]?.message?.content as string | undefined;
    let text = rawText ? stripMarkdownArtifacts(rawText) : rawText;
    let finishReason = data?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      console.error("[relationship generate-full] AI 回复被 max_tokens 截断，重试一次。submission id:", body.id);
      const retryRes = await callOnce();
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        const retryRaw = retryData?.choices?.[0]?.message?.content as string | undefined;
        if (retryRaw) {
          data = retryData;
          rawText = retryRaw;
          text = stripMarkdownArtifacts(retryRaw);
          finishReason = retryData?.choices?.[0]?.finish_reason;
        }
      }
      if (finishReason === "length" && text) {
        console.error("[relationship generate-full] 重试后仍被截断，裁掉最后一段不完整内容。submission id:", body.id);
        const parts = text.split(/===\s*\d+\s*===/);
        const lastPart = parts[parts.length - 1]?.trim() ?? "";
        const endsCleanly = /[。！？.!?」”】]\s*$/.test(lastPart);
        if (!endsCleanly && parts.length > 1) {
          const cutIndex = text.lastIndexOf(lastPart);
          text = text.slice(0, cutIndex).trim();
        }
      }
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
      vectors: { a: vA, b: vB },
    });
  } catch (e) {
    console.error("[relationship generate-full] 出错:", e);
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}
