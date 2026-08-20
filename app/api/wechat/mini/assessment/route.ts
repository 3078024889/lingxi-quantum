import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { computeLifeMapFacts, type BirthInput } from "@/lib/lifemap-calc";
import { calculateResilience, calculateWealthDetail, compareLifeVectors, computeLifeVector, topTraits } from "@/lib/life-vector";
import { drawThreeSigns } from "@/lib/qian-draw";
import { drawTarotSpread } from "@/lib/tarot-spread";

export const runtime = "nodejs";
export const maxDuration = 30;

const SUPPORTED_PRODUCTS = new Set([
  "life-map-report", "relationship-resonance", "qian-reading", "tarot-reading",
  "resilience-report", "romance-report", "daily-tide-report", "wealth-report",
]);

type PersonPayload = {
  name?: unknown; year?: unknown; month?: unknown; day?: unknown;
  hour?: unknown; minute?: unknown; hasTime?: unknown;
};

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
  return { name: typeof raw.name === "string" ? raw.name.trim().slice(0, 40) : "", birthInput };
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
      productId?: unknown; person?: PersonPayload; personB?: PersonPayload; relationshipType?: unknown; focus?: unknown;
    };
    if (typeof body.productId !== "string" || !SUPPORTED_PRODUCTS.has(body.productId)) {
      return NextResponse.json({ error: "这项精测暂未开放资料采集" }, { status: 400 });
    }
    if (!body.person) return NextResponse.json({ error: "请先填写出生资料" }, { status: 400 });

    const admin = createAdminClient();
    const a = parsePerson(body.person);
    const facts = computeLifeMapFacts(a.birthInput);
    const focus = typeof body.focus === "string" ? body.focus.trim().slice(0, 120) : "";

    if (body.productId === "relationship-resonance") {
      if (!body.personB) return NextResponse.json({ error: "关系共振需要两个人的资料" }, { status: 400 });
      const b = parsePerson(body.personB, "对方的");
      if (!a.name || !b.name) return NextResponse.json({ error: "请填写两个人的称呼" }, { status: 400 });
      const factsB = computeLifeMapFacts(b.birthInput);
      const relationshipType = body.relationshipType === "business" ? "business" : body.relationshipType === "general" ? "general" : "romantic";
      const { data, error } = await admin.from("relationship_submissions").insert({
        user_id: session.userId, name_a: a.name, name_b: b.name,
        birth_input_a: a.birthInput, birth_input_b: b.birthInput,
        facts_a: facts, facts_b: factsB, relationship_type: relationshipType,
      }).select("id").single();
      if (error || !data) throw new Error(`relationship insert: ${error?.code ?? "unknown"}`);
      const resonance = compareLifeVectors(computeLifeVector(facts), computeLifeVector(factsB));
      const strongest = resonance.resonant[0];
      return NextResponse.json({ submissionId: data.id, preview: {
        eyebrow: `${a.name} × ${b.name} · 双生命结构`,
        title: strongest ? `共同驱动力：${strongest.labelZh}` : "相似之外，更重要的是你们如何互相改变",
        insight: strongest
          ? `你们在「${strongest.labelZh}」上拥有可辨认的共振，但完整报告真正要回答的是：谁先靠近、谁负责收束，以及差异在什么情境下会变成互补或摩擦。`
          : "你们的价值不在一个简单的匹配分数，而在距离、角色与现实情境如何改变这段关系。",
        traits: resonance.resonant.slice(0, 3).map((item) => ({ label: item.labelZh, score: Math.round((item.a + item.b) / 2) })),
      }});
    }

    let table = "life_map_submissions";
    let row: Record<string, unknown> = {};
    let preview = basePreview(facts);

    if (body.productId === "life-map-report") {
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts,
        core_type_name: preview.title, free_narrative: preview.insight, focus: focus || "全域结构",
        current_state: "探索中", energy_level: 3, clarity_level: 3, alignment_level: 3 };
    } else if (body.productId === "qian-reading") {
      table = "qian_submissions";
      const signs = drawThreeSigns(facts);
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts, sign_indexes: signs.map((s) => s.index) };
      preview = { eyebrow: "三签已由你的四柱确定", title: signs.map((s) => s.nameZh).join(" → "),
        insight: `真正独属于你的不是三枚签各自的含义，而是「${signs[0].nameZh}」如何被「${signs[1].nameZh}」修正，最后在「${signs[2].nameZh}」中落地。`,
        traits: signs.map((s, index) => ({ label: ["源流签", "灵魂签", "行者签"][index], score: s.index + 1 })) };
    } else if (body.productId === "tarot-reading") {
      table = "tarot_reading_submissions";
      const spread = drawTarotSpread(facts);
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts,
        hidden_index: spread.hidden.index, present_index: spread.present.index, future_index: spread.future.index };
      preview = { eyebrow: "三重镜像已形成", title: `${spread.hidden.nameZh} → ${spread.present.nameZh} → ${spread.future.nameZh}`,
        insight: "三张牌不是三个孤立答案。完整档案会解释正在释放什么、穿越什么，以及什么现实证据代表新的结构真正形成。",
        traits: [{ label: "潜意识镜像", score: spread.hidden.index + 1 }, { label: "当下共振", score: spread.present.index + 1 }, { label: "未来展开", score: spread.future.index + 1 }] };
    } else {
      table = body.productId === "resilience-report" ? "resilience_submissions" :
        body.productId === "romance-report" ? "romance_submissions" :
        body.productId === "daily-tide-report" ? "daily_tide_submissions" : "wealth_submissions";
      row = { user_id: session.userId, name: a.name || null, birth_input: a.birthInput, facts,
        ...(body.productId === "daily-tide-report" ? { generated_date: new Date().toISOString().slice(0, 10) } : {}) };
      const vector = computeLifeVector(facts);
      if (body.productId === "resilience-report") {
        const result = calculateResilience(vector);
        const weakest = Object.entries(result.breakdown).sort((x, y) => x[1] - y[1])[0];
        preview = { eyebrow: `生命韧性初步结构 · ${result.score}`, title: "恢复不是一个分数，而是一条链",
          insight: `你的恢复链目前最值得继续读取的是最低承载段（${weakest[1]}）。完整档案会说明受扰、回收、重启与稳态之间究竟卡在哪里。`,
          traits: Object.entries(result.breakdown).slice(0, 3).map(([label, score]) => ({ label, score })) };
      } else if (body.productId === "wealth-report") {
        const result = calculateWealthDetail(vector);
        preview = { eyebrow: `财富创造初步结构 · ${result.typeLabelZh}`, title: "财富没有堵在能力，而堵在闭环最窄处",
          insight: `你的价值创造更接近「${result.typeLabelZh}」。完整地图会继续定位从发现价值到表达、交换、留存与复制之间的最窄瓶颈。`,
          traits: Object.entries(result.breakdown).slice(0, 3).map(([label, score]) => ({ label, score })) };
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
