import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { computeLifeMapFacts, type BirthInput } from "@/lib/lifemap-calc";
import { calculateResilience, calculateWealthDetail, compareLifeVectors, computeLifeVector, topTraits } from "@/lib/life-vector";
import { drawThreeSigns } from "@/lib/qian-draw";
import { drawTarotSpread } from "@/lib/tarot-spread";
import { analyzePhoneNumber, analyzePlateNumber } from "@/lib/number-energy-calc";

export const runtime = "nodejs";
export const maxDuration = 30;

const SUPPORTED_PRODUCTS = new Set([
  "life-map-report", "relationship-resonance", "qian-reading", "tarot-reading",
  "resilience-report", "romance-report", "daily-tide-report", "wealth-report",
]);

type PersonPayload = {
  name?: unknown; year?: unknown; month?: unknown; day?: unknown;
  hour?: unknown; minute?: unknown; hasTime?: unknown;
  phone?: unknown; plate?: unknown;
};

type ExplorationProfile = {
  gender?: unknown; city?: unknown; profession?: unknown; relationshipStatus?: unknown;
  practiceStatus?: unknown; focus?: unknown; currentState?: unknown; energyLevel?: unknown;
  clarityLevel?: unknown; alignmentLevel?: unknown; relationshipStage?: unknown;
};

const LABELS = {
  focus: { all: "全面探索", wealth: "财富与事业", relationship: "感情与关系", direction: "人生方向", growth: "内在成长" },
  currentState: { transforming: "转化中", lost: "有些迷失", breakthrough: "准备突破", stable: "相对稳定", exploring: "正在探索" },
} as const;

function enumValue<T extends string>(value: unknown, values: readonly T[], fallback: T) {
  return typeof value === "string" && values.includes(value as T) ? value as T : fallback;
}

function boundedText(value: unknown, length: number) {
  return typeof value === "string" ? value.trim().slice(0, length) : "";
}

function parseProfile(raw: ExplorationProfile | undefined) {
  const focus = enumValue(raw?.focus, ["all", "wealth", "relationship", "direction", "growth"] as const, "all");
  const currentState = enumValue(raw?.currentState, ["transforming", "lost", "breakthrough", "stable", "exploring"] as const, "exploring");
  const score = (value: unknown) => Math.min(5, Math.max(1, Number.isInteger(Number(value)) ? Number(value) : 3));
  return {
    focus, currentState, city: boundedText(raw?.city, 60), gender: enumValue(raw?.gender, ["female", "male", "other"] as const, "other"),
    profession: boundedText(raw?.profession, 80), relationshipStatus: enumValue(raw?.relationshipStatus, ["single", "dating", "married", "complicated"] as const, "single"),
    practiceStatus: enumValue(raw?.practiceStatus, ["regular", "occasional", "curious", "none"] as const, "none"),
    relationshipStage: enumValue(raw?.relationshipStage, ["understanding", "deepening", "tension", "repair"] as const, "understanding"),
    energyLevel: score(raw?.energyLevel), clarityLevel: score(raw?.clarityLevel), alignmentLevel: score(raw?.alignmentLevel),
  };
}

function contextLine(profile: ReturnType<typeof parseProfile>) {
  return `你选择从「${LABELS.focus[profile.focus]}」进入，当前更接近「${LABELS.currentState[profile.currentState]}」。`;
}

function parsePerson(raw: PersonPayload, label = "你的") {
  const year = Number(raw.year), month = Number(raw.month), day = Number(raw.day);
  const hour = raw.hasTime ? Number(raw.hour) : 12;
  const minute = raw.hasTime ? Number(raw.minute) : 0;
  if (!Number.isInteger(year) || year < 1 || year > new Date().getFullYear() ||
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(day) || day < 1 || day > 31 ||
      !Number.isInteger(hour) || hour < 0 || hour > 23 ||
      !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`${label}出生日期或时间不完整`);
  }
  const birthInput: BirthInput = { year, month, day, hour, minute, hasTime: Boolean(raw.hasTime) };
  return {
    name: typeof raw.name === "string" ? raw.name.trim().slice(0, 40) : "",
    phone: boundedText(raw.phone, 32),
    plate: boundedText(raw.plate, 32),
    birthInput,
  };
}

const DAILY_SIGNS = new Map([
  ["aries", "白羊座"], ["taurus", "金牛座"], ["gemini", "双子座"], ["cancer", "巨蟹座"],
  ["leo", "狮子座"], ["virgo", "处女座"], ["libra", "天秤座"], ["scorpio", "天蝎座"],
  ["sagittarius", "射手座"], ["capricorn", "摩羯座"], ["aquarius", "水瓶座"], ["pisces", "双鱼座"],
]);

function dailySign(value: unknown) {
  return typeof value === "string" && DAILY_SIGNS.has(value) ? value : "aries";
}

function lifeMapFocus(profile: ReturnType<typeof parseProfile>, person: ReturnType<typeof parsePerson>) {
  let focus = LABELS.focus[profile.focus];
  if (person.phone) {
    const result = analyzePhoneNumber(person.phone);
    if (result.digitsOnly) focus += ` · 手机号数字能量：${result.digitsOnly}（总和${result.totalSum}，${result.lingdong.zh}）`;
  }
  if (person.plate) {
    const result = analyzePlateNumber(person.plate);
    if (result.digitsOnly) focus += ` · 车牌号数字能量：${result.digitsOnly}（总和${result.totalSum}，${result.lingdong.zh}）`;
  }
  return focus;
}

function basePreview(facts: ReturnType<typeof computeLifeMapFacts>) {
  const traits = topTraits(computeLifeVector(facts), 3);
  return {
    eyebrow: `${facts.sunSignZh}太阳 · ${facts.moonSignZh}月亮 · ${facts.dayMasterElement.toUpperCase()}日主`,
    title: traits.map((item) => item.labelZh).join(" × "),
    insight: `你最明显的结构不是单一性格，而是「${traits[0].labelZh}」与「${traits[1].labelZh}」如何同时运作。完整档案会继续验证它在现实选择、关系与行动中的具体表现。`,
    traits: traits.map((item) => ({ label: item.labelZh, score: item.score })),
  };
}

export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效，请重新进入小程序" }, { status: 401 });

  try {
    const body = await req.json() as {
      productId?: unknown; person?: PersonPayload; personB?: PersonPayload; relationshipType?: unknown; profile?: ExplorationProfile; sign?: unknown;
    };
    if (typeof body.productId !== "string" || !SUPPORTED_PRODUCTS.has(body.productId)) {
      return NextResponse.json({ error: "这项精测暂未开放资料采集" }, { status: 400 });
    }
    if (!body.person) return NextResponse.json({ error: "请先填写出生资料" }, { status: 400 });

    const admin = createAdminClient();
    const a = parsePerson(body.person);
    const facts = computeLifeMapFacts(a.birthInput);
    const profile = parseProfile(body.profile);
    const contextualFacts = {
      ...facts,
      mini_exploration_profile: profile,
      ...(body.productId === "daily-tide-report" ? { mini_daily_sign: dailySign(body.sign) } : {}),
    };

    if (body.productId === "relationship-resonance") {
      if (!body.personB) return NextResponse.json({ error: "关系共振需要两个人的资料" }, { status: 400 });
      const b = parsePerson(body.personB, "对方的");
      if (!a.name || !b.name) return NextResponse.json({ error: "请填写两个人的称呼" }, { status: 400 });
      const factsB = computeLifeMapFacts(b.birthInput);
      const relationshipType = body.relationshipType === "business" ? "business" : body.relationshipType === "general" ? "general" : "romantic";
      const { data, error } = await admin.from("relationship_submissions").insert({
        user_id: session.userId, name_a: a.name, name_b: b.name,
        birth_input_a: a.birthInput, birth_input_b: b.birthInput,
        facts_a: contextualFacts, facts_b: { ...factsB, mini_exploration_profile: profile }, relationship_type: relationshipType,
      }).select("id").single();
      if (error || !data) throw new Error(`relationship insert: ${error?.code ?? "unknown"}`);
      const resonance = compareLifeVectors(computeLifeVector(facts), computeLifeVector(factsB));
      const strongest = resonance.resonant[0];
      return NextResponse.json({ submissionId: data.id, preview: {
        eyebrow: `${a.name} × ${b.name} · 双生命结构`,
        title: strongest ? `共同驱动力：${strongest.labelZh}` : "相似之外，更重要的是你们如何互相改变",
        insight: strongest
          ? `${contextLine(profile)} 你们在「${strongest.labelZh}」上拥有可辨认的共振；完整报告会继续回答谁先靠近、谁负责收束，以及差异在什么情境下会变成互补或摩擦。`
          : `${contextLine(profile)} 你们的价值不在一个简单的匹配分数，而在距离、角色与现实情境如何改变这段关系。`,
        traits: resonance.resonant.slice(0, 3).map((item) => ({ label: item.labelZh, score: Math.round((item.a + item.b) / 2) })),
      }});
    }

    let table = "life_map_submissions";
    let row: Record<string, unknown> = {};
    let preview = basePreview(facts);
    preview = { ...preview, insight: `${contextLine(profile)} ${preview.insight}` };

    if (body.productId === "life-map-report") {
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts: contextualFacts,
        core_type_name: preview.title, free_narrative: preview.insight, focus: lifeMapFocus(profile, a),
        current_state: LABELS.currentState[profile.currentState], energy_level: profile.energyLevel, clarity_level: profile.clarityLevel, alignment_level: profile.alignmentLevel };
    } else if (body.productId === "qian-reading") {
      table = "qian_submissions";
      const signs = drawThreeSigns(facts);
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts: contextualFacts, sign_indexes: signs.map((s) => s.index) };
      preview = { eyebrow: "三签已由你的四柱确定", title: signs.map((s) => s.nameZh).join(" → "),
        insight: `${contextLine(profile)}真正独属于你的不是三枚签各自的含义，而是「${signs[0].nameZh}」如何被「${signs[1].nameZh}」修正，最后在「${signs[2].nameZh}」中落地。`,
        traits: signs.map((s, index) => ({ label: ["源流签", "灵魂签", "行者签"][index], score: s.index + 1 })) };
    } else if (body.productId === "tarot-reading") {
      table = "tarot_reading_submissions";
      const spread = drawTarotSpread(facts);
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts: contextualFacts,
        hidden_index: spread.hidden.index, present_index: spread.present.index, future_index: spread.future.index };
      preview = { eyebrow: "三重镜像已形成", title: `${spread.hidden.nameZh} → ${spread.present.nameZh} → ${spread.future.nameZh}`,
        insight: `${contextLine(profile)}三张牌不是三个孤立答案。完整档案会解释正在释放什么、穿越什么，以及什么现实证据代表新的结构真正形成。`,
        traits: [{ label: "潜意识镜像", score: spread.hidden.index + 1 }, { label: "当下共振", score: spread.present.index + 1 }, { label: "未来展开", score: spread.future.index + 1 }] };
    } else {
      table = body.productId === "resilience-report" ? "resilience_submissions" :
        body.productId === "romance-report" ? "romance_submissions" :
        body.productId === "daily-tide-report" ? "daily_tide_submissions" : "wealth_submissions";
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts: contextualFacts,
        ...(body.productId === "daily-tide-report" ? { generated_date: new Date().toISOString().slice(0, 10) } : {}) };
      const vector = computeLifeVector(facts);
      if (body.productId === "resilience-report") {
        const result = calculateResilience(vector);
        const weakest = Object.entries(result.breakdown).sort((x, y) => x[1] - y[1])[0];
        preview = { eyebrow: `生命韧性初步结构 · ${result.score}`, title: "恢复不是一个分数，而是一条链",
          insight: `${contextLine(profile)}你的恢复链目前最值得继续读取的是最低承载段（${weakest[1]}）。完整档案会说明受扰、回收、重启与稳态之间究竟卡在哪里。`,
          traits: Object.entries(result.breakdown).slice(0, 3).map(([label, score]) => ({ label, score })) };
      } else if (body.productId === "wealth-report") {
        const result = calculateWealthDetail(vector);
        preview = { eyebrow: `财富创造初步结构 · ${result.typeLabelZh}`, title: "财富没有堵在能力，而堵在闭环最窄处",
          insight: `${contextLine(profile)}你的价值创造更接近「${result.typeLabelZh}」。完整地图会继续定位从发现价值到表达、交换、留存与复制之间的最窄瓶颈。`,
          traits: Object.entries(result.breakdown).slice(0, 3).map(([label, score]) => ({ label, score })) };
      } else if (body.productId === "daily-tide-report") {
        const sign = dailySign(body.sign);
        preview = {
          eyebrow: `${DAILY_SIGNS.get(sign)} · 今日潮汐深读`,
          title: "今天先推进什么，什么值得暂缓",
          insight: `你已从${DAILY_SIGNS.get(sign)}进入今日潮汐。完整深读会把星座入口与你的出生结构一起转换为今日行动、关系与观察窗口，而不是事件预测。`,
          traits: topTraits(vector, 3).map((item) => ({ label: item.labelZh, score: item.score })),
        };
      }
    }

    const { data, error } = await admin.from(table).insert(row).select("id").single();
    if (error || !data) throw new Error(`${table} insert: ${error?.code ?? "unknown"}`);
    return NextResponse.json({ submissionId: data.id, preview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[mini assessment] failed", message);
    if (message.includes("出生日期")) return NextResponse.json({ error: message }, { status: 400 });
    return NextResponse.json({ error: "资料计算或保存失败，请检查信息后重试" }, { status: 500 });
  }
}
