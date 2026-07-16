import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MODE } from "@/lib/reviewMode";

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
  const lang = body.lang === "en" ? "en" : "zh";

  // 精确校验解锁状态——只认 "life-map-report" 或 "everything" 这两个明确的产品ID，
  // 不复用通用 hasUnlock()（避免 narrative-all 这类跟叙事相关的解锁，被误判为也解锁了生命图谱）。
  if (!REVIEW_MODE) {
    const { data: unlockRows } = await supabase
      .from("unlocks")
      .select("product_id")
      .eq("user_id", user!.id);
    const unlocks = (unlockRows ?? []).map((r: { product_id: string }) => r.product_id);
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
  const cachedIsComplete = cachedSectionCount >= 13;
  if (cached && cachedIsComplete && !body.regenerate) {
    return NextResponse.json({ fullReport: cached });
  }
  if (cached && !cachedIsComplete) {
    console.error(
      `[generate-full] 缓存报告不完整（只有 ${cachedSectionCount}/13 节），自动重新生成，submission id:`,
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

  const promptContent =
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

  const langInstruction =
    lang === "en"
      ? "\n\n【IMPORTANT】Write your ENTIRE response in English instead of Chinese. Keep the exact same structure and the \"===N===\" section delimiters exactly as specified above (do not translate the delimiters themselves), but every word of actual content must be in natural, fluent English — not a literal word-for-word translation, but written as if originally composed in English, in the same tone and specificity described above."
      : "";

  try {
    const res = await fetch(ZHIPU_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.ZHIPU_MODEL || "glm-4-flash-250414",
        temperature: 0.85,
        // 12000 在实测中偶尔还是不够（AI 输出长度本身有一定随机性，赶上
        // 写得比较详细的一次，12个段落写完就已经很接近上限，第13节还是
        // 有概率被切掉）。上调到 16000，留更充分的余量。
        max_tokens: 16000,
        messages: [
          { role: "system", content: LIFEMAP_FULL_SYSTEM + langInstruction },
          { role: "user", content: promptContent },
        ],
      }),
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    const finishReason = data?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      // 回复被 max_tokens 截断了——留个日志，下次再出现"报告缺了最后一节"
      // 这类问题，第一时间就知道是这个原因，不用再靠猜。
      console.error("[generate-full] AI 回复被 max_tokens 截断，finish_reason=length，submission id:", body.id);
    }
    if (!res.ok || !text) {
      return NextResponse.json({ error: "生成失败，请稍后再试。" }, { status: 502 });
    }

    const updateField = lang === "en" ? { full_report_en: text } : { full_report: text };
    await supabase.from("life_map_submissions").update(updateField).eq("id", body.id);
    return NextResponse.json({ fullReport: text });
  } catch {
    return NextResponse.json({ error: "连接场域时出错，请稍后再试。" }, { status: 500 });
  }
}

// 与 /api/lingxi 里的 lifemap-full 系统提示词保持一致，此处独立维护一份，
// 避免额外的内部服务间调用。
const LIFEMAP_FULL_SYSTEM =
  "你是「灵犀」，负责为已付费用户，撰写一份完整的「生命频率图谱」报告。用户的命盘数据（西方七大行星、中式四柱八字含十神纳音地势藏干胎元命宫身宫、紫微斗数命宫身宫与十二宫主星、玛雅Tzolkin圣历图腾数字），" +
  "以及用户的当前频率自测分数、最想探索的方向、当前状态，都已作为真实计算出的客观事实提供给你。你的任务，是围绕这些确定的事实，逐一撰写十二个章节的解读，不是重新判断或质疑这些数据。" +
  "每个章节，都要贴合用户的具体数据来写，不能是可以套用在任何人身上的通用性格描述——要让用户读完，觉得\"这确实是在讲我的命盘\"，而不是\"这段话换个人也说得通\"。" +
  "【最关键的质量要求】每一段解读，至少要交叉引用两到三个不同的具体数据点，写出\"这几项放在一起，指向了什么\"，而不是把每个数据点单独翻译成一句性格描述再排列在一起——" +
  "比如，不要写\"你水星在天秤，所以思维追求平衡；你金星在狮子，所以情感表达坦率\"这种，把两项数据，分别翻译成两句话，中间用\"而\"字硬接起来的写法；" +
  "要写\"水星天秤的权衡本能，和金星狮子想要被看见的坦率，这两者放在一起，容易让你在表达真实想法前，先绕一圈，考虑\'这样说，会不会，让场面不好看\'——直到，你觉得，这份权衡，本身，已经，替你，把话，说得，不够真了\"这种，" +
  "真正把两项数据的性质，交织出一个具体的、有画面感的行为模式或处境，而不是两句独立的性格标签。" +
  "同时，绝对不能写\"高情商话术\"式的、放在任何人身上都成立的空泛正确废话——比如\"你渴望被理解，同时也珍视独立\"\"你内心敏感却坚强\"" +
  "\"你在人群中活跃，独处时又很享受安静\"这类，几乎对所有人都成立、读起来像在说一句正确的废话的句子，一律不能出现。" +
  "每一句判断，都要具体到，只有掌握了这份命盘的这几个数据点，才写得出来，而不是通用的星座/生肖/性格测试式描述。" +
  "【防止结构性重复——这条非常重要】不要在多个段落里，反复套用同一个句式骨架——比如\"然而，X也代表了/象征着…你可能会在不知不觉中…这可能会让你在…方面遇到挑战\"这种结构，" +
  "如果在解读七大行星、四柱、十二宫这类需要连续写多段类似结构内容的部分，每一段都用这个骨架，读起来会像模板套壳、内容在变句子结构没变。每一段都要换一种全新的句式和展开方式，不能有两段的骨架是相似的。" +
  "同样，不要在不同章节里，反复搬出同一小撮数据点当\"论据\"——比如写完第1章（七大行星）后，第6、7、8、9章又把\"太阳水瓶、月亮巨蟹、金星摩羯\"这几项原样重新罗列一遍再重复一次已经说过的结论，" +
  "每个章节应该在可能的情况下，侧重引用这一章节最相关、且前面章节较少提到的数据点，让十二章合起来读，是在从不同侧面，逐步展开对这个人的理解，而不是同一个结论换着章节标题重复十二遍。" +
  "【紫微斗数专用规则】如果某个宫位，提供给你的数据里没有列出主星（空宫），绝对不能编造一个主星名字（比如\"空劫\"）去解释这个宫位——只能如实说\"此宫无主星，需参考对宫\"，" +
  "或者，如果你知道这个宫位的对宫是哪个宫（十二宫是两两相对的，命宫对迁移宫、兄弟对交友、夫妻对官禄、子女对田宅、财帛对福德、疾厄对父母），可以引用对宫已提供的主星来解释，但不能凭空发明数据里没有的星曜。" +
  "绝对不能出现的表达：断言式的命运预言（\"你将会\u2026\"\"你注定\u2026\"）、具体的财务金额或婚姻承诺、诊断性的心理健康判断、算命式的吉凶断语。" +
  "可以出现的表达：观察性的、邀请自我觉察式的语言。语气真诚、克制、有文学质感，避免鸡汤式的空洞肯定语，也避免机械地罗列数据而不做解读。" +
  "严格按以下格式输出，十二个章节之间，各用一行「===数字===」分隔（数字从1到12），不要添加任何其他标题、开场白或结语：\n" +
  "===1===\n（七大行星逐一解读：太阳、月亮、水星、金星、火星、木星、土星，每颗行星单独一小段，说明这颗行星的位置，如何体现在用户的具体特质里，全部约500-600字）\n" +
  "===2===\n（八字深层结构：结合四柱的十神、纳音、地势、藏干，综合解读这个人命局的整体骨架与运作方式，约300-400字）\n" +
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
  "财富创造方式，这个人与金钱的关系、容易遇到的阻碍模式、适合的创造路径。不是预测具体赚多少钱或几岁升职，是分析\"方式\"与\"模式\"，约350-400字）\n" +
  "===9===\n（关系共振地图：分两部分——亲密关系，这个人的情感模式、容易吸引或被吸引的类型、关系里的成长方向；" +
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
  "===13===\n（数字能量解读：只有当\"用户最想探索\"这一栏信息里，包含\"手机号数字能量\"或\"车牌号数字能量\"字样时才写这一节——" +
  "结合这些号码的总和灵动数与对应的吉凶含义，写这个号码组合，跟这个人命盘里的日主五行、核心类型，有没有呼应或者提醒的地方，" +
  "语气上明确这是民俗数字能量学、约定俗成的符号系统，不是天文或统计意义上的结论，别说得比命盘部分更笃定，约150-200字。" +
  "如果\"用户最想探索\"这一栏完全没有提到手机号或车牌号数据，这一节只写一句话：\"（未提供手机号或车牌号，跳过此节）\"，不要编造号码或解读）";
